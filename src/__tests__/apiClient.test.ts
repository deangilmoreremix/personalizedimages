import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, ApiRequest, ImageGenerationOptions } from '../utils/api/core/ApiClient';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    apiClient.clearRateLimits();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('executeRequest', () => {
    it('should make successful API requests', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ url: 'https://example.com/image.png' }] }),
        headers: new Headers({
          'x-ratelimit-remaining': '9',
          'x-ratelimit-reset': '1234567890',
          'x-ratelimit-limit': '10',
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const request: ApiRequest = {
        prompt: 'test prompt',
        provider: 'openai',
      };

      const result = await apiClient.executeRequest(request);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('openai');
      expect(result.data).toBe('https://example.com/image.png');
      expect(result.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const request: ApiRequest = {
        prompt: 'test prompt',
        provider: 'openai',
      };

      const result = await apiClient.executeRequest(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const request: ApiRequest = {
        prompt: 'test prompt',
        provider: 'openai',
      };

      const result = await apiClient.executeRequest(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle missing API keys', async () => {
      const request: ApiRequest = {
        prompt: 'test prompt',
        provider: 'nonexistent-provider' as 'openai',
      };

      const result = await apiClient.executeRequest(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });

    it('should include timestamp in response', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ url: 'https://example.com/image.png' }] }),
        headers: new Headers(),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const beforeTime = Date.now();
      const result = await apiClient.executeRequest({
        prompt: 'test',
        provider: 'openai',
      });
      const afterTime = Date.now();

      expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(result.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('provider-specific requests', () => {
    const mockImageUrl = 'https://example.com/image.png';

    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [{ url: mockImageUrl }] }),
        headers: new Headers(),
      });
    });

    it('should handle OpenAI requests', async () => {
      const result = await apiClient.executeRequest({
        prompt: 'test',
        provider: 'openai',
        options: { size: '1024x1024', quality: 'hd' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/openai',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle Gemini requests', async () => {
      const result = await apiClient.executeRequest({
        prompt: 'test',
        provider: 'gemini',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/gemini',
        expect.any(Object)
      );
    });

    it('should handle Gemini Nano requests', async () => {
      const result = await apiClient.executeRequest({
        prompt: 'test',
        provider: 'gemini-nano',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/gemini-nano',
        expect.any(Object)
      );
    });

    it('should handle Imagen requests', async () => {
      const result = await apiClient.executeRequest({
        prompt: 'test',
        provider: 'imagen',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/proxy/imagen',
        expect.any(Object)
      );
    });
  });

  describe('rate limiting', () => {
    it('should update rate limit info from headers', () => {
      const headers = new Headers({
        'x-ratelimit-remaining': '5',
        'x-ratelimit-reset': '1234567890',
        'x-ratelimit-limit': '10',
      });

      apiClient.updateRateLimit('openai', headers);

      const status = apiClient.getRateLimitStatus('openai');
      expect(status).toEqual({
        remaining: 5,
        resetTime: 1234567890,
        limit: 10,
      });
    });

    it('should return null for unknown provider rate limit', () => {
      const status = apiClient.getRateLimitStatus('unknown');
      expect(status).toBeNull();
    });

    it('should clear rate limits', () => {
      const headers = new Headers({
        'x-ratelimit-remaining': '5',
        'x-ratelimit-reset': '1234567890',
        'x-ratelimit-limit': '10',
      });

      apiClient.updateRateLimit('openai', headers);
      apiClient.clearRateLimits();

      const status = apiClient.getRateLimitStatus('openai');
      expect(status).toBeNull();
    });
  });

  describe('request ID generation', () => {
    it('should generate unique request IDs', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ url: 'test' }] }),
        headers: new Headers(),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result1 = await apiClient.executeRequest({
        prompt: 'test1',
        provider: 'openai',
      });
      const result2 = await apiClient.executeRequest({
        prompt: 'test2',
        provider: 'openai',
      });

      expect(result1.requestId).not.toBe(result2.requestId);
      expect(result1.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(result2.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  describe('options handling', () => {
    it('should pass options to API request', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ url: 'test' }] }),
        headers: new Headers(),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const options: ImageGenerationOptions = {
        size: '1792x1024',
        quality: 'hd',
        style: 'vivid',
        n: 2,
      };

      await apiClient.executeRequest({
        prompt: 'test',
        provider: 'openai',
        options,
      });

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]!.body as string);
      expect(body.options).toEqual(options);
    });
  });
});
