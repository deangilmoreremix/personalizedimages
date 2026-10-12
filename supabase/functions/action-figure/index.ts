import { getCorsHeaders, authenticateUser, checkRateLimit, validateApiKey, getUserApiKey, OPENAI_KEY_MISSING_ERROR, sanitizeInput, isValidUrl } from "../_shared/cors.ts"
import { generateWithGptImage } from "../_shared/imageProviders.ts"

interface ActionFigureRequest {
  prompt: string
  provider?: 'openai' | 'gpt-image-1'
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

    const { prompt, referenceImageUrl }: ActionFigureRequest = await req.json()

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

    const userApiKey = getUserApiKey(req, 'openai')
    if (!userApiKey || !validateApiKey(userApiKey, 'openai')) {
      return new Response(
        JSON.stringify({ error: OPENAI_KEY_MISSING_ERROR }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const enhancedPrompt = `Create a highly detailed, professional-quality product photo of an action figure: ${sanitizedPrompt}. The figure should look like a real commercial toy with articulation points, detailed textures, realistic packaging design, and toy store lighting.`

    let imageUrl = ''

    try {
      imageUrl = await generateWithGptImage({ prompt: enhancedPrompt, apiKey: userApiKey, referenceImageUrl })
    } catch (providerError) {
      console.error('Action figure image generation failed:', providerError)
      throw providerError
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
