import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, ApiRequest, OPENAI_IMAGE_MODEL } from '../utils/api/core/ApiClient';
import { setUserApiKey, clearAllUserApiKeys } from '../utils/userApiKeyStorage';

/**
 * The client calls providers DIRECTLY from the browser using the user's own
 * (BYOK) key stored in localStorage. There is no server-side /api/proxy route,
 * and there is intentionally no shared VITE_* fallback.
 */
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/images/generations';
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
const IMAGEN_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict';

const OPENAI_KEY = 'sk-proj-test-openai-key-1234567890';
const GEMINI_KEY = 'AIzaTestGeminiKey-1234567890';

const okJson = (payload: unknown) => ({
  ok: true,
  json: () => Promise.resolve(payload),
  headers: new Headers(),
});

describe('ApiClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    apiClient.clearRateLimits();
    // Ensure a clean key slate so "missing key" tests are accurate.
    clearAllUserApiKeys();
  });

  afterEach(() => {
    clearAllUserApiKeys();
    vi.restoreAllMocks();
  });

  describe('executeRequest', () => {
    it('should generate an image via the direct OpenAI endpoint and return a base64 data URL', async () => {
      setUserApiKey('openai', OPENAI_KEY);
      // GPT Image 2.5 always returns base64 (data.data[0].b64_json).
      global.fetch = vi.fn().mockResolvedValue(okJson({ data: [{ b64_json: 'AAAA' }] }));

      const request: ApiRequest = { prompt: 'test prompt', provider: 'openai' };
      const result = await apiClient.executeRequest(request);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('openai');
      expect(result.data).toBe('data:image/png;base64,AAAA');
      expect(result.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);

      // Direct call to api.openai.com with the BYOK key (no /api/proxy route).
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        OPENAI_ENDPOINT,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_KEY}`,
          }),
        }),
      );
    });

    it('should fall back to a returned URL when the response has no b64_json', async () => {
      setUserApiKey('openai', OPENAI_KEY);
      global.fetch = vi.fn().mockResolvedValue(
        okJson({ data: [{ url: 'https://example.com/image.png' }] }),
      );

      const result = await apiClient.executeRequest({ prompt: 'test', provider: 'openai' });

      expect(result.success).toBe(true);
      expect(result.data).toBe('https://example.com/image.png');
    });

    it('should handle OpenAI API errors', async () => {
      setUserApiKey('openai', OPENAI_KEY);
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } }),
      });

      const result = await apiClient.executeRequest({ prompt: 'test', provider: 'openai' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should handle network errors', async () => {
      setUserApiKey('openai', OPENAI_KEY);
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await apiClient.executeRequest({ prompt: 'test', provider: 'openai' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should fail when no OpenAI BYOK key is set (and never call the network)', async () => {
      // No key stored -> getUserProvidedApiKey('openai') returns null.
      global.fetch = vi.fn();

      const result = await apiClient.executeRequest({ prompt: 'test', provider: 'openai' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires your own OpenAI API key');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should reject unsupported providers', async () => {
      const result = await apiClient.executeRequest({
        prompt: 'test',
        provider: 'made-up' as ApiRequest['provider'],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });

    it('should include timestamp in response', async () => {
      setUserApiKey('openai', OPENAI_KEY);
      global.fetch = vi.fn().mockResolvedValue(okJson({ data: [{ b64_json: 'AAAA' }] }));

      const beforeTime = Date.now();
      const result = await apiClient.executeRequest({ prompt: 'test', provider: 'openai' });
      const afterTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(result.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('provider-specific requests', () => {
    it('should POST to OpenAI images/generations with the mapped model/options body', async () => {
      setUserApiKey('openai', OPENAI_KEY);
      global.fetch = vi.fn().mockResolvedValue(okJson({ data: [{ b64_json: 'AAAA' }] }));

      const result = await apiClient.executeRequest({
        prompt: 'test',
        provider: 'openai',
        options: { size: '1792x1024', quality: 'hd' },
      });

      expect(result.success).toBe(true);

      const [url, init] = vi.mocked(global.fetch).mock.calls[0];
      expect(url).toBe(OPENAI_ENDPOINT);
      const body = JSON.parse((init as RequestInit).body as string);
      expect(body.model).toBe(OPENAI_IMAGE_MODEL);
      expect(body.prompt).toBe('test');
      expect(body.n).toBe(1);
      expect(body.size).toBe('1792x1024');
      expect(body.quality).toBe('high'); // 'hd' is mapped to 'high'
    });

    it('should call the Gemini generateContent endpoint and parse inlineData', async () => {
      setUserApiKey('gemini', GEMINI_KEY);
      global.fetch = vi.fn().mockResolvedValue(
        okJson({
          candidates: [
            { content: { parts: [{ inlineData: { mimeType: 'image/png', data: 'BBBB' } }] } },
          ],
        }),
      );

      const result = await apiClient.executeRequest({ prompt: 'test', provider: 'gemini' });

      expect(result.success).toBe(true);
      expect(result.data).toBe('data:image/png;base64,BBBB');
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url.startsWith(`${GEMINI_ENDPOINT}?key=`)).toBe(true);
      expect(url).toContain(`key=${GEMINI_KEY}`);
    });

    it('should route Gemini Nano through the flash-image generateContent endpoint', async () => {
      setUserApiKey('gemini', GEMINI_KEY); // Nano reuses the Gemini key
      global.fetch = vi.fn().mockResolvedValue(
        okJson({
          candidates: [
            { content: { parts: [{ inlineData: { mimeType: 'image/png', data: 'CCCC' } }] } },
          ],
        }),
      );

      const result = await apiClient.executeRequest({ prompt: 'test', provider: 'gemini-nano' });

      expect(result.success).toBe(true);
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url.startsWith(`${GEMINI_ENDPOINT}?key=`)).toBe(true);
    });

    it('should call the Imagen predict endpoint and parse bytesBase64Encoded', async () => {
      setUserApiKey('gemini', GEMINI_KEY); // Imagen reuses the Gemini key
      global.fetch = vi.fn().mockResolvedValue(
        okJson({ predictions: [{ bytesBase64Encoded: 'DDDD' }] }),
      );

      const result = await apiClient.executeRequest({ prompt: 'test', provider: 'imagen' });

      expect(result.success).toBe(true);
      expect(result.data).toBe('data:image/png;base64,DDDD');
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url.startsWith(`${IMAGEN_ENDPOINT}?key=`)).toBe(true);
    });

    it('should resolve the freepik provider through OpenAI GPT Image 2.5', async () => {
      setUserApiKey('openai', OPENAI_KEY);
      global.fetch = vi.fn().mockResolvedValue(okJson({ data: [{ b64_json: 'EEEE' }] }));

      const result = await apiClient.executeRequest({ prompt: 'test', provider: 'freepik' });

      expect(result.success).toBe(true);
      expect(vi.mocked(global.fetch).mock.calls[0][0]).toBe(OPENAI_ENDPOINT);
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
      setUserApiKey('openai', OPENAI_KEY);
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve(okJson({ data: [{ b64_json: 'AAAA' }] })),
      );

      const result1 = await apiClient.executeRequest({ prompt: 'test1', provider: 'openai' });
      const result2 = await apiClient.executeRequest({ prompt: 'test2', provider: 'openai' });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.requestId).not.toBe(result2.requestId);
      expect(result1.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(result2.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });
});
