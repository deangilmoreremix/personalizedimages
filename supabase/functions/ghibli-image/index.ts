import { getCorsHeaders, authenticateUser, validateApiKey, sanitizeInput, isValidUrl } from "../_shared/cors.ts"
import { generateWithGptImage, generateWithGeminiImage } from "../_shared/imageProviders.ts"

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkLocalRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

interface GhibliImageRequest {
  prompt: string
  provider: 'openai' | 'gemini' | 'gemini2flash'
  referenceImageUrl?: string
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkLocalRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before trying again." }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Authenticate user
    const { user, error: authError } = await authenticateUser(req)
    if (authError) {
      return new Response(
        JSON.stringify({ error: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { prompt, provider, referenceImageUrl }: GhibliImageRequest = await req.json()

    if (!prompt?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = sanitizeInput(prompt)

    if (referenceImageUrl && !isValidUrl(referenceImageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid reference image URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get API keys
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if (!openaiKey && !geminiKey) {
      return new Response(
        JSON.stringify({ error: 'API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const enhancedPrompt = `Studio Ghibli style animation: ${sanitizedPrompt}. Soft colors, whimsical atmosphere, detailed backgrounds, watercolor style painting, magical elements, inspired by Hayao Miyazaki's art direction.`

    let imageUrl = ''

    const preferGemini = (provider === 'gemini' || provider === 'gemini2flash') && !!geminiKey

    try {
      if (preferGemini && geminiKey) {
        imageUrl = await generateWithGeminiImage({ prompt: enhancedPrompt, apiKey: geminiKey, referenceImageUrl })
      } else if (openaiKey) {
        imageUrl = await generateWithGptImage({ prompt: enhancedPrompt, apiKey: openaiKey, referenceImageUrl })
      } else if (geminiKey) {
        imageUrl = await generateWithGeminiImage({ prompt: enhancedPrompt, apiKey: geminiKey, referenceImageUrl })
      } else {
        return new Response(
          JSON.stringify({ error: 'API keys not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (providerError) {
      console.error('Primary image provider failed:', providerError)
      try {
        if (!preferGemini && geminiKey) {
          imageUrl = await generateWithGeminiImage({ prompt: enhancedPrompt, apiKey: geminiKey, referenceImageUrl })
        } else if (openaiKey) {
          imageUrl = await generateWithGptImage({ prompt: enhancedPrompt, apiKey: openaiKey, referenceImageUrl })
        } else {
          throw providerError
        }
      } catch (fallbackError) {
        console.error('Fallback image provider failed:', fallbackError)
        throw providerError
      }
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Ghibli Image Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to convert blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '')
  return btoa(binaryString)
}