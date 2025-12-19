import { createClient } from 'npm:@supabase/supabase-js@2';

export interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
}

export interface SecurityContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export async function checkRateLimit(
  supabaseClient: ReturnType<typeof createClient>,
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_max_requests: config.maxRequests,
      p_window_minutes: config.windowMinutes
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return true;
    }

    return data === true;
  } catch (error) {
    console.error('Rate limit check exception:', error);
    return true;
  }
}

export function validateInput(data: any, rules: ValidationRule[]): void {
  const errors: string[] = [];

  for (const rule of rules) {
    const value = data[rule.field];

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.field} is required`);
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    if (rule.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rule.type) {
        errors.push(`${rule.field} must be of type ${rule.type}`);
        continue;
      }
    }

    if (rule.type === 'string') {
      const strValue = value as string;

      if (rule.minLength !== undefined && strValue.length < rule.minLength) {
        errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
      }

      if (rule.maxLength !== undefined && strValue.length > rule.maxLength) {
        errors.push(`${rule.field} must not exceed ${rule.maxLength} characters`);
      }

      if (rule.pattern && !rule.pattern.test(strValue)) {
        errors.push(`${rule.field} has invalid format`);
      }
    }

    if (rule.type === 'number') {
      const numValue = value as number;

      if (rule.min !== undefined && numValue < rule.min) {
        errors.push(`${rule.field} must be at least ${rule.min}`);
      }

      if (rule.max !== undefined && numValue > rule.max) {
        errors.push(`${rule.field} must not exceed ${rule.max}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new SecurityError(
      `Validation failed: ${errors.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }
}

export async function logAuditEvent(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string | undefined,
  action: string,
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabaseClient.rpc('log_audit_event', {
      p_user_id: userId || null,
      p_action: action,
      p_resource_type: resourceType || null,
      p_resource_id: resourceId || null,
      p_metadata: metadata || {}
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

export function getSecurityContext(req: Request): SecurityContext {
  const authHeader = req.headers.get('authorization');
  const ip = req.headers.get('x-forwarded-for') ||
             req.headers.get('x-real-ip') ||
             'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  return {
    ip,
    userAgent
  };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 10000);
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key] as string) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

export async function requireAuth(
  supabaseClient: ReturnType<typeof createClient>
): Promise<{ userId: string; email: string }> {
  const { data: { user }, error } = await supabaseClient.auth.getUser();

  if (error || !user) {
    throw new SecurityError('Authentication required', 401, 'UNAUTHORIZED');
  }

  return {
    userId: user.id,
    email: user.email || ''
  };
}

export function createSecureResponse(
  data: any,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
    'Content-Type': 'application/json',
    ...headers
  };

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: corsHeaders
    }
  );
}

export function createErrorResponse(
  error: Error | SecurityError,
  status?: number
): Response {
  const statusCode = status || (error instanceof SecurityError ? error.statusCode : 500);
  const code = error instanceof SecurityError ? error.code : 'INTERNAL_ERROR';

  return createSecureResponse(
    {
      error: {
        message: error.message,
        code,
        timestamp: new Date().toISOString()
      }
    },
    statusCode
  );
}
