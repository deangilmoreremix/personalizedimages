import { openai, GPTModel } from '../../lib/openai';

export interface GPTRequest {
  input?: string;
  messages?: { role: 'user' | 'system' | 'assistant'; content: string }[];
  model?: GPTModel;
}

export interface GPTResponse {
  model: string;
  text: string;
  error?: string;
}

/**
 * Call OpenAI GPT API for text generation
 */
export async function callGPT(request: GPTRequest): Promise<GPTResponse> {
  try {
    const { input, messages, model = 'gpt-4o' } = request;

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

    const response = await openai.chat.completions.create({
      model,
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content || '';

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