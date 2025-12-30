import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { getCorsHeaders, authenticateUser, validateApiKey, sanitizeInput, isValidUrl } from "../_shared/cors.ts"

interface GhibliImageRequest {
  prompt: string
  provider: 'openai' | 'gemini' | 'gemini2flash'
  referenceImageUrl?: string
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const { user, error: authError } = await authenticateUser(req)
    if (authError) {
      return new Response(
        JSON.stringify({ error: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { prompt, provider, referenceImageUrl }: GhibliImageRequest = await req.json()

    if (!prompt?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(prompt)

    if (referenceImageUrl && !isValidUrl(referenceImageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid reference image URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get API keys
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if (!openaiKey && !geminiKey) {
      return new Response(
        JSON.stringify({ error: 'API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const enhancedPrompt = `Studio Ghibli style animation: ${sanitizedPrompt}. Soft colors, whimsical atmosphere, detailed backgrounds, watercolor style painting, magical elements, inspired by Hayao Miyazaki's art direction.`

    let imageUrl = ''

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

    } else if ((provider === 'gemini' || provider === 'gemini2flash') && geminiKey) {
      // Use Gemini
      const model = provider === 'gemini2flash' ? 'gemini-2.5-flash' : 'gemini-1.5-flash'

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

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiKey}`, {
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

    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not available` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Ghibli Image Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
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