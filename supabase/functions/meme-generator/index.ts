import { getCorsHeaders, authenticateUser, checkRateLimit, checkCredits, validateApiKey, sanitizeInput, isValidUrl } from "../_shared/cors.ts"

interface MemeGeneratorRequest {
  topText: string
  bottomText: string
  referenceImageUrl: string
  additionalStyle?: string
  provider?: 'openai' | 'gemini' | 'gpt-image-1'
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

    const { topText, bottomText, referenceImageUrl, additionalStyle, provider }: MemeGeneratorRequest = await req.json()

    if (!topText && !bottomText) {
      return new Response(
        JSON.stringify({ error: 'At least one of topText or bottomText is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedTopText = topText ? sanitizeInput(topText) : ''
    const sanitizedBottomText = bottomText ? sanitizeInput(bottomText) : ''
    const sanitizedStyle = additionalStyle ? sanitizeInput(additionalStyle) : ''

    if (!referenceImageUrl || (!referenceImageUrl.startsWith('data:') && !isValidUrl(referenceImageUrl))) {
      return new Response(
        JSON.stringify({ error: 'Valid reference image URL is required' }),
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

    let imageUrl: string = ''

    const memePrompt = `Create a meme using this reference image. Add "${sanitizedTopText}" as top text and "${sanitizedBottomText}" as bottom text in large, bold, white letters with black outline. ${sanitizedStyle ? `Style: ${sanitizedStyle}` : ''} Make it humorous and well-formatted like a classic meme.`

    async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
      try {
        if (url.startsWith('data:')) {
          const match = url.match(/^data:([^;]+);base64,(.+)$/)
          if (match) return { mimeType: match[1], data: match[2] }
          return null
        }
        const resp = await fetch(url)
        if (!resp.ok) return null
        const blob = await resp.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const binaryString = uint8Array.reduce((s, b) => s + String.fromCharCode(b), '')
        return { mimeType: blob.type || 'image/png', data: btoa(binaryString) }
      } catch {
        return null
      }
    }

    if ((provider === 'gemini' || !provider) && geminiKey) {
      const imageInfo = await fetchImageAsBase64(referenceImageUrl)
      if (!imageInfo) throw new Error('Failed to fetch reference image')

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: memePrompt },
              { inline_data: { mime_type: imageInfo.mimeType, data: imageInfo.data } }
            ]
          }],
          generationConfig: { responseMediaType: "IMAGE" }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      for (const candidate of data.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
            break
          }
        }
        if (imageUrl) break
      }
    }

    if (!imageUrl && openaiKey) {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `${memePrompt} Classic internet meme format.`,
          n: 1,
          size: "1024x1024"
        })
      })

      if (response.ok) {
        const data = await response.json()
        imageUrl = data.data?.[0]?.url || ''
      }
    }

    if (!imageUrl) {
      throw new Error('Failed to generate meme image')
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
