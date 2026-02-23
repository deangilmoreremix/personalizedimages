import { getCorsHeaders, authenticateUser, checkRateLimit, checkCredits, validateApiKey, sanitizeInput, isValidUrl } from "../_shared/cors.ts"

interface ActionFigureRequest {
  prompt: string
  provider: 'openai' | 'gemini' | 'gpt-image-1'
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

    const { prompt, provider, referenceImageUrl }: ActionFigureRequest = await req.json()

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

    const enhancedPrompt = `Create a highly detailed, professional-quality product photo of an action figure: ${sanitizedPrompt}. The figure should look like a real commercial toy with articulation points, detailed textures, realistic packaging design, and toy store lighting.`

    let imageUrl: string = ''

    if (provider === 'openai' && openaiKey) {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: "1024x1024"
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      imageUrl = data.data[0].url

    } else if (provider === 'gemini' && geminiKey) {
      const requestBody: any = {
        contents: [{ parts: [{ text: enhancedPrompt }] }],
        generationConfig: { responseMediaType: "IMAGE" }
      }

      if (referenceImageUrl) {
        try {
          let imageData = ''
          let mimeType = 'image/png'

          if (referenceImageUrl.startsWith('data:')) {
            const match = referenceImageUrl.match(/^data:([^;]+);base64,(.+)$/)
            if (match) {
              mimeType = match[1]
              imageData = match[2]
            }
          } else {
            const imageResponse = await fetch(referenceImageUrl)
            if (imageResponse.ok) {
              const imageBlob = await imageResponse.blob()
              mimeType = imageBlob.type || 'image/png'
              const arrayBuffer = await imageBlob.arrayBuffer()
              const uint8Array = new Uint8Array(arrayBuffer)
              imageData = uint8Array.reduce((s, b) => s + String.fromCharCode(b), '')
              imageData = btoa(imageData)
            }
          }

          if (imageData) {
            requestBody.contents[0].parts.push({
              inline_data: { mime_type: mimeType, data: imageData }
            })
          }
        } catch (error) {
          console.warn('Failed to fetch reference image:', error)
        }
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
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

      if (!imageUrl) {
        throw new Error('No image found in Gemini response')
      }

    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not available or API key missing` }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
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
