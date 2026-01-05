// Comprehensive logging system for production applications

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  maxEntries: number;
  remoteEndpoint?: string;
  enableUserTracking: boolean;
  enablePerformanceLogging: boolean;
}

class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private sessionId: string;
  private userId: string | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: import.meta.env.PROD ? LogLevel.INFO : LogLevel.DEBUG,
      enableConsole: true,
      enableRemote: import.meta.env.PROD,
      maxEntries: 1000,
      enableUserTracking: true,
      enablePerformanceLogging: true,
      ...config
    };

    this.sessionId = this.generateSessionId();

    if (this.config.enableUserTracking) {
      this.trackUserContext();
    }

    // Auto-cleanup old entries
    setInterval(() => {
      this.cleanup();
    }, 300000); // 5 minutes
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private trackUserContext() {
    // Track user ID from auth context (implement based on your auth system)
    // this.userId = auth.currentUser?.id || null;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };
  }

  private log(entry: LogEntry) {
    // Add to local storage
    this.entries.push(entry);

    // Keep only recent entries
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }

    // Console logging
    if (this.config.enableConsole && entry.level >= this.config.level) {
      this.logToConsole(entry);
    }

    // Remote logging
    if (this.config.enableRemote && entry.level >= LogLevel.WARN) {
      this.logToRemote(entry);
    }
  }

  private logToConsole(entry: LogEntry) {
    const levelName = LogLevel[entry.level];
    const prefix = `[${entry.timestamp}] ${levelName}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.context);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.context);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, entry.message, entry.error, entry.context);
        break;
    }
  }

  private async logToRemote(entry: LogEntry) {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
        signal: AbortSignal.timeout(5000)
      });
    } catch (error) {
      // Don't log remote logging failures to avoid infinite loops
      if (this.config.enableConsole) {
        console.warn('Failed to send log to remote endpoint:', error);
      }
    }
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>) {
    this.log(this.createLogEntry(LogLevel.DEBUG, message, context));
  }

  info(message: string, context?: Record<string, any>) {
    this.log(this.createLogEntry(LogLevel.INFO, message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(this.createLogEntry(LogLevel.WARN, message, context));
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(this.createLogEntry(LogLevel.ERROR, message, context, error));
  }

  fatal(message: string, error?: Error, context?: Record<string, any>) {
    this.log(this.createLogEntry(LogLevel.FATAL, message, context, error));
  }

  // Performance logging
  time(label: string) {
    if (!this.config.enablePerformanceLogging) return;

    console.time(label);
    this.debug(`Started timing: ${label}`);
  }

  timeEnd(label: string) {
    if (!this.config.enablePerformanceLogging) return;

    console.timeEnd(label);
    this.debug(`Ended timing: ${label}`);
  }

  // User action tracking
  trackUserAction(action: string, properties?: Record<string, any>) {
    this.info(`User Action: ${action}`, {
      action,
      ...properties,
      category: 'user_action'
    });
  }

  // Error boundary integration
  logErrorBoundary(error: Error, errorInfo: any) {
    this.error('React Error Boundary', error, {
      componentStack: errorInfo.componentStack,
      category: 'error_boundary'
    });
  }

  // API call logging
  logApiCall(endpoint: string, method: string, duration: number, success: boolean, statusCode?: number) {
    const level = success ? LogLevel.DEBUG : LogLevel.WARN;
    const entry = this.createLogEntry(level, `API Call: ${method} ${endpoint}`, {
      endpoint,
      method,
      duration,
      success,
      statusCode,
      category: 'api_call'
    });

    this.log(entry);
  }

  // Performance metrics logging
  logPerformanceMetric(metric: string, value: number, unit: string = 'ms') {
    if (!this.config.enablePerformanceLogging) return;

    this.info(`Performance: ${metric}`, {
      metric,
      value,
      unit,
      category: 'performance'
    });
  }

  // Cleanup old entries
  private cleanup() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    this.entries = this.entries.filter(entry =>
      new Date(entry.timestamp).getTime() > cutoffTime
    );
  }

  // Get recent logs
  getRecentLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
    let filtered = this.entries;

    if (level !== undefined) {
      filtered = filtered.filter(entry => entry.level >= level);
    }

    return filtered.slice(-limit);
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  // Clear all logs
  clearLogs() {
    this.entries = [];
  }

  // Update user context
  setUserId(userId: string | null) {
    this.userId = userId;
  }
}

// Global logger instance
export const logger = new Logger();

// React hook for component logging
export const useLogger = (componentName: string) => {
  const logDebug = (message: string, context?: Record<string, any>) => {
    logger.debug(`[${componentName}] ${message}`, context);
  };

  const logInfo = (message: string, context?: Record<string, any>) => {
    logger.info(`[${componentName}] ${message}`, context);
  };

  const logWarn = (message: string, context?: Record<string, any>) => {
    logger.warn(`[${componentName}] ${message}`, context);
  };

  const logError = (message: string, error?: Error, context?: Record<string, any>) => {
    logger.error(`[${componentName}] ${message}`, error, context);
  };

  const trackAction = (action: string, properties?: Record<string, any>) => {
    logger.trackUserAction(`${componentName}:${action}`, properties);
  };

  return {
    logDebug,
    logInfo,
    logWarn,
    logError,
    trackAction
  };
};

// Utility functions for common logging patterns
export const logApiError = (endpoint: string, error: Error, context?: Record<string, any>) => {
  logger.error(`API Error: ${endpoint}`, error, {
    endpoint,
    ...context,
    category: 'api_error'
  });
};

export const logPerformanceIssue = (component: string, issue: string, duration: number) => {
  logger.warn(`Performance Issue: ${component}`, {
    component,
    issue,
    duration,
    category: 'performance_issue'
  });
};

export const logSecurityEvent = (event: string, details?: Record<string, any>) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    ...details,
    category: 'security'
  });
};

export { Logger };
export type { LoggerConfig, LogEntry };