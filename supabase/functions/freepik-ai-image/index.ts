import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const FREEPIK_BASE = "https://api.freepik.com/v1";
const MAX_PROMPT_LENGTH = 2000;
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim().slice(0, MAX_PROMPT_LENGTH);
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  function jsonRes(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(clientIp)) {
      return jsonRes({ error: "Rate limit exceeded. Please wait before trying again." }, 429);
    }

    const freepikKey = Deno.env.get("FREEPIK_API_KEY");
    if (!freepikKey) {
      return jsonRes({ error: "Freepik API key not configured" }, 500);
    }

    const body = await req.json();
    const { action, taskId } = body;

    if (action === "status" && taskId) {
      const statusRes = await fetch(
        `${FREEPIK_BASE}/ai/mystic/${taskId}`,
        {
          method: "GET",
          headers: { "x-freepik-api-key": freepikKey },
        }
      );

      if (!statusRes.ok) {
        const errText = await statusRes.text();
        return jsonRes({ status: "FAILED", error: `Status check failed: ${statusRes.status} ${errText}` });
      }

      const statusData = await statusRes.json();
      const taskStatus = statusData.data?.status || statusData.status;

      if (taskStatus === "COMPLETED" || taskStatus === "completed") {
        const images = statusData.data?.images || statusData.data?.result?.images || [];
        const urls = images.map((img: { url?: string }) => img.url).filter(Boolean);
        return jsonRes({ status: "COMPLETED", resultUrl: urls[0] || null, resultUrls: urls });
      }

      if (taskStatus === "FAILED" || taskStatus === "failed") {
        return jsonRes({ status: "FAILED", error: statusData.data?.error || "Generation failed" });
      }

      return jsonRes({ status: "PROCESSING" });
    }

    const {
      prompt,
      negativePrompt,
      width,
      height,
      numImages,
      guidanceScale,
      seed,
      styling,
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return jsonRes({ error: "prompt is required and must be a string" }, 400);
    }

    const cleanPrompt = sanitize(prompt);
    if (cleanPrompt.length === 0) {
      return jsonRes({ error: "prompt cannot be empty after sanitization" }, 400);
    }

    const requestBody: Record<string, unknown> = {
      prompt: cleanPrompt,
      num_images: numImages || 1,
    };

    if (negativePrompt && typeof negativePrompt === "string") {
      requestBody.negative_prompt = sanitize(negativePrompt);
    }
    if (width) requestBody.image = { size: { width, height: height || width } };
    if (guidanceScale) requestBody.guidance_scale = guidanceScale;
    if (seed) requestBody.seed = seed;

    if (styling) {
      requestBody.styling = {};
      if (styling.color)
        (requestBody.styling as Record<string, unknown>).color = styling.color;
      if (styling.framing)
        (requestBody.styling as Record<string, unknown>).framing = styling.framing;
      if (styling.lighting)
        (requestBody.styling as Record<string, unknown>).lighting = styling.lighting;
      if (styling.photography)
        (requestBody.styling as Record<string, unknown>).photography =
          styling.photography;
    }

    const generateRes = await fetch(`${FREEPIK_BASE}/ai/mystic`, {
      method: "POST",
      headers: {
        "x-freepik-api-key": freepikKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!generateRes.ok) {
      const errText = await generateRes.text();
      return jsonRes({ error: `Freepik API error: ${generateRes.status} ${errText}` }, generateRes.status);
    }

    const data = await generateRes.json();

    const images = data.data?.images || [];
    if (images.length > 0 && images[0].url) {
      const urls = images.map((img: { url?: string }) => img.url).filter(Boolean);
      return jsonRes({ status: "COMPLETED", resultUrl: urls[0], resultUrls: urls });
    }

    const returnedTaskId = data.data?.task_id || data.data?.id || data.task_id;
    return jsonRes({ taskId: returnedTaskId, status: "PROCESSING" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return jsonRes({ error: message }, 500);
  }
});
