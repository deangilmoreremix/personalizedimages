/**
 * Structured Logging Utility
 * 
 * Provides consistent logging across the application:
 * - Development: Console with colors and pretty printing
 * - Production: Structured JSON logs for easier parsing/monitoring
 * 
 * SECURITY: Never log sensitive data (tokens, keys, passwords, PII)
 */

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Log entry structure
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

// Sensitive fields that should never be logged
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'authorization',
  'auth',
  'cookie',
  'session',
  'credit_card',
  'ssn',
  'email',
  'phone',
];

/**
 * Deep clone and sanitize an object for safe logging
 */
function sanitizeForLogging(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    // Truncate very long strings
    if (obj.length > 1000) {
      return obj.slice(0, 1000) + '...[truncated]';
    }
    return obj;
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: obj.message,
      stack: isDevelopment ? obj.stack : undefined,
    };
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForLogging);
  }
  
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Check if key contains sensitive terms
    const isSensitive = SENSITIVE_FIELDS.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Format log entry for development (colored, pretty)
 */
function formatDevLog(entry: LogEntry): string {
  const colors: Record<LogLevel, string> = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    fatal: '\x1b[35m', // Magenta
  };
  
  const reset = '\x1b[0m';
  const color = colors[entry.level];
  const levelUpper = entry.level.toUpperCase().padStart(5);
  
  let output = `${color}[${levelUpper}]${reset} ${entry.message}`;
  
  if (entry.context && Object.keys(entry.context).length > 0) {
    const sanitized = sanitizeForLogging(entry.context);
    output += '\n' + JSON.stringify(sanitized, null, 2);
  }
  
  if (entry.error) {
    output += `\n${color}Error:${reset} ${entry.error.message}`;
    if (isDevelopment && entry.error.stack) {
      output += `\n${entry.error.stack}`;
    }
  }
  
  return output;
}

/**
 * Format log entry for production (JSON)
 */
function formatProdLog(entry: LogEntry): string {
  const logData = {
    timestamp: entry.timestamp,
    level: entry.level,
    message: entry.message,
    ...(entry.context && { context: sanitizeForLogging(entry.context) }),
    ...(entry.error && { 
      error: {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      }
    }),
  };
  
  return JSON.stringify(logData);
}

/**
 * Create a log entry
 */
function log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error,
  };
  
  // Skip debug logs in production
  if (level === 'debug' && isProduction) {
    return;
  }
  
  const formatted = isProduction 
    ? formatProdLog(entry)
    : formatDevLog(entry);
  
  // Use appropriate console method
  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
    case 'fatal':
      console.error(formatted);
      break;
  }
  
  // In production, you might want to send fatal errors to a monitoring service
  if (level === 'fatal' && isProduction) {
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error || new Error(message), { extra: context });
  }
}

// Environment detection (circular dependency safe)
const isDevelopment = import.meta.env?.DEV === true || import.meta.env?.MODE === 'development';
const isProduction = import.meta.env?.PROD === true || import.meta.env?.MODE === 'production';

// Logger API
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => 
    log('debug', message, context),
  
  info: (message: string, context?: Record<string, unknown>) => 
    log('info', message, context),
  
  warn: (message: string, context?: Record<string, unknown>) => 
    log('warn', message, context),
  
  error: (message: string, error?: Error, context?: Record<string, unknown>) => 
    log('error', message, context, error),
  
  fatal: (message: string, error?: Error, context?: Record<string, unknown>) => 
    log('fatal', message, context, error),
  
  // Create a child logger with bound context
  child: (defaultContext: Record<string, unknown>) => ({
    debug: (message: string, context?: Record<string, unknown>) => 
      log('debug', message, { ...defaultContext, ...context }),
    info: (message: string, context?: Record<string, unknown>) => 
      log('info', message, { ...defaultContext, ...context }),
    warn: (message: string, context?: Record<string, unknown>) => 
      log('warn', message, { ...defaultContext, ...context }),
    error: (message: string, error?: Error, context?: Record<string, unknown>) => 
      log('error', message, { ...defaultContext, ...context }, error),
    fatal: (message: string, error?: Error, context?: Record<string, unknown>) => 
      log('fatal', message, { ...defaultContext, ...context }, error),
  }),
};

export default logger;
