import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey } from "../_shared/cors.ts"

console.log("Health Check Edge Function loaded")

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    openai: boolean
    gemini: boolean
    stripe: boolean
    database: boolean
  }
  environment: {
    nodeEnv: string
    denoVersion: string
    allowedOrigins: string[]
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const timestamp = new Date().toISOString()

    // Check API keys
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS') || 'http://localhost:3000'

    const services = {
      openai: !!(openaiKey && validateApiKey(openaiKey, 'openai')),
      gemini: !!(geminiKey && validateApiKey(geminiKey, 'gemini')),
      stripe: !!(stripeKey && validateApiKey(stripeKey, 'stripe')),
      database: true // Assume database is available since we're running
    }

    // Determine overall health status
    const serviceCount = Object.values(services).length
    const healthyServices = Object.values(services).filter(Boolean).length

    let status: 'healthy' | 'degraded' | 'unhealthy'
    if (healthyServices === serviceCount) {
      status = 'healthy'
    } else if (healthyServices >= serviceCount * 0.5) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }

    const response: HealthCheckResponse = {
      status,
      timestamp,
      version: '1.0.0',
      services,
      environment: {
        nodeEnv: Deno.env.get('NODE_ENV') || 'development',
        denoVersion: '1.37.0', // Current Deno version
        allowedOrigins: allowedOrigins.split(',').map(origin => origin.trim())
      }
    }

    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 206 : 503

    return new Response(
      JSON.stringify(response, null, 2),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    )

  } catch (error) {
    console.error('Health Check Error:', error)
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Internal server error'
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})