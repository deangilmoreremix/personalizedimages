import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput, isValidUrl } from "../_shared/cors.ts"

console.log("Image Description Edge Function loaded")

interface ImageDescriptionRequest {
  imageUrl: string
  provider: 'openai' | 'gemini'
  style?: 'concise' | 'detailed' | 'creative' | 'technical'
  maxLength?: number
  includeMetadata?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, provider = 'openai', style = 'detailed', maxLength = 200, includeMetadata = false }: ImageDescriptionRequest = await req.json()

    if (!imageUrl || !isValidUrl(imageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Valid image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if ((!openaiKey || !validateApiKey(openaiKey, 'openai')) &&
        (!geminiKey || !validateApiKey(geminiKey, 'gemini'))) {
      return new Response(
        JSON.stringify({ error: 'Valid API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create description prompt based on style
    let descriptionPrompt = ''
    switch (style) {
      case 'concise':
        descriptionPrompt = `Provide a brief, concise description of this image in ${maxLength} characters or less. Focus on the main subject and key elements.`
        break
      case 'detailed':
        descriptionPrompt = `Provide a detailed description of this image, including objects, people, setting, colors, composition, lighting, and mood. Be comprehensive but natural.`
        break
      case 'creative':
        descriptionPrompt = `Create a creative, engaging description of this image as if writing for a blog post or social media. Make it vivid and captivating.`
        break
      case 'technical':
        descriptionPrompt = `Provide a technical description of this image including composition, lighting, colors, focal points, and photographic elements.`
        break
      default:
        descriptionPrompt = 'Describe this image in detail.'
    }

    let description = ''
    let metadata = null

    if (provider === 'openai' && openaiKey) {
      // Fetch image and convert to base64
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image')
      }

      const imageBlob = await imageResponse.blob()
      const base64Data = await blobToBase64(imageBlob)

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: descriptionPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageBlob.type};base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          max_tokens: Math.min(maxLength / 4, 500) // Estimate tokens needed
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      description = data.choices?.[0]?.message?.content || ''

      if (includeMetadata) {
        metadata = {
          model: 'gpt-4o',
          tokens: data.usage?.total_tokens || 0,
          imageSize: imageBlob.size,
          imageType: imageBlob.type
        }
      }

    } else if (provider === 'gemini' && geminiKey) {
      // Fetch image and convert to base64
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image')
      }

      const imageBlob = await imageResponse.blob()
      const base64Data = await blobToBase64(imageBlob)

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: descriptionPrompt },
                {
                  inline_data: {
                    mime_type: imageBlob.type,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: Math.min(maxLength / 4, 500)
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      description = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      if (includeMetadata) {
        metadata = {
          model: 'gemini-1.5-flash',
          imageSize: imageBlob.size,
          imageType: imageBlob.type
        }
      }

    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not available or API key missing` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = {
      description: description.substring(0, maxLength),
      style,
      provider,
      truncated: description.length > maxLength
    }

    if (includeMetadata && metadata) {
      response.metadata = metadata
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Image Description Error:', error)
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