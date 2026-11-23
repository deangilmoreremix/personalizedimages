/**
 * Receives Beacon API events from the app (navigator.sendBeacon cannot send auth headers, so
 * this function is public: deploy with `--no-verify-jwt`). It validates and rate-limits by size,
 * and only accepts a small allowlist of event names.
 *
 * Client: set VITE_ANALYTICS_ENDPOINT=https://<project>.supabase.co/functions/v1/app-events
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const ALLOWED = new Set(['image_generated', 'batch_rendered', 'voice_prompt', 'background_removed', 'gif_created', 'project_saved']);
const MAX_BODY = 4096;
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return new Response(null, { status: 405, headers: cors });

  const text = await req.text();
  if (text.length > MAX_BODY) return new Response(null, { status: 413, headers: cors });

  let b: any;
  try {
    b = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400, headers: cors });
  }
  if (typeof b?.name !== 'string' || !ALLOWED.has(b.name)) return new Response(null, { status: 400, headers: cors });

  // Keep props to flat primitives only.
  const props: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(b.props ?? {}).slice(0, 12)) {
    if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) props[k.slice(0, 32)] = typeof v === 'string' ? v.slice(0, 120) : (v as any);
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error } = await supabase.from('app_events').insert({
    name: b.name,
    props,
    session: typeof b.session === 'string' ? b.session.slice(0, 64) : null,
    path: typeof b.path === 'string' ? b.path.slice(0, 200) : null
  });
  return new Response(null, { status: error ? 500 : 204, headers: cors });
});
