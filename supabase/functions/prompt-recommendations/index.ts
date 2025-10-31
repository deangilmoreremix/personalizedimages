import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput } from "../_shared/cors.ts"

console.log("Prompt Recommendations Edge Function loaded")

interface PromptRecommendationsRequest {
  basePrompt: string
  tokens?: Record<string, string>
  style?: string
  count?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      basePrompt,
      tokens = {},
      style = 'DALL-E',
      count = 3
    }: PromptRecommendationsRequest = await req.json()

    if (!basePrompt || typeof basePrompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid base prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(basePrompt)

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    // Prefer OpenAI for text generation, but fallback to Gemini
    const useOpenAI = openaiKey && validateApiKey(openaiKey, 'openai')
    const useGemini = geminiKey && validateApiKey(geminiKey, 'gemini')

    if (!useOpenAI && !useGemini) {
      return new Response(
        JSON.stringify({ error: 'Valid API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format tokens for the request
    const tokenString = Object.entries(tokens)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')

    const systemPrompt = `You are an expert at creating detailed, effective prompts for AI image generation. Generate ${count} enhanced prompt variations that follow best practices for ${style} image generation. Return ONLY a JSON array of strings, nothing else.`

    const userPrompt = `Based on this prompt: "${sanitizedPrompt}" and personalization tokens (${tokenString || 'none'}), generate ${count} enhanced prompt variations. Make them detailed, specific, and optimized for high-quality image generation.`

    let recommendations: string[] = []

    if (useOpenAI) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1024
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        const responseText = data.choices?.[0]?.message?.content || ''

        try {
          recommendations = JSON.parse(responseText)
        } catch (e) {
          // If parsing fails, extract strings from the text
          const matches = responseText.match(/"([^"]+)"/g)
          if (matches) {
            recommendations = matches.map((match: string) => match.replace(/"/g, ''))
          } else {
            throw new Error('Failed to parse recommendations from response')
          }
        }

      } catch (error) {
        console.error('OpenAI recommendations error:', error)
        // Fallback to Gemini if OpenAI fails
        if (useGemini) {
          console.log('Falling back to Gemini for recommendations')
        } else {
          throw error
        }
      }
    }

    // If OpenAI didn't work or wasn't available, try Gemini
    if (recommendations.length === 0 && useGemini) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemPrompt}\n\n${userPrompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024
            }
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

        try {
          recommendations = JSON.parse(responseText)
        } catch (e) {
          // If parsing fails, extract strings from the text
          const matches = responseText.match(/"([^"]+)"/g)
          if (matches) {
            recommendations = matches.map((match: string) => match.replace(/"/g, ''))
          } else {
            throw new Error('Failed to parse recommendations from Gemini response')
          }
        }

      } catch (error) {
        console.error('Gemini recommendations error:', error)
        throw error
      }
    }

    // If still no recommendations, provide fallbacks
    if (recommendations.length === 0) {
      recommendations = [
        `${sanitizedPrompt} with detailed lighting and high-quality finish`,
        `${sanitizedPrompt} with a creative composition and vibrant colors`,
        `${sanitizedPrompt} in a photorealistic style with dramatic lighting`
      ]
    }

    // Ensure we have exactly the requested count
    if (recommendations.length > count) {
      recommendations = recommendations.slice(0, count)
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Prompt Recommendations Error:', error)

    // Return fallback recommendations on error
    const fallbackRecommendations = [
      'A professional photograph with detailed lighting and composition',
      'A creative illustration with vibrant colors and unique perspective',
      'A high-quality render in a modern artistic style'
    ]

    return new Response(
      JSON.stringify({
        recommendations: fallbackRecommendations,
        warning: 'Using fallback recommendations due to error'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
