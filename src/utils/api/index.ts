/**
 * Unified API Module - Modern Image Generation Interface
 *
 * This module provides a clean, consolidated interface for all AI image generation,
 * processing, and analysis operations while maintaining backward compatibility.
 */

// Export the new unified API
export { generateImage, generateImageBatch, generateVariations } from './image/generation';

// Export core infrastructure
export { apiClient } from './core/ApiClient';

// Export types
export type {
  ImageGenerationRequest,
  ImageGenerationResponse,
  GenerationOptions,
  StreamingOptions,
  AIProvider
} from './core/types';

// Export provider information
export {
  PROVIDER_CAPABILITIES,
  providerSupports,
  getProvidersForCapability
} from './core/providers';

// Legacy API exports for backward compatibility
// These will be deprecated but maintained during transition

/**
 * @deprecated Use generateImage instead
 */
export const generateImageWithDalle = async (prompt: string, options?: any) => {
  console.warn('generateImageWithDalle is deprecated. Use generateImage instead.');
  const { generateImage } = await import('./image/generation');
  return generateImage(prompt, { ...options, provider: 'openai' });
};

/**
 * @deprecated Use generateImage instead
 */
export const generateImageWithGemini = async (prompt: string, aspectRatio?: string, style?: string) => {
  console.warn('generateImageWithGemini is deprecated. Use generateImage instead.');
  const { generateImage } = await import('./image/generation');
  return generateImage(prompt, { aspectRatio, style, provider: 'gemini' });
};

/**
 * @deprecated Use generateImage instead
 */
export const generateImageWithGemini2Flash = async (prompt: string) => {
  console.warn('generateImageWithGemini2Flash is deprecated. Use generateImage instead.');
  const { generateImage } = await import('./image/generation');
  return generateImage(prompt, { provider: 'gemini', model: 'gemini-2.0-flash-exp' });
};

/**
 * @deprecated Use generateImage instead
 */
export const generateImageWithImagen = async (prompt: string, aspectRatio?: string) => {
  console.warn('generateImageWithImagen is deprecated. Use generateImage instead.');
  const { generateImage } = await import('./image/generation');
  return generateImage(prompt, { aspectRatio, provider: 'imagen' });
};

/**
 * @deprecated Use generateImage instead
 */
export const generateImageWithGptImage = async (prompt: string) => {
  console.warn('generateImageWithGptImage is deprecated. Use generateImage instead.');
  const { generateImage } = await import('./image/generation');
  return generateImage(prompt, { provider: 'openai', model: 'gpt-4-vision-preview' });
};

// Re-export utility functions for convenience
export {
  getEnvironmentConfig,
  validateEnvironmentConfig,
  hasValidApiKey,
  getApiKey,
  getEnvironmentInfo
} from '../env';

export {
  sanitizeTokenValue,
  isValidTokenKey,
  isValidEmail,
  isValidUrl,
  isValidPhone,
  sanitizePrompt,
  isValidImageUrl,
  sanitizeHtml,
  validateTokenReplacement
} from '../validation';

// Re-export streaming utilities
export { streamImageGeneration, streamAIReasoning } from '../streamingApi';

// Re-export API utilities
export {
  getGiphyApiKey,
  getOpenAIApiKey,
  getGeminiApiKey,
  getGeminiNanoApiKey,
  hasApiKey,
  blobToBase64
} from '../apiUtils';