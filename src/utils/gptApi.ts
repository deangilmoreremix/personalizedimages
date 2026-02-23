import { GPTModel } from '../../lib/openai';
import { callEdgeFunction, isSupabaseConfigured } from './supabaseClient';

export interface GPTRequest {
  input?: string;
  messages?: { role: 'user' | 'system' | 'assistant'; content: string }[];
  model?: GPTModel;
  tools?: any[];
  tool_choice?: any;
  response_format?: any;
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

export async function callGPT(request: GPTRequest): Promise<GPTResponse> {
  try {
    const {
      input,
      messages,
      model = 'gpt-4o',
      max_output_tokens = 1000
    } = request;

    let apiMessages;
    if (messages && messages.length > 0) {
      apiMessages = messages;
    } else if (input) {
      apiMessages = [{ role: 'user' as const, content: input }];
    } else {
      throw new Error('Either input or messages must be provided');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. GPT calls require edge function routing.');
    }

    const result = await callEdgeFunction('assistant-stream', {
      messages: apiMessages,
      temperature: request.temperature ?? 0.7,
      provider: 'openai'
    });

    const text = typeof result === 'string' ? result : (result?.text || result?.message || '');

    return {
      model,
      text,
    };
  } catch (error: any) {
    console.error('GPT API Error:', error);

    const errorMessage = error?.message || 'Unknown error occurred';

    return {
      model: request.model || 'gpt-4o',
      text: '',
      error: errorMessage,
    };
  }
}

export async function polishImagePrompt(
  originalPrompt: string,
  model: GPTModel = 'gpt-4o'
): Promise<string> {
  const polishRequest: GPTRequest = {
    input: `Please improve this image generation prompt for DALL-E 3. Make it more detailed, professional, and optimized for high-quality results. Keep the core concept but enhance it with better descriptive language, technical specifications, and artistic elements:

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

export async function streamGPTResponse(
  request: GPTRequest,
  options: GPTStreamOptions = {}
): Promise<void> {
  try {
    const {
      input,
      messages,
    } = request;

    let apiMessages;
    if (messages && messages.length > 0) {
      apiMessages = messages;
    } else if (input) {
      apiMessages = [{ role: 'user' as const, content: input }];
    } else {
      throw new Error('Either input or messages must be provided');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Streaming requires edge function routing.');
    }

    const result = await callEdgeFunction('assistant-stream', {
      messages: apiMessages,
      temperature: request.temperature ?? 0.7,
      provider: 'openai'
    });

    const text = typeof result === 'string' ? result : (result?.text || result?.message || '');
    options.onToken?.(text);
    options.onComplete?.(text);
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
      model: request.model || 'gpt-4o',
      text: fullText
    };
  }

  return callGPT(request);
}
