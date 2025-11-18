/**
 * Unified API Client for AI Image Generation Services
 *
 * This client provides a consistent interface for all AI providers,
 * handling authentication, error management, and response normalization.
 */

import { getApiKey, hasValidApiKey } from '../../env';
import type { AIProvider } from './types';

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
      // Validate provider and API key
      if (!this.isProviderAvailable(request.provider)) {
        throw new Error(`Provider ${request.provider} is not available or API key is missing`);
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
   * Check if a provider is available and configured
   */
  private isProviderAvailable(provider: string): boolean {
    switch (provider) {
      case 'openai':
        return hasValidApiKey('openai');
      case 'gemini':
      case 'gemini-nano':
        return hasValidApiKey('gemini') || hasValidApiKey('gemini-nano');
      case 'imagen':
        return hasValidApiKey('gemini'); // Imagen uses Gemini API
      default:
        return false;
    }
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
    const { provider, prompt, options = {} } = request;

    switch (provider) {
      case 'openai':
        return this.executeOpenAIRequest(prompt, options);
      case 'gemini':
        return this.executeGeminiRequest(prompt, options);
      case 'gemini-nano':
        return this.executeGeminiNanoRequest(prompt, options);
      case 'imagen':
        return this.executeImagenRequest(prompt, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Execute OpenAI API request
   */
  private async executeOpenAIRequest(prompt: string, options: any): Promise<any> {
    const apiKey = getApiKey('openai');
    if (!apiKey) throw new Error('OpenAI API key not available');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        style: options.style || 'natural'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data[0].url;
  }

  /**
   * Execute Gemini API request
   */
  private async executeGeminiRequest(prompt: string, options: any): Promise<any> {
    const apiKey = getApiKey('gemini');
    if (!apiKey) throw new Error('Gemini API key not available');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMediaType: "IMAGE",
          ...(options.aspectRatio && {
            imageConfig: { aspectRatio: options.aspectRatio }
          })
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Extract image from response
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error('No image found in Gemini response');
  }

  /**
   * Execute Gemini Nano API request
   */
  private async executeGeminiNanoRequest(prompt: string, options: any): Promise<any> {
    // Gemini Nano uses the same API as regular Gemini but with different model
    const apiKey = getApiKey('gemini-nano') || getApiKey('gemini');
    if (!apiKey) throw new Error('Gemini Nano API key not available');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMediaType: "IMAGE",
          temperature: 0.7, // More creative for Nano
          ...(options.aspectRatio && {
            imageConfig: { aspectRatio: options.aspectRatio }
          })
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini Nano API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Extract image from response
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error('No image found in Gemini Nano response');
  }

  /**
   * Execute Imagen API request
   */
  private async executeImagenRequest(prompt: string, options: any): Promise<any> {
    const apiKey = getApiKey('gemini'); // Imagen uses Gemini API
    if (!apiKey) throw new Error('Imagen API key not available');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{
          prompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: options.aspectRatio || '1:1',
          ...(options.quality === 'high' && { imageSize: '2K' }),
          negativePrompt: options.negativePrompt || undefined,
          personGeneration: 'allow_adult'
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Imagen API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
      return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
    }

    throw new Error('No image found in Imagen response');
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