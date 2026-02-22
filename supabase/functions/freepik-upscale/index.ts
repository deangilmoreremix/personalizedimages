import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

function jsonRes(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
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

    const useCreative = mode === "creative";
    const endpoint = useCreative
      ? `${FREEPIK_BASE}/ai/image-upscaler/creative`
      : `${FREEPIK_BASE}/ai/image-upscaler/precision`;

    const requestBody: Record<string, unknown> = {
      image_url: imageUrl,
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
