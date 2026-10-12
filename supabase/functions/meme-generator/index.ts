import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { getCorsHeaders, authenticateUser, validateApiKey, getUserApiKey, OPENAI_KEY_MISSING_ERROR, sanitizeInput, isValidUrl } from "../_shared/cors.ts"
import { generateWithGptImage } from "../_shared/imageProviders.ts"

console.log("Meme Generator Edge Function loaded")

interface MemeGeneratorRequest {
  topText: string
  bottomText: string
  referenceImageUrl: string
  additionalStyle?: string
  provider?: 'openai' | 'gpt-image-1'
}

serve(async (req) => {
  const headers = getCorsHeaders(req.headers.get('origin'))

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const { user, error: authError } = await authenticateUser(req)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: authError || 'Authentication required' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const { topText, bottomText, referenceImageUrl, additionalStyle, provider }: MemeGeneratorRequest = await req.json()

    // Validate and sanitize inputs
    if (!topText && !bottomText) {
      return new Response(
        JSON.stringify({ error: 'At least one of topText or bottomText is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedTopText = topText ? sanitizeInput(topText) : '';
    const sanitizedBottomText = bottomText ? sanitizeInput(bottomText) : '';
    const sanitizedStyle = additionalStyle ? sanitizeInput(additionalStyle) : '';

    if (!referenceImageUrl || !isValidUrl(referenceImageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Valid reference image URL is required' }),
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

    let imageUrl: string = ''

    const memePrompt = `Create a humorous meme based on this reference image. Add "${sanitizedTopText}" as the top text in large, bold, white letters with black outline. Add "${sanitizedBottomText}" as the bottom text in large, bold, white letters with black outline. ${sanitizedStyle ? `Style: ${sanitizedStyle}. ` : ''}Make it look like a classic meme format with the text clearly readable and well-positioned. Keep the original image's essence but make it funny and shareable.`

    try {
      imageUrl = await generateWithGptImage({ prompt: memePrompt, apiKey: userApiKey, referenceImageUrl })
    } catch (error) {
      console.error('Meme generation failed:', error)
      return new Response(
        JSON.stringify({ error: 'Meme generation failed. Please try again.' }),
        { status: 502, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Meme Generator Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  }
})
