import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { getCorsHeaders, authenticateUser, checkRateLimit, validateApiKey, sanitizeInput } from "../_shared/cors.ts"

console.log("Create Payment Intent Edge Function loaded")

// In-memory store for idempotency keys (use Redis/database in production)
const paymentIntents = new Map<string, any>()

interface CreatePaymentIntentRequest {
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, string>
  idempotencyKey?: string
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
    const rateLimit = checkRateLimit(user.id, true)
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
    const { amount, currency = 'usd', description, metadata, idempotencyKey }: CreatePaymentIntentRequest = await req.json()

    // Check idempotency key to prevent duplicate payments
    if (idempotencyKey) {
      // In production, store this in a database with TTL
      const existingIntent = paymentIntents.get(idempotencyKey)
      if (existingIntent) {
        return new Response(
          JSON.stringify({
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
            amount: existingIntent.amount,
            currency: existingIntent.currency,
            status: existingIntent.status
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Validate inputs
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valid amount is required (must be greater than 0)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (amount > 99999999) { // Stripe limit is 999999.99 USD
      return new Response(
        JSON.stringify({ error: 'Amount exceeds maximum allowed limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedDescription = description ? sanitizeInput(description) : 'VideoRemix AI Service'

    // Validate currency
    const validCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud']
    if (!validCurrencies.includes(currency.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: 'Invalid currency. Supported: USD, EUR, GBP, CAD, AUD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get and validate Stripe API key
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!stripeKey || !validateApiKey(stripeKey, 'stripe')) {
      return new Response(
        JSON.stringify({ error: 'Stripe API key not configured or invalid' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payment intent with Stripe
    const paymentMetadata = {
      user_id: user.id,
      user_email: user.email,
      ...metadata
    }

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${stripeKey}`
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(), // Convert to cents
        currency: currency.toLowerCase(),
        description: sanitizedDescription,
        'automatic_payment_methods[enabled]': 'true',
        'metadata': JSON.stringify(paymentMetadata)
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Stripe API error:', error)
      throw new Error(`Payment intent creation failed: ${error.error?.message || 'Unknown error'}`)
    }

    const paymentIntent = await response.json()

    // Store payment intent for idempotency (in production, use database with TTL)
    if (idempotencyKey) {
      paymentIntents.set(idempotencyKey, paymentIntent)
      // Clean up old entries after some time (simplified)
      setTimeout(() => paymentIntents.delete(idempotencyKey), 24 * 60 * 60 * 1000) // 24 hours
    }

    // Return only necessary client-side data
    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Create Payment Intent Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})