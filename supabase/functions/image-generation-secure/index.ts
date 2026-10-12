import { createEdgeFunction, createSecureResponse, SecurityError } from '../_shared/middleware.ts';
import { validateApiKey, getUserApiKey, OPENAI_KEY_MISSING_ERROR } from '../_shared/cors.ts';

interface ImageGenerationRequest {
  prompt: string;
  provider?: 'gpt-5' | 'openai';
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  style?: string;
  quality?: 'standard' | 'hd';
}

async function generateImage(prompt: string, apiKey: string, size: string, quality: string, style?: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: Deno.env.get('OPENAI_IMAGE_MODEL') || 'gpt-image-2.5-sunburst',
      prompt: prompt + (style ? ` Style: ${style}` : ''),
      n: 1,
      size,
      quality: quality === 'hd' ? 'high' : 'medium',
      output_format: 'png'
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
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    throw new SecurityError('Image generation returned no image data', 502, 'GENERATION_ERROR');
  }
  return `data:image/png;base64,${b64}`;
}

export default createEdgeFunction(
  async (req, context) => {
    const { prompt, provider = 'openai', size = '1024x1024', style, quality = 'standard' } = context.body as ImageGenerationRequest;

    const userApiKey = getUserApiKey(req, 'openai');
    if (!userApiKey || !validateApiKey(userApiKey, 'openai')) {
      return createSecureResponse({ error: OPENAI_KEY_MISSING_ERROR }, 400);
    }

    const imageUrl = await generateImage(prompt, userApiKey, size, quality, style);

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
