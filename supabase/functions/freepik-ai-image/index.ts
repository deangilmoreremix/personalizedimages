import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders, authenticateUser, checkRateLimit, validateApiKey, getUserApiKey, OPENAI_KEY_MISSING_ERROR } from "../_shared/cors.ts";
import { generateWithGptImage } from "../_shared/imageProviders.ts";

const MAX_PROMPT_LENGTH = 2000;
const DEFAULT_SIZE = "1024x1024";
const MIN_EDGE = 16;
const MAX_EDGE = 3840;
const MIN_PIXELS = 655360;
const MAX_PIXELS = 8294400;
const DEFAULT_IMAGE_COUNT = 1;
const MAX_IMAGE_COUNT = 10;

function sanitize(text: unknown): string {
  if (typeof text !== "string") return "";
  return text.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim().slice(0, MAX_PROMPT_LENGTH);
}

function roundTo16(value: number): number {
  return Math.max(MIN_EDGE, Math.round(value / 16) * 16);
}

function mapToGptImageSize(width: unknown, height: unknown): string {
  const rawWidth = Number(width);
  const rawHeight = Number(height);
  if (!Number.isFinite(rawWidth) || !Number.isFinite(rawHeight) || rawWidth <= 0 || rawHeight <= 0) {
    return DEFAULT_SIZE;
  }
  let w = roundTo16(rawWidth);
  let h = roundTo16(rawHeight);
  const ratio = w / h;
  if (ratio > 3) h = roundTo16(w / 3);
  else if (ratio < 1 / 3) w = roundTo16(h / 3);
  const shrink = Math.min(1, MAX_EDGE / w, MAX_EDGE / h, Math.sqrt(MAX_PIXELS / (w * h)));
  if (shrink < 1) {
    w = roundTo16(w * shrink);
    h = roundTo16(h * shrink);
  }
  while (w * h < MIN_PIXELS && Math.max(w, h) < MAX_EDGE) {
    w += 16;
    h += 16;
  }
  if (w * h > MAX_PIXELS) {
    const factor = Math.sqrt(MAX_PIXELS / (w * h));
    w = roundTo16(w * factor);
    h = roundTo16(h * factor);
  }
  return `${w}x${h}`;
}

function styleHints(styling: unknown): string {
  if (!styling || typeof styling !== "object") return "";
  const record = styling as Record<string, unknown>;
  const hints: string[] = [];
  const color = sanitize(record.color);
  const framing = sanitize(record.framing);
  const lighting = sanitize(record.lighting);
  const photography = sanitize(record.photography);
  if (color) hints.push(`${color} color palette`);
  if (framing) hints.push(`${framing} framing`);
  if (lighting) hints.push(`${lighting} lighting`);
  if (photography) hints.push(`${photography} photography style`);
  return hints.length > 0 ? ` Style: ${hints.join(", ")}.` : "";
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
    const { user, error: authError } = await authenticateUser(req);
    if (authError || !user) {
      return jsonRes({ error: authError || "Authentication required" }, 401);
    }

    const rateLimit = await checkRateLimit(user.id, true);
    if (!rateLimit.allowed) {
      return jsonRes({ error: "Rate limit exceeded. Please wait before trying again." }, 429);
    }

    const userApiKey = getUserApiKey(req, "openai");
    if (!userApiKey || !validateApiKey(userApiKey, "openai")) {
      return jsonRes({ error: OPENAI_KEY_MISSING_ERROR }, 400);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonRes({ error: "Invalid JSON body" }, 400);
    }
    const payload = body as Record<string, unknown>;
    const { action, taskId } = payload;

    if (action === "status" && taskId) {
      return jsonRes({ status: "FAILED", error: "This operation is synchronous" });
    }

    const cleanPrompt = sanitize(payload.prompt);
    if (!cleanPrompt) {
      return jsonRes({ error: "prompt is required and must be a non-empty string" }, 400);
    }

    let prompt = cleanPrompt;
    const negativePrompt = sanitize(payload.negativePrompt);
    if (negativePrompt) prompt += `; avoid: ${negativePrompt}`;
    prompt += styleHints(payload.styling);

    const size = mapToGptImageSize(payload.width, payload.height);

    const rawCount = Number(payload.numImages);
    const count = Number.isFinite(rawCount)
      ? Math.min(Math.max(DEFAULT_IMAGE_COUNT, Math.round(rawCount)), MAX_IMAGE_COUNT)
      : DEFAULT_IMAGE_COUNT;

    let generated: string[];
    try {
      generated = await Promise.all(
        Array.from({ length: count }, () => generateWithGptImage({ prompt, apiKey: userApiKey, size }))
      );
    } catch (providerError) {
      console.error("OpenAI image generation failed", providerError instanceof Error ? providerError.message : "unknown");
      return jsonRes({ error: "Image generation failed" }, 502);
    }

    const resultUrls = generated.filter((url) => typeof url === "string" && url.length > 0);
    if (resultUrls.length === 0) {
      return jsonRes({ error: "Image generation returned no image" }, 502);
    }

    return jsonRes({ resultUrls, resultUrl: resultUrls[0] });
  } catch (error) {
    console.error("freepik-ai-image failed", error instanceof Error ? error.name : "unknown");
    return jsonRes({ error: "Internal server error" }, 500);
  }
});
