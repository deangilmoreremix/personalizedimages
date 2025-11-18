/**
 * Google Gemini Provider Implementation
 *
 * Handles all Gemini API interactions including image generation, editing, and analysis.
 */

import { getApiKey } from '../../../env';

export interface GeminiOptions {
  model?: 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash-exp';
  temperature?: number;
  maxTokens?: number;
  aspectRatio?: string;
  negativePrompt?: string;
  referenceImages?: string[];
}

export class GeminiProvider {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1';

  constructor() {
    this.apiKey = getApiKey('gemini') || '';
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }
  }

  /**
   * Generate image using Gemini
   */
  async generateImage(prompt: string, options: GeminiOptions = {}): Promise<string> {
    const {
      model = 'gemini-1.5-flash',
      temperature = 0.7,
      aspectRatio,
      referenceImages = []
    } = options;

    const parts: any[] = [{ text: prompt }];

    // Add reference images if provided
    for (const imageUrl of referenceImages) {
      try {
        const base64Data = await this.urlToBase64(imageUrl);
        const mimeType = this.getMimeTypeFromUrl(imageUrl);
        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        });
      } catch (error) {
        console.warn('Failed to process reference image:', error);
      }
    }

    const requestBody: any = {
      contents: [{ parts }],
      generationConfig: {
        responseMediaType: "IMAGE",
        temperature
      }
    };

    // Add aspect ratio if specified
    if (aspectRatio) {
      requestBody.generationConfig.aspectRatio = aspectRatio;
    }

    const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return this.extractImageFromResponse(data);
  }

  /**
   * Edit image using Gemini (instruction-based editing)
   */
  async editImage(imageUrl: string, editPrompt: string, options: GeminiOptions = {}): Promise<string> {
    const { model = 'gemini-1.5-pro', temperature = 0.3 } = options;

    try {
      const base64Data = await this.urlToBase64(imageUrl);
      const mimeType = this.getMimeTypeFromUrl(imageUrl);

      const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `Edit this image with the following instruction: ${editPrompt}. Return the edited image.` },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            responseMediaType: "IMAGE",
            temperature
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini Edit API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return this.extractImageFromResponse(data);

    } catch (error) {
      throw new Error(`Image editing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze image using Gemini
   */
  async analyzeImage(imageUrl: string, analysisPrompt: string = 'Describe this image in detail', options: GeminiOptions = {}): Promise<string> {
    const { model = 'gemini-1.5-pro', temperature = 0.1, maxTokens = 500 } = options;

    try {
      const base64Data = await this.urlToBase64(imageUrl);
      const mimeType = this.getMimeTypeFromUrl(imageUrl);

      const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: analysisPrompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini Analysis API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return this.extractTextFromResponse(data);

    } catch (error) {
      throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate image variations using Gemini
   */
  async generateVariations(imageUrl: string, count: number = 3, options: GeminiOptions = {}): Promise<string[]> {
    const { model = 'gemini-1.5-flash', temperature = 0.8 } = options;
    const variations: string[] = [];

    try {
      const base64Data = await this.urlToBase64(imageUrl);
      const mimeType = this.getMimeTypeFromUrl(imageUrl);

      for (let i = 0; i < count; i++) {
        const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: `Create a creative variation of this image. Make it different but keep the same style and main subject. Variation ${i + 1} of ${count}.` },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }],
            generationConfig: {
              responseMediaType: "IMAGE",
              temperature
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = this.extractImageFromResponse(data);
          variations.push(imageUrl);
        }
      }

      return variations;

    } catch (error) {
      throw new Error(`Variation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract image from Gemini API response
   */
  private extractImageFromResponse(data: any): string {
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error('No image found in Gemini response');
  }

  /**
   * Extract text from Gemini API response
   */
  private extractTextFromResponse(data: any): string {
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.text) {
          return part.text;
        }
      }
    }
    return 'No text response available';
  }

  /**
   * Convert image URL to base64
   */
  private async urlToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            // Remove data URL prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to convert to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to convert image URL to base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get MIME type from URL
   */
  private getMimeTypeFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg'; // Default fallback
    }
  }

  /**
   * Check if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${this.apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}