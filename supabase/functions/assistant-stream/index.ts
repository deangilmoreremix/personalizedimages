import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders, authenticateUser, checkRateLimit } from "../_shared/cors.ts"

interface AssistantStreamRequest {
  messages: Array<{ role: string; content: string }>;
  userContext?: Record<string, any>;
  temperature?: number;
  provider?: 'openai' | 'gemini';
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

    const { messages, userContext = {}, temperature = 0.7, provider = 'openai' }: AssistantStreamRequest = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (provider === 'gemini' && geminiApiKey) {
      return await streamWithGemini(messages, userContext, temperature, geminiApiKey, headers);
    } else if (provider === 'openai' && openaiApiKey) {
      return await streamWithOpenAI(messages, userContext, temperature, openaiApiKey, headers);
    } else if (geminiApiKey) {
      return await streamWithGemini(messages, userContext, temperature, geminiApiKey, headers);
    } else if (openaiApiKey) {
      return await streamWithOpenAI(messages, userContext, temperature, openaiApiKey, headers);
    } else {
      return new Response(
        JSON.stringify({ error: 'No API keys configured' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Assistant stream error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    );
  }
});

async function streamWithGemini(
  messages: Array<{ role: string; content: string }>,
  userContext: Record<string, any>,
  temperature: number,
  apiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const systemMessage = `You are an AI assistant for a creative tool called VideoRemix that helps users create personalized images, action figures, Ghibli-style images, cartoon-style images, memes, and other visual content using AI.

First name: ${userContext['FIRSTNAME'] || 'User'}
Last name: ${userContext['LASTNAME'] || 'Unknown'}
Company: ${userContext['COMPANY'] || 'Unknown'}

The available features are:
- AI Image Generator (image): Create custom images from text descriptions
- Action Figure Generator (action-figure): Create personalized action figures
- Studio Ghibli Style (ghibli): Create images in the style of Studio Ghibli
- Cartoon Style (cartoon): Transform images into cartoon styles
- Meme Generator (meme): Create personalized memes
- Crazy Image Generator (crazy): Create wild, surreal images
- GIF Editor (gif): Create animated GIFs with personalization
- Email-Ready Image Editor (email): Design images optimized for email

When suggesting features, include the feature ID in brackets like [image] at the end of your response.
Keep responses concise (max 3-4 sentences).
At the end of your response include a marker with feature IDs like this: FEATURES:["image","action-figure"]`;

  const formattedMessages = [
    { role: 'user', parts: [{ text: systemMessage }] },
    ...messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))
  ];

  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: formattedMessages,
      generationConfig: {
        temperature,
        topP: 0.8,
        topK: 40
      }
    })
  });

  if (!response.ok) {
    console.error('Gemini API error:', response.status);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json().catch(() => ({}));
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return new Response(JSON.stringify({ text, model: 'gemini-2.5-flash', message: text }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

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
