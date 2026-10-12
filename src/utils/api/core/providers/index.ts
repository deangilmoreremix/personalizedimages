/**
 * Provider Exports
 *
 * Central export point for all AI provider implementations.
 */

import { OpenAIProvider, type OpenAIOptions } from './OpenAIProvider';

export { OpenAIProvider, type OpenAIOptions };

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

export const PROVIDER_CAPABILITIES: Partial<Record<AIProvider, ProviderCapabilities>> = {
  openai: {
    imageGeneration: true,
    imageEditing: true,
    imageAnalysis: true,
    imageVariations: true,
    streaming: false,
    videoGeneration: false
  }
};

/**
 * Get provider instance based on provider type
 */
export function createProvider(provider: AIProvider) {
  switch (normalizeProvider(provider)) {
    case 'openai':
      return new OpenAIProvider();
    default:
      throw new Error(`Provider ${provider} not implemented yet`);
  }
}

export function normalizeProvider(provider: AIProvider): AIProvider {
  switch (provider) {
    case 'gemini':
    case 'gemini-nano':
    case 'imagen':
    case 'leonardo':
    case 'giphy':
    case 'freepik':
      return 'openai';
    default:
      return provider;
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