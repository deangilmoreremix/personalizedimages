import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders, authenticateUser, checkRateLimit, isValidUrl } from "../_shared/cors.ts";
import { generateWithGptImage } from "../_shared/imageProviders.ts";

const DEFAULT_SIZE = "2048x2048";
const HEADER_BYTES = 16384;
const HEADER_BASE64_CHARS = Math.ceil((HEADER_BYTES * 4) / 3 / 4) * 4;
const MIN_EDGE = 16;
const MAX_EDGE = 3840;
const MIN_PIXELS = 655360;
const MAX_PIXELS = 8294400;
const SCALE_TARGET_EDGE: Record<string, number> = { "2": 2048, "4": 3840 };
const DEFAULT_SCALE = "2";

function isValidImageRef(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.startsWith("data:image/")) return true;
  return isValidUrl(value);
}

function readUInt16BE(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] << 8) | bytes[offset + 1]) & 0xffff;
}

function readUInt32BE(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0
  );
}

function parseImageSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    const width = readUInt32BE(bytes, 16);
    const height = readUInt32BE(bytes, 20);
    if (width > 0 && height > 0) return { width, height };
    return null;
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      const segmentLength = readUInt16BE(bytes, offset + 2);
      const isStartOfFrame =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isStartOfFrame) {
        const height = readUInt16BE(bytes, offset + 5);
        const width = readUInt16BE(bytes, offset + 7);
        if (width > 0 && height > 0) return { width, height };
        return null;
      }
      if (segmentLength <= 0) break;
      offset += 2 + segmentLength;
    }
  }
  return null;
}

function decodeDataUrlHeader(imageUrl: string): Uint8Array | null {
  const match = imageUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  if (!match) return null;
  try {
    const binary = atob(match[1].slice(0, HEADER_BASE64_CHARS));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function fetchImageHeader(imageUrl: string): Promise<Uint8Array | null> {
  try {
    let response = await fetch(imageUrl, { headers: { Range: `bytes=0-${HEADER_BYTES - 1}` } });
    if (!response.ok) response = await fetch(imageUrl);
    if (!response.ok) return null;
    const buffer = new Uint8Array(await response.arrayBuffer());
    return buffer.subarray(0, HEADER_BYTES);
  } catch {
    return null;
  }
}

async function detectImageSize(imageUrl: string): Promise<{ width: number; height: number } | null> {
  const bytes = imageUrl.startsWith("data:") ? decodeDataUrlHeader(imageUrl) : await fetchImageHeader(imageUrl);
  if (!bytes) return null;
  return parseImageSize(bytes);
}

function roundTo16(value: number): number {
  return Math.max(MIN_EDGE, Math.round(value / 16) * 16);
}

function mapUpscaleSize(source: { width: number; height: number } | null, scaleKey: string): string {
  if (!source || !source.width || !source.height) return DEFAULT_SIZE;
  const targetEdge = SCALE_TARGET_EDGE[scaleKey] ?? 2048;
  let w = roundTo16(source.width);
  let h = roundTo16(source.height);
  const longEdge = Math.max(w, h);
  if (targetEdge > longEdge) {
    const factor = targetEdge / longEdge;
    w = roundTo16(w * factor);
    h = roundTo16(h * factor);
  }
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

function toPercent(value: unknown): number | null {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  if (num <= 1) return Math.round(num * 100);
  return Math.round(Math.min(num, 100));
}

function buildUpscalePrompt(options: {
  mode?: unknown;
  creativity?: unknown;
  resemblance?: unknown;
  optimizeFor?: unknown;
}): string {
  const mode = typeof options.mode === "string" ? options.mode : "";
  const parts = ["Upscale this image to a higher resolution with sharper, cleaner detail."];
  if (mode === "creative") {
    parts.push("You may synthesize plausible fine detail that stays consistent with the image.");
    const creativity = toPercent(options.creativity);
    if (creativity !== null) parts.push(`Creativity level: ${creativity}%.`);
  } else {
    parts.push(
      "Keep the original content, textures, colors and edges as faithful as possible and do not invent new elements."
    );
    const resemblance = toPercent(options.resemblance);
    if (resemblance !== null) parts.push(`Resemblance to the original: ${resemblance}%.`);
  }
  const optimizeFor = typeof options.optimizeFor === "string" ? options.optimizeFor : "";
  if (optimizeFor === "faces") parts.push("Prioritize natural, crisp facial detail.");
  if (optimizeFor === "art") parts.push("Prioritize clean linework and illustration detail.");
  if (optimizeFor === "photo") parts.push("Prioritize photographic texture and grain fidelity.");
  return parts.join(" ");
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

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return jsonRes({ error: "OpenAI API key not configured" }, 503);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonRes({ error: "Invalid JSON body" }, 400);
    }
    const payload = body as Record<string, unknown>;
    const { action, taskId, imageUrl, scaleFactor, mode, creativity, resemblance, optimizeFor } = payload;

    if (action === "status" && taskId) {
      return jsonRes({ status: "FAILED", error: "This operation is synchronous" });
    }

    if (!isValidImageRef(imageUrl)) {
      return jsonRes({ error: "imageUrl is required and must be an image data URL or HTTPS URL" }, 400);
    }

    const scaleKey = String(Math.round(Number(scaleFactor)) || DEFAULT_SCALE);
    const size = mapUpscaleSize(await detectImageSize(imageUrl), scaleKey);
    const prompt = buildUpscalePrompt({ mode, creativity, resemblance, optimizeFor });

    let resultUrl: string;
    try {
      resultUrl = await generateWithGptImage({ prompt, apiKey: openaiKey, referenceImageUrl: imageUrl, size });
    } catch (providerError) {
      console.error("OpenAI image edit failed", providerError instanceof Error ? providerError.message : "unknown");
      return jsonRes({ error: "Image upscale failed" }, 502);
    }

    if (!resultUrl) {
      return jsonRes({ error: "Image upscale returned no image" }, 502);
    }

    return jsonRes({ resultUrl });
  } catch (error) {
    console.error("freepik-upscale failed", error instanceof Error ? error.name : "unknown");
    return jsonRes({ error: "Internal server error" }, 500);
  }
});
