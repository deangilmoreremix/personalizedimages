import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  checkRateLimit,
  validateInput,
  logAuditEvent,
  getSecurityContext,
  requireAuth,
  createErrorResponse,
  createSecureResponse,
  SecurityError,
  type RateLimitConfig,
  type ValidationRule
} from './security.ts';
import { corsHeaders } from './cors.ts';

export interface EdgeFunctionConfig {
  requireAuth?: boolean;
  rateLimit?: RateLimitConfig;
  validation?: ValidationRule[];
  auditAction?: string;
}

export type EdgeFunctionHandler = (
  req: Request,
  context: EdgeFunctionContext
) => Promise<Response>;

export interface EdgeFunctionContext {
  supabase: ReturnType<typeof createClient>;
  user?: { userId: string; email: string };
  body?: any;
  params?: Record<string, string>;
}

export function createEdgeFunction(
  handler: EdgeFunctionHandler,
  config: EdgeFunctionConfig = {}
) {
  return async (req: Request): Promise<Response> => {
    try {
      if (req.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders
        });
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

      if (!supabaseUrl || !supabaseKey) {
        throw new SecurityError('Server configuration error', 500, 'CONFIG_ERROR');
      }

      const authHeader = req.headers.get('Authorization') || '';
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: { Authorization: authHeader }
        }
      });

      const context: EdgeFunctionContext = {
        supabase
      };

      if (config.requireAuth) {
        context.user = await requireAuth(supabase);
      }

      if (config.rateLimit) {
        const securityContext = getSecurityContext(req);
        const identifier = context.user?.userId || securityContext.ip || 'anonymous';
        const endpoint = new URL(req.url).pathname;

        const allowed = await checkRateLimit(
          supabase,
          identifier,
          endpoint,
          config.rateLimit
        );

        if (!allowed) {
          throw new SecurityError(
            'Rate limit exceeded. Please try again later.',
            429,
            'RATE_LIMIT_EXCEEDED'
          );
        }
      }

      if (req.method !== 'GET' && req.headers.get('content-type')?.includes('application/json')) {
        try {
          context.body = await req.json();
        } catch (error) {
          throw new SecurityError('Invalid JSON in request body', 400, 'INVALID_JSON');
        }

        if (config.validation && context.body) {
          validateInput(context.body, config.validation);
        }
      }

      const response = await handler(req, context);

      if (config.auditAction && context.user) {
        await logAuditEvent(
          supabase,
          context.user.userId,
          config.auditAction,
          undefined,
          undefined,
          {
            endpoint: new URL(req.url).pathname,
            method: req.method,
            timestamp: new Date().toISOString()
          }
        );
      }

      return response;

    } catch (error) {
      console.error('Edge function error:', error);

      if (error instanceof SecurityError) {
        return createErrorResponse(error);
      }

      return createErrorResponse(
        new Error('An unexpected error occurred'),
        500
      );
    }
  };
}

export { createSecureResponse, createErrorResponse, SecurityError };
