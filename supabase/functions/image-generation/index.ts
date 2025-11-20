import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput } from "../_shared/cors.ts"

console.log("Image Generation Edge Function loaded")

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
  provider?: 'gpt-5' | 'gemini' | 'openai'
  size?: '1024x1024' | '1024x1792' | '1792x1024'
  style?: string
  quality?: 'standard' | 'hd'
  appliedTokens?: AppliedToken[]
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, provider = 'gpt-5', size = '1024x1024', style, quality = 'standard', appliedTokens }: ImageGenerationRequest = await req.json()

    // Validate and sanitize inputs
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(prompt)
    const sanitizedStyle = style ? sanitizeInput(style) : ''

    // Process applied tokens to enhance the prompt
    let enhancedPrompt = sanitizedPrompt
    if (appliedTokens && appliedTokens.length > 0) {
      console.log(`🎨 Processing ${appliedTokens.length} applied tokens`)
      enhancedPrompt = processAppliedTokens(sanitizedPrompt, appliedTokens)
    }

    // Get and validate API keys
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    console.log('🔑 API Keys check:', {
      hasOpenAI: !!openaiKey,
      openAIValid: openaiKey ? validateApiKey(openaiKey, 'openai') : false,
      openAIPrefix: openaiKey ? openaiKey.substring(0, 10) + '...' : 'none',
      hasGemini: !!geminiKey,
      geminiValid: geminiKey ? validateApiKey(geminiKey, 'gemini') : false,
      geminiPrefix: geminiKey ? geminiKey.substring(0, 10) + '...' : 'none'
    })

    let imageUrl: string = ''

    if (provider === 'gpt-5' && openaiKey && validateApiKey(openaiKey, 'openai')) {
      // Use GPT-5 (likely referring to GPT-4o or future GPT-5) for image generation
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "dall-e-3", // Using DALL-E 3 as GPT-5 image generation capability
            prompt: sanitizedPrompt + (sanitizedStyle ? ` Style: ${sanitizedStyle}` : ''),
            n: 1,
            size: size,
            quality: quality
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`GPT-5/OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        imageUrl = data.data[0].url

      } catch (error) {
        console.error('GPT-5 image generation failed:', error)
        throw new Error(`Image generation failed: ${error.message}`)
      }

    } else if (provider === 'gemini') {
      // Gemini doesn't support native image generation, fall back to OpenAI
      console.warn('Gemini does not support image generation, falling back to OpenAI DALL-E')

      if (!openaiKey || !validateApiKey(openaiKey, 'openai')) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API key required for image generation (Gemini fallback)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: sanitizedPrompt + (sanitizedStyle ? ` Style: ${sanitizedStyle}` : ''),
            n: 1,
            size: size,
            quality: quality
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        imageUrl = data.data[0].url

      } catch (error) {
        console.error('OpenAI fallback image generation failed:', error)
        throw new Error(`Image generation failed: ${error.message}`)
      }

    } else if (provider === 'openai' && openaiKey && validateApiKey(openaiKey, 'openai')) {
      // Fallback to standard OpenAI DALL-E
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: sanitizedPrompt + (sanitizedStyle ? ` Style: ${sanitizedStyle}` : ''),
            n: 1,
            size: size,
            quality: quality
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        imageUrl = data.data[0].url

      } catch (error) {
        console.error('OpenAI image generation failed:', error)
        throw new Error(`Image generation failed: ${error.message}`)
      }

    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not available or API key missing/invalid` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        imageUrl,
        prompt: sanitizedPrompt,
        provider,
        size,
        style: sanitizedStyle,
        quality
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Image Generation Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})