import { GPTModel } from '../../lib/openai';
import { callEdgeFunction, isSupabaseConfigured } from './supabaseClient';
import { responsesGenerateText, TEXT_MODEL } from './openaiClient';

export interface GPTRequest {
  input?: string;
  messages?: { role: 'user' | 'system' | 'assistant'; content: string }[];
  model?: GPTModel;
  tools?: any[];
  tool_choice?: any;
  response_format?: any;
  /** Structured output schema (Responses API `text.format`). Preferred over response_format. */
  json_schema?: { name: string; schema: Record<string, unknown>; strict?: boolean };
  max_output_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface GPTStreamOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export interface GPTResponse {
  model: string;
  text: string;
  error?: string;
}

/** Convert legacy chat-completions `response_format: {type:'json_schema'}` to the Responses shape. */
function toJsonSchema(request: GPTRequest) {
  if (request.json_schema) return request.json_schema;
  const js = request.response_format?.type === 'json_schema' ? request.response_format.json_schema : undefined;
  return js?.schema ? { name: js.name || 'output', schema: js.schema, strict: js.strict } : undefined;
}

function toMessages(request: GPTRequest) {
  if (request.messages && request.messages.length > 0) return request.messages;
  if (request.input) return [{ role: 'user' as const, content: request.input }];
  throw new Error('Either input or messages must be provided');
}

export async function callGPT(request: GPTRequest): Promise<GPTResponse> {
  const model = request.model || TEXT_MODEL;
  try {
    const messages = toMessages(request);

    // Preferred path: Responses API (direct with a user/env key, otherwise via the edge proxy).
    const result = await responsesGenerateText({
      model,
      messages,
      maxOutputTokens: request.max_output_tokens ?? 1000,
      jsonSchema: toJsonSchema(request),
      tools: request.tools
    });
    return { model: result.model, text: result.text };
  } catch (error: any) {
    // Legacy fallback: assistant-stream edge function (only when the Responses path is unavailable).
    if (isSupabaseConfigured() && /not configured/i.test(error?.message || '')) {
      try {
        const result = await callEdgeFunction('assistant-stream', {
          messages: toMessages(request),
          temperature: request.temperature ?? 0.7,
          provider: 'openai'
        });
        const text = typeof result === 'string' ? result : (result?.text || result?.message || '');
        return { model, text };
      } catch (edgeError: any) {
        error = edgeError;
      }
    }
    console.error('GPT API Error:', error);
    return { model, text: '', error: error?.message || 'Unknown error occurred' };
  }
}

export async function polishImagePrompt(
  originalPrompt: string,
  model: GPTModel = TEXT_MODEL
): Promise<string> {
  const polishRequest: GPTRequest = {
    input: `Please improve this image generation prompt for GPT Image 2.6. Make it more detailed, professional, and optimized for high-quality results. Keep the core concept but enhance it with better descriptive language, technical specifications, and artistic elements:

Original prompt: "${originalPrompt}"

Please provide only the improved prompt without any additional explanation or quotes.`,
    model,
  };

  const response = await callGPT(polishRequest);

  if (response.error) {
    console.warn('Prompt polishing failed:', response.error);
    return originalPrompt;
  }

  return response.text.trim().replace(/^["']|["']$/g, '');
}

/** Live token streaming via the Responses API (SSE `response.output_text.delta`). */
export async function streamGPTResponse(
  request: GPTRequest,
  options: GPTStreamOptions = {}
): Promise<void> {
  try {
    const messages = toMessages(request);
    const result = await responsesGenerateText({
      model: request.model || TEXT_MODEL,
      messages,
      maxOutputTokens: request.max_output_tokens ?? 1000,
      jsonSchema: toJsonSchema(request),
      onToken: token => options.onToken?.(token)
    });
    options.onComplete?.(result.text);
  } catch (error: any) {
    console.error('GPT Stream Error:', error);
    const err = new Error(error?.message || 'Unknown streaming error');
    options.onError?.(err);
    throw err;
  }
}

export async function callGPTWithStreaming(
  request: GPTRequest,
  streamOptions?: GPTStreamOptions
): Promise<GPTResponse> {
  if (request.stream && streamOptions) {
    let fullText = '';

    await streamGPTResponse(request, {
      onToken: (token) => {
        fullText += token;
        streamOptions.onToken?.(token);
      },
      onComplete: (text) => {
        fullText = text;
        streamOptions.onComplete?.(text);
      },
      onError: streamOptions.onError
    });

    return {
      model: request.model || TEXT_MODEL,
      text: fullText
    };
  }

  return callGPT(request);
}
