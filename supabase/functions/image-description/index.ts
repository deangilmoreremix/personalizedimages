import { getCorsHeaders, authenticateUser, checkRateLimit, validateApiKey, getUserApiKey, OPENAI_KEY_MISSING_ERROR, sanitizeInput } from "../_shared/cors.ts"

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

    const { tokens } = await req.json();

    if (!tokens || typeof tokens !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Tokens object is required' }),
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

    let description = '';

    const tokenEntries = Object.entries(tokens)
      .map(([k, v]) => `${sanitizeInput(String(k))}: ${sanitizeInput(String(v))}`)
      .join(', ');
    const prompt = `Generate a detailed, creative image description for personalized content with these attributes: ${tokenEntries}. Write a vivid, descriptive paragraph suitable as an image generation prompt.`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userApiKey}`
      },
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_RESPONSES_MODEL') || 'gpt-5-mini',
        input: prompt,
        max_output_tokens: 512
      })
    });

    if (response.ok) {
      const data = await response.json();
      description = (data.output || [])
        .flatMap((item: any) => item.content || [])
        .filter((part: any) => part.type === 'output_text')
        .map((part: any) => part.text || '')
        .join('');
    }

    if (!description) {
      description = `A personalized image featuring ${tokenEntries}`;
    }

    return new Response(
      JSON.stringify({ description }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate description' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
});
