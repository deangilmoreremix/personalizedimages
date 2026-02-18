import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FREEPIK_BASE = "https://api.freepik.com/v1";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const freepikKey = Deno.env.get("FREEPIK_API_KEY");
    if (!freepikKey) {
      return new Response(
        JSON.stringify({ error: "Freepik API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
        return new Response(
          JSON.stringify({
            status: "FAILED",
            error: `Status check failed: ${statusRes.status} ${errText}`,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const statusData = await statusRes.json();
      const taskStatus = statusData.data?.status || statusData.status;

      if (
        taskStatus === "COMPLETED" ||
        taskStatus === "completed" ||
        statusData.data?.image?.url
      ) {
        return new Response(
          JSON.stringify({
            status: "COMPLETED",
            resultUrl:
              statusData.data?.image?.url || statusData.data?.result?.url,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (taskStatus === "FAILED" || taskStatus === "failed") {
        return new Response(
          JSON.stringify({
            status: "FAILED",
            error: statusData.data?.error || "Upscale task failed",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify({ status: "PROCESSING" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "imageUrl is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
      return new Response(
        JSON.stringify({
          error: `Freepik API error: ${generateRes.status} ${errText}`,
        }),
        {
          status: generateRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await generateRes.json();

    if (data.data?.image?.url) {
      return new Response(
        JSON.stringify({
          status: "COMPLETED",
          resultUrl: data.data.image.url,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const returnedTaskId =
      data.data?.task_id || data.data?.id || data.task_id;
    return new Response(
      JSON.stringify({
        taskId: returnedTaskId,
        status: "PROCESSING",
        mode: useCreative ? "creative" : "precision",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
