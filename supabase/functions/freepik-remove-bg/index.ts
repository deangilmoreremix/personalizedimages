import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders, authenticateUser, checkRateLimit, isValidUrl } from "../_shared/cors.ts";

const IMAGE_MODEL = Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-2.5-sunburst";
const REMOVE_BG_PROMPT =
  "Remove the background completely, keeping only the main subject with clean edges, and make the background fully transparent.";

function isValidImageRef(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.startsWith("data:image/")) return true;
  return isValidUrl(value);
}

function jsonResponse(data: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

function mapUpstreamError(status: number): { message: string; status: number } {
  if (status === 429) return { message: "Background removal provider rate limit reached", status: 429 };
  if (status === 401 || status === 403) {
    return { message: "Background removal provider rejected the server credentials", status: 502 };
  }
  if (status === 404) return { message: "Background removal provider endpoint not found", status: 502 };
  return { message: "Background removal provider rejected the request", status: 502 };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  try {
    const { user, error: authError } = await authenticateUser(req);
    if (authError || !user) {
      return jsonResponse({ error: authError || "Authentication required" }, 401, headers);
    }

    const rateLimit = await checkRateLimit(user.id, true);
    if (!rateLimit.allowed) {
      return jsonResponse({ error: "Rate limit exceeded. Please wait before trying again." }, 429, headers);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return jsonResponse({ error: "OpenAI API key not configured" }, 503, headers);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ error: "Invalid JSON body" }, 400, headers);
    }
    const payload = body as Record<string, unknown>;
    const { action, taskId, imageUrl, outputFormat } = payload;

    if (action === "status" && taskId) {
      return jsonResponse({ status: "FAILED", error: "This operation is synchronous" }, 200, headers);
    }

    if (!isValidImageRef(imageUrl)) {
      return jsonResponse({ error: "imageUrl is required and must be an image data URL or HTTPS URL" }, 400, headers);
    }

    const useWebp = outputFormat === "webp";
    const mimeType = useWebp ? "image/webp" : "image/png";

    const upstream = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        images: [{ image_url: imageUrl }],
        prompt: REMOVE_BG_PROMPT,
        n: 1,
        background: "transparent",
        output_format: useWebp ? "webp" : "png",
      }),
    });

    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("OpenAI background removal failed", { status: upstream.status, code: result?.error?.code });
      const mapped = mapUpstreamError(upstream.status);
      return jsonResponse({ error: mapped.message, providerStatus: upstream.status }, mapped.status, headers);
    }

    const image = result?.data?.[0];
    const b64 = typeof image?.b64_json === "string" ? image.b64_json : "";
    if (!b64 && typeof image?.url !== "string") {
      return jsonResponse({ error: "Background removal returned no image" }, 502, headers);
    }
    const resultUrl = b64 ? `data:${mimeType};base64,${b64}` : image.url;

    return jsonResponse({ resultUrl }, 200, headers);
  } catch (error) {
    console.error("freepik-remove-bg failed", error instanceof Error ? error.name : "unknown");
    return jsonResponse({ error: "Internal server error" }, 500, headers);
  }
});
