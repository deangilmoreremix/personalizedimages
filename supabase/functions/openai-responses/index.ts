/**
 * OpenAI Responses API streaming proxy.
 *
 * Client calls: POST {SUPABASE_URL}/functions/v1/openai-responses/responses
 * The OpenAI key stays server-side; SSE (stream:true) is passed straight through so the
 * browser can render live token / partial-image events.
 */
import { createEdgeFunction, SecurityError } from '../_shared/middleware.ts';
import { corsHeaders, validateApiKey } from '../_shared/cors.ts';

const ALLOWED_TOOLS = new Set(['image_generation']);
const MAX_BODY_CHARS = 20_000_000; // inline base64 input images
const ALLOWED_FIELDS = new Set([
  'model', 'input', 'instructions', 'tools', 'tool_choice', 'text', 'reasoning',
  'max_output_tokens', 'previous_response_id', 'store', 'stream', 'metadata', 'safety_identifier'
]);

export default createEdgeFunction(
  async (_req, context) => {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey || !validateApiKey(openaiKey, 'openai')) {
      throw new SecurityError('OpenAI API key not configured', 500, 'API_KEY_ERROR');
    }

    const raw = (context.body ?? {}) as Record<string, unknown>;
    if (JSON.stringify(raw).length > MAX_BODY_CHARS) {
      throw new SecurityError('Request too large', 413, 'PAYLOAD_TOO_LARGE');
    }
    if (typeof raw.model !== 'string' || !/^gpt-[a-z0-9.\-]+$/i.test(raw.model)) {
      throw new SecurityError('Unsupported model', 400, 'INVALID_MODEL');
    }

    const body: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) if (ALLOWED_FIELDS.has(k)) body[k] = v;

    // Only image generation may be used as a tool through the proxy.
    if (Array.isArray(body.tools)) {
      for (const t of body.tools as Array<{ type?: string }>) {
        if (!t?.type || !ALLOWED_TOOLS.has(t.type)) {
          throw new SecurityError('Tool not allowed', 400, 'INVALID_TOOL');
        }
      }
    }
    body.safety_identifier = context.user?.userId;

    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
        ...(body.stream ? { Accept: 'text/event-stream' } : {})
      },
      body: JSON.stringify(body)
    });

    const headers = new Headers(corsHeaders as Record<string, string>);
    headers.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json');
    if (body.stream) {
      headers.set('Cache-Control', 'no-cache, no-transform');
      headers.set('X-Accel-Buffering', 'no');
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  },
  {
    requireAuth: true,
    rateLimit: { maxRequests: 30, windowMinutes: 5 },
    auditAction: 'openai_responses'
  }
);
