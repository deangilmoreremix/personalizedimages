import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callGPT, polishImagePrompt } from './gptApi';

// Mock the OpenAI client
vi.mock('../../lib/openai', () => ({
  openai: {
    responses: {
      create: vi.fn(),
    },
    apiKey: 'test-key',
  },
}));

describe('GPT API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('callGPT', () => {
    it('should reject empty payloads', async () => {
      const result = await callGPT({});
      expect(result.error).toContain('Either input or messages must be provided');
    });

    it('should reject missing API key', async () => {
      // Mock missing API key
      const { openai } = await import('../../lib/openai');
      Object.defineProperty(openai, 'apiKey', { value: '', configurable: true });

      const result = await callGPT({ input: 'test' });
      expect(result.error).toContain('Missing OPENAI_API_KEY');
    });

    it('should handle API errors gracefully', async () => {
      const { openai } = await import('../../lib/openai');
      // Mock the API key to be present
      Object.defineProperty(openai, 'apiKey', { value: 'test-key', configurable: true });
      const mockCreate = vi.fn().mockRejectedValue(new Error('API Error'));
      openai.responses.create = mockCreate;

      const result = await callGPT({ input: 'test' });
      expect(result.error).toBe('API Error');
    });
  });

  describe('polishImagePrompt', () => {
    it('should return original prompt if polishing fails', async () => {
      const { openai } = await import('../../lib/openai');
      const mockCreate = vi.fn().mockRejectedValue(new Error('API Error'));
      openai.responses.create = mockCreate;

      const originalPrompt = 'A simple cat';
      const result = await polishImagePrompt(originalPrompt);
      expect(result).toBe(originalPrompt);
    });
  });
});