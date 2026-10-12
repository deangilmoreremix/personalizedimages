import { getCorsHeaders, authenticateUser, checkRateLimit, getUserApiKey } from "../_shared/cors.ts"

const MUAPI_BASE = "https://api.muapi.ai/api/v1"

async function pollMuApiTask(
  requestId: string,
  muapiKey: string
): Promise<{ status: string; outputs: string[]; error: string | null } | null> {
  const res = await fetch(`${MUAPI_BASE}/predictions/${encodeURIComponent(requestId)}/result`, {
    headers: { 'x-api-key': muapiKey }
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  if (!data || typeof data !== 'object') return null
  return {
    status: String(data.status ?? '').toLowerCase(),
    outputs: Array.isArray(data.outputs) ? data.outputs.filter((url: unknown) => typeof url === 'string') : [],
    error: typeof data.error === 'string' ? data.error : (typeof data.message === 'string' ? data.message : null)
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  try {
    const { user, error: authError } = await authenticateUser(req);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const rateLimit = await checkRateLimit(user.id, true);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { videoId } = await req.json();

    if (!videoId || typeof videoId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Video ID is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Service configuration missing' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/generated_videos?id=eq.${encodeURIComponent(videoId)}&user_id=eq.${encodeURIComponent(user.id)}&select=id,status,progress,error_message,video_url,created_at,updated_at,metadata`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    );

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to check video status' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const rows = await res.json();
    const video = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!video) {
      return new Response(
        JSON.stringify({ error: 'Video not found' }),
        { status: 404, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    let status = video.status || 'processing';
    let progress = video.progress || 0;
    let errorMessage = video.error_message || null;
    let videoUrl = video.video_url || null;

    const providerTaskId = video.metadata?.providerTaskId;
    const needsProviderPoll = (status === 'pending' || status === 'processing') && providerTaskId;

    if (needsProviderPoll) {
      const muapiKey = getUserApiKey(req, 'muapi');

      if (!muapiKey) {
        return new Response(
          JSON.stringify({
            id: video.id,
            status: status === 'pending' ? 'queued' : status,
            progress,
            videoUrl,
            error: errorMessage,
            message: 'Live status polling requires your MuAPI API key. Add it in Settings → API Keys.',
            createdAt: video.created_at,
            updatedAt: video.updated_at,
          }),
          { headers: { ...headers, 'Content-Type': 'application/json' } }
        );
      }

      const provider = await pollMuApiTask(providerTaskId, muapiKey).catch(() => null);

      if (provider) {
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

        if (provider.status === 'completed') {
          const output = provider.outputs[0];
          if (output) {
            status = 'completed';
            progress = 100;
            videoUrl = output;
            patch.status = 'completed';
            patch.progress = 100;
            patch.video_url = output;
          } else {
            status = 'failed';
            errorMessage = 'Video generation completed without an output';
            patch.status = 'failed';
            patch.error_message = errorMessage;
          }
        } else if (provider.status === 'failed' || provider.status === 'cancelled') {
          status = 'failed';
          errorMessage = provider.error || 'Video generation failed';
          patch.status = 'failed';
          patch.error_message = errorMessage;
        } else {
          status = 'processing';
          progress = 50;
          patch.status = 'processing';
          patch.progress = 50;
        }

        await fetch(`${supabaseUrl}/rest/v1/generated_videos?id=eq.${video.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`
          },
          body: JSON.stringify(patch)
        }).catch(() => null);
      }
    }

    return new Response(
      JSON.stringify({
        id: video.id,
        status: status === 'pending' ? 'queued' : status,
        progress,
        videoUrl,
        error: errorMessage,
        createdAt: video.created_at,
        updatedAt: video.updated_at,
      }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to check video status' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
});
