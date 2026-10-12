// Shared image provider helpers for generator edge functions.
// OpenAI image operations route through GPT Image 2.5 (Images API).

export function openaiImageModel(): string {
  return Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-2.5-sunburst";
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), "");
  return btoa(binaryString);
}

export interface GptImageOptions {
  prompt: string;
  apiKey: string;
  referenceImageUrl?: string;
  size?: string;
}

// Generate (or edit when a reference image is supplied) with GPT Image 2.5.
// GPT image models always return base64 image data.
export async function generateWithGptImage(options: GptImageOptions): Promise<string> {
  const { prompt, apiKey, referenceImageUrl, size = "1024x1024" } = options;
  const model = openaiImageModel();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };

  const response = referenceImageUrl
    ? await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          images: [{ image_url: referenceImageUrl }],
          prompt,
          n: 1,
          size,
          output_format: "png",
        }),
      })
    : await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          size,
          quality: "medium",
          output_format: "png",
        }),
      });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`OpenAI image error: ${response.status}${data?.error?.message ? ` - ${data.error.message}` : ""}`);
  }
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI image response contained no image");
  return `data:image/png;base64,${b64}`;
}
