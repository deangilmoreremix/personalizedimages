/**
 * Unified API Client for AI Image Generation Services
 *
 * This client provides a consistent interface for all AI providers,
 * handling authentication, error management, and response normalization.
 */

import { getUserProvidedApiKey as getApiKey } from '../../apiUtils';
import { normalizeProvider } from './providers';
import type { AIProvider } from './types';

export const OPENAI_IMAGE_MODEL = 'gpt-image-2.5-sunburst';

export interface ApiRequest {
  prompt: string;
  provider: AIProvider;
  options?: Record<string, any>;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider: string;
  requestId: string;
  timestamp: number;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}

export class ApiClient {
  private static instance: ApiClient;
  private rateLimits: Map<string, RateLimitInfo> = new Map();

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Execute an API request with unified error handling and rate limiting
   */
  async executeRequest(request: ApiRequest): Promise<ApiResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      // Validate provider support
      if (!this.isProviderAvailable(request.provider)) {
        throw new Error(`Provider ${request.provider} is not available`);
      }

      // Check rate limits
      if (this.isRateLimited(request.provider)) {
        throw new Error(`Rate limit exceeded for ${request.provider}. Try again later.`);
      }

      // Execute the request based on provider
      const result = await this.executeProviderRequest(request);

      return {
        success: true,
        data: result,
        provider: request.provider,
        requestId,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error(`API Request ${requestId} failed:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown API error',
        provider: request.provider,
        requestId,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Resolve a provider to the implementation that actually serves it.
   * Freepik-routed generation is served by OpenAI GPT Image 2.5.
   */
  private resolveProvider(provider: AIProvider): AIProvider | null {
    return normalizeProvider(provider);
  }

  /**
   * Check if a provider is supported by this client.
   * Credentials are validated at execution time so that a missing or
   * malformed key produces an accurate error instead of a generic one.
   */
  private isProviderAvailable(provider: string): boolean {
    return this.resolveProvider(provider as AIProvider) !== null;
  }

  /**
   * Check if provider is currently rate limited
   */
  private isRateLimited(provider: string): boolean {
    const limit = this.rateLimits.get(provider);
    if (!limit) return false;

    const now = Date.now() / 1000;
    return limit.remaining <= 0 && now < limit.resetTime;
  }

  /**
   * Execute provider-specific request
   */
  private async executeProviderRequest(request: ApiRequest): Promise<any> {
    const { prompt, options = {} } = request;
    const provider = this.resolveProvider(request.provider);

    if (!provider) {
      throw new Error(`Unsupported provider: ${request.provider}`);
    }

    return this.executeOpenAIRequest(prompt, options);
  }

  /**
   * Execute OpenAI API request
   */
  private async executeOpenAIRequest(prompt: string, options: any): Promise<any> {
    const apiKey = getApiKey('openai');
    if (!apiKey) throw new Error('OpenAI API key not available. Image generation requires your own OpenAI API key (starts with sk-).');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_IMAGE_MODEL,
        prompt,
        n: 1,
        size: options.size || '1024x1024',
        quality: options.quality === 'hd' ? 'high' : 'medium'
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`OpenAI API error: ${error.error?.message || error.error || 'Unknown error'}`);
    }

    const data = await response.json();
    const image = data?.data?.[0];

    if (image?.b64_json) {
      return `data:image/png;base64,${image.b64_json}`;
    }

    if (image?.url) {
      return image.url;
    }

    throw new Error('No image URL in OpenAI response');
  }

  /**
   * Update rate limit information from API response headers
   */
  updateRateLimit(provider: string, headers: Headers): void {
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    const limit = headers.get('x-ratelimit-limit');

    if (remaining && reset && limit) {
      this.rateLimits.set(provider, {
        remaining: parseInt(remaining),
        resetTime: parseInt(reset),
        limit: parseInt(limit)
      });
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get current rate limit status for a provider
   */
  getRateLimitStatus(provider: string): RateLimitInfo | null {
    return this.rateLimits.get(provider) || null;
  }

  /**
   * Clear rate limit cache (useful for testing)
   */
  clearRateLimits(): void {
    this.rateLimits.clear();
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();