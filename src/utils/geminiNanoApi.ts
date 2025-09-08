/**
 * Google Gemini Nano API Integration for Image Generation and Editing
 * Optimized for speed and efficiency with advanced image editing capabilities
 */

import { getGeminiNanoApiKey, blobToBase64 } from './apiUtils';

export interface GeminiNanoConfig {
  model?: 'gemini-1.5-flash-8b' | 'gemini-1.5-flash-8b-latest';
  temperature?: number;
  maxTokens?: number;
  safetySettings?: SafetySetting[];
  aspectRatio?: string;
  style?: string;
}

export interface SafetySetting {
  category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT';
  threshold: 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH' | 'BLOCK_NONE';
}

export interface ImageEditOptions {
  mode: 'enhance' | 'colorize' | 'restore' | 'stylize' | 'remove_background' | 'blur_background' | 'custom';
  intensity?: number;
  style?: string;
  customPrompt?: string;
}

export interface ImageGenerationOptions {
  aspectRatio?: string;
  style?: string;
  quality?: 'standard' | 'high';
  negativePrompt?: string;
}

/**
 * Gemini Nano API Service Class
 */
export class GeminiNanoService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || getGeminiNanoApiKey();
    if (!this.apiKey) {
      throw new Error('Gemini Nano API key is required');
    }
  }

  /**
   * Generate an image using Gemini Nano
   */
  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {},
    config: GeminiNanoConfig = {}
  ): Promise<string> {
    try {
      console.log('🎨 Generating image with Gemini Nano:', { prompt, options, config });

      const {
        aspectRatio = '1:1',
        style = '',
        quality = 'standard',
        negativePrompt = ''
      } = options;

      const {
        model = 'gemini-1.5-flash-8b',
        temperature = 0.7,
        maxTokens = 2048
      } = config;

      // Enhance prompt with style and quality settings
      let enhancedPrompt = prompt;
      if (style && !prompt.toLowerCase().includes(style.toLowerCase())) {
        enhancedPrompt = `${prompt} in ${style} style`;
      }

      // Add aspect ratio
      if (!enhancedPrompt.toLowerCase().includes('aspect ratio')) {
        enhancedPrompt = `${enhancedPrompt} (${aspectRatio} aspect ratio)`;
      }

      // Add quality instruction
      if (quality === 'high') {
        enhancedPrompt = `${enhancedPrompt}. High quality, detailed, professional result.`;
      }

      // Add negative prompt if provided
      if (negativePrompt) {
        enhancedPrompt = `${enhancedPrompt}. Avoid: ${negativePrompt}`;
      }

      const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: enhancedPrompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMediaType: "IMAGE"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini Nano API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      // Extract image from response
      for (const candidate of data.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error('No image found in Gemini Nano response');
    } catch (error) {
      console.error('Error generating image with Gemini Nano:', error);
      throw error;
    }
  }

  /**
   * Edit an existing image using Gemini Nano
   */
  async editImage(
    imageUrl: string,
    editOptions: ImageEditOptions,
    config: GeminiNanoConfig = {}
  ): Promise<string> {
    try {
      console.log('✏️ Editing image with Gemini Nano:', { imageUrl, editOptions, config });

      const { model = 'gemini-1.5-flash-8b' } = config;

      // Fetch the original image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch original image');
      }

      const imageBlob = await imageResponse.blob();
      const base64Data = await blobToBase64(imageBlob);

      // Create edit prompt based on mode
      let editPrompt = this.createEditPrompt(editOptions);

      const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: editPrompt },
                {
                  inline_data: {
                    mime_type: imageBlob.type,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMediaType: "IMAGE",
            temperature: 0.3 // Lower temperature for more consistent edits
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini Nano API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      // Extract edited image from response
      for (const candidate of data.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error('No edited image found in Gemini Nano response');
    } catch (error) {
      console.error('Error editing image with Gemini Nano:', error);
      throw error;
    }
  }

  /**
   * Generate image variations
   */
  async generateVariations(
    imageUrl: string,
    count: number = 3,
    config: GeminiNanoConfig = {}
  ): Promise<string[]> {
    try {
      console.log('🔄 Generating variations with Gemini Nano:', { imageUrl, count, config });

      const { model = 'gemini-1.5-flash-8b' } = config;

      // Fetch the original image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch original image');
      }

      const imageBlob = await imageResponse.blob();
      const base64Data = await blobToBase64(imageBlob);

      const variations: string[] = [];

      // Generate variations sequentially to avoid rate limits
      for (let i = 0; i < count; i++) {
        const variationPrompt = `Create a variation of this image with different colors, lighting, or composition. Variation ${i + 1} of ${count}.`;

        const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: variationPrompt },
                  {
                    inline_data: {
                      mime_type: imageBlob.type,
                      data: base64Data
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              responseMediaType: "IMAGE",
              temperature: 0.8 // Higher temperature for more varied results
            }
          })
        });

        if (!response.ok) {
          console.warn(`Failed to generate variation ${i + 1}:`, response.status);
          continue;
        }

        const data = await response.json();

        // Extract variation from response
        for (const candidate of data.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
              variations.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
              break;
            }
          }
        }
      }

      if (variations.length === 0) {
        throw new Error('No variations could be generated');
      }

      return variations;
    } catch (error) {
      console.error('Error generating variations with Gemini Nano:', error);
      throw error;
    }
  }

  /**
   * Create edit prompt based on edit mode
   */
  private createEditPrompt(editOptions: ImageEditOptions): string {
    const { mode, intensity = 1, style, customPrompt } = editOptions;

    switch (mode) {
      case 'enhance':
        return `Enhance this image with better quality, sharpness, and colors. Make it look more professional and polished. Intensity: ${intensity * 100}%.`;

      case 'colorize':
        return `Colorize this image with vibrant, natural colors. Make it look like a colorful photograph while maintaining the original composition.`;

      case 'restore':
        return `Restore this image by removing scratches, improving clarity, and enhancing details. Make it look clean and well-preserved.`;

      case 'stylize':
        return `Apply a ${style || 'modern artistic'} style to this image. Transform it while keeping the main subject recognizable.`;

      case 'remove_background':
        return `Remove the background from this image and make it transparent. Keep only the main subject with clean edges.`;

      case 'blur_background':
        return `Apply a professional bokeh effect to blur the background while keeping the main subject in sharp focus.`;

      case 'custom':
        return customPrompt || 'Edit this image according to the specified requirements.';

      default:
        return 'Improve this image with general enhancements.';
    }
  }
}

// Export singleton instance
export const geminiNanoService = new GeminiNanoService();

// Export convenience functions
export const generateImageWithGeminiNano = (
  prompt: string,
  options?: ImageGenerationOptions,
  config?: GeminiNanoConfig
): Promise<string> => {
  return geminiNanoService.generateImage(prompt, options, config);
};

export const editImageWithGeminiNano = (
  imageUrl: string,
  editOptions: ImageEditOptions,
  config?: GeminiNanoConfig
): Promise<string> => {
  return geminiNanoService.editImage(imageUrl, editOptions, config);
};

export const generateVariationsWithGeminiNano = (
  imageUrl: string,
  count?: number,
  config?: GeminiNanoConfig
): Promise<string[]> => {
  return geminiNanoService.generateVariations(imageUrl, count, config);
};