import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput } from "../_shared/cors.ts"

console.log("Create Payment Intent Edge Function loaded")

interface CreatePaymentIntentRequest {
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, string>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency = 'usd', description, metadata }: CreatePaymentIntentRequest = await req.json()

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
        ...(metadata && Object.keys(metadata).length > 0 && {
          'metadata': JSON.stringify(metadata)
        })
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Stripe API error:', error)
      throw new Error(`Payment intent creation failed: ${error.error?.message || 'Unknown error'}`)
    }

    const paymentIntent = await response.json()

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
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})