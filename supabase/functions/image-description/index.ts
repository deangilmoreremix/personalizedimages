import { getCorsHeaders, authenticateUser, checkRateLimit, sanitizeInput } from "../_shared/cors.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');

    let description = '';

    const tokenEntries = Object.entries(tokens)
      .map(([k, v]) => `${sanitizeInput(String(k))}: ${sanitizeInput(String(v))}`)
      .join(', ');
    const prompt = `Generate a detailed, creative image description for personalized content with these attributes: ${tokenEntries}. Write a vivid, descriptive paragraph suitable as an image generation prompt.`;

    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.8
        })
      });

      if (response.ok) {
        const data = await response.json();
        description = data.choices?.[0]?.message?.content || '';
      }
    } else if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 300, temperature: 0.8 }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        description = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
