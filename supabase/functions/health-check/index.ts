import { createClient } from "npm:@supabase/supabase-js@2.78.0"
import { getCorsHeaders } from "../_shared/cors.ts"

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    database: boolean
    api_keys: boolean
    memory: { used: number; available: boolean }
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    let dbHealthy = false
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      const { error } = await supabase.from('profiles').select('id').limit(1)
      dbHealthy = !error
    } catch (_e) {
      dbHealthy = false
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    const apiKeysHealthy = !!(openaiKey || geminiKey)

    const memUsage = Deno.memoryUsage?.() || { rss: 0, heapUsed: 0, heapTotal: 0 }
    const memoryHealthy = memUsage.heapUsed < (memUsage.heapTotal * 0.9)

    const response: HealthCheckResponse = {
      status: dbHealthy && apiKeysHealthy && memoryHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {
        database: dbHealthy,
        api_keys: apiKeysHealthy,
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          available: memoryHealthy
        }
      }
    }

    const statusCode = response.status === 'healthy' ? 200 : 503

    return new Response(
      JSON.stringify(response),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Health check failed'
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: errorMessage
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
