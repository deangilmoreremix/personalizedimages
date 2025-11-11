import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, validateApiKey, sanitizeInput } from "../_shared/cors.ts"

console.log("Create Payment Intent Edge Function loaded")

interface PaymentIntentRequest {
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, string>
  customerEmail?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency = 'usd', description, metadata, customerEmail }: PaymentIntentRequest = await req.json()

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valid amount is required (must be greater than 0)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedDescription = description ? sanitizeInput(description) : ''
    const sanitizedEmail = customerEmail ? sanitizeInput(customerEmail) : ''

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
        description: sanitizedDescription || 'VideoRemix AI Image Generation',
        metadata: JSON.stringify(metadata || {}),
        ...(sanitizedEmail && { receipt_email: sanitizedEmail }),
        automatic_payment_methods: 'enabled'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Stripe API error: ${error.error?.message || 'Unknown error'}`)
    }

    const paymentIntent = await response.json()

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