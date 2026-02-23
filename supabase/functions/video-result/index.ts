import { getCorsHeaders, authenticateUser, checkRateLimit } from "../_shared/cors.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
      `${supabaseUrl}/rest/v1/generated_videos?id=eq.${encodeURIComponent(videoId)}&user_id=eq.${encodeURIComponent(user.id)}&select=*`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    );

    const rows = await res.json();
    const video = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!video) {
      return new Response(
        JSON.stringify({ error: 'Video not found' }),
        { status: 404, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    if (video.status !== 'completed') {
      return new Response(
        JSON.stringify({
          id: video.id,
          status: video.status,
          progress: video.progress || 0,
          error: video.error_message || null,
        }),
        { headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        id: video.id,
        status: 'completed',
        videoUrl: video.video_url,
        thumbnailUrl: video.thumbnail_url,
        duration: video.duration,
        format: video.format || 'mp4',
        createdAt: video.created_at,
        metadata: video.metadata || {},
      }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve video result' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
