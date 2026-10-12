import { getCorsHeaders, authenticateUser, checkRateLimit, validateApiKey, getUserApiKey, OPENAI_KEY_MISSING_ERROR, sanitizeInput, isValidUrl } from "../_shared/cors.ts"
import { generateWithGptImage } from "../_shared/imageProviders.ts"

interface ImageEnhancementRequest {
  imageUrl: string
  prompt?: string
  provider?: 'openai'
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

    const userApiKey = getUserApiKey(req, 'openai')
    if (!userApiKey || !validateApiKey(userApiKey, 'openai')) {
      return new Response(
        JSON.stringify({ error: OPENAI_KEY_MISSING_ERROR }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
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
      resultImageUrl = await generateWithGptImage({ prompt: enhancementPrompt, apiKey: userApiKey, referenceImageUrl: imageUrl })
    } catch (providerError) {
      console.error('Image enhancement failed:', providerError)
      throw providerError
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

