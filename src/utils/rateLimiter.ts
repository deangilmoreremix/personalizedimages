// Client-side rate limiting utility
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
  blockDurationMs?: number; // How long to block after limit exceeded
}

interface RateLimitEntry {
  requests: number[];
  blockedUntil?: number;
}

class ClientRateLimiter {
  private limits = new Map<string, RateLimitEntry>();

  // Check if request is allowed
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.limits.get(key) || { requests: [] };

    // Check if currently blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return false;
    }

    // Clean old requests outside the window
    entry.requests = entry.requests.filter(timestamp => now - timestamp < config.windowMs);

    // Check if under limit
    if (entry.requests.length < config.maxRequests) {
      entry.requests.push(now);
      this.limits.set(key, entry);
      return true;
    }

    // Exceeded limit - block for specified duration
    entry.blockedUntil = now + (config.blockDurationMs || config.windowMs);
    this.limits.set(key, entry);
    return false;
  }

  // Get remaining requests for a key
  getRemainingRequests(key: string, config: RateLimitConfig): number {
    const entry = this.limits.get(key);
    if (!entry) return config.maxRequests;

    const now = Date.now();
    const validRequests = entry.requests.filter(timestamp => now - timestamp < config.windowMs);

    return Math.max(0, config.maxRequests - validRequests.length);
  }

  // Get time until unblocked
  getTimeUntilUnblocked(key: string): number {
    const entry = this.limits.get(key);
    if (!entry?.blockedUntil) return 0;

    const now = Date.now();
    return Math.max(0, entry.blockedUntil - now);
  }

  // Reset rate limit for a key
  reset(key: string): void {
    this.limits.delete(key);
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      // Clean old requests
      entry.requests = entry.requests.filter(timestamp => now - timestamp < 60000); // 1 minute

      // Remove if no requests and not blocked
      if (entry.requests.length === 0 && (!entry.blockedUntil || now > entry.blockedUntil)) {
        this.limits.delete(key);
      }
    }
  }
}

// Global rate limiter instance
const rateLimiter = new ClientRateLimiter();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Image generation - strict limits
  IMAGE_GENERATION: {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
    blockDurationMs: 300000 // 5 minutes block
  },

  // API calls - moderate limits
  API_CALLS: {
    maxRequests: 20,
    windowMs: 60000, // 1 minute
  },

  // UI interactions - lenient limits
  UI_INTERACTIONS: {
    maxRequests: 100,
    windowMs: 10000, // 10 seconds
  }
} as const;

// Rate limiting hook for React components
export const useRateLimit = (key: string, config: RateLimitConfig) => {
  const isAllowed = () => rateLimiter.isAllowed(key, config);
  const getRemaining = () => rateLimiter.getRemainingRequests(key, config);
  const getTimeUntilUnblocked = () => rateLimiter.getTimeUntilUnblocked(key);
  const reset = () => rateLimiter.reset(key);

  return {
    isAllowed,
    getRemaining,
    getTimeUntilUnblocked,
    reset
  };
};

// Utility function for API calls with rate limiting
export const makeRateLimitedRequest = async (
  key: string,
  config: RateLimitConfig,
  requestFn: () => Promise<any>
): Promise<any> => {
  if (!rateLimiter.isAllowed(key, config)) {
    const timeUntilUnblocked = rateLimiter.getTimeUntilUnblocked(key);
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(timeUntilUnblocked / 1000)} seconds.`);
  }

  try {
    return await requestFn();
  } catch (error) {
    // Log rate limit violations for monitoring
    if (error instanceof Error && error.message?.includes('Rate limit')) {
      console.warn('Rate limit violation:', { key, config, error: error.message });
    }
    throw error;
  }
};

// Periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 30000); // Clean every 30 seconds
}

export { rateLimiter, ClientRateLimiter };
export type { RateLimitConfig, RateLimitEntry };