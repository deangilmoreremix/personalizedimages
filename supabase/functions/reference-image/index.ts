import { getCorsHeaders, validateApiKey, sanitizeInput, isValidUrl, authenticateUser, checkRateLimit } from "../_shared/cors.ts"
import { generateWithGptImage, generateWithGeminiImage } from "../_shared/imageProviders.ts"

interface ReferenceImageRequest {
  prompt: string
  provider: 'openai' | 'gemini' | 'gpt-image-1'
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
      provider,
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
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if ((!openaiKey || !validateApiKey(openaiKey, 'openai')) &&
        (!geminiKey || !validateApiKey(geminiKey, 'gemini'))) {
      return new Response(
        JSON.stringify({ error: 'API keys not configured' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
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

    const preferGemini = (provider === 'gemini' || provider === 'gemini2flash') && !!geminiKey

    try {
      if (preferGemini && geminiKey) {
        imageUrl = await generateWithGeminiImage({ prompt: enhancedPrompt, apiKey: geminiKey, referenceImageUrl })
      } else if (openaiKey) {
        imageUrl = await generateWithGptImage({ prompt: enhancedPrompt, apiKey: openaiKey, referenceImageUrl })
      } else if (geminiKey) {
        imageUrl = await generateWithGeminiImage({ prompt: enhancedPrompt, apiKey: geminiKey, referenceImageUrl })
      } else {
        return new Response(
          JSON.stringify({ error: 'API keys not configured' }),
          { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
        )
      }
    } catch (providerError) {
      console.error('Primary image provider failed:', providerError)
      try {
        if (!preferGemini && geminiKey) {
          imageUrl = await generateWithGeminiImage({ prompt: enhancedPrompt, apiKey: geminiKey, referenceImageUrl })
        } else if (openaiKey) {
          imageUrl = await generateWithGptImage({ prompt: enhancedPrompt, apiKey: openaiKey, referenceImageUrl })
        } else {
          throw providerError
        }
      } catch (fallbackError) {
        console.error('Fallback image provider failed:', fallbackError)
        throw providerError
      }
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
