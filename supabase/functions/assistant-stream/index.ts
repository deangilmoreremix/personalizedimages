import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders, authenticateUser, checkRateLimit, validateApiKey, getUserApiKey, OPENAI_KEY_MISSING_ERROR } from "../_shared/cors.ts"

interface AssistantStreamRequest {
  messages: Array<{ role: string; content: string }>;
  userContext?: Record<string, any>;
  temperature?: number;
  provider?: 'openai';
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  try {
    const { user, error: authError } = await authenticateUser(req);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const rateLimit = await checkRateLimit(user.id, true);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, userContext = {}, temperature = 0.7 }: AssistantStreamRequest = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const userApiKey = getUserApiKey(req, 'openai');
    if (!userApiKey || !validateApiKey(userApiKey, 'openai')) {
      return new Response(
        JSON.stringify({ error: OPENAI_KEY_MISSING_ERROR }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    return await streamWithOpenAI(messages, userContext, temperature, userApiKey, headers);
  } catch (error) {
    console.error('Assistant stream error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    );
  }
});

async function streamWithOpenAI(
  messages: Array<{ role: string; content: string }>,
  userContext: Record<string, any>,
  _temperature: number,
  apiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const instructions = `You are a concise creative assistant for personalized image, action figure,
cartoon, meme and email artwork workflows. Available feature IDs: image, action-figure,
ghibli, cartoon, meme, crazy, gif, email. When suggesting tools finish with a valid
FEATURES:["image"] JSON array marker. User context: ${JSON.stringify(userContext).slice(0,2000)}`;

  // The frontend callEdgeFunction helper expects JSON, not an SSE event stream.
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_RESPONSES_MODEL") || "gpt-5-mini",
      instructions,
      input: messages.filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content })),
      max_output_tokens: 1000,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("OpenAI Responses request failed", { status: response.status, code: result?.error?.code });
    return new Response(JSON.stringify({ error: "OpenAI Responses request failed", providerStatus: response.status }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  if (result.status === "incomplete" || result.incomplete_details) {
    console.error("OpenAI Responses incomplete", { details: result.incomplete_details });
    return new Response(JSON.stringify({ error: "Model response was incomplete", details: result.incomplete_details ?? null }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const text = (result.output || []).flatMap((item: any) => item.content || [])
    .filter((part: any) => part.type === "output_text")
    .map((part: any) => part.text || "").join("");
  return new Response(JSON.stringify({ text, model: result.model, message: text }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
