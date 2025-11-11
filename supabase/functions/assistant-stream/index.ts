import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput } from "../_shared/cors.ts"

console.log("Assistant Stream Edge Function loaded")

interface AssistantStreamRequest {
  prompt: string
  provider: 'openai' | 'gemini'
  stream?: boolean
  model?: string
  temperature?: number
  maxTokens?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, provider = 'openai', stream = true, model, temperature = 0.7, maxTokens = 1000 }: AssistantStreamRequest = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(prompt)

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if ((!openaiKey || !validateApiKey(openaiKey, 'openai')) &&
        (!geminiKey || !validateApiKey(geminiKey, 'gemini'))) {
      return new Response(
        JSON.stringify({ error: 'Valid API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (provider === 'openai' && openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages: [{ role: 'user', content: sanitizedPrompt }],
          temperature,
          max_tokens: maxTokens,
          stream
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      if (stream) {
        return new Response(response.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        })
      } else {
        const data = await response.json()
        return new Response(
          JSON.stringify({ response: data.choices?.[0]?.message?.content || '' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

    } else if (provider === 'gemini' && geminiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sanitizedPrompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const assistantResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      return new Response(
        JSON.stringify({ response: assistantResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      return new Response(
        JSON.stringify({ error: `Provider ${provider} not available or API key missing` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Assistant Stream Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})