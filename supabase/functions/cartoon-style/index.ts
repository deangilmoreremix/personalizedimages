import { getCorsHeaders, authenticateUser, checkRateLimit, checkCredits, validateApiKey, sanitizeInput, isValidUrl } from "../_shared/cors.ts"
import { generateWithGptImage, generateWithGeminiImage } from "../_shared/imageProviders.ts"

interface CartoonStyleRequest {
  prompt: string
  provider: 'openai' | 'gemini'
  style?: string
  referenceImageUrl?: string
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
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before trying again.' }),
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const credits = await checkCredits(user.id)
    if (!credits.allowed) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits', remainingCredits: credits.remainingCredits }),
        { status: 402, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const { prompt, provider, style, referenceImageUrl }: CartoonStyleRequest = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(prompt)

    if (referenceImageUrl && !referenceImageUrl.startsWith('data:') && !isValidUrl(referenceImageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid reference image URL' }),
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

    const cartoonStyle = style || 'cartoon'
    const enhancedPrompt = `${sanitizedPrompt} in ${cartoonStyle} style. Clean lines, vibrant colors, simplified features, animated look, bold outlines.`

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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  }
})
