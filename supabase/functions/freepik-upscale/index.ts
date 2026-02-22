import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.78.0";
import { getCorsHeaders } from "../_shared/cors.ts";

async function resolveImageUrl(imageUrl: string): Promise<string> {
  if (!imageUrl.startsWith("data:")) return imageUrl;
  const match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) throw new Error("Invalid base64 image data");
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const raw = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const fileName = `freepik-tmp/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("temp-uploads")
    .upload(fileName, raw, { contentType: `image/${match[1]}`, upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from("temp-uploads").getPublicUrl(fileName);
  return data.publicUrl;
}

const FREEPIK_BASE = "https://api.freepik.com/v1";
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
    const { action, taskId, imageUrl, scaleFactor, mode, creativity, resemblance, optimizeFor } = body;

    if (action === "status" && taskId) {
      const endpoint =
        mode === "creative"
          ? `${FREEPIK_BASE}/ai/image-upscaler/creative/${taskId}`
          : `${FREEPIK_BASE}/ai/image-upscaler/precision/${taskId}`;

      const statusRes = await fetch(endpoint, {
        method: "GET",
        headers: { "x-freepik-api-key": freepikKey },
      });

      if (!statusRes.ok) {
        const errText = await statusRes.text();
        return jsonRes({ status: "FAILED", error: `Status check failed: ${statusRes.status} ${errText}` });
      }

      const statusData = await statusRes.json();
      const taskStatus = statusData.data?.status || statusData.status;

      if (
        taskStatus === "COMPLETED" ||
        taskStatus === "completed" ||
        statusData.data?.image?.url
      ) {
        return jsonRes({
          status: "COMPLETED",
          resultUrl: statusData.data?.image?.url || statusData.data?.result?.url,
        });
      }

      if (taskStatus === "FAILED" || taskStatus === "failed") {
        return jsonRes({ status: "FAILED", error: statusData.data?.error || "Upscale task failed" });
      }

      return jsonRes({ status: "PROCESSING" });
    }

    if (!imageUrl) {
      return jsonRes({ error: "imageUrl is required" }, 400);
    }

    const resolvedUrl = await resolveImageUrl(imageUrl);

    const useCreative = mode === "creative";
    const endpoint = useCreative
      ? `${FREEPIK_BASE}/ai/image-upscaler/creative`
      : `${FREEPIK_BASE}/ai/image-upscaler/precision`;

    const requestBody: Record<string, unknown> = {
      image_url: resolvedUrl,
      scale_factor: scaleFactor || 2,
    };

    if (useCreative) {
      if (creativity !== undefined) requestBody.creativity = creativity;
      if (resemblance !== undefined) requestBody.resemblance = resemblance;
      if (optimizeFor) requestBody.optimize_for = optimizeFor;
    }

    const generateRes = await fetch(endpoint, {
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

    if (data.data?.image?.url) {
      return jsonRes({ status: "COMPLETED", resultUrl: data.data.image.url });
    }

    const returnedTaskId = data.data?.task_id || data.data?.id || data.task_id;
    return jsonRes({
      taskId: returnedTaskId,
      status: "PROCESSING",
      mode: useCreative ? "creative" : "precision",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return jsonRes({ error: message }, 500);
  }
});
