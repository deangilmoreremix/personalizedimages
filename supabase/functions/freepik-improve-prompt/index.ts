import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders, authenticateUser, checkRateLimit } from "../_shared/cors.ts";

const RESPONSES_MODEL = Deno.env.get("OPENAI_RESPONSES_MODEL") || "gpt-5-mini";
const MAX_PROMPT_LENGTH = 2000;
const MAX_OUTPUT_TOKENS = 512;
const INSTRUCTIONS =
  "You are an expert image prompt engineer. Rewrite the user's image prompt so it is more vivid, specific and descriptive for an image generation model. Preserve the original subject and intent. Reply with the improved prompt only, as plain text, with no preamble, quotes, labels or explanation.";

function sanitize(text: unknown): string {
  if (typeof text !== "string") return "";
  return text.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim().slice(0, MAX_PROMPT_LENGTH);
}

function jsonResponse(data: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

function extractOutputText(payload: any): string {
  const output = Array.isArray(payload?.output) ? payload.output : [];
  const texts: string[] = [];
  for (const item of output) {
    const content = item?.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        texts.push(part.text);
      }
    }
  }
  const joined = texts.join("\n").trim();
  if (joined) return joined;
  if (typeof payload?.output_text === "string") return payload.output_text.trim();
  return "";
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

    const cleanPrompt = sanitize((body as Record<string, unknown>).prompt);
    if (!cleanPrompt) {
      return jsonResponse({ error: "prompt is required and must be a non-empty string" }, 400, headers);
    }

    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: RESPONSES_MODEL,
        instructions: INSTRUCTIONS,
        input: [{ role: "user", content: [{ type: "input_text", text: cleanPrompt }] }],
        max_output_tokens: MAX_OUTPUT_TOKENS,
      }),
    });

    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("OpenAI Responses request failed", { status: upstream.status, code: result?.error?.code });
      if (upstream.status === 429) {
        return jsonResponse(
          { error: "Prompt improvement provider rate limit reached", providerStatus: upstream.status },
          429,
          headers
        );
      }
      if (upstream.status === 401 || upstream.status === 403) {
        return jsonResponse(
          { error: "Prompt improvement provider rejected the server credentials", providerStatus: upstream.status },
          502,
          headers
        );
      }
      return jsonResponse(
        { error: "Prompt improvement provider rejected the request", providerStatus: upstream.status },
        502,
        headers
      );
    }

    if (result?.status === "incomplete" || result?.incomplete_details) {
      console.error("OpenAI Responses incomplete", { details: result?.incomplete_details ?? null });
      return jsonResponse({ error: "Prompt improvement response was incomplete" }, 502, headers);
    }

    const improvedPrompt = extractOutputText(result);
    if (!improvedPrompt) {
      return jsonResponse({ error: "Prompt improvement returned no text" }, 502, headers);
    }

    return jsonResponse({ improvedPrompt, originalPrompt: cleanPrompt }, 200, headers);
  } catch (error) {
    console.error("freepik-improve-prompt failed", error instanceof Error ? error.name : "unknown");
    return jsonResponse({ error: "Internal server error" }, 500, headers);
  }
});
