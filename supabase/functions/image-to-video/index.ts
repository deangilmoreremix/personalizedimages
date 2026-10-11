import { getCorsHeaders, authenticateUser, checkRateLimit, sanitizeInput, isValidUrl } from "../_shared/cors.ts"
import { createClient } from "npm:@supabase/supabase-js@2.78.0"

const MUAPI_BASE = "https://api.muapi.ai/api/v1"
const DEFAULT_MUAPI_MODEL = "kling-master"

async function resolveImageUrl(imageUrl: string): Promise<string> {
  if (!imageUrl.startsWith("data:")) return imageUrl;
  const match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) throw new Error("Invalid base64 image data");
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const raw = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const fileName = `video-tmp/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("temp-uploads")
    .upload(fileName, raw, { contentType: `image/${match[1]}`, upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from("temp-uploads").getPublicUrl(fileName);
  return data.publicUrl;
}

interface ImageToVideoRequest {
  imageUrl: string
  duration?: number
  prompt?: string
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { user, error: authError } = await authenticateUser(req)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: authError || 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rateLimit = await checkRateLimit(user.id, true)
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { imageUrl, duration = 5, prompt }: ImageToVideoRequest = await req.json()

    if (!imageUrl || typeof imageUrl !== 'string' ||
        !(imageUrl.startsWith('data:image/') || isValidUrl(imageUrl))) {
      return new Response(
        JSON.stringify({ error: 'A valid image URL or image data URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestedDuration = Number(duration) || 5
    const videoDuration = requestedDuration > 5 ? 10 : 5

    const sanitizedPrompt = prompt
      ? sanitizeInput(prompt, 2000)
      : 'Create a smooth, cinematic video animation from this image'

    const model = Deno.env.get('MUAPI_VIDEO_MODEL') || DEFAULT_MUAPI_MODEL

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Service configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sourceImageUrl = await resolveImageUrl(imageUrl).catch((err) => {
      console.error('Failed to resolve source image:', err)
      return null
    })
    if (!sourceImageUrl) {
      return new Response(
        JSON.stringify({ error: 'Failed to process the source image' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/generated_videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: user.id,
        video_url: '',
        prompt: sanitizedPrompt,
        duration: videoDuration,
        provider: model,
        format: 'mp4',
        status: 'processing',
        metadata: { sourceImageUrl }
      })
    })

    if (!insertRes.ok) {
      console.error('Failed to create video row:', insertRes.status)
      return new Response(
        JSON.stringify({ error: 'Failed to start video generation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rows = await insertRes.json()
    const videoRow = Array.isArray(rows) ? rows[0] : null
    if (!videoRow?.id) {
      return new Response(
        JSON.stringify({ error: 'Failed to start video generation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const muapiKey = Deno.env.get('MUAPI_API_KEY')
    if (!muapiKey) {
      await fetch(`${supabaseUrl}/rest/v1/generated_videos?id=eq.${videoRow.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({
          status: 'failed',
          error_message: 'MuAPI is not configured on the server',
          updated_at: new Date().toISOString()
        })
      })
      return new Response(
        JSON.stringify({ error: 'MuAPI is not configured on the server' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const providerBody: Record<string, unknown> = {
      prompt: sanitizedPrompt,
      image_url: sourceImageUrl
    }
    if (videoDuration === 5 || videoDuration === 10) {
      providerBody.duration = videoDuration
    }

    const providerRes = await fetch(`${MUAPI_BASE}/${model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': muapiKey
      },
      body: JSON.stringify(providerBody)
    })

    const providerData = await providerRes.json().catch(() => ({}))
    const taskId = providerData?.request_id

    if (!providerRes.ok || !taskId) {
      console.error('MuAPI image-to-video failed:', providerRes.status, providerData?.message)
      await fetch(`${supabaseUrl}/rest/v1/generated_videos?id=eq.${videoRow.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({
          status: 'failed',
          error_message: providerData?.message || providerData?.error || `Video provider rejected the request (${providerRes.status})`,
          updated_at: new Date().toISOString()
        })
      })
      return new Response(
        JSON.stringify({
          error: 'Video provider rejected the request',
          providerStatus: providerRes.status,
          id: videoRow.id,
          status: 'failed'
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await fetch(`${supabaseUrl}/rest/v1/generated_videos?id=eq.${videoRow.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({
        metadata: { sourceImageUrl, providerTaskId: taskId },
        updated_at: new Date().toISOString()
      })
    })

    return new Response(
      JSON.stringify({
        id: videoRow.id,
        status: 'processing',
        sourceImageUrl,
        duration: videoDuration,
        createdAt: Date.now(),
        paymentRequired: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Image to Video Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    )
  }
})
