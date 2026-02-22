import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const FREEPIK_BASE = "https://api.freepik.com/v1";
const MAX_PROMPT_LENGTH = 2000;
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 20;

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

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim().slice(0, MAX_PROMPT_LENGTH);
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
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(clientIp)) {
      return jsonRes({ error: "Rate limit exceeded. Please wait before trying again." }, 429);
    }

    const freepikKey = Deno.env.get("FREEPIK_API_KEY");
    if (!freepikKey) {
      return jsonRes({ error: "Freepik API key not configured" }, 500);
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return jsonRes({ error: "prompt is required and must be a string" }, 400);
    }

    const cleanPrompt = sanitize(prompt);
    if (cleanPrompt.length === 0) {
      return jsonRes({ error: "prompt cannot be empty after sanitization" }, 400);
    }

    const res = await fetch(`${FREEPIK_BASE}/ai/improve-prompt`, {
      method: "POST",
      headers: {
        "x-freepik-api-key": freepikKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: cleanPrompt }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return jsonRes({ error: `Freepik API error: ${res.status} ${errText}` }, res.status);
    }

    const data = await res.json();

    return jsonRes({
      improvedPrompt:
        data.data?.improved_prompt ||
        data.data?.prompt ||
        data.improved_prompt ||
        cleanPrompt,
      originalPrompt: cleanPrompt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return jsonRes({ error: message }, 500);
  }
});
