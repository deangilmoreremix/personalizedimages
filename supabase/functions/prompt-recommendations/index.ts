import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput } from "../_shared/cors.ts"

console.log("Prompt Recommendations Edge Function loaded")

interface PromptRecommendationsRequest {
  basePrompt: string
  provider: 'openai' | 'gemini'
  style?: 'creative' | 'technical' | 'simple' | 'detailed' | 'artistic'
  count?: number
  context?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      basePrompt,
      provider = 'openai',
      style = 'creative',
      count = 3,
      context = ''
    }: PromptRecommendationsRequest = await req.json()

    if (!basePrompt || typeof basePrompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid base prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(basePrompt)
    const sanitizedContext = context ? sanitizeInput(context) : ''

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if ((!openaiKey || !validateApiKey(openaiKey, 'openai')) &&
        (!geminiKey || !validateApiKey(geminiKey, 'gemini'))) {
      return new Response(
        JSON.stringify({ error: 'Valid API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create recommendation prompt
    const recommendationPrompt = `Based on this base prompt: "${sanitizedPrompt}"

${sanitizedContext ? `Additional context: ${sanitizedContext}` : ''}

Generate ${count} enhanced and improved versions of this prompt for AI image generation. Each recommendation should be:
- More specific and detailed than the original
- Include relevant artistic or technical terms
- Maintain the core concept but add creative elements
- Be optimized for better AI image generation results
- ${style === 'creative' ? 'Highly creative and imaginative' :
    style === 'technical' ? 'Technically precise with specific details' :
    style === 'simple' ? 'Clear and straightforward' :
    style === 'detailed' ? 'Very detailed with comprehensive descriptions' :
    style === 'artistic' ? 'Artistically focused with style references' : 'Well-balanced'}

Return exactly ${count} prompt recommendations, each on a separate line, numbered 1-${count}. Do not include any other text or explanations.`

    let recommendations: string[] = []

    if (provider === 'openai' && openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: recommendationPrompt }],
          max_tokens: 1000,
          temperature: 0.8
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const responseText = data.choices?.[0]?.message?.content || ''

      // Parse numbered recommendations
      recommendations = responseText
        .split('\n')
        .map(line => line.trim())
        .filter(line => /^\d+\./.test(line))
        .map(line => line.replace(/^\d+\.\s*/, ''))
        .slice(0, count)

    } else if (provider === 'gemini' && geminiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: recommendationPrompt }] }],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.8
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      // Parse numbered recommendations
      recommendations = responseText
        .split('\n')
        .map(line => line.trim())
        .filter(line => /^\d+\./.test(line))
        .map(line => line.replace(/^\d+\.\s*/, ''))
        .slice(0, count)

    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not available or API key missing` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ensure we have the requested number of recommendations
    while (recommendations.length < count) {
      recommendations.push(`${sanitizedPrompt} (enhanced version ${recommendations.length + 1})`)
    }

    return new Response(
      JSON.stringify({
        recommendations: recommendations.slice(0, count),
        basePrompt: sanitizedPrompt,
        style,
        count,
        provider
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Prompt Recommendations Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
