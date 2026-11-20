import { describe, it, expect, vi, beforeEach } from 'vitest';

const responsesGenerateText = vi.fn();
vi.mock('./openaiClient', () => ({
  responsesGenerateText: (...args: unknown[]) => responsesGenerateText(...args),
  TEXT_MODEL: 'gpt-6.2-sol'
}));
vi.mock('./supabaseClient', () => ({
  callEdgeFunction: vi.fn(),
  isSupabaseConfigured: () => false
}));

import { callGPT, polishImagePrompt, streamGPTResponse } from './gptApi';

describe('GPT API (Responses API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('callGPT', () => {
    it('rejects empty payloads', async () => {
      const result = await callGPT({});
      expect(result.error).toContain('Either input or messages must be provided');
      expect(responsesGenerateText).not.toHaveBeenCalled();
    });

    it('returns text from the Responses API using the default model', async () => {
      responsesGenerateText.mockResolvedValue({ text: 'hello', model: 'gpt-6.2-sol' });
      const result = await callGPT({ input: 'test' });
      expect(result).toEqual({ model: 'gpt-6.2-sol', text: 'hello' });
      expect(responsesGenerateText.mock.calls[0][0]).toMatchObject({
        model: 'gpt-6.2-sol',
        messages: [{ role: 'user', content: 'test' }]
      });
    });

    it('converts legacy response_format json_schema to the Responses jsonSchema', async () => {
      responsesGenerateText.mockResolvedValue({ text: '{}', model: 'm' });
      await callGPT({
        input: 'x',
        response_format: { type: 'json_schema', json_schema: { name: 'n', schema: { type: 'object' } } }
      });
      expect(responsesGenerateText.mock.calls[0][0].jsonSchema).toMatchObject({ name: 'n', schema: { type: 'object' } });
    });

    it('handles API errors gracefully', async () => {
      responsesGenerateText.mockRejectedValue(new Error('API Error'));
      const result = await callGPT({ input: 'test' });
      expect(result.error).toBe('API Error');
      expect(result.text).toBe('');
    });
  });

  describe('streamGPTResponse', () => {
    it('forwards live tokens and completes', async () => {
      responsesGenerateText.mockImplementation(async (opts: any) => {
        opts.onToken('Hel', 'Hel');
        opts.onToken('lo', 'Hello');
        return { text: 'Hello', model: 'm' };
      });
      const tokens: string[] = [];
      let done = '';
      await streamGPTResponse({ input: 'hi' }, { onToken: t => tokens.push(t), onComplete: t => (done = t) });
      expect(tokens).toEqual(['Hel', 'lo']);
      expect(done).toBe('Hello');
    });

    it('reports errors through onError and rethrows', async () => {
      responsesGenerateText.mockRejectedValue(new Error('nope'));
      const onError = vi.fn();
      await expect(streamGPTResponse({ input: 'hi' }, { onError })).rejects.toThrow('nope');
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('polishImagePrompt', () => {
    it('returns original prompt if polishing fails', async () => {
      responsesGenerateText.mockRejectedValue(new Error('API Error'));
      expect(await polishImagePrompt('A simple cat')).toBe('A simple cat');
    });

    it('strips wrapping quotes from the polished prompt', async () => {
      responsesGenerateText.mockResolvedValue({ text: '"A fluffy cat, studio light"', model: 'm' });
      expect(await polishImagePrompt('A cat')).toBe('A fluffy cat, studio light');
    });
  });
});
