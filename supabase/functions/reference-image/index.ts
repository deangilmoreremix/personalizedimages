import { getCorsHeaders, validateApiKey, getUserApiKey, OPENAI_KEY_MISSING_ERROR, sanitizeInput, isValidUrl, authenticateUser, checkRateLimit } from "../_shared/cors.ts"
import { generateWithGptImage } from "../_shared/imageProviders.ts"

interface ReferenceImageRequest {
  prompt: string
  provider?: 'openai' | 'gpt-image-1'
  referenceImageUrl: string
  imageType?: 'cartoonStyle' | 'ghibliStyle' | 'actionFigure' | 'general'
  basePrompt?: string
  style?: string
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
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)) } }
      )
    }

    const {
      prompt,
      referenceImageUrl,
      imageType,
      basePrompt,
      style
    }: ReferenceImageRequest = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    if (!referenceImageUrl || !isValidUrl(referenceImageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Valid reference image URL is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(basePrompt || prompt)

    const userApiKey = getUserApiKey(req, 'openai')
    if (!userApiKey || !validateApiKey(userApiKey, 'openai')) {
      return new Response(
        JSON.stringify({ error: OPENAI_KEY_MISSING_ERROR }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    let enhancedPrompt = sanitizedPrompt
    if (imageType === 'cartoonStyle' && style) {
      enhancedPrompt = `${sanitizedPrompt} in ${sanitizeInput(style)} style. Clean lines, vibrant colors, simplified features, animated look.`
    } else if (imageType === 'ghibliStyle') {
      enhancedPrompt = `Studio Ghibli style: ${sanitizedPrompt}. Whimsical atmosphere, detailed backgrounds, watercolor style.`
    } else if (imageType === 'actionFigure') {
      enhancedPrompt = `Action figure style: ${sanitizedPrompt}. Professional toy photography, detailed articulation, packaging.`
    }

    let imageUrl = ''

    try {
      imageUrl = await generateWithGptImage({ prompt: enhancedPrompt, apiKey: userApiKey, referenceImageUrl })
    } catch (providerError) {
      console.error('Reference image generation failed:', providerError)
      throw providerError
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Image generation failed. Please try again.' }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    )
  }
})

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '')
  return btoa(binaryString)
}
