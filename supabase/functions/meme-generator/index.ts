import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput, isValidUrl } from "../_shared/cors.ts"

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

    // Validate and sanitize inputs
    if (!topText && !bottomText) {
      return new Response(
        JSON.stringify({ error: 'At least one of topText or bottomText is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedTopText = topText ? sanitizeInput(topText) : '';
    const sanitizedBottomText = bottomText ? sanitizeInput(bottomText) : '';
    const sanitizedStyle = additionalStyle ? sanitizeInput(additionalStyle) : '';

    if (!referenceImageUrl || !isValidUrl(referenceImageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Valid reference image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get and validate API keys
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if ((!openaiKey || !validateApiKey(openaiKey, 'openai')) &&
        (!geminiKey || !validateApiKey(geminiKey, 'gemini'))) {
      return new Response(
        JSON.stringify({ error: 'Valid API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let imageUrl: string = ''

    // Use AI to generate memes by describing the text overlay in the prompt
    // Both OpenAI DALL-E 3 and Gemini can generate images with text

    if (provider === 'gpt-image-1' && openaiKey) {
      // Use DALL-E 3 to generate a meme image with text overlay
      try {
        // Create a comprehensive prompt that includes the reference image description and text overlay
        let memePrompt = `Create a humorous meme image`

        if (referenceImageUrl) {
          memePrompt += ` based on this reference image style and composition`
        }

        if (sanitizedTopText) {
          memePrompt += ` with "${sanitizedTopText}" as large, bold white text at the top`
        }

        if (sanitizedBottomText) {
          memePrompt += ` and "${sanitizedBottomText}" as large, bold white text at the bottom`
        }

        if (sanitizedStyle) {
          memePrompt += `. ${sanitizedStyle}`
        }

        memePrompt += `. Make it funny and well-formatted with high contrast text that's easy to read.`

        console.log('Generating meme with DALL-E 3:', memePrompt)

        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: memePrompt,
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
        console.log('Successfully generated meme with DALL-E 3')

      } catch (error) {
        console.warn('DALL-E 3 meme generation failed:', error)
        throw error
      }

    } else if ((provider === 'gemini' || !provider) && geminiKey) {
      // Use Gemini to generate a meme image with text overlay
      try {
        let memePrompt = `Generate a humorous meme image`

        if (referenceImageUrl) {
          // Include reference image for style inspiration
          const imageResponse = await fetch(referenceImageUrl)
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob()
            const base64Data = await blobToBase64(imageBlob)

            memePrompt += ` inspired by this reference image style`
          }
        }

        if (sanitizedTopText) {
          memePrompt += ` with "${sanitizedTopText}" as large, bold white text at the top of the image`
        }

        if (sanitizedBottomText) {
          memePrompt += ` and "${sanitizedBottomText}" as large, bold white text at the bottom of the image`
        }

        if (sanitizedStyle) {
          memePrompt += `. ${sanitizedStyle}`
        }

        memePrompt += `. Make it funny, well-formatted with high contrast text that's easy to read against any background.`

        console.log('Generating meme with Gemini:', memePrompt)

        const requestBody: any = {
          contents: [{ parts: [{ text: memePrompt }] }],
          generationConfig: {
            responseMediaType: "IMAGE"
          }
        }

        // Add reference image if available
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
            console.warn('Failed to add reference image to Gemini request:', error)
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

        console.log('Successfully generated meme with Gemini')

      } catch (error) {
        console.warn('Gemini meme generation failed:', error)
        throw error
      }

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