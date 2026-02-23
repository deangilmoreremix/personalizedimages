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

    const { provider, imageUrl, count = 2, config } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const variationCount = Math.min(Math.max(1, Number(count) || 2), 4);

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!geminiKey && !openaiKey) {
      return new Response(
        JSON.stringify({ error: 'API keys not configured' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const variations: string[] = [];

    if (geminiKey) {
      let imageData = '';
      let mimeType = 'image/png';

      if (imageUrl.startsWith('data:')) {
        const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          imageData = match[2];
        }
      } else {
        const imgResponse = await fetch(imageUrl);
        if (!imgResponse.ok) throw new Error('Failed to fetch source image');
        const blob = await imgResponse.blob();
        mimeType = blob.type || 'image/png';
        const arrayBuf = await blob.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuf);
        imageData = btoa(uint8.reduce((s, b) => s + String.fromCharCode(b), ''));
      }

      const variationPrompts = [
        'Create a creative variation of this image with different colors and lighting.',
        'Create a variation of this image with a different artistic style.',
        'Create a variation of this image from a different perspective or angle.',
        'Create a variation of this image with a different mood or atmosphere.',
      ];

      for (let i = 0; i < variationCount; i++) {
        const prompt = variationPrompts[i % variationPrompts.length];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: mimeType, data: imageData } }
                ]
              }],
              generationConfig: { responseMediaType: "IMAGE" }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          for (const candidate of data.candidates || []) {
            for (const part of candidate.content?.parts || []) {
              if (part.inlineData?.mimeType?.startsWith('image/')) {
                variations.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                break;
              }
            }
            if (variations.length > i) break;
          }
        }
      }
    }

    if (variations.length === 0 && openaiKey) {
      for (let i = 0; i < variationCount; i++) {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `Create a creative variation of the original image. Variation ${i + 1} of ${variationCount}.`,
            n: 1,
            size: '1024x1024'
          })
        });

        if (response.ok) {
          const data = await response.json();
          const url = data.data?.[0]?.url;
          if (url) variations.push(url);
        }
      }
    }

    return new Response(
      JSON.stringify({ variations, count: variations.length }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate variations' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
