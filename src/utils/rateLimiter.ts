/**
 * Rate Limiter Utility
 *
 * Implements client-side rate limiting to prevent API abuse and protect against
 * excessive API calls. This is a defense-in-depth measure and should be combined
 * with server-side rate limiting.
 */

import { getEnvironmentConfig } from './env';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitRecord> = new Map();
  private defaultConfig: RateLimitConfig = {
    maxRequests: 60, // 60 requests per minute
    windowMs: 60 * 1000, // 1 minute window
  };

  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Check if a request is allowed for a given key
   */
  isAllowed(key: string): boolean {
    const config = this.getConfig();
    const now = Date.now();
    const record = this.limits.get(key);

    if (!record) {
      // First request for this key
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Check if window has expired
    if (now >= record.resetTime) {
      // Reset the counter
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Check if we've exceeded the limit
    if (record.count >= config.maxRequests) {
      return false;
    }

    // Increment counter
    record.count++;
    return true;
  }

  /**
   * Get remaining requests in current window
   */
  getRemaining(key: string): number {
    const config = this.getConfig();
    const now = Date.now();
    const record = this.limits.get(key);

    if (!record) {
      return config.maxRequests;
    }

    if (now >= record.resetTime) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - record.count);
  }

  /**
   * Get time until reset in milliseconds
   */
  getResetTime(key: string): number {
    const record = this.limits.get(key);
    if (!record) {
      return 0;
    }

    const now = Date.now();
    return Math.max(0, record.resetTime - now);
  }

  /**
   * Clear rate limit for a specific key
   */
  clear(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }

  /**
   * Get rate limit configuration
   */
  private getConfig(): RateLimitConfig {
    const config = getEnvironmentConfig();
    const maxRequests = config.VITE_MAX_REQUESTS_PER_MINUTE
      ? parseInt(config.VITE_MAX_REQUESTS_PER_MINUTE, 10)
      : this.defaultConfig.maxRequests;

    return {
      maxRequests: Math.max(1, Math.min(maxRequests, 1000)), // Clamp between 1 and 1000
      windowMs: this.defaultConfig.windowMs,
    };
  }

  /**
   * Check if rate limiting is enabled
   */
  isEnabled(): boolean {
    const config = getEnvironmentConfig();
    return config.VITE_ENABLE_RATE_LIMITING === 'true';
  }

  /**
   * Get current rate limit status for a key
   */
  getStatus(key: string): {
    allowed: boolean;
    remaining: number;
    resetIn: number;
  } {
    return {
      allowed: this.isAllowed(key),
      remaining: this.getRemaining(key),
      resetIn: this.getResetTime(key),
    };
  }
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();

/**
 * Rate limit wrapper for API calls
 */
export async function withRateLimit<T>(
  key: string,
  fn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  if (!rateLimiter.isEnabled()) {
    return fn();
  }

  if (!rateLimiter.isAllowed(key)) {
    console.warn(`Rate limit exceeded for key: ${key}`);
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil(rateLimiter.getResetTime(key) / 1000)} seconds.`);
  }

  try {
    return await fn();
  } catch (error) {
    // Don't count failed requests against rate limit
    rateLimiter.clear(key);
    throw error;
  }
}
