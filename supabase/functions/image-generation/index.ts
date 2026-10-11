import { getCorsHeaders, authenticateUser, checkRateLimit, checkCredits, validateApiKey, sanitizeInput } from "../_shared/cors.ts"

interface AppliedToken {
  id: string;
  token: {
    id: string;
    type: string;
    key: string;
    value: string;
    displayName: string;
  };
  position?: { x: number; y: number };
  appliedAt: string;
  effect: {
    type: string;
    parameters: Record<string, any>;
  };
}

interface ImageGenerationRequest {
  prompt: string
  provider?: 'gpt-5' | 'gemini' | 'openai' | 'gemini-nano' | 'gpt-image-1' | 'imagen' | 'imagen-4'
  size?: string
  style?: string
  quality?: 'standard' | 'hd'
  appliedTokens?: AppliedToken[]
}

const SUPPORTED_PROVIDERS = ['openai', 'gpt-5', 'gemini', 'gemini-nano', 'gpt-image-1', 'imagen', 'imagen-4']

const SIZE_MAP: Record<string, string> = {
  '1024x1024': '1024x1024',
  '1536x1024': '1536x1024',
  '1024x1536': '1024x1536',
  '1792x1024': '1536x1024',
  '1024x1792': '1024x1536'
}

// Process applied tokens to enhance the prompt
function processAppliedTokens(basePrompt: string, appliedTokens: AppliedToken[]): string {
  let enhancedPrompt = basePrompt;

  for (const appliedToken of appliedTokens) {
    const { token, effect } = appliedToken;

    switch (effect.type) {
      case 'text-overlay':
        enhancedPrompt += `. Add the text "${effect.parameters.text}" at position (${effect.parameters.position.x}%, ${effect.parameters.position.y}%) with ${effect.parameters.fontSize}px ${effect.parameters.fontFamily} font in ${effect.parameters.color} color`;
        if (effect.parameters.strokeWidth > 0) {
          enhancedPrompt += ` with ${effect.parameters.strokeWidth}px ${effect.parameters.stroke} outline`;
        }
        break;

      case 'filter':
        enhancedPrompt += `. Apply a ${effect.parameters.filterType} filter with ${Math.round(effect.parameters.intensity * 100)}% intensity using ${effect.parameters.blendMode} blend mode`;
        break;

      case 'style':
        enhancedPrompt += `. Transform the image with ${effect.parameters.stylePrompt} style at ${Math.round(effect.parameters.strength * 100)}% strength`;
        if (effect.parameters.preserveComposition) {
          enhancedPrompt += ', preserving the original composition';
        }
        break;

      case 'color-adjustment':
        enhancedPrompt += `. Apply ${effect.parameters.adjustmentType} with ${effect.parameters.color} color at ${Math.round(effect.parameters.opacity * 100)}% opacity`;
        break;

      default:
        enhancedPrompt += `. Apply ${token.displayName} effect: ${token.value}`;
    }
  }

  console.log(`📝 Enhanced prompt with ${appliedTokens.length} tokens:`, enhancedPrompt);
  return enhancedPrompt;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    // Authenticate user
    const { user, error: authError } = await authenticateUser(req)
    if (authError) {
      return new Response(
        JSON.stringify({ error: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let requestBody: ImageGenerationRequest
    try {
      requestBody = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { prompt, provider = 'gpt-5', size = '1024x1024', style, quality = 'standard', appliedTokens } = requestBody

    // Validate and sanitize inputs
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!SUPPORTED_PROVIDERS.includes(provider)) {
      return new Response(
        JSON.stringify({ error: 'Unsupported provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const imageSize = SIZE_MAP[size]
    if (!imageSize) {
      return new Response(
        JSON.stringify({ error: 'Unsupported size. Valid sizes are 1024x1024, 1536x1024, 1024x1536, 1792x1024, 1024x1792' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(prompt)
    const sanitizedStyle = style ? sanitizeInput(style) : ''

    if (!sanitizedPrompt) {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process applied tokens to enhance the prompt
    let enhancedPrompt = sanitizedPrompt
    if (appliedTokens && appliedTokens.length > 0) {
      console.log(`🎨 Processing ${appliedTokens.length} applied tokens`)
      enhancedPrompt = processAppliedTokens(sanitizedPrompt, appliedTokens)
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id, true)
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      )
    }

    // Check user credits
    const creditCheck = await checkCredits(user.id)
    if (!creditCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Daily credit limit exceeded',
          remainingCredits: creditCheck.remainingCredits,
          resetTime: new Date(creditCheck.resetTime).toISOString()
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Credits-Remaining': creditCheck.remainingCredits.toString(),
            'X-Credits-Reset': creditCheck.resetTime.toString()
          }
        }
      )
    }

    // Get and validate API keys
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    console.log('API Keys check:', {
      hasOpenAI: !!openaiKey,
      openAIValid: openaiKey ? validateApiKey(openaiKey, 'openai') : false,
      hasGemini: !!geminiKey,
      geminiValid: geminiKey ? validateApiKey(geminiKey, 'gemini') : false,
    })

    if (!openaiKey || !validateApiKey(openaiKey, 'openai')) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    // Existing Gemini option retains compatibility but uses the configured OpenAI image backend.
    const imageModel = Deno.env.get('OPENAI_IMAGE_MODEL') || 'gpt-image-2.5-sunburst';
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: imageModel,
        prompt: enhancedPrompt + (sanitizedStyle ? ` Style: ${sanitizedStyle}` : ''),
        n: 1,
        size: imageSize,
        quality: quality === 'hd' ? 'high' : 'medium',
        output_format: 'png'
      })
    });
    const generated = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('OpenAI image generation rejected', { status: response.status, code: generated?.error?.code });
      return new Response(JSON.stringify({ error: 'Image provider rejected the request', providerStatus: response.status }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const data = generated.data?.[0];
    const imageUrl = data?.b64_json ? `data:image/png;base64,${data.b64_json}` : data?.url;
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'Image provider returned no image' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(
      JSON.stringify({
        imageUrl,
        imageUrls: [imageUrl],
        prompt: sanitizedPrompt,
        provider,
        size: imageSize,
        style: sanitizedStyle,
        quality,
        creditsRemaining: creditCheck.remainingCredits
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Credits-Remaining': creditCheck.remainingCredits.toString()
        }
      }
    )

  } catch (error) {
    console.error('Image Generation Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})