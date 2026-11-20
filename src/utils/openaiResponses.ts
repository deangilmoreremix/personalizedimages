/**
 * OpenAI Responses API client (text, image generation, image editing, streaming).
 *
 * Dependency-free on purpose: the identical file is mirrored at
 * supabase/functions/_shared/openai-responses.ts for Deno edge functions.
 * Keep the two in sync (run `npm run sync:responses`).
 *
 * Notes on the Responses API image_generation tool:
 *  - The image model is chosen inside the tool (`tools[0].model`); a mainline text
 *    model is chosen at the top level.
 *  - GPT Image models return base64 only (no hosted URL), so results are data URLs.
 *  - With `stream: true` + `partial_images: 0-3` the server emits
 *    `response.image_generation_call.partial_image` events before the final image.
 */

export const OPENAI_BASE_URL = 'https://api.openai.com/v1';

/** Defaults; override via env (VITE_OPENAI_TEXT_MODEL / VITE_OPENAI_IMAGE_MODEL). */
export const DEFAULT_TEXT_MODEL = 'gpt-6.2-sol';
/** Detailed visual work. */
export const DEFAULT_IMAGE_MODEL = 'gpt-image-2.6-sunburst';
/** Fast iteration. */
export const FAST_IMAGE_MODEL = 'gpt-image-2.6-flare';

export type ImageSize = 'auto' | '1024x1024' | '1536x1024' | '1024x1536';
export type ImageQuality = 'auto' | 'low' | 'medium' | 'high';
export type ImageFormat = 'png' | 'jpeg' | 'webp';

export interface ResponsesConfig {
  apiKey: string;
  baseUrl?: string;
  /** Extra headers (e.g. Supabase auth when baseUrl is an edge function proxy). */
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Fetch override, mainly for tests. */
  fetchImpl?: typeof fetch;
}

export class OpenAIResponsesError extends Error {
  status?: number;
  code?: string;
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'OpenAIResponsesError';
    this.status = status;
    this.code = code;
  }
}

/* ------------------------------------------------------------------ */
/* Legacy parameter mapping (DALL-E era -> GPT Image)                  */
/* ------------------------------------------------------------------ */

/** DALL-E 3 sizes (1792x1024 / 1024x1792) are not valid for GPT Image models. */
export function normalizeImageSize(size?: string): ImageSize {
  switch (size) {
    case '1792x1024':
    case '1536x1024':
    case '16:9':
    case '3:2':
      return '1536x1024';
    case '1024x1792':
    case '1024x1536':
    case '9:16':
    case '2:3':
      return '1024x1536';
    case '1024x1024':
    case '1:1':
      return '1024x1024';
    default:
      return 'auto';
  }
}

/** DALL-E quality ('standard' | 'hd') -> GPT Image quality. */
export function normalizeImageQuality(quality?: string): ImageQuality {
  switch (quality) {
    case 'hd':
    case 'high':
      return 'high';
    case 'standard':
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    default:
      return 'auto';
  }
}

export function toDataUrl(b64: string, format: ImageFormat = 'png'): string {
  if (b64.startsWith('data:')) return b64;
  const mime = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
  return `data:${mime};base64,${b64}`;
}

/* ------------------------------------------------------------------ */
/* Low-level request + SSE                                             */
/* ------------------------------------------------------------------ */

export interface SSEMessage {
  event?: string;
  data: string;
}

/** Parse a text/event-stream body into messages. */
export async function* parseSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<SSEMessage> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const flush = function* (block: string): Generator<SSEMessage> {
    let event: string | undefined;
    const dataLines: string[] = [];
    for (const rawLine of block.split('\n')) {
      const line = rawLine.replace(/\r$/, '');
      if (!line || line.startsWith(':')) continue;
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
    }
    if (dataLines.length) yield { event, data: dataLines.join('\n') };
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.search(/\r?\n\r?\n/)) !== -1) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx).replace(/^\r?\n\r?\n/, '');
        yield* flush(block);
      }
    }
    buffer += decoder.decode();
    if (buffer.trim()) yield* flush(buffer);
  } finally {
    reader.releaseLock();
  }
}

async function throwForBadResponse(res: Response): Promise<never> {
  let message = res.statusText || 'Request failed';
  let code: string | undefined;
  try {
    const data = await res.json();
    message = data?.error?.message || data?.message || message;
    code = data?.error?.code || data?.error?.type;
  } catch {
    /* body not JSON */
  }
  throw new OpenAIResponsesError(`OpenAI API error (${res.status}): ${message}`, res.status, code);
}

function endpoint(cfg: ResponsesConfig): string {
  return `${(cfg.baseUrl || OPENAI_BASE_URL).replace(/\/$/, '')}/responses`;
}

function requestHeaders(cfg: ResponsesConfig, stream: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    ...(cfg.headers || {})
  };
  if (stream) headers.Accept = 'text/event-stream';
  return headers;
}

/** POST /responses (non-streaming). Returns the Response object JSON. */
export async function createResponse(body: Record<string, unknown>, cfg: ResponsesConfig): Promise<any> {
  const f = cfg.fetchImpl || fetch;
  const res = await f(endpoint(cfg), {
    method: 'POST',
    headers: requestHeaders(cfg, false),
    body: JSON.stringify({ ...body, stream: false }),
    signal: cfg.signal
  });
  if (!res.ok) await throwForBadResponse(res);
  const json = await res.json();
  if (json?.error) {
    throw new OpenAIResponsesError(json.error.message || 'Response failed', undefined, json.error.code);
  }
  return json;
}

/** POST /responses with stream:true. Yields parsed events. */
export async function* streamResponse(
  body: Record<string, unknown>,
  cfg: ResponsesConfig
): AsyncGenerator<{ type: string; [k: string]: any }> {
  const f = cfg.fetchImpl || fetch;
  const res = await f(endpoint(cfg), {
    method: 'POST',
    headers: requestHeaders(cfg, true),
    body: JSON.stringify({ ...body, stream: true }),
    signal: cfg.signal
  });
  if (!res.ok) await throwForBadResponse(res);
  if (!res.body) throw new OpenAIResponsesError('Streaming not supported: response has no body');

  for await (const msg of parseSSE(res.body)) {
    if (msg.data === '[DONE]') return;
    let evt: any;
    try {
      evt = JSON.parse(msg.data);
    } catch {
      continue;
    }
    if (!evt.type && msg.event) evt.type = msg.event;
    if (evt.type === 'error') {
      throw new OpenAIResponsesError(evt.message || evt.error?.message || 'Stream error', undefined, evt.code);
    }
    if (evt.type === 'response.failed') {
      const err = evt.response?.error;
      throw new OpenAIResponsesError(err?.message || 'Response failed', undefined, err?.code);
    }
    yield evt;
  }
}

/* ------------------------------------------------------------------ */
/* Output extraction                                                   */
/* ------------------------------------------------------------------ */

export function extractText(response: any): string {
  if (typeof response?.output_text === 'string' && response.output_text) return response.output_text;
  const parts: string[] = [];
  for (const item of response?.output || []) {
    if (item?.type === 'message') {
      for (const c of item.content || []) {
        if (c?.type === 'output_text' && typeof c.text === 'string') parts.push(c.text);
      }
    }
  }
  return parts.join('');
}

export function extractImages(response: any): Array<{ b64: string; revisedPrompt?: string; id?: string }> {
  const out: Array<{ b64: string; revisedPrompt?: string; id?: string }> = [];
  for (const item of response?.output || []) {
    if (item?.type === 'image_generation_call' && typeof item.result === 'string' && item.result) {
      out.push({ b64: item.result, revisedPrompt: item.revised_prompt, id: item.id });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  role: 'system' | 'developer' | 'user' | 'assistant';
  content: string;
}

export interface TextOptions {
  model?: string;
  input?: string;
  messages?: ChatMessage[];
  instructions?: string;
  maxOutputTokens?: number;
  /** Structured outputs. */
  jsonSchema?: { name: string; schema: Record<string, unknown>; strict?: boolean };
  /** Stream tokens as they arrive (uses response.output_text.delta). */
  onToken?: (token: string, fullText: string) => void;
  tools?: unknown[];
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
}

export function buildTextBody(opts: TextOptions, defaultModel = DEFAULT_TEXT_MODEL): Record<string, unknown> {
  let instructions = opts.instructions;
  let input: unknown;

  if (opts.messages?.length) {
    const system = opts.messages.filter(m => m.role === 'system' || m.role === 'developer').map(m => m.content);
    if (system.length) instructions = [instructions, ...system].filter(Boolean).join('\n\n');
    input = opts.messages
      .filter(m => m.role !== 'system' && m.role !== 'developer')
      .map(m => ({ role: m.role, content: m.content }));
  } else if (opts.input) {
    input = opts.input;
  } else {
    throw new OpenAIResponsesError('Either input or messages must be provided');
  }

  const body: Record<string, unknown> = { model: opts.model || defaultModel, input, store: false };
  if (instructions) body.instructions = instructions;
  if (opts.maxOutputTokens) body.max_output_tokens = opts.maxOutputTokens;
  if (opts.tools?.length) body.tools = opts.tools;
  if (opts.reasoningEffort) body.reasoning = { effort: opts.reasoningEffort };
  if (opts.jsonSchema) {
    body.text = {
      format: {
        type: 'json_schema',
        name: opts.jsonSchema.name,
        schema: opts.jsonSchema.schema,
        strict: opts.jsonSchema.strict ?? true
      }
    };
  }
  return body;
}

export async function generateText(
  opts: TextOptions,
  cfg: ResponsesConfig,
  defaultModel = DEFAULT_TEXT_MODEL
): Promise<{ text: string; model: string; responseId?: string }> {
  const body = buildTextBody(opts, defaultModel);

  if (!opts.onToken) {
    const res = await createResponse(body, cfg);
    return { text: extractText(res), model: res.model || (body.model as string), responseId: res.id };
  }

  let full = '';
  let finalResponse: any;
  for await (const evt of streamResponse(body, cfg)) {
    if (evt.type === 'response.output_text.delta' && typeof evt.delta === 'string') {
      full += evt.delta;
      opts.onToken(evt.delta, full);
    } else if (evt.type === 'response.completed') {
      finalResponse = evt.response;
    }
  }
  if (!full && finalResponse) full = extractText(finalResponse);
  return { text: full, model: finalResponse?.model || (body.model as string), responseId: finalResponse?.id };
}

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

export interface ImageOptions {
  prompt: string;
  /** Image model inside the tool. */
  imageModel?: string;
  /** Mainline model at the top level that drives the tool. */
  textModel?: string;
  size?: string;
  quality?: string;
  format?: ImageFormat;
  background?: 'auto' | 'opaque' | 'transparent';
  /** Optional input images (data URLs, https URLs, or file ids) for edits / references. */
  inputImages?: string[];
  /** Optional mask (data URL or file id) for inpainting. */
  mask?: string;
  /** 0-3. >0 enables progressive previews when streaming. */
  partialImages?: number;
  /** Extra passthrough fields for the tool (e.g. `complexity`). */
  toolExtras?: Record<string, unknown>;
  /** Continue a previous edit conversation. */
  previousResponseId?: string;
  onPartial?: (preview: { dataUrl: string; index: number }) => void;
  onStatus?: (status: 'started' | 'generating' | 'completed') => void;
}

export interface ImageResult {
  dataUrl: string;
  b64: string;
  revisedPrompt?: string;
  responseId?: string;
  imageCallId?: string;
  model: string;
}

function isFileId(s: string) {
  return /^file[-_]/.test(s);
}

export function buildImageBody(
  opts: ImageOptions,
  defaults: { imageModel?: string; textModel?: string } = {}
): Record<string, unknown> {
  const imageModel = opts.imageModel || defaults.imageModel || DEFAULT_IMAGE_MODEL;
  const textModel = opts.textModel || defaults.textModel || DEFAULT_TEXT_MODEL;
  const format = opts.format || 'png';
  const editing = !!opts.inputImages?.length;

  const tool: Record<string, unknown> = {
    type: 'image_generation',
    model: imageModel,
    action: editing ? 'edit' : 'generate',
    size: normalizeImageSize(opts.size),
    quality: normalizeImageQuality(opts.quality),
    output_format: format,
    ...(opts.background ? { background: opts.background } : {}),
    ...(opts.partialImages ? { partial_images: Math.max(0, Math.min(3, opts.partialImages)) } : {}),
    ...(opts.mask ? { input_image_mask: isFileId(opts.mask) ? { file_id: opts.mask } : { image_url: opts.mask } } : {}),
    ...(opts.toolExtras || {})
  };

  const content: unknown[] = [{ type: 'input_text', text: opts.prompt }];
  for (const img of opts.inputImages || []) {
    content.push(isFileId(img) ? { type: 'input_image', file_id: img } : { type: 'input_image', image_url: img });
  }

  return {
    model: textModel,
    input: [{ role: 'user', content }],
    tools: [tool],
    tool_choice: { type: 'image_generation' },
    store: false,
    ...(opts.previousResponseId ? { previous_response_id: opts.previousResponseId, store: true } : {})
  };
}

/**
 * Generate or edit an image through the Responses API.
 * Streams (progressive previews) when `onPartial` is provided, otherwise a single request.
 */
export async function generateImage(
  opts: ImageOptions,
  cfg: ResponsesConfig,
  defaults: { imageModel?: string; textModel?: string } = {}
): Promise<ImageResult> {
  if (!opts.prompt || !opts.prompt.trim()) {
    throw new OpenAIResponsesError('Prompt is required');
  }
  const wantStream = !!opts.onPartial;
  const body = buildImageBody(
    { ...opts, partialImages: wantStream ? opts.partialImages ?? 2 : 0 },
    defaults
  );
  const format = opts.format || 'png';
  const imageModel = (body.tools as any[])[0].model as string;

  if (!wantStream) {
    const res = await createResponse(body, cfg);
    const img = extractImages(res)[0];
    if (!img) {
      throw new OpenAIResponsesError(
        extractText(res) || 'No image was returned (the request may have been refused by moderation)'
      );
    }
    return {
      dataUrl: toDataUrl(img.b64, format),
      b64: img.b64,
      revisedPrompt: img.revisedPrompt,
      responseId: res.id,
      imageCallId: img.id,
      model: imageModel
    };
  }

  let finalB64: string | undefined;
  let revisedPrompt: string | undefined;
  let responseId: string | undefined;
  let callId: string | undefined;

  opts.onStatus?.('started');
  for await (const evt of streamResponse(body, cfg)) {
    switch (evt.type) {
      case 'response.created':
        responseId = evt.response?.id ?? responseId;
        break;
      case 'response.image_generation_call.in_progress':
      case 'response.image_generation_call.generating':
        opts.onStatus?.('generating');
        break;
      case 'response.image_generation_call.partial_image': {
        const b64 = evt.partial_image_b64 as string | undefined;
        if (b64) opts.onPartial?.({ dataUrl: toDataUrl(b64, format), index: evt.partial_image_index ?? 0 });
        break;
      }
      case 'response.output_item.done':
        if (evt.item?.type === 'image_generation_call' && evt.item.result) {
          finalB64 = evt.item.result;
          revisedPrompt = evt.item.revised_prompt ?? revisedPrompt;
          callId = evt.item.id ?? callId;
        }
        break;
      case 'response.completed': {
        responseId = evt.response?.id ?? responseId;
        const img = extractImages(evt.response)[0];
        if (img) {
          finalB64 = finalB64 || img.b64;
          revisedPrompt = revisedPrompt ?? img.revisedPrompt;
          callId = callId ?? img.id;
        }
        break;
      }
    }
  }

  if (!finalB64) {
    throw new OpenAIResponsesError('Stream ended without a final image (the request may have been refused by moderation)');
  }
  opts.onStatus?.('completed');
  return {
    dataUrl: toDataUrl(finalB64, format),
    b64: finalB64,
    revisedPrompt,
    responseId,
    imageCallId: callId,
    model: imageModel
  };
}

/** Vision: describe / analyse an image with a mainline model. */
export async function analyzeImage(
  imageUrl: string,
  prompt: string,
  cfg: ResponsesConfig,
  opts: { model?: string; maxOutputTokens?: number; detail?: 'low' | 'high' | 'auto' } = {}
): Promise<string> {
  const res = await createResponse(
    {
      model: opts.model || DEFAULT_TEXT_MODEL,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: imageUrl, detail: opts.detail || 'high' }
          ]
        }
      ],
      store: false,
      ...(opts.maxOutputTokens ? { max_output_tokens: opts.maxOutputTokens } : {})
    },
    cfg
  );
  const text = extractText(res);
  if (!text) throw new OpenAIResponsesError('No analysis returned');
  return text;
}
