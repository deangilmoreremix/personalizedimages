import { getCorsHeaders, authenticateUser, checkRateLimit, sanitizeInput } from "../_shared/cors.ts";

const IMAGE_MODEL = Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-2.5-sunburst";
const MAX_BYTES = 20 * 1024 * 1024;
const json = (data: unknown, status: number, headers: Record<string,string>) =>
  new Response(JSON.stringify(data), { status, headers: { ...headers, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  const headers = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, headers);
  try {
    const { user, error: authError } = await authenticateUser(req);
    if (authError || !user) return json({ error: "Authentication required" }, 401, headers);
    const limit = await checkRateLimit(user.id, true);
    if (!limit.allowed) return json({ error: "Rate limit exceeded" }, 429, headers);

    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key) return json({ error: "OpenAI is not configured on the server" }, 503, headers);
    const { imageUrl, editOptions } = await req.json();
    if (typeof imageUrl !== "string" || !imageUrl ||
        !(imageUrl.startsWith("data:image/") || imageUrl.startsWith("https://"))) {
      return json({ error: "An HTTPS image URL or image data URL is required" }, 400, headers);
    }
    const prompt = sanitizeInput(editOptions?.prompt || editOptions?.instruction || "", 8000);
    if (!prompt) return json({ error: "An editing instruction is required" }, 400, headers);

    // Pass the actual source image to the image edits API; generation without it is not an edit.
    // Remote source URLs are forwarded directly; no server-side fetch (avoids SSRF).
    if (imageUrl.length > MAX_BYTES) return json({ error: "Image reference too large" }, 413, headers);
    const upstream = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        images: [{ image_url: imageUrl }],
        prompt,
        n: 1,
        output_format: "png",
      }),
    });
    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("OpenAI image editing failed", { status: upstream.status, code: result?.error?.code });
      return json({ error: "Image editing provider rejected the request", providerStatus: upstream.status }, 502, headers);
    }
    const image = result?.data?.[0];
    const imageResult = image?.b64_json ? `data:image/png;base64,${image.b64_json}` : image?.url;
    if (!imageResult) return json({ error: "Image editing returned no image" }, 502, headers);
    return json({ imageUrl: imageResult, model: IMAGE_MODEL }, 200, headers);
  } catch (error) {
    console.error("Image editing exception", error instanceof Error ? error.name : "unknown");
    return json({ error: "Image editing failed" }, 500, headers);
  }
});
