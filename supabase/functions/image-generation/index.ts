import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput } from "../_shared/cors.ts"

console.log("Image Generation Edge Function loaded")

interface ImageGenerationRequest {
  prompt: string
  provider?: 'gpt-5' | 'gemini' | 'openai'
  size?: '1024x1024' | '1024x1792' | '1792x1024'
  style?: string
  quality?: 'standard' | 'hd'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, provider = 'gpt-5', size = '1024x1024', style, quality = 'standard' }: ImageGenerationRequest = await req.json()

    // Validate and sanitize inputs
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(prompt)
    const sanitizedStyle = style ? sanitizeInput(style) : ''

    // Get and validate API keys
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    let imageUrl: string = ''

    if (provider === 'gpt-5' && openaiKey && validateApiKey(openaiKey, 'openai')) {
      // Use GPT-5 (likely referring to GPT-4o or future GPT-5) for image generation
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "dall-e-3", // Using DALL-E 3 as GPT-5 image generation capability
            prompt: sanitizedPrompt + (sanitizedStyle ? ` Style: ${sanitizedStyle}` : ''),
            n: 1,
            size: size,
            quality: quality
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`GPT-5/OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        imageUrl = data.data[0].url

      } catch (error) {
        console.error('GPT-5 image generation failed:', error)
        throw new Error(`Image generation failed: ${error.message}`)
      }

    } else if (provider === 'gemini' && geminiKey && validateApiKey(geminiKey, 'gemini')) {
      // Use Gemini for image generation
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: sanitizedPrompt + (sanitizedStyle ? ` Style: ${sanitizedStyle}` : '') }] }],
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
        console.error('Gemini image generation failed:', error)
        throw new Error(`Image generation failed: ${error.message}`)
      }

    } else if (provider === 'openai' && openaiKey && validateApiKey(openaiKey, 'openai')) {
      // Fallback to standard OpenAI DALL-E
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: sanitizedPrompt + (sanitizedStyle ? ` Style: ${sanitizedStyle}` : ''),
            n: 1,
            size: size,
            quality: quality
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        imageUrl = data.data[0].url

      } catch (error) {
        console.error('OpenAI image generation failed:', error)
        throw new Error(`Image generation failed: ${error.message}`)
      }

    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not available or API key missing/invalid` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        imageUrl,
        prompt: sanitizedPrompt,
        provider,
        size,
        style: sanitizedStyle,
        quality
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Image Generation Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})