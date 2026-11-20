import { describe, it, expect, vi } from 'vitest';
import {
  buildImageBody,
  buildTextBody,
  generateImage,
  generateText,
  normalizeImageQuality,
  normalizeImageSize,
  parseSSE,
  DEFAULT_IMAGE_MODEL,
  DEFAULT_TEXT_MODEL
} from '../openaiResponses';

const enc = new TextEncoder();

function sseResponse(events: Array<{ type: string; [k: string]: unknown }>, chunkSize = 37): Response {
  const text = events.map(e => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join('') + 'data: [DONE]\n\n';
  const bytes = enc.encode(text);
  // Split into awkward chunks to exercise buffering across event boundaries.
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (let i = 0; i < bytes.length; i += chunkSize) controller.enqueue(bytes.slice(i, i + chunkSize));
      controller.close();
    }
  });
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('legacy parameter mapping', () => {
  it('maps DALL-E sizes to GPT Image sizes', () => {
    expect(normalizeImageSize('1792x1024')).toBe('1536x1024');
    expect(normalizeImageSize('1024x1792')).toBe('1024x1536');
    expect(normalizeImageSize('1024x1024')).toBe('1024x1024');
    expect(normalizeImageSize('16:9')).toBe('1536x1024');
    expect(normalizeImageSize(undefined)).toBe('auto');
  });
  it('maps DALL-E quality to GPT Image quality', () => {
    expect(normalizeImageQuality('standard')).toBe('medium');
    expect(normalizeImageQuality('hd')).toBe('high');
    expect(normalizeImageQuality('low')).toBe('low');
    expect(normalizeImageQuality(undefined)).toBe('auto');
  });
});

describe('request builders', () => {
  it('builds an image_generation tool body using GPT Image 2.6', () => {
    const body: any = buildImageBody({ prompt: 'a cat', size: '1792x1024', quality: 'hd' });
    expect(body.model).toBe(DEFAULT_TEXT_MODEL);
    expect(body.tools[0]).toMatchObject({
      type: 'image_generation',
      model: DEFAULT_IMAGE_MODEL,
      action: 'generate',
      size: '1536x1024',
      quality: 'high'
    });
    expect(body.tool_choice).toEqual({ type: 'image_generation' });
    expect(body.tools[0].partial_images).toBeUndefined();
  });

  it('switches to edit mode with input images and a mask', () => {
    const body: any = buildImageBody({
      prompt: 'add a hat',
      inputImages: ['data:image/png;base64,AAA', 'file_123'],
      mask: 'data:image/png;base64,MMM',
      partialImages: 9
    });
    expect(body.tools[0].action).toBe('edit');
    expect(body.tools[0].partial_images).toBe(3); // clamped
    expect(body.tools[0].input_image_mask).toEqual({ image_url: 'data:image/png;base64,MMM' });
    expect(body.input[0].content).toEqual([
      { type: 'input_text', text: 'add a hat' },
      { type: 'input_image', image_url: 'data:image/png;base64,AAA' },
      { type: 'input_image', file_id: 'file_123' }
    ]);
  });

  it('moves system messages to instructions and supports json schema', () => {
    const body: any = buildTextBody({
      messages: [
        { role: 'system', content: 'be terse' },
        { role: 'user', content: 'hi' }
      ],
      jsonSchema: { name: 'x', schema: { type: 'object' } },
      maxOutputTokens: 50
    });
    expect(body.instructions).toBe('be terse');
    expect(body.input).toEqual([{ role: 'user', content: 'hi' }]);
    expect(body.text.format).toMatchObject({ type: 'json_schema', name: 'x', strict: true });
    expect(body.max_output_tokens).toBe(50);
  });

  it('requires input or messages', () => {
    expect(() => buildTextBody({})).toThrow();
  });
});

describe('parseSSE', () => {
  it('reassembles events split across chunks', async () => {
    const res = sseResponse([{ type: 'a', n: 1 }, { type: 'b', n: 2 }], 5);
    const out: string[] = [];
    for await (const m of parseSSE(res.body!)) out.push(m.data);
    expect(out.map(d => (d === '[DONE]' ? d : JSON.parse(d).type))).toEqual(['a', 'b', '[DONE]']);
  });
});

describe('generateImage', () => {
  it('returns a data URL from a non-streaming response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({ id: 'resp_1', output: [{ type: 'image_generation_call', id: 'ig_1', result: 'QUJD', revised_prompt: 'rp' }] })
    );
    const r = await generateImage({ prompt: 'cat' }, { apiKey: 'sk-test', fetchImpl: fetchImpl as any });
    expect(r.dataUrl).toBe('data:image/png;base64,QUJD');
    expect(r.revisedPrompt).toBe('rp');
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/responses');
    expect(JSON.parse(init.body).stream).toBe(false);
    expect(init.headers.Authorization).toBe('Bearer sk-test');
  });

  it('streams partial images then resolves with the final image', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      sseResponse([
        { type: 'response.created', response: { id: 'resp_2' } },
        { type: 'response.image_generation_call.in_progress' },
        { type: 'response.image_generation_call.generating' },
        { type: 'response.image_generation_call.partial_image', partial_image_index: 0, partial_image_b64: 'UDA=' },
        { type: 'response.image_generation_call.partial_image', partial_image_index: 1, partial_image_b64: 'UDE=' },
        { type: 'response.output_item.done', item: { type: 'image_generation_call', id: 'ig_2', result: 'RklOQUw=' } },
        { type: 'response.completed', response: { id: 'resp_2', output: [{ type: 'image_generation_call', id: 'ig_2', result: 'RklOQUw=' }] } }
      ])
    );
    const partials: Array<{ dataUrl: string; index: number }> = [];
    const statuses: string[] = [];
    const r = await generateImage(
      { prompt: 'cat', onPartial: p => partials.push(p), onStatus: s => statuses.push(s) },
      { apiKey: 'sk-test', fetchImpl: fetchImpl as any }
    );
    expect(partials).toEqual([
      { dataUrl: 'data:image/png;base64,UDA=', index: 0 },
      { dataUrl: 'data:image/png;base64,UDE=', index: 1 }
    ]);
    expect(r.b64).toBe('RklOQUw=');
    expect(r.responseId).toBe('resp_2');
    expect(statuses).toEqual(['started', 'generating', 'generating', 'completed']);
    const sent = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(sent.stream).toBe(true);
    expect(sent.tools[0].partial_images).toBe(2);
  });

  it('falls back to response.completed output when no output_item.done arrives', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      sseResponse([{ type: 'response.completed', response: { id: 'r', output: [{ type: 'image_generation_call', result: 'WFla' }] } }])
    );
    const r = await generateImage({ prompt: 'x', onPartial: () => {} }, { apiKey: 'k', fetchImpl: fetchImpl as any });
    expect(r.b64).toBe('WFla');
  });

  it('surfaces API errors with status and message', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ error: { message: 'bad key', code: 'invalid_api_key' } }, 401));
    await expect(generateImage({ prompt: 'x' }, { apiKey: 'k', fetchImpl: fetchImpl as any })).rejects.toMatchObject({
      status: 401,
      code: 'invalid_api_key',
      message: expect.stringContaining('bad key')
    });
  });

  it('errors when a stream ends without an image (e.g. moderation)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(sseResponse([{ type: 'response.completed', response: { output: [] } }]));
    await expect(
      generateImage({ prompt: 'x', onPartial: () => {} }, { apiKey: 'k', fetchImpl: fetchImpl as any })
    ).rejects.toThrow(/without a final image/);
  });

  it('throws on stream error events', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(sseResponse([{ type: 'error', message: 'boom' }]));
    await expect(
      generateImage({ prompt: 'x', onPartial: () => {} }, { apiKey: 'k', fetchImpl: fetchImpl as any })
    ).rejects.toThrow('boom');
  });

  it('rejects empty prompts without calling the API', async () => {
    const fetchImpl = vi.fn();
    await expect(generateImage({ prompt: '  ' }, { apiKey: 'k', fetchImpl: fetchImpl as any })).rejects.toThrow('Prompt is required');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('uses a custom base URL and headers (edge proxy)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ output: [{ type: 'image_generation_call', result: 'QQ==' }] }));
    await generateImage(
      { prompt: 'x' },
      { apiKey: '', baseUrl: 'https://proj.supabase.co/functions/v1/openai-responses/', headers: { Authorization: 'Bearer jwt' }, fetchImpl: fetchImpl as any }
    );
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://proj.supabase.co/functions/v1/openai-responses/responses');
    expect(init.headers.Authorization).toBe('Bearer jwt');
  });
});

describe('generateText', () => {
  it('extracts text from a non-streaming response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({ id: 'r', model: 'gpt-6.2-sol', output: [{ type: 'message', content: [{ type: 'output_text', text: 'hello' }] }] })
    );
    const r = await generateText({ input: 'hi' }, { apiKey: 'k', fetchImpl: fetchImpl as any });
    expect(r.text).toBe('hello');
  });

  it('streams tokens via output_text.delta', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      sseResponse([
        { type: 'response.output_text.delta', delta: 'Hel' },
        { type: 'response.output_text.delta', delta: 'lo' },
        { type: 'response.completed', response: { id: 'r', model: 'gpt-6.2-sol', output: [] } }
      ])
    );
    const tokens: string[] = [];
    const r = await generateText({ input: 'hi', onToken: t => tokens.push(t) }, { apiKey: 'k', fetchImpl: fetchImpl as any });
    expect(tokens).toEqual(['Hel', 'lo']);
    expect(r.text).toBe('Hello');
  });
});
