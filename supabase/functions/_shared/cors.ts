// Get allowed origins from environment
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:3000'];

export const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export function getCorsHeaders(origin: string | null) {
  const isAllowed = !origin || allowedOrigins.includes(origin);
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': isAllowed ? origin || allowedOrigins[0] : allowedOrigins[0],
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

// Helper function to sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
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

// In-memory stores (for production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const usageStore = new Map<string, { credits: number; lastReset: number; dailyUsage: number }>();

// Rate limiting configuration
const RATE_LIMITS = {
  authenticated: { requests: 100, windowMs: 60 * 60 * 1000 }, // 100 requests per hour for authenticated users
  anonymous: { requests: 10, windowMs: 60 * 60 * 1000 },      // 10 requests per hour for anonymous users
};

// Credit system configuration
const CREDIT_SYSTEM = {
  dailyLimit: 50,        // Credits per day per user
  resetInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  costPerRequest: 1      // Credits per API request
};

// Helper function to check rate limit
export function checkRateLimit(identifier: string, isAuthenticated: boolean = false): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const limits = isAuthenticated ? RATE_LIMITS.authenticated : RATE_LIMITS.anonymous;

  const key = `${identifier}:${isAuthenticated ? 'auth' : 'anon'}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limits.windowMs
    });
    return { allowed: true, remaining: limits.requests - 1, resetTime: now + limits.windowMs };
  }

  if (record.count >= limits.requests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: limits.requests - record.count, resetTime: record.resetTime };
}

// Helper function to check and deduct user credits
export function checkCredits(userId: string): { allowed: boolean; remainingCredits: number; resetTime: number } {
  const now = Date.now();
  const userKey = `credits:${userId}`;
  const record = usageStore.get(userKey);

  if (!record || now > record.lastReset + CREDIT_SYSTEM.resetInterval) {
    // First time or daily reset
    usageStore.set(userKey, {
      credits: CREDIT_SYSTEM.dailyLimit - CREDIT_SYSTEM.costPerRequest,
      lastReset: now,
      dailyUsage: CREDIT_SYSTEM.costPerRequest
    });
    const resetTime = now + CREDIT_SYSTEM.resetInterval;
    return { allowed: true, remainingCredits: CREDIT_SYSTEM.dailyLimit - CREDIT_SYSTEM.costPerRequest, resetTime };
  }

  if (record.credits <= 0) {
    return { allowed: false, remainingCredits: 0, resetTime: record.lastReset + CREDIT_SYSTEM.resetInterval };
  }

  record.credits -= CREDIT_SYSTEM.costPerRequest;
  record.dailyUsage += CREDIT_SYSTEM.costPerRequest;

  return {
    allowed: true,
    remainingCredits: record.credits,
    resetTime: record.lastReset + CREDIT_SYSTEM.resetInterval
  };
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