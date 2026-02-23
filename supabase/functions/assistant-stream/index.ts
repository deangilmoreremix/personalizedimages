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

    const { messages, userContext = {}, temperature = 0.7, provider = 'gemini' }: AssistantStreamRequest = await req.json();

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

  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`;

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
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          let startIndex = 0;
          let endIndex = 0;

          while ((endIndex = buffer.indexOf('}\n', startIndex)) !== -1) {
            const jsonStr = buffer.substring(startIndex, endIndex + 1);
            startIndex = endIndex + 2;

            try {
              const data = JSON.parse(jsonStr);
              if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                const text = data.candidates[0].content.parts[0].text;
                controller.enqueue(new TextEncoder().encode(text));
              }
            } catch (_e) {
            }
          }

          buffer = buffer.substring(startIndex);
        }
      } catch (error) {
        console.error('Stream error:', error);
        controller.error(error);
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}

async function streamWithOpenAI(
  messages: Array<{ role: string; content: string }>,
  userContext: Record<string, any>,
  temperature: number,
  apiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const systemMessage = {
    role: 'system',
    content: `You are an AI assistant for a creative tool called VideoRemix that helps users create personalized images, action figures, Ghibli-style images, cartoon-style images, memes, and other visual content using AI.

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
At the end of your response include a marker with feature IDs like this: FEATURES:["image","action-figure"]`
  };

  const formattedMessages = [systemMessage, ...messages];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: formattedMessages,
      temperature,
      max_tokens: 800,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              } catch (_e) {
              }
            }
          }
        }
      } catch (error) {
        console.error('Stream error:', error);
        controller.error(error);
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
