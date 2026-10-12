import { getCorsHeaders, authenticateUser, checkRateLimit, validateApiKey, getUserApiKey, OPENAI_KEY_MISSING_ERROR } from "../_shared/cors.ts"
import { generateWithGptImage } from "../_shared/imageProviders.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
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

    const { provider, imageUrl, count = 2, config } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const variationCount = Math.min(Math.max(1, Number(count) || 2), 4);

    const userApiKey = getUserApiKey(req, 'openai');
    if (!userApiKey || !validateApiKey(userApiKey, 'openai')) {
      return new Response(
        JSON.stringify({ error: OPENAI_KEY_MISSING_ERROR }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const variations: string[] = [];

    for (let i = 0; i < variationCount; i++) {
      try {
        const imageResult = await generateWithGptImage({
          prompt: `Create a creative variation of the provided image. Variation ${i + 1} of ${variationCount}: change the colors, lighting and composition while keeping the main subject recognizable.`,
          apiKey: userApiKey,
          referenceImageUrl: imageUrl,
          size: '1024x1024',
        });
        variations.push(imageResult);
      } catch (openaiError) {
        console.error('OpenAI variation failed', openaiError instanceof Error ? openaiError.message : 'unknown');
      }
    }

    return new Response(
      JSON.stringify({ variations, count: variations.length, imageUrls: variations }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate variations' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
