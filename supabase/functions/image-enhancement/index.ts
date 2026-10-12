import { getCorsHeaders, authenticateUser, checkRateLimit, validateApiKey, sanitizeInput, isValidUrl } from "../_shared/cors.ts"
import { generateWithGptImage, generateWithGeminiImage } from "../_shared/imageProviders.ts"

interface ImageEnhancementRequest {
  imageUrl: string
  prompt?: string
  provider: 'openai' | 'gemini'
  enhancementType?: 'upscale' | 'edit' | 'style-transfer' | 'inpaint' | 'variations'
  maskUrl?: string
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers })
  }

  try {
    const { user, error: authError } = await authenticateUser(req)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const rateLimit = await checkRateLimit(user.id, true)
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const {
      imageUrl,
      prompt,
      provider,
      enhancementType,
      maskUrl
    }: ImageEnhancementRequest = await req.json()

    if (!imageUrl || !isValidUrl(imageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Valid image URL is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = prompt ? sanitizeInput(prompt) : ''

    if (maskUrl && !isValidUrl(maskUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid mask URL' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if ((!openaiKey || !validateApiKey(openaiKey, 'openai')) &&
        (!geminiKey || !validateApiKey(geminiKey, 'gemini'))) {
      return new Response(
        JSON.stringify({ error: 'Valid API keys not configured' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    let resultImageUrl: string = ''

    let enhancementPrompt = sanitizedPrompt || 'Enhance this image with improved quality, clarity, and detail.'

    if (enhancementType === 'upscale') {
      enhancementPrompt = 'Upscale and enhance this image to higher quality with more detail and clarity.'
    } else if (enhancementType === 'style-transfer') {
      enhancementPrompt = `Apply artistic style transformation to this image: ${sanitizedPrompt}`
    } else if (enhancementType === 'edit') {
      enhancementPrompt = `Edit this image: ${sanitizedPrompt}`
    } else if (enhancementType === 'variations') {
      enhancementPrompt = 'Create a creative variation of this image with different colors and lighting while preserving its subject.'
    }

    try {
      if (provider === 'gemini' && geminiKey) {
        resultImageUrl = await generateWithGeminiImage({ prompt: enhancementPrompt, apiKey: geminiKey, referenceImageUrl: imageUrl })
      } else if (openaiKey) {
        resultImageUrl = await generateWithGptImage({ prompt: enhancementPrompt, apiKey: openaiKey, referenceImageUrl: imageUrl })
      } else if (geminiKey) {
        resultImageUrl = await generateWithGeminiImage({ prompt: enhancementPrompt, apiKey: geminiKey, referenceImageUrl: imageUrl })
      } else {
        return new Response(
          JSON.stringify({ error: 'API keys not configured' }),
          { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
        )
      }
    } catch (providerError) {
      console.error('Primary enhancement provider failed:', providerError)
      try {
        if (openaiKey && provider === 'gemini') {
          resultImageUrl = await generateWithGptImage({ prompt: enhancementPrompt, apiKey: openaiKey, referenceImageUrl: imageUrl })
        } else if (geminiKey) {
          resultImageUrl = await generateWithGeminiImage({ prompt: enhancementPrompt, apiKey: geminiKey, referenceImageUrl: imageUrl })
        } else {
          throw providerError
        }
      } catch (fallbackError) {
        console.error('Fallback enhancement provider failed:', fallbackError)
        throw providerError
      }
    }

    return new Response(
      JSON.stringify({ imageUrl: resultImageUrl }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Image Enhancement Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    )
  }
})

