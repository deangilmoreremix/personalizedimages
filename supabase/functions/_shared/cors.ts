// Get allowed origins from environment
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:3000'];

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export function getCorsHeaders(origin: string | null) {
  if (!origin) {
    return {
      ...corsHeaders,
      'Access-Control-Allow-Origin': allowedOrigins[0],
    };
  }
  const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': isAllowed ? origin : 'null',
  };
}

// Helper function to validate API keys
export function validateApiKey(key: string | undefined, service: string): boolean {
  if (!key || key.length < 10) return false;

  switch (service) {
    case 'openai':
      return key.startsWith('sk-');
    case 'gemini':
      return key.startsWith('AIza');
    case 'stripe':
      return key.startsWith('sk_');
    case 'freepik':
      // Freepik API keys are typically alphanumeric strings, often starting with specific patterns
      // We'll do basic validation for now - can be enhanced based on actual key format
      return /^[A-Za-z0-9]{20,}$/.test(key);
    default:
      return false;
  }
}

export function sanitizeInput(input: string, maxLength = 1000): string {
  return input
    .trim()
    .replace(/\0/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .substring(0, maxLength);
}

// Helper function to validate URL
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

const RATE_LIMITS = {
  authenticated: { requests: 100, windowMs: 60 * 60 * 1000 },
  anonymous: { requests: 10, windowMs: 60 * 60 * 1000 },
};

function getSupabaseServiceClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

async function dbQuery(path: string, body: Record<string, unknown>, serviceKey: string, baseUrl: string) {
  const res = await fetch(`${baseUrl}/rest/v1/rpc/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify(body),
  });
  return res;
}

export async function checkRateLimit(
  identifier: string,
  isAuthenticated: boolean = false
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const limits = isAuthenticated ? RATE_LIMITS.authenticated : RATE_LIMITS.anonymous;
  const now = Date.now();
  const windowStart = new Date(now - limits.windowMs).toISOString();
  const config = getSupabaseServiceClient();

  if (!config) {
    return { allowed: false, remaining: 0, resetTime: now + limits.windowMs };
  }

  try {
    const selectRes = await fetch(
      `${config.url}/rest/v1/rate_limits?identifier=eq.${encodeURIComponent(identifier)}&is_authenticated=eq.${isAuthenticated}&select=id,request_count,window_start`,
      {
        headers: {
          'apikey': config.serviceKey,
          'Authorization': `Bearer ${config.serviceKey}`,
        },
      }
    );
    const rows = await selectRes.json();
    const record = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!record || new Date(record.window_start).getTime() < new Date(windowStart).getTime()) {
      const upsertRes = await fetch(`${config.url}/rest/v1/rate_limits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.serviceKey,
          'Authorization': `Bearer ${config.serviceKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          identifier,
          is_authenticated: isAuthenticated,
          request_count: 1,
          window_start: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
      if (!upsertRes.ok) {
        return { allowed: false, remaining: 0, resetTime: now + limits.windowMs };
      }
      return { allowed: true, remaining: limits.requests - 1, resetTime: now + limits.windowMs };
    }

    if (record.request_count >= limits.requests) {
      const resetTime = new Date(record.window_start).getTime() + limits.windowMs;
      return { allowed: false, remaining: 0, resetTime };
    }

    await fetch(`${config.url}/rest/v1/rate_limits?id=eq.${record.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.serviceKey,
        'Authorization': `Bearer ${config.serviceKey}`,
      },
      body: JSON.stringify({
        request_count: record.request_count + 1,
        updated_at: new Date().toISOString(),
      }),
    });

    const remaining = limits.requests - (record.request_count + 1);
    const resetTime = new Date(record.window_start).getTime() + limits.windowMs;
    return { allowed: true, remaining, resetTime };
  } catch {
    return { allowed: false, remaining: 0, resetTime: now + limits.windowMs };
  }
}

export async function checkCredits(
  userId: string
): Promise<{ allowed: boolean; remainingCredits: number; resetTime: number }> {
  const config = getSupabaseServiceClient();
  const now = Date.now();

  if (!config) {
    return { allowed: false, remainingCredits: 0, resetTime: now + 86400000 };
  }

  try {
    const rpcRes = await fetch(`${config.url}/rest/v1/rpc/check_and_deduct_credit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.serviceKey,
        'Authorization': `Bearer ${config.serviceKey}`,
      },
      body: JSON.stringify({ p_user_id: userId, p_reason: 'edge_function_generation' }),
    });

    if (!rpcRes.ok) {
      return { allowed: false, remainingCredits: 0, resetTime: now + 86400000 };
    }

    const result = await rpcRes.json();
    const parsed = typeof result === 'string' ? JSON.parse(result) : result;

    return {
      allowed: !!parsed?.allowed,
      remainingCredits: parsed?.balance ?? 0,
      resetTime: now + 86400000,
    };
  } catch {
    return { allowed: false, remainingCredits: 0, resetTime: now + 86400000 };
  }
}

// Helper function to authenticate user
export async function authenticateUser(req: Request): Promise<{ user: any; error: string | null }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseKey) {
    return { user: null, error: 'Supabase configuration missing' };
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey,
      },
    });

    if (!response.ok) {
      return { user: null, error: 'Invalid token' };
    }

    const user = await response.json();
    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Authentication failed' };
  }
}