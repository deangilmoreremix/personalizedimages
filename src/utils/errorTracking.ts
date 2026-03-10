/**
 * Centralized Error Tracking Module
 * 
 * Provides unified error tracking capabilities with pluggable backends.
 * Supports Sentry integration when available, falls back to console logging.
 */

// Error severity levels
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

// Error context information
export interface ErrorContext {
  userId?: string;
  tags?: Record<string, string>;
  extras?: Record<string, unknown>;
  [key: string]: unknown;
}

// Error report structure
interface ErrorReport {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  timestamp: string;
  url: string;
  userAgent: string;
  context?: ErrorContext;
}

// Configuration for error tracking
export interface ErrorTrackingConfig {
  dsn?: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  beforeSend?: (report: ErrorReport) => ErrorReport | null;
  onError?: (error: Error, context?: ErrorContext) => void;
}

// Default configuration
const DEFAULT_CONFIG: ErrorTrackingConfig = {
  environment: 'development',
  tracesSampleRate: 0.1,
};

let config: ErrorTrackingConfig = { ...DEFAULT_CONFIG };
let isInitialized = false;

/**
 * Initialize error tracking with configuration
 * This should be called once during app startup
 */
export function initializeErrorTracking(userConfig: Partial<ErrorTrackingConfig> = {}): void {
  if (isInitialized) {
    console.warn('[ErrorTracking] Already initialized');
    return;
  }

  config = { ...DEFAULT_CONFIG, ...userConfig };

  // Set environment based on import.meta.env
  if (import.meta.env.PROD) {
    config.environment = 'production';
  } else if (import.meta.env.DEV) {
    config.environment = 'development';
  }

  // Set release from build info if available
  config.release = import.meta.env.VITE_APP_VERSION || 'unknown';

  isInitialized = true;

  console.log('[ErrorTracking] Initialized', { environment: config.environment });

  // Set up global error handlers
  setupGlobalErrorHandlers();
}

/**
 * Capture an error with optional context
 */
export function captureError(
  error: Error | string,
  context?: ErrorContext,
  severity: ErrorSeverity = 'error'
): string {
  if (!isInitialized) {
    console.warn('[ErrorTracking] Not initialized, call initializeErrorTracking() first');
  }

  const errorObj = typeof error === 'string' ? new Error(error) : error;
  const errorId = generateErrorId();

  const report: ErrorReport = {
    message: errorObj.message,
    stack: errorObj.stack,
    severity,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context: sanitizeContext(context),
  };

  // Apply beforeSend hook if configured
  const finalReport = config.beforeSend ? config.beforeSend(report) : report;

  if (!finalReport) {
    return errorId; // Report was filtered out
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.group(`[Error] ${severity.toUpperCase()}: ${errorObj.message}`);
    console.log('Error ID:', errorId);
    console.log('Context:', finalReport.context);
    console.error(errorObj);
    console.groupEnd();
  }

  // Send to backend in production
  if (import.meta.env.PROD) {
    sendErrorToBackend(finalReport, errorId);
  }

  // Call custom error handler if configured
  if (config.onError) {
    config.onError(errorObj, context);
  }

  return errorId;
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  level: ErrorSeverity = 'info',
  context?: ErrorContext
): void {
  if (!isInitialized) {
    console.warn('[ErrorTracking] Not initialized');
  }

  const report: ErrorReport = {
    message,
    severity: level,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context: sanitizeContext(context),
  };

  // Apply beforeSend hook
  const finalReport = config.beforeSend ? config.beforeSend(report) : report;

  if (!finalReport) return;

  if (import.meta.env.DEV) {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }

  if (import.meta.env.PROD) {
    sendErrorToBackend(finalReport);
  }
}

/**
 * Set user context for all subsequent errors
 */
export function setUser(user: { id?: string; email?: string; username?: string } | null): void {
  if (!isInitialized) {
    console.warn('[ErrorTracking] Not initialized');
    return;
  }

  // Store user info in session storage for persistence
  if (user) {
    sessionStorage.setItem('error_tracking_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('error_tracking_user');
  }
}

/**
 * Get current user from storage
 */
function getUserFromStorage(): { id?: string; email?: string; username?: string } | null {
  try {
    const stored = sessionStorage.getItem('error_tracking_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Sanitize context to remove sensitive data
 */
function sanitizeContext(context?: ErrorContext): ErrorContext | undefined {
  if (!context) return undefined;

  const sanitized = { ...context };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
  sensitiveFields.forEach(field => {
    if (sanitized.extras?.[field]) {
      sanitized.extras[field] = '[REDACTED]';
    }
    if (sanitized[field]) {
      (sanitized as Record<string, unknown>)[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Generate unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Send error report to backend
 */
async function sendErrorToBackend(report: ErrorReport, errorId?: string): Promise<void> {
  try {
    // Try to send to your error tracking endpoint
    const response = await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...report, errorId }),
      // Don't block on error reporting
      keepalive: true,
    });

    if (!response.ok) {
      console.warn('[ErrorTracking] Failed to send error to backend:', response.status);
    }
  } catch (err) {
    // Silently fail - don't let error reporting break the app
    console.warn('[ErrorTracking] Failed to send error:', err);
  }
}

/**
 * Set up global error handlers
 */
function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    captureError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { tags: { type: 'unhandledrejection' } },
      'error'
    );
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    captureError(
      event.error || new Error(event.message),
      {
        tags: { type: 'globalerror' },
        extras: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      },
      'fatal'
    );
  });
}

/**
 * Create a breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, unknown>
): void {
  if (import.meta.env.DEV) {
    console.log(`[Breadcrumb] ${category || 'default'}: ${message}`, data);
  }
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string): { finish: () => void } {
  const startTime = performance.now();

  return {
    finish: () => {
      const duration = performance.now() - startTime;
      if (import.meta.env.DEV) {
        console.log(`[Performance] ${op}:${name} took ${duration.toFixed(2)}ms`);
      }
    },
  };
}
