import { getCorsHeaders, authenticateUser, checkRateLimit, validateApiKey, getUserApiKey, OPENAI_KEY_MISSING_ERROR, sanitizeInput } from "../_shared/cors.ts"

interface PromptRecommendationsRequest {
  basePrompt: string
  tokens?: Record<string, string>
  style?: string
  count?: number
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers })
  }

  try {
    const { user, error: authError } = await authenticateUser(req)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const rateLimit = await checkRateLimit(user.id, true)
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const {
      basePrompt,
      tokens = {},
      style = 'DALL-E',
      count = 3
    }: PromptRecommendationsRequest = await req.json()

    if (!basePrompt || typeof basePrompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid base prompt is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(basePrompt)

    const userApiKey = getUserApiKey(req, 'openai')
    if (!userApiKey || !validateApiKey(userApiKey, 'openai')) {
      return new Response(
        JSON.stringify({ error: OPENAI_KEY_MISSING_ERROR }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const tokenString = Object.entries(tokens)
      .map(([key, value]) => `${sanitizeInput(String(key))}: ${sanitizeInput(String(value))}`)
      .join(', ')

    const systemPrompt = `You are an expert at creating detailed, effective prompts for AI image generation. Generate ${count} enhanced prompt variations that follow best practices for ${style} image generation. Return ONLY a JSON array of strings, nothing else.`

    const userPrompt = `Based on this prompt: "${sanitizedPrompt}" and personalization tokens (${tokenString || 'none'}), generate ${count} enhanced prompt variations. Make them detailed, specific, and optimized for high-quality image generation.`

    let recommendations: string[] = []

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userApiKey}`
        },
        body: JSON.stringify({
          model: Deno.env.get('OPENAI_RESPONSES_MODEL') || 'gpt-5-mini',
          instructions: systemPrompt,
          input: userPrompt,
          max_output_tokens: 1024
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const responseText = (data.output || [])
        .flatMap((item: any) => item.content || [])
        .filter((part: any) => part.type === 'output_text')
        .map((part: any) => part.text || '')
        .join('')

      try {
        recommendations = JSON.parse(responseText)
      } catch (_e) {
        const matches = responseText.match(/"([^"]+)"/g)
        if (matches) {
          recommendations = matches.map((match: string) => match.replace(/"/g, ''))
        } else {
          throw new Error('Failed to parse recommendations from response')
        }
      }

    } catch (error) {
      console.error('OpenAI recommendations error:', error)
      throw error
    }

    if (recommendations.length === 0) {
      recommendations = [
        `${sanitizedPrompt} with detailed lighting and high-quality finish`,
        `${sanitizedPrompt} with a creative composition and vibrant colors`,
        `${sanitizedPrompt} in a photorealistic style with dramatic lighting`
      ]
    }

    if (recommendations.length > count) {
      recommendations = recommendations.slice(0, count)
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Prompt Recommendations Error:', error)

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
      { status: 200, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    )
  }
})
