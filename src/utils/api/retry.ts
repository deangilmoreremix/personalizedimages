/**
 * Retry utility with exponential backoff for API requests
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  retryableStatuses: [429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'NETWORK_ERROR'],
};

export class RetryableError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly attempt: number = 0
  ) {
    super(message);
    this.name = 'RetryableError';
  }
}

/**
 * Execute a function with automatic retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on the last attempt
      if (attempt === finalConfig.maxRetries) {
        throw new RetryableError(
          `Failed after ${finalConfig.maxRetries + 1} attempts: ${lastError.message}`,
          undefined,
          attempt
        );
      }

      // Check if error is retryable
      if (!isRetryableError(error, finalConfig)) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = calculateDelay(attempt, finalConfig);

      console.log(
        `[Retry] Attempt ${attempt + 1}/${finalConfig.maxRetries + 1} failed. Retrying in ${delay}ms...`,
        { error: lastError.message }
      );

      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Check if an error should trigger a retry
 */
function isRetryableError(error: unknown, config: RetryConfig): boolean {
  if (error instanceof Response) {
    return config.retryableStatuses.includes(error.status);
  }

  if (error instanceof Error) {
    // Check for network-related errors
    const errorMessage = error.message.toUpperCase();
    return config.retryableErrors.some(retryableError =>
      errorMessage.includes(retryableError)
    );
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = config.baseDelay * Math.pow(2, attempt);

  // Add jitter (±25%) to prevent thundering herd
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);

  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, config.maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Higher-order function to wrap API calls with retry logic
 */
export function withRetryWrapper<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  config?: Partial<RetryConfig>
): (...args: TArgs) => Promise<TReturn> {
  return (...args: TArgs) => withRetry(() => fn(...args), config);
}

/**
 * Create a retry policy for specific use cases
 */
export function createRetryPolicy(config: Partial<RetryConfig>) {
  return {
    execute: <T>(fn: () => Promise<T>) => withRetry(fn, config),
    wrap: <TArgs extends unknown[], TReturn>(
      fn: (...args: TArgs) => Promise<TReturn>
    ) => withRetryWrapper(fn, config),
  };
}

// Predefined retry policies for common scenarios
export const RetryPolicies = {
  // For critical operations that must succeed
  aggressive: createRetryPolicy({
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 30000,
  }),

  // For non-critical operations
  conservative: createRetryPolicy({
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 10000,
  }),

  // For real-time operations where speed matters
  fast: createRetryPolicy({
    maxRetries: 1,
    baseDelay: 500,
    maxDelay: 2000,
  }),

  // Default policy
  default: createRetryPolicy(DEFAULT_CONFIG),
};
