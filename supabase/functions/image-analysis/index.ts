import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput, isValidUrl } from "../_shared/cors.ts"

console.log("Image Analysis Edge Function loaded")

interface ImageAnalysisRequest {
  imageUrl: string
  provider: 'openai' | 'gemini'
  analysisType?: 'general' | 'detailed' | 'colors' | 'objects' | 'text' | 'emotions'
  language?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, provider = 'openai', analysisType = 'general', language = 'en' }: ImageAnalysisRequest = await req.json()

    if (!imageUrl || !isValidUrl(imageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Valid image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedLanguage = sanitizeInput(language)

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if ((!openaiKey || !validateApiKey(openaiKey, 'openai')) &&
        (!geminiKey || !validateApiKey(geminiKey, 'gemini'))) {
      return new Response(
        JSON.stringify({ error: 'Valid API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create analysis prompt based on type
    let analysisPrompt = ''
    switch (analysisType) {
      case 'general':
        analysisPrompt = 'Analyze this image and provide a comprehensive description including objects, people, setting, colors, mood, and any notable features.'
        break
      case 'detailed':
        analysisPrompt = 'Provide a detailed analysis of this image including composition, lighting, colors, textures, objects, people, emotions, and artistic elements.'
        break
      case 'colors':
        analysisPrompt = 'Analyze the color palette and scheme of this image. Describe the dominant colors, color relationships, and how colors contribute to the overall mood.'
        break
      case 'objects':
        analysisPrompt = 'Identify and describe all objects, people, and elements visible in this image. Provide details about their appearance and relationships.'
        break
      case 'text':
        analysisPrompt = 'Extract and analyze any text visible in this image. Include the text content, fonts, colors, and placement.'
        break
      case 'emotions':
        analysisPrompt = 'Analyze the emotional content and mood conveyed by this image. Describe the atmosphere, feelings evoked, and emotional elements.'
        break
      default:
        analysisPrompt = 'Provide a comprehensive analysis of this image.'
    }

    let analysis = ''

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
                { type: 'text', text: analysisPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageBlob.type};base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      analysis = data.choices?.[0]?.message?.content || ''

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
                { text: analysisPrompt },
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
            maxOutputTokens: 1000
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not available or API key missing` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        analysis,
        analysisType,
        provider,
        language: sanitizedLanguage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Image Analysis Error:', error)
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