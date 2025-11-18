/**
 * OpenAI Provider Implementation
 *
 * Handles all OpenAI API interactions including DALL-E 3, GPT-4 Vision, and future models.
 */

import { getApiKey } from '../../../env';

export interface OpenAIOptions {
  model?: 'dall-e-3' | 'dall-e-2' | 'gpt-4-vision-preview';
  size?: '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '256x256';
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
  response_format?: 'url' | 'b64_json';
  n?: number; // Number of images to generate (for variations)
}

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
   * Generate image using DALL-E
   */
  async generateImage(prompt: string, options: OpenAIOptions = {}): Promise<string> {
    const {
      model = 'dall-e-3',
      size = '1024x1024',
      quality = 'standard',
      style = 'natural',
      response_format = 'url'
    } = options;

    const response = await fetch(`${this.baseUrl}/images/generations`, {
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
        style,
        response_format
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (response_format === 'b64_json') {
      return `data:image/png;base64,${data.data[0].b64_json}`;
    }

    return data.data[0].url;
  }

  /**
   * Edit image using DALL-E (mask-based editing)
   */
  async editImage(image: string, mask: string, prompt: string, options: OpenAIOptions = {}): Promise<string> {
    const { size = '1024x1024', response_format = 'url' } = options;

    // Convert base64 to blob for FormData
    const imageBlob = await this.base64ToBlob(image);
    const maskBlob = await this.base64ToBlob(mask);

    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('mask', maskBlob);
    formData.append('prompt', prompt);
    formData.append('n', '1');
    formData.append('size', size);
    formData.append('response_format', response_format);

    const response = await fetch(`${this.baseUrl}/images/edits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Edit API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (response_format === 'b64_json') {
      return `data:image/png;base64,${data.data[0].b64_json}`;
    }

    return data.data[0].url;
  }

  /**
   * Generate variations of an image
   */
  async generateVariations(image: string, options: OpenAIOptions = {}): Promise<string[]> {
    const { n = 1, size = '1024x1024', response_format = 'url' } = options;

    const imageBlob = await this.base64ToBlob(image);

    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('n', n.toString());
    formData.append('size', size);
    formData.append('response_format', response_format);

    const response = await fetch(`${this.baseUrl}/images/variations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Variations API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    return data.data.map((item: any) => {
      if (response_format === 'b64_json') {
        return `data:image/png;base64,${item.b64_json}`;
      }
      return item.url;
    });
  }

  /**
   * Analyze image using GPT-4 Vision
   */
  async analyzeImage(imageUrl: string, prompt: string = 'Describe this image in detail'): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Vision API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No description available';
  }

  /**
   * Convert base64 string to Blob
   */
  private async base64ToBlob(base64: string): Promise<Blob> {
    const response = await fetch(base64);
    return response.blob();
  }

  /**
   * Check if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
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