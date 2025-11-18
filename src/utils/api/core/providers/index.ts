/**
 * Provider Exports
 *
 * Central export point for all AI provider implementations.
 */

export { OpenAIProvider, type OpenAIOptions } from './OpenAIProvider';
export { GeminiProvider, type GeminiOptions } from './GeminiProvider';

// Future providers can be added here:
// export { ImagenProvider, type ImagenOptions } from './ImagenProvider';
// export { LeonardoProvider, type LeonardoOptions } from './LeonardoProvider';
// export { MidjourneyProvider, type MidjourneyOptions } from './MidjourneyProvider';

// Import types from core types
import type { AIProvider } from '../types';

// Re-export for convenience
export type { AIProvider };

export interface ProviderCapabilities {
  imageGeneration: boolean;
  imageEditing: boolean;
  imageAnalysis: boolean;
  imageVariations: boolean;
  streaming: boolean;
  videoGeneration: boolean;
}

// Provider capability matrix
export const PROVIDER_CAPABILITIES: Record<AIProvider, ProviderCapabilities> = {
  openai: {
    imageGeneration: true,
    imageEditing: true,
    imageAnalysis: true,
    imageVariations: true,
    streaming: false,
    videoGeneration: false
  },
  gemini: {
    imageGeneration: true,
    imageEditing: true,
    imageAnalysis: true,
    imageVariations: true,
    streaming: true,
    videoGeneration: false
  },
  'gemini-nano': {
    imageGeneration: true,
    imageEditing: true,
    imageAnalysis: true,
    imageVariations: true,
    streaming: true,
    videoGeneration: false
  },
  imagen: {
    imageGeneration: true,
    imageEditing: false,
    imageAnalysis: false,
    imageVariations: false,
    streaming: false,
    videoGeneration: false
  },
  leonardo: {
    imageGeneration: true,
    imageEditing: false,
    imageAnalysis: false,
    imageVariations: true,
    streaming: false,
    videoGeneration: false
  },
  giphy: {
    imageGeneration: false,
    imageEditing: false,
    imageAnalysis: false,
    imageVariations: false,
    streaming: false,
    videoGeneration: false
  }
};

/**
 * Get provider instance based on provider type
 */
export function createProvider(provider: AIProvider) {
  switch (provider) {
    case 'openai':
      const { OpenAIProvider } = require('./OpenAIProvider');
      return new OpenAIProvider();
    case 'gemini':
      const { GeminiProvider } = require('./GeminiProvider');
      return new GeminiProvider();
    default:
      throw new Error(`Provider ${provider} not implemented yet`);
  }
}

/**
 * Check if a provider supports a specific capability
 */
export function providerSupports(provider: AIProvider, capability: keyof ProviderCapabilities): boolean {
  return PROVIDER_CAPABILITIES[provider]?.[capability] || false;
}

/**
 * Get all providers that support a specific capability
 */
export function getProvidersForCapability(capability: keyof ProviderCapabilities): AIProvider[] {
  return Object.entries(PROVIDER_CAPABILITIES)
    .filter(([, capabilities]) => capabilities[capability])
    .map(([provider]) => provider as AIProvider);
}