import { getCorsHeaders, authenticateUser, checkRateLimit, validateApiKey, sanitizeInput, isValidUrl } from "../_shared/cors.ts"

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

    if (provider === 'gemini' && geminiKey) {
      try {
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image')
        }

        const imageBlob = await imageResponse.blob()
        const base64Data = await blobToBase64(imageBlob)

        let enhancementPrompt = sanitizedPrompt || 'Enhance this image with improved quality, clarity, and detail.'

        if (enhancementType === 'upscale') {
          enhancementPrompt = 'Upscale and enhance this image to higher quality with more detail and clarity.'
        } else if (enhancementType === 'style-transfer') {
          enhancementPrompt = `Apply artistic style transformation to this image: ${sanitizedPrompt}`
        } else if (enhancementType === 'edit') {
          enhancementPrompt = `Edit this image: ${sanitizedPrompt}`
        }

        const requestBody = {
          contents: [{
            parts: [
              { text: enhancementPrompt },
              {
                inline_data: {
                  mime_type: imageBlob.type,
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            responseMediaType: "IMAGE"
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
              resultImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
              break
            }
          }
          if (resultImageUrl) break
        }

        if (!resultImageUrl) {
          throw new Error('No image found in Gemini response')
        }

      } catch (error) {
        console.error('Gemini enhancement error:', error)
        throw error
      }

    } else if (provider === 'openai' && openaiKey) {
      if (enhancementType === 'variations') {
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image')
        }

        const imageBlob = await imageResponse.blob()
        const formData = new FormData()
        formData.append('image', imageBlob)
        formData.append('n', '1')
        formData.append('size', '1024x1024')

        const response = await fetch('https://api.openai.com/v1/images/variations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`
          },
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        resultImageUrl = data.data[0].url

      } else if (enhancementType === 'edit' && maskUrl && sanitizedPrompt) {
        const [imageResponse, maskResponse] = await Promise.all([
          fetch(imageUrl),
          fetch(maskUrl)
        ])

        if (!imageResponse.ok || !maskResponse.ok) {
          throw new Error('Failed to fetch image or mask')
        }

        const [imageBlob, maskBlob] = await Promise.all([
          imageResponse.blob(),
          maskResponse.blob()
        ])

        const formData = new FormData()
        formData.append('image', imageBlob)
        formData.append('mask', maskBlob)
        formData.append('prompt', sanitizedPrompt)
        formData.append('n', '1')
        formData.append('size', '1024x1024')

        const response = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`
          },
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        resultImageUrl = data.data[0].url

      } else {
        const enhancementPrompt = `An enhanced, higher quality version of: ${sanitizedPrompt || 'professional photograph with improved detail'}`

        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: enhancementPrompt,
            n: 1,
            size: "1024x1024"
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        resultImageUrl = data.data[0].url
      }

    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not available or API key missing` }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
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

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '')
  return btoa(binaryString)
}
