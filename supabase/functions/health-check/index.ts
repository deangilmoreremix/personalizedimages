import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
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

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check database connectivity (simplified)
    const dbHealthy = true // In production, check actual DB connection

    // Check API keys availability
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    const apiKeysHealthy = !!(openaiKey || geminiKey)

    // Check memory usage
    const memUsage = Deno.memoryUsage?.() || { rss: 0, heapUsed: 0, heapTotal: 0 }
    const memoryHealthy = memUsage.heapUsed < (memUsage.heapTotal * 0.9) // Less than 90% heap usage

    const response: HealthCheckResponse = {
      status: dbHealthy && apiKeysHealthy && memoryHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {
        database: dbHealthy,
        api_keys: apiKeysHealthy,
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
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