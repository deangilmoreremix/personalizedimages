import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput, isValidUrl } from "../_shared/cors.ts"

console.log("Reference Image Edge Function loaded")

interface ReferenceImageRequest {
  prompt: string
  provider: 'openai' | 'gemini' | 'gpt-image-1'
  referenceImageUrl: string
  imageType?: 'cartoonStyle' | 'ghibliStyle' | 'actionFigure' | 'general'
  basePrompt?: string
  style?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!referenceImageUrl || !isValidUrl(referenceImageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Valid reference image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(basePrompt || prompt)

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if ((!openaiKey || !validateApiKey(openaiKey, 'openai')) &&
        (!geminiKey || !validateApiKey(geminiKey, 'gemini'))) {
      return new Response(
        JSON.stringify({ error: 'Valid API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enhance prompt based on image type
    let enhancedPrompt = sanitizedPrompt
    if (imageType === 'cartoonStyle' && style) {
      enhancedPrompt = `${sanitizedPrompt} in ${style} style. Clean lines, vibrant colors, simplified features, animated look.`
    } else if (imageType === 'ghibliStyle') {
      enhancedPrompt = `Studio Ghibli style: ${sanitizedPrompt}. Whimsical atmosphere, detailed backgrounds, watercolor style.`
    } else if (imageType === 'actionFigure') {
      enhancedPrompt = `Action figure style: ${sanitizedPrompt}. Professional toy photography, detailed articulation, packaging.`
    }

    let imageUrl: string = ''

    if (provider === 'gemini' && geminiKey) {
      try {
        const imageResponse = await fetch(referenceImageUrl)
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch reference image')
        }

        const imageBlob = await imageResponse.blob()
        const base64Data = await blobToBase64(imageBlob)

        const requestBody = {
          contents: [{
            parts: [
              { text: `Using this image as reference, create: ${enhancedPrompt}` },
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
              imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
              break
            }
          }
          if (imageUrl) break
        }

        if (!imageUrl) {
          throw new Error('No image found in Gemini response')
        }

      } catch (error) {
        console.error('Gemini reference image error:', error)
        throw error
      }

    } else if (provider === 'openai' && openaiKey) {
      // For OpenAI, we'll use the enhanced prompt with reference context
      // Note: DALL-E 3 doesn't support direct image-to-image, so we describe the reference
      const contextPrompt = `Using a reference image as inspiration: ${enhancedPrompt}. The reference image contains important visual elements that should be incorporated into the generated image.`

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: contextPrompt,
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

    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not available or API key missing` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Reference Image Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '')
  return btoa(binaryString)
}
