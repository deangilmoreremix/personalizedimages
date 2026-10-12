import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders, authenticateUser, checkRateLimit, validateApiKey, getUserApiKey, OPENAI_KEY_MISSING_ERROR, isValidUrl } from "../_shared/cors.ts";

const IMAGE_MODEL = Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-2.5-sunburst";
const BASE_PROMPT =
  "Keep the first image's subject, composition and structure intact and apply only the style, not the content.";
const MAX_PROMPT_LENGTH = 2000;

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
  if (status === 429) return { message: "Style transfer provider rate limit reached", status: 429 };
  if (status === 401 || status === 403) {
    return { message: "Style transfer provider rejected the server credentials", status: 502 };
  }
  if (status === 404) return { message: "Style transfer provider endpoint not found", status: 502 };
  return { message: "Style transfer provider rejected the request", status: 502 };
}

function sanitize(text: unknown): string {
  if (typeof text !== "string") return "";
  return text.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim().slice(0, MAX_PROMPT_LENGTH);
}

function toPercent(value: unknown): number | null {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  if (num <= 1) return Math.round(num * 100);
  return Math.round(Math.min(num, 100));
}

function buildStylePrompt(options: { styleImageUrl: string; styleName: string; strength: number | null }): string {
  const parts: string[] = [];
  if (options.styleImageUrl) {
    parts.push("Transfer the artistic style of the second image onto the first image.");
    if (options.styleName) parts.push(`Target style: ${options.styleName}.`);
  } else {
    parts.push(`Restyle this image in the ${options.styleName} style.`);
  }
  parts.push(BASE_PROMPT);
  if (options.styleName) parts.push(`Apply the colors, textures and lighting of the ${options.styleName} style.`);
  if (options.strength !== null) parts.push(`Style strength: ${options.strength}%.`);
  return parts.join(" ");
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

    const userApiKey = getUserApiKey(req, "openai");
    if (!userApiKey || !validateApiKey(userApiKey, "openai")) {
      return jsonResponse({ error: OPENAI_KEY_MISSING_ERROR }, 400, headers);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ error: "Invalid JSON body" }, 400, headers);
    }
    const payload = body as Record<string, unknown>;
    const { action, taskId, imageUrl, styleImageUrl, styleName, strength } = payload;

    if (action === "status" && taskId) {
      return jsonResponse({ status: "FAILED", error: "This operation is synchronous" }, 200, headers);
    }

    if (!isValidImageRef(imageUrl)) {
      return jsonResponse({ error: "imageUrl is required and must be an image data URL or HTTPS URL" }, 400, headers);
    }

    const hasStyleImage = isValidImageRef(styleImageUrl);
    const cleanStyleName = sanitize(styleName);
    if (!hasStyleImage && !cleanStyleName) {
      return jsonResponse({ error: "styleImageUrl or styleName is required for style transfer" }, 400, headers);
    }

    const images: Array<{ image_url: string }> = [{ image_url: imageUrl }];
    if (hasStyleImage) images.push({ image_url: styleImageUrl });

    const upstream = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${userApiKey}` },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        images,
        prompt: buildStylePrompt({ styleImageUrl: hasStyleImage ? styleImageUrl : "", styleName: cleanStyleName, strength: toPercent(strength) }),
        n: 1,
        output_format: "png",
      }),
    });

    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("OpenAI style transfer failed", { status: upstream.status, code: result?.error?.code });
      const mapped = mapUpstreamError(upstream.status);
      return jsonResponse({ error: mapped.message, providerStatus: upstream.status }, mapped.status, headers);
    }

    const image = result?.data?.[0];
    const b64 = typeof image?.b64_json === "string" ? image.b64_json : "";
    if (!b64 && typeof image?.url !== "string") {
      return jsonResponse({ error: "Style transfer returned no image" }, 502, headers);
    }
    const resultUrl = b64 ? `data:image/png;base64,${b64}` : image.url;

    return jsonResponse({ resultUrl }, 200, headers);
  } catch (error) {
    console.error("freepik-style-transfer failed", error instanceof Error ? error.name : "unknown");
    return jsonResponse({ error: "Internal server error" }, 500, headers);
  }
});
