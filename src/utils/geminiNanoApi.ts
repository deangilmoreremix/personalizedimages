/**
 * Google Gemini API Integration for Image Generation and Editing
 * Note: Despite the "Nano" name in this file, this uses the standard Gemini API
 * with the gemini-1.5-flash model for fast, efficient generation
 */

import { getGeminiNanoApiKey, blobToBase64 } from './apiUtils';

export interface GeminiNanoConfig {
  model?: 'gemini-1.5-flash' | 'gemini-1.5-flash-latest' | 'gemini-2.0-flash-exp' | 'imagen-3.0-generate-001' | 'imagen-4.0-generate-001' | 'imagen-4.0-ultra-generate-001';
  temperature?: number;
  maxTokens?: number;
  safetySettings?: SafetySetting[];
  aspectRatio?: string;
  style?: string;
  responseModalities?: ('Text' | 'Image')[];
  useImagen?: boolean;
  imagenModel?: 'imagen-3.0-generate-001' | 'imagen-4.0-generate-001' | 'imagen-4.0-ultra-generate-001';
}

export interface SafetySetting {
  category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT';
  threshold: 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH' | 'BLOCK_NONE';
}

export interface ImageEditOptions {
  mode: 'enhance' | 'colorize' | 'restore' | 'stylize' | 'remove_background' | 'blur_background' | 'custom' | 'text_render' | 'compose' | 'style_transfer';
  intensity?: number;
  style?: string;
  customPrompt?: string;
  textToRender?: string;
  fontStyle?: string;
  secondaryImages?: string[]; // For multi-image composition
  aspectRatio?: string;
  responseModalities?: ('Text' | 'Image')[];
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
  }

  /**
    * Generate an image using Imagen API (via Gemini) with full Imagen 4 support
    */
   async generateImage(
     prompt: string,
     options: ImageGenerationOptions = {},
     config: GeminiNanoConfig = {}
   ): Promise<string> {
     try {
       console.log('🎨 Generating image with Imagen API:', { prompt, options, config });

       const {
         aspectRatio = '1:1',
         style = '',
         quality = 'standard',
         negativePrompt = ''
       } = options;

       const { useImagen = false, imagenModel = 'imagen-3.0-generate-001' } = config;

       if (!this.apiKey || this.apiKey.length < 20) {
         throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your.env file.');
       }

       // If not explicitly using Imagen, fall back to Gemini's built-in image generation
       if (!useImagen) {
         return this.generateImageWithGemini(prompt, options, config);
       }

       // Enhance prompt with style and quality settings
       let enhancedPrompt = prompt;
       if (style && !prompt.toLowerCase().includes(style.toLowerCase())) {
         enhancedPrompt = `${prompt} in ${style} style`;
       }

       // Add quality instruction
       if (quality === 'high') {
         enhancedPrompt = `${enhancedPrompt}. High quality, detailed, professional result.`;
       }

       // Add negative prompt if provided
       if (negativePrompt) {
         enhancedPrompt = `${enhancedPrompt}. Avoid: ${negativePrompt}`;
       }

       // Map aspect ratios to Imagen format
       const aspectRatioMap: Record<string, string> = {
         '1:1': '1:1',
         '16:9': '16:9',
         '9:16': '9:16',
         '4:3': '4:3',
         '3:4': '3:4',
         '2:3': '2:3',
         '3:2': '3:2',
         '5:4': '5:4',
         '4:5': '4:5',
         '21:9': '21:9'
       };

       const imagenAspectRatio = aspectRatioMap[aspectRatio] || '1:1';

       // Determine number of images based on model
       const numberOfImages = imagenModel.includes('ultra') ? 1 : 4;

       // Use appropriate Imagen API endpoint based on model
       const endpoint = imagenModel.includes('4.0')
         ? `imagen-4.0-generate-001`
         : `imagen-3.0-generate-001`;

       const response = await fetch(
         `https://generativelanguage.googleapis.com/v1beta/models/${endpoint}:predict`,
         {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${this.apiKey}`,
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({
             instances: [{
               prompt: enhancedPrompt
             }],
             parameters: {
               sampleCount: numberOfImages,
               aspectRatio: imagenAspectRatio,
               negativePrompt: negativePrompt || undefined,
               ...(imagenModel.includes('4.0') && {
                 imageSize: quality === 'high' ? '2K' : '1K',
                 personGeneration: 'allow_adult' // Safe default
               })
             }
           })
         }
       );

       if (!response.ok) {
         const errorText = await response.text();
         console.error('Imagen API error response:', errorText);

         // Provide a more helpful error message
         if (response.status === 403) {
           throw new Error(
             'Imagen API access denied. This typically means:\n' +
             '1. The API key needs proper authentication setup\n' +
             '2. Imagen API requires a Google Cloud project with billing enabled\n' +
             '3. You may need to use a different image generation provider (OpenAI DALL-E)\n\n' +
             'For now, please use OpenAI as your image generation provider.'
           );
         }

         throw new Error(`Imagen API error: ${response.status} - ${errorText}`);
       }

       const data = await response.json();

       // Extract image from Imagen response
       if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
         return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
       }

       throw new Error('No image found in Imagen API response');
     } catch (error) {
       console.error('Error generating image with Imagen:', error);
       throw error;
     }
   }

   /**
    * Generate image using Gemini's built-in image generation (fallback)
    */
   private async generateImageWithGemini(
     prompt: string,
     options: ImageGenerationOptions = {},
     config: GeminiNanoConfig = {}
   ): Promise<string> {
     try {
       console.log('🎨 Generating image with Gemini built-in:', { prompt, options, config });

       const { model = 'gemini-2.0-flash-exp' } = config;
       const { aspectRatio = '1:1', negativePrompt } = options;

       // Enhance prompt
       let enhancedPrompt = prompt;
       if (negativePrompt) {
         enhancedPrompt = `${enhancedPrompt}. Avoid: ${negativePrompt}`;
       }

       const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           contents: [{ parts: [{ text: enhancedPrompt }] }],
           generationConfig: {
             responseMediaType: "IMAGE",
             ...(aspectRatio !== '1:1' && {
               imageConfig: { aspectRatio }
             })
           }
         })
       });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
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

       throw new Error('No image found in Gemini response');
     } catch (error) {
       console.error('Error generating image with Gemini built-in:', error);
       throw error;
     }
   }

  /**
    * Edit an existing image using Gemini vision model with advanced features
    */
   async editImage(
     imageUrl: string,
     editOptions: ImageEditOptions,
     config: GeminiNanoConfig = {}
   ): Promise<string> {
     try {
       console.log('✏️ Editing image with Gemini:', { imageUrl, editOptions, config });

       if (!this.apiKey || this.apiKey.length < 20) {
         throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
       }

       const { model = 'gemini-2.0-flash-exp' } = config;

       // Fetch the original image
       const imageResponse = await fetch(imageUrl);
       if (!imageResponse.ok) {
         throw new Error('Failed to fetch original image');
       }

       const imageBlob = await imageResponse.blob();
       const base64Data = await blobToBase64(imageBlob);

       // Create edit prompt based on mode
       let editPrompt = this.createEditPrompt(editOptions);

       // Build request body with advanced configuration
       const requestBody: any = {
         contents: [{
           parts: [{ text: editPrompt }]
         }],
         generationConfig: {
           temperature: 0.3 // Lower temperature for more consistent edits
         }
       };

       // Add image to parts
       requestBody.contents[0].parts.push({
         inline_data: {
           mime_type: imageBlob.type,
           data: base64Data
         }
       });

       // Add secondary images for composition/style transfer
       if (editOptions.secondaryImages && editOptions.secondaryImages.length > 0) {
         for (const secondaryImageUrl of editOptions.secondaryImages) {
           try {
             const secondaryResponse = await fetch(secondaryImageUrl);
             if (secondaryResponse.ok) {
               const secondaryBlob = await secondaryResponse.blob();
               const secondaryBase64 = await blobToBase64(secondaryBlob);
               requestBody.contents[0].parts.push({
                 inline_data: {
                   mime_type: secondaryBlob.type,
                   data: secondaryBase64
                 }
               });
             }
           } catch (error) {
             console.warn('Failed to load secondary image:', error);
           }
         }
       }

       // Configure response modalities
       if (editOptions.responseModalities) {
         requestBody.generationConfig.responseModalities = editOptions.responseModalities;
       } else {
         requestBody.generationConfig.responseMediaType = "IMAGE";
       }

       // Configure aspect ratio if specified
       if (editOptions.aspectRatio) {
         requestBody.generationConfig.imageConfig = {
           aspectRatio: editOptions.aspectRatio
         };
       }

       const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(requestBody)
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
      console.log('🔄 Generating variations with Gemini:', { imageUrl, count, config });

      if (!this.apiKey || this.apiKey.length < 20) {
        throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
      }

      const { model = 'gemini-2.0-flash-exp' } = config;

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
    * Create edit prompt based on edit mode with advanced features
    */
   private createEditPrompt(editOptions: ImageEditOptions): string {
     const { mode, intensity = 1, style, customPrompt, textToRender, fontStyle, secondaryImages } = editOptions;

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

       case 'text_render':
         return `Add the following text to the image: "${textToRender}". Use a ${fontStyle || 'clean, modern'} font style. Make the text highly legible, well-placed, and integrated naturally into the image composition. Ensure perfect typography and readability.`;

       case 'compose':
         if (secondaryImages && secondaryImages.length > 0) {
           return `Create a new composite image by combining elements from all the provided images. Compose a cohesive scene that naturally integrates elements from each image. Maintain the style and quality of the original images while creating a harmonious composition.`;
         }
         return 'Compose a new image using the provided visual elements.';

       case 'style_transfer':
         if (secondaryImages && secondaryImages.length > 0) {
           return `Transfer the artistic style from the additional reference images to the main subject. Apply the visual characteristics, colors, textures, and artistic elements from the reference images while preserving the main subject's form and identity.`;
         }
         return `Apply artistic style transfer to transform the image's visual characteristics.`;

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