import { getCorsHeaders, authenticateUser, checkRateLimit, checkCredits, validateApiKey, sanitizeInput } from "../_shared/cors.ts"

interface FreepikResourcesRequest {
  keywords?: string
  content_type?: 'photo' | 'vector' | 'psd' | 'icon' | 'video'
  orientation?: 'horizontal' | 'vertical' | 'square'
  license?: string
  page?: number
  per_page?: number
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
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

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id, true)
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      )
    }

    // Check user credits
    const creditCheck = await checkCredits(user.id)
    if (!creditCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Daily credit limit exceeded',
          remainingCredits: creditCheck.remainingCredits,
          resetTime: new Date(creditCheck.resetTime).toISOString()
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Credits-Remaining': creditCheck.remainingCredits.toString(),
            'X-Credits-Reset': creditCheck.resetTime.toString()
          }
        }
      )
    }

    // Parse request parameters
    const url = new URL(req.url)
    const keywords = url.searchParams.get('keywords') || undefined
    const content_type = url.searchParams.get('content_type') as FreepikResourcesRequest['content_type'] || undefined
    const orientation = url.searchParams.get('orientation') as FreepikResourcesRequest['orientation'] || undefined
    const license = url.searchParams.get('license') || undefined
    const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1
    const per_page = url.searchParams.get('per_page') ? parseInt(url.searchParams.get('per_page')!) : 20

    // Validate and sanitize inputs
    if (keywords && typeof keywords !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Keywords must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedKeywords = keywords ? sanitizeInput(keywords) : undefined

    // Get and validate Freepik API key
    const freepikKey = Deno.env.get('FREEPIK_API_KEY')
    if (!freepikKey || !validateApiKey(freepikKey, 'freepik')) {
      return new Response(
        JSON.stringify({ error: 'Freepik API key not configured or invalid' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build query parameters for Freepik API
    const params = new URLSearchParams()
    if (sanitizedKeywords) params.append('keywords', sanitizedKeywords)
    if (content_type) params.append('content_type', content_type)
    if (orientation) params.append('orientation', orientation)
    if (license) params.append('license', license)
    if (page > 1) params.append('page', page.toString())
    if (per_page !== 20) params.append('per_page', per_page.toString())

    console.log('🔍 Fetching Freepik resources with params:', Object.fromEntries(params))

    // Make API call to Freepik
    const freepikUrl = `https://api.freepik.com/v1/resources?${params}`
    const response = await fetch(freepikUrl, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': freepikKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Freepik API error:', response.status, errorText)

      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid Freepik API key' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Freepik API rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        return new Response(
          JSON.stringify({ error: `Freepik API error: ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const data = await response.json()

    // Transform response to include thumbnail URLs for easier frontend consumption
    const transformedData = data.data?.map((resource: any) => ({
      id: resource.id,
      title: resource.title,
      url: resource.url,
      filename: resource.filename,
      thumbnailUrl: resource.image?.source?.url || null,
      type: resource.image?.type || null,
      orientation: resource.image?.orientation || null,
      width: resource.image?.source?.size ? parseInt(resource.image.source.size.split('x')[0]) : null,
      height: resource.image?.source?.size ? parseInt(resource.image.source.size.split('x')[1]) : null,
      downloads: resource.stats?.downloads || 0,
      likes: resource.stats?.likes || 0,
      author: resource.author?.name || null,
      publishedAt: resource.meta?.published_at || null,
      license: resource.licenses?.[0]?.type || null
    })) || []

    return new Response(
      JSON.stringify({
        resources: transformedData,
        meta: data.meta,
        creditsRemaining: creditCheck.remainingCredits
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Credits-Remaining': creditCheck.remainingCredits.toString()
        }
      }
    )

  } catch (error) {
    console.error('Freepik Resources Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})