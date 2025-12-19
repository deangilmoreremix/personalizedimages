import { createEdgeFunction, createSecureResponse, SecurityError } from '../_shared/middleware.ts';
import { validateApiKey } from '../_shared/cors.ts';

interface ImageGenerationRequest {
  prompt: string;
  provider?: 'gpt-5' | 'gemini' | 'openai';
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  style?: string;
  quality?: 'standard' | 'hd';
}

async function generateImage(prompt: string, provider: string, size: string, quality: string, style?: string): Promise<string> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiKey || !validateApiKey(openaiKey, 'openai')) {
    throw new SecurityError('OpenAI API key not configured', 500, 'API_KEY_ERROR');
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt + (style ? ` Style: ${style}` : ''),
      n: 1,
      size,
      quality
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new SecurityError(
      `Image generation failed: ${error.error?.message || 'Unknown error'}`,
      response.status,
      'GENERATION_ERROR'
    );
  }

  const data = await response.json();
  return data.data[0].url;
}

export default createEdgeFunction(
  async (req, context) => {
    const { prompt, provider = 'openai', size = '1024x1024', style, quality = 'standard' } = context.body as ImageGenerationRequest;

    const imageUrl = await generateImage(prompt, provider, size, quality, style);

    return createSecureResponse({
      imageUrl,
      prompt,
      provider,
      size,
      style,
      quality,
      generatedAt: new Date().toISOString()
    });
  },
  {
    requireAuth: true,
    rateLimit: {
      maxRequests: 10,
      windowMinutes: 5
    },
    validation: [
      {
        field: 'prompt',
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 1000
      },
      {
        field: 'provider',
        type: 'string'
      },
      {
        field: 'size',
        type: 'string',
        pattern: /^(1024x1024|1024x1792|1792x1024)$/
      },
      {
        field: 'quality',
        type: 'string',
        pattern: /^(standard|hd)$/
      }
    ],
    auditAction: 'image_generation'
  }
);
