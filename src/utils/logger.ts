/**
 * Production-safe logging utility
 * Only logs in development mode to avoid console spam in production
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) return false;

    // In development, allow all logs
    return true;
  }

  log(...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log('[LOG]', ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  }

  // Group logging for complex operations
  group(label: string): void {
    if (this.shouldLog('log')) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.shouldLog('log')) {
      console.groupEnd();
    }
  }

  // Performance timing
  time(label: string): void {
    if (this.shouldLog('log')) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog('log')) {
      console.timeEnd(label);
    }
  }
}

export const logger = new Logger();

// Convenience functions for common use cases
export const logApiCall = (endpoint: string, method: string = 'GET') => {
  logger.info(`API ${method} ${endpoint}`);
};

export const logError = (error: Error | string, context?: string) => {
  const message = error instanceof Error ? error.message : error;
  logger.error(message, context ? { context } : undefined);
};

export const logPerformance = (operation: string, startTime: number) => {
  const duration = performance.now() - startTime;
  logger.debug(`${operation} took ${duration.toFixed(2)}ms`);
};