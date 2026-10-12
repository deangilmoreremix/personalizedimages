/**
 * OpenAI Provider Implementation
 *
 * Handles all OpenAI API interactions including GPT Image 2.5 image
 * generation/editing and the Responses API for vision analysis.
 */

import { getApiKey } from '../../../env';

export interface OpenAIOptions {
  model?: 'gpt-image-2.5-sunburst' | 'gpt-image-2.5-flare';
  size?: '1024x1024' | '1536x1024' | '1024x1536' | '2048x2048' | '3840x2160' | 'auto' | '512x512' | '256x256';
  quality?: 'low' | 'medium' | 'high' | 'standard' | 'hd';
  n?: number; // Number of images to generate (for variations)
  timeout?: number; // Request timeout in milliseconds (default: 60000)
}

const DEFAULT_TIMEOUT = 60000; // 60 seconds
const DEFAULT_TEXT_MODEL = 'gpt-5-mini';
export const DEFAULT_OPENAI_IMAGE_MODEL = 'gpt-image-2.5-sunburst';

export class OpenAIProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = getApiKey('openai') || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
  }

  /**
   * Helper method to make fetch requests with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number = DEFAULT_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      throw error;
    }
  }

  /**
   * Generate image using GPT Image 2.5
   */
  async generateImage(prompt: string, options: OpenAIOptions = {}): Promise<string> {
    const {
      model = DEFAULT_OPENAI_IMAGE_MODEL,
      size = '1024x1024',
      timeout = DEFAULT_TIMEOUT
    } = options;
    const quality = options.quality === 'hd'
      ? 'high'
      : options.quality === 'standard'
        ? 'medium'
        : options.quality || 'medium';

    const response = await this.fetchWithTimeout(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size,
        quality,
        output_format: 'png'
      })
    }, timeout);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || error.error || 'Unknown error'}`);
    }

    const data = await response.json();
    const image = data?.data?.[0];

    if (image?.b64_json) {
      return `data:image/png;base64,${image.b64_json}`;
    }

    throw new Error('No image data in OpenAI response');
  }

  /**
   * Edit image using GPT Image 2.5 (mask-based editing)
   */
  async editImage(image: string, mask: string, prompt: string, options: OpenAIOptions = {}): Promise<string> {
    const { size = '1024x1024', timeout = DEFAULT_TIMEOUT } = options;

    const requestBody: Record<string, any> = {
      model: DEFAULT_OPENAI_IMAGE_MODEL,
      images: [{ image_url: this.toImageUrl(image) }],
      prompt,
      n: 1,
      size,
      output_format: 'png'
    };

    if (mask) {
      requestBody.mask = this.toImageUrl(mask);
    }

    const response = await this.fetchWithTimeout(`${this.baseUrl}/images/edits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    }, timeout);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Edit API error: ${error.error?.message || error.error || 'Unknown error'}`);
    }

    const data = await response.json();
    const edited = data?.data?.[0];

    if (edited?.b64_json) {
      return `data:image/png;base64,${edited.b64_json}`;
    }

    throw new Error('No image data in OpenAI edit response');
  }

  /**
   * Generate variations of an image
   */
  async generateVariations(image: string, options: OpenAIOptions = {}): Promise<string[]> {
    const { n = 1, size = '1024x1024', timeout = DEFAULT_TIMEOUT } = options;

    const response = await this.fetchWithTimeout(`${this.baseUrl}/images/edits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: DEFAULT_OPENAI_IMAGE_MODEL,
        images: [{ image_url: this.toImageUrl(image) }],
        prompt: 'Create a creative variation of this image. Keep the same style and main subject while exploring a fresh composition.',
        n,
        size,
        output_format: 'png'
      })
    }, timeout);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Variations API error: ${error.error?.message || error.error || 'Unknown error'}`);
    }

    const data = await response.json();

    return (data.data || []).map((item: any) => {
      if (item?.b64_json) {
        return `data:image/png;base64,${item.b64_json}`;
      }
      throw new Error('No image data in OpenAI variations response');
    });
  }

  /**
   * Analyze image using GPT-5 mini via the Responses API
   */
  async analyzeImage(imageUrl: string, prompt: string = 'Describe this image in detail'): Promise<string> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: DEFAULT_TEXT_MODEL,
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: prompt },
              { type: 'input_image', image_url: imageUrl }
            ]
          }
        ],
        max_output_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Vision API error: ${error.error?.message || error.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return this.extractTextFromResponse(data);
  }

  /**
   * Extract text from a Responses API payload
   */
  private extractTextFromResponse(data: any): string {
    for (const item of data?.output || []) {
      if (item?.type === 'output_text' && item.text) {
        return item.text;
      }
      for (const part of item?.content || []) {
        if (part?.type === 'output_text' && part.text) {
          return part.text;
        }
      }
    }
    return 'No description available';
  }

  /**
   * Normalize an image reference to a URL or base64 data URL
   */
  private toImageUrl(image: string): string {
    if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return `data:image/png;base64,${image}`;
  }

  /**
   * Check if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}