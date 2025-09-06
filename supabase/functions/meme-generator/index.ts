import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

console.log("Meme Generator Edge Function loaded")

interface MemeGeneratorRequest {
  topText: string
  bottomText: string
  referenceImageUrl: string
  additionalStyle?: string
  provider?: 'openai' | 'gemini' | 'gpt-image-1'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topText, bottomText, referenceImageUrl, additionalStyle, provider }: MemeGeneratorRequest = await req.json()

    if (!topText && !bottomText) {
      return new Response(
        JSON.stringify({ error: 'At least one of topText or bottomText is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!referenceImageUrl) {
      return new Response(
        JSON.stringify({ error: 'Reference image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get API keys from environment
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if (!openaiKey && !geminiKey) {
      return new Response(
        JSON.stringify({ error: 'No API keys configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let imageUrl: string = ''

    // For now, we'll use a simple approach: return the reference image
    // In a production implementation, you would use an image editing API
    // or generate a new image with the text overlaid

    if (provider === 'gpt-image-1' && openaiKey) {
      // Use GPT-4 Vision to analyze the reference image and generate a meme
      try {
        // First, fetch and encode the reference image
        const imageResponse = await fetch(referenceImageUrl)
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch reference image')
        }

        const imageBlob = await imageResponse.blob()
        const base64Data = await blobToBase64(imageBlob)

        // Create a prompt for meme generation
        const memePrompt = `Create a meme using this reference image. Add "${topText}" as top text and "${bottomText}" as bottom text. ${additionalStyle ? `Style: ${additionalStyle}` : ''} Make it humorous and well-formatted.`

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4-vision-preview',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: memePrompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${imageBlob.type};base64,${base64Data}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 300
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        const description = data.choices?.[0]?.message?.content || ''

        // For now, return the reference image with a note about the description
        // In production, you'd use an image generation API to create the actual meme
        console.log('Generated meme description:', description)
        imageUrl = referenceImageUrl

      } catch (error) {
        console.warn('GPT-4 Vision failed, falling back to reference image:', error)
        imageUrl = referenceImageUrl
      }

    } else if ((provider === 'gemini' || !provider) && geminiKey) {
      // Use Gemini for meme generation
      try {
        // Fetch and encode the reference image
        const imageResponse = await fetch(referenceImageUrl)
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch reference image')
        }

        const imageBlob = await imageResponse.blob()
        const base64Data = await blobToBase64(imageBlob)

        const memePrompt = `Create a meme using this reference image. Add "${topText}" as top text and "${bottomText}" as bottom text. ${additionalStyle ? `Style: ${additionalStyle}` : ''} Make it humorous and well-formatted.`

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: memePrompt },
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
              responseMediaType: "IMAGE"
            }
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()

        // Extract image from Gemini response
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
        console.warn('Gemini meme generation failed, falling back to reference image:', error)
        imageUrl = referenceImageUrl
      }

    } else {
      // Fallback: return the reference image
      console.log('No suitable provider available, returning reference image')
      imageUrl = referenceImageUrl
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Meme Generator Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to convert blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '')
  return btoa(binaryString)
}