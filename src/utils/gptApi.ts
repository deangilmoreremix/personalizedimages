import { openai, GPTModel } from '../../lib/openai';

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

/**
 * Call OpenAI GPT API for text generation using Responses API
 */
export async function callGPT(request: GPTRequest): Promise<GPTResponse> {
  try {
    const {
      input,
      messages,
      model = 'gpt-4o',
      tools,
      tool_choice,
      response_format,
      max_output_tokens = 1000
    } = request;

    // Prepare messages for OpenAI API
    let apiMessages;
    if (messages && messages.length > 0) {
      apiMessages = messages;
    } else if (input) {
      apiMessages = [{ role: 'user' as const, content: input }];
    } else {
      throw new Error('Either input or messages must be provided');
    }

    // Check if API key is available
    if (!openai.apiKey) {
      throw new Error('Missing OPENAI_API_KEY');
    }

    const response = await openai.responses.create({
      model,
      messages: apiMessages,
      temperature: request.temperature ?? 0.7,
      max_output_tokens,
      ...(tools && { tools }),
      ...(tool_choice && { tool_choice }),
      ...(response_format && { response_format })
    });

    const text = response.output_text || '';

    return {
      model,
      text,
    };
  } catch (error: any) {
    console.error('GPT API Error:', error);

    let errorMessage = 'Unknown error occurred';
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    }

    return {
      model: request.model || 'gpt-4o',
      text: '',
      error: errorMessage,
    };
  }
}

/**
 * Polish/improve an image generation prompt using GPT
 */
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
    return originalPrompt; // Return original if polishing fails
  }

  return response.text.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
}

/**
 * Stream GPT responses token-by-token using chat completions API
 */
export async function streamGPTResponse(
  request: GPTRequest,
  options: GPTStreamOptions = {}
): Promise<void> {
  try {
    const {
      input,
      messages,
      model = 'gpt-4o',
      tools,
      tool_choice,
      response_format,
      max_output_tokens = 1000,
      temperature = 0.7
    } = request;

    // Prepare messages for OpenAI API
    let apiMessages;
    if (messages && messages.length > 0) {
      apiMessages = messages;
    } else if (input) {
      apiMessages = [{ role: 'user' as const, content: input }];
    } else {
      throw new Error('Either input or messages must be provided');
    }

    // Check if API key is available
    if (!openai.apiKey) {
      throw new Error('Missing OPENAI_API_KEY');
    }

    // Use chat completions API for streaming
    const stream = await openai.chat.completions.create({
      model,
      messages: apiMessages,
      temperature,
      max_tokens: max_output_tokens,
      stream: true,
      ...(tools && { tools }),
      ...(tool_choice && { tool_choice }),
      ...(response_format && { response_format })
    });

    let fullText = '';

    // Process the stream
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        options.onToken?.(content);
      }
    }

    options.onComplete?.(fullText);
  } catch (error: any) {
    console.error('GPT Stream Error:', error);
    const err = new Error(error?.message || 'Unknown streaming error');
    options.onError?.(err);
    throw err;
  }
}

/**
 * Call GPT with optional streaming support
 */
export async function callGPTWithStreaming(
  request: GPTRequest,
  streamOptions?: GPTStreamOptions
): Promise<GPTResponse> {
  // If streaming is requested and callbacks provided, use streaming
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

  // Otherwise use standard non-streaming API
  return callGPT(request);
}