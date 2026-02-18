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
        taskStatus === "completed"
      ) {
        const images = statusData.data?.images || statusData.data?.result?.images || [];
        const urls = images.map((img: { url?: string }) => img.url).filter(Boolean);
        return new Response(
          JSON.stringify({
            status: "COMPLETED",
            resultUrl: urls[0] || null,
            resultUrls: urls,
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
            error: statusData.data?.error || "Generation failed",
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

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const requestBody: Record<string, unknown> = {
      prompt,
      num_images: numImages || 1,
    };

    if (negativePrompt) requestBody.negative_prompt = negativePrompt;
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

    const images = data.data?.images || [];
    if (images.length > 0 && images[0].url) {
      const urls = images.map((img: { url?: string }) => img.url).filter(Boolean);
      return new Response(
        JSON.stringify({
          status: "COMPLETED",
          resultUrl: urls[0],
          resultUrls: urls,
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
