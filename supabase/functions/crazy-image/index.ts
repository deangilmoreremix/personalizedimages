import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput } from "../_shared/cors.ts"

console.log("Crazy Image Edge Function loaded")

interface CrazyImageRequest {
  prompt: string
  provider: 'openai' | 'gemini'
  surrealLevel?: 'mild' | 'moderate' | 'extreme'
  style?: string
  referenceImageUrl?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, provider = 'openai', surrealLevel = 'moderate', style, referenceImageUrl }: CrazyImageRequest = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(prompt)
    const sanitizedStyle = style ? sanitizeInput(style) : ''

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if ((!openaiKey || !validateApiKey(openaiKey, 'openai')) &&
        (!geminiKey || !validateApiKey(geminiKey, 'gemini'))) {
      return new Response(
        JSON.stringify({ error: 'Valid API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enhance prompt for surreal/crazy imagery based on level
    let surrealEnhancement = ''
    switch (surrealLevel) {
      case 'mild':
        surrealEnhancement = 'with subtle surreal elements, dreamlike quality, slightly distorted reality'
        break
      case 'moderate':
        surrealEnhancement = 'with surreal and imaginative elements, bending reality, unexpected combinations'
        break
      case 'extreme':
        surrealEnhancement = 'with extreme surrealism, impossible physics, dream logic, bizarre and otherworldly'
        break
    }

    const enhancedPrompt = `${sanitizedPrompt}, ${surrealEnhancement}${sanitizedStyle ? `, ${sanitizedStyle} style` : ''}. Surreal, imaginative, creative, artistic interpretation.`

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
          size: "1024x1024",
          quality: "standard"
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      imageUrl = data.data[0].url

    } else if (provider === 'gemini' && geminiKey) {
      let requestBody: any = {
        contents: [{ parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
          responseMediaType: "IMAGE"
        }
      }

      // Add reference image if provided
      if (referenceImageUrl) {
        try {
          const imageResponse = await fetch(referenceImageUrl)
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob()
            const base64Data = await blobToBase64(imageBlob)

            requestBody.contents[0].parts.push({
              inline_data: {
                mime_type: imageBlob.type,
                data: base64Data
              }
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
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        imageUrl,
        prompt: enhancedPrompt,
        surrealLevel,
        provider
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Crazy Image Error:', error)
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