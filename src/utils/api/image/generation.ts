/**
 * Consolidated Image Generation API
 *
 * Modern, unified interface for all image generation operations.
 * Supports multiple providers with automatic fallbacks and optimizations.
 */

import { apiClient } from '../core/ApiClient';
import { createProvider, type AIProvider } from '../core/providers';
import { hasValidApiKey } from '../../env';
import type {
  ImageGenerationRequest,
  ImageGenerationResponse,
  StreamingOptions
} from '../core/types';

// Provider priority for automatic selection
const PROVIDER_PRIORITY: AIProvider[] = ['gemini', 'openai', 'imagen', 'leonardo'];

/**
 * Generate image with automatic provider selection and fallbacks
 */
export async function generateImage(
  prompt: string,
  options: Partial<ImageGenerationRequest> = {},
  streamingOptions?: StreamingOptions
): Promise<ImageGenerationResponse> {
  const startTime = Date.now();

  // Determine best provider based on capabilities and availability
  const provider = selectBestProvider(options);

  if (!provider) {
    return {
      success: false,
      error: 'No suitable AI provider available. Please check your API keys.',
      provider: 'none' as any,
      requestId: generateRequestId()
    };
  }

  try {
    // Update streaming status if provided
    streamingOptions?.onStatusUpdate?.(`Initializing ${provider}...`);

    // Create provider-specific request
    const request = createProviderRequest(prompt, provider, options);

    // Execute request through unified API client
    const response = await apiClient.executeRequest(request);

    // Update streaming progress
    streamingOptions?.onProgress?.(100);
    streamingOptions?.onStatusUpdate?.('Generation complete');

    return {
      success: true,
      imageUrl: response.data,
      provider: response.provider as any,
      requestId: response.requestId,
      metadata: {
        generationTime: Date.now() - startTime,
        model: getModelForProvider(provider, options)
      }
    };

  } catch (error) {
    console.error('Image generation failed:', error);

    // Try fallback provider if available
    const fallbackProvider = selectFallbackProvider(provider, options);
    if (fallbackProvider) {
      try {
        streamingOptions?.onStatusUpdate?.(`Retrying with ${fallbackProvider}...`);

        const fallbackRequest = createProviderRequest(prompt, fallbackProvider, options);
        const fallbackResponse = await apiClient.executeRequest(fallbackRequest);

        return {
          success: true,
          imageUrl: fallbackResponse.data,
          provider: fallbackResponse.provider as any,
          requestId: fallbackResponse.requestId,
          metadata: {
            generationTime: Date.now() - startTime,
            model: getModelForProvider(fallbackProvider, options),
            fallbackUsed: true
          }
        };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed',
      provider: provider as any,
      requestId: generateRequestId()
    };
  }
}

/**
 * Generate multiple images in batch
 */
export async function generateImageBatch(
  prompts: string[],
  options: Partial<ImageGenerationRequest> = {},
  streamingOptions?: StreamingOptions
): Promise<ImageGenerationResponse[]> {
  const results: ImageGenerationResponse[] = [];
  const total = prompts.length;

  for (let i = 0; i < total; i++) {
    const prompt = prompts[i];

    // Update progress
    streamingOptions?.onProgress?.((i / total) * 100);
    streamingOptions?.onStatusUpdate?.(`Generating image ${i + 1} of ${total}...`);

    const result = await generateImage(prompt, { ...options, count: 1 });
    results.push(result);

    // Small delay to avoid rate limits
    if (i < total - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  streamingOptions?.onProgress?.(100);
  streamingOptions?.onStatusUpdate?.('Batch generation complete');

  return results;
}

/**
 * Generate image variations from a reference image
 */
export async function generateVariations(
  imageUrl: string,
  count: number = 3,
  options: Partial<ImageGenerationRequest> = {},
  streamingOptions?: StreamingOptions
): Promise<ImageGenerationResponse[]> {
  const variations: ImageGenerationResponse[] = [];
  const startTime = Date.now();

  // Use Gemini for variations (most reliable)
  const provider: AIProvider = 'gemini';

  if (!hasValidApiKey(provider)) {
    return [{
      success: false,
      error: 'No provider available for image variations',
      provider: 'none' as any,
      requestId: generateRequestId()
    }];
  }

  try {
    const providerInstance = createProvider(provider);

    streamingOptions?.onStatusUpdate?.(`Generating ${count} variations...`);

    // Generate variations
    const urls = await providerInstance.generateVariations(imageUrl, count, {
      model: 'gemini-1.5-flash',
      temperature: 0.8
    });

    urls.forEach((url: string, index: number) => {
      variations.push({
        success: true,
        imageUrl: url,
        provider: provider as any,
        requestId: generateRequestId(),
        metadata: {
          generationTime: Date.now() - startTime,
          model: 'gemini-1.5-flash',
          variationIndex: index + 1,
          totalVariations: count
        }
      });
    });

    streamingOptions?.onProgress?.(100);
    streamingOptions?.onStatusUpdate?.('Variations generated');

    return variations;

  } catch (error) {
    return [{
      success: false,
      error: error instanceof Error ? error.message : 'Variation generation failed',
      provider: provider as any,
      requestId: generateRequestId()
    }];
  }
}

// Helper functions
function selectBestProvider(options: Partial<ImageGenerationRequest>): AIProvider | null {
  // Check for specific provider preference
  if (options.provider && hasValidApiKey(options.provider)) {
    return options.provider;
  }

  // Default priority selection
  for (const provider of PROVIDER_PRIORITY) {
    if (hasValidApiKey(provider)) {
      return provider;
    }
  }

  return null;
}

function selectFallbackProvider(currentProvider: AIProvider, options: Partial<ImageGenerationRequest>): AIProvider | null {
  for (const provider of PROVIDER_PRIORITY) {
    if (provider !== currentProvider && hasValidApiKey(provider)) {
      return provider;
    }
  }
  return null;
}

function createProviderRequest(prompt: string, provider: AIProvider, options: Partial<ImageGenerationRequest>) {
  const baseRequest: { prompt: string; provider: AIProvider; options: Record<string, any> } = {
    prompt,
    provider,
    options: {}
  };

  switch (provider) {
    case 'openai':
      baseRequest.options = {
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        style: options.quality === 'hd' ? 'natural' : 'vivid',
        response_format: options.outputFormat || 'url'
      };
      break;

    case 'gemini':
      baseRequest.options = {
        model: getModelForProvider(provider, options),
        temperature: options.style === 'surreal' ? 0.8 : 0.7,
        aspectRatio: options.aspectRatio,
        referenceImages: options.referenceImages
      };
      break;

    case 'imagen':
      baseRequest.options = {
        aspectRatio: options.aspectRatio || '1:1',
        negativePrompt: options.negativePrompt
      };
      break;
  }

  if (options.appliedTokens?.length) {
    baseRequest.options.appliedTokens = options.appliedTokens;
  }

  return baseRequest;
}

function getModelForProvider(provider: AIProvider, options: Partial<ImageGenerationRequest>): string {
  switch (provider) {
    case 'openai':
      return options.quality === 'hd' ? 'dall-e-3' : 'dall-e-3';
    case 'gemini':
      return options.style === 'ghibli' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
    case 'imagen':
      return 'imagen-3.0-generate-001';
    default:
      return 'default';
  }
}

function generateRequestId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Legacy function exports for backward compatibility
export const generateImageWithDalle = async (prompt: string, options?: any) => {
  console.warn('generateImageWithDalle is deprecated. Use generateImage instead.');
  return generateImage(prompt, { ...options, provider: 'openai' });
};

export const generateImageWithGemini = async (prompt: string, aspectRatio?: string, style?: string) => {
  console.warn('generateImageWithGemini is deprecated. Use generateImage instead.');
  return generateImage(prompt, {
    aspectRatio: aspectRatio as any,
    style: style as any,
    provider: 'gemini'
  });
};

export const generateImageWithGemini2Flash = async (prompt: string) => {
  console.warn('generateImageWithGemini2Flash is deprecated. Use generateImage instead.');
  return generateImage(prompt, { provider: 'gemini', model: 'gemini-2.0-flash-exp' });
};

export const generateImageWithImagen = async (prompt: string, aspectRatio?: string) => {
  console.warn('generateImageWithImagen is deprecated. Use generateImage instead.');
  return generateImage(prompt, { aspectRatio: aspectRatio as any, provider: 'imagen' });
};

export const generateImageWithGptImage = async (prompt: string) => {
  console.warn('generateImageWithGptImage is deprecated. Use generateImage instead.');
  return generateImage(prompt, { provider: 'openai', model: 'gpt-4-vision-preview' });
};