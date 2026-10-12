import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callGPT, polishImagePrompt } from './gptApi';

// callGPT no longer talks to the OpenAI SDK from the browser. It validates the
// payload, then routes through a Supabase edge function (server-side OpenAI).
// Mock the client module so tests drive both the configuration gate and the
// edge-function response/error paths.
vi.mock('./supabaseClient', () => ({
  isSupabaseConfigured: vi.fn(() => true),
  callEdgeFunction: vi.fn(),
}));

import { isSupabaseConfigured, callEdgeFunction } from './supabaseClient';

describe('GPT API', () => {
  beforeEach(() => {
    vi.mocked(isSupabaseConfigured).mockReset();
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(callEdgeFunction).mockReset();
  });

  describe('callGPT', () => {
    it('should reject when neither input nor messages are provided', async () => {
      const result = await callGPT({});
      expect(result.error).toContain('Either input or messages must be provided');
    });

    it('should fail when the Supabase backend is not configured (edge-function routing required)', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const result = await callGPT({ input: 'test' });

      expect(result.error).toContain('Supabase not configured');
      expect(result.text).toBe('');
      expect(callEdgeFunction).not.toHaveBeenCalled();
    });

    it('should return the text from the edge-function response', async () => {
      vi.mocked(callEdgeFunction).mockResolvedValue({ text: 'assistant reply' });

      const result = await callGPT({ input: 'test' });

      expect(result.error).toBeUndefined();
      expect(result.text).toBe('assistant reply');
      expect(callEdgeFunction).toHaveBeenCalledWith(
        'assistant-stream',
        expect.objectContaining({ provider: 'openai' }),
      );
    });

    it('should handle edge-function errors gracefully', async () => {
      vi.mocked(callEdgeFunction).mockRejectedValue(new Error('API Error'));

      const result = await callGPT({ input: 'test' });

      expect(result.error).toBe('API Error');
      expect(result.text).toBe('');
    });
  });

  describe('polishImagePrompt', () => {
    it('should return original prompt if polishing fails', async () => {
      vi.mocked(callEdgeFunction).mockRejectedValue(new Error('API Error'));

      const originalPrompt = 'A simple cat';
      const result = await polishImagePrompt(originalPrompt);

      expect(result).toBe(originalPrompt);
    });
  });
});
