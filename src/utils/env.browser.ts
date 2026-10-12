/**
 * Browser-compatible environment utilities
 *
 * Direct browser provider calls require user-provided keys (BYOK) only.
 * Shared deployment credentials (VITE_* env vars) must never be used from the browser.
 */

import type { AIProvider } from './api/core/types';
import { getUserApiKey, validateUserApiKey, type ApiKeyProvider } from './userApiKeyStorage';

// Environment variable schema (browser-safe subset)
interface BrowserEnvironmentConfig {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_OPENAI_ASSISTANT_ID?: string;
  VITE_ENABLE_DEBUG_MODE?: string;
  VITE_ENABLE_ANALYTICS?: string;
}

/**
 * Get environment variable from browser environment
 */
function getBrowserEnvVar(key: string): string | undefined {
  return (import.meta.env as any)?.[key];
}

/**
 * Get validated environment configuration for browser
 */
export function getEnvironmentConfig(): BrowserEnvironmentConfig {
  return {
    VITE_SUPABASE_URL: getBrowserEnvVar('VITE_SUPABASE_URL'),
    VITE_SUPABASE_ANON_KEY: getBrowserEnvVar('VITE_SUPABASE_ANON_KEY'),
    VITE_OPENAI_ASSISTANT_ID: getBrowserEnvVar('VITE_OPENAI_ASSISTANT_ID'),
    VITE_ENABLE_DEBUG_MODE: getBrowserEnvVar('VITE_ENABLE_DEBUG_MODE'),
    VITE_ENABLE_ANALYTICS: getBrowserEnvVar('VITE_ENABLE_ANALYTICS')
  };
}

const STORAGE_PROVIDER_BY_IMAGE_PROVIDER: Record<AIProvider, ApiKeyProvider> = {
  openai: 'openai',
  gemini: 'openai',
  'gemini-nano': 'openai',
  imagen: 'openai',
  leonardo: 'openai',
  giphy: 'openai',
  freepik: 'openai',
};

function resolveStorageProvider(provider: AIProvider): ApiKeyProvider {
  return STORAGE_PROVIDER_BY_IMAGE_PROVIDER[provider] || 'openai';
}

/**
 * Check if a specific API key is available and valid (BYOK only)
 */
export function hasValidApiKey(provider: AIProvider): boolean {
  const storageProvider = resolveStorageProvider(provider);
  const userKey = getUserApiKey(storageProvider);
  if (userKey) {
    const validation = validateUserApiKey(storageProvider, userKey);
    if (validation.valid) return true;
  }
  return false;
}

/**
 * Get API key for a specific provider with validation (BYOK only)
 */
export function getApiKey(provider: AIProvider): string | null {
  const storageProvider = resolveStorageProvider(provider);
  const userKey = getUserApiKey(storageProvider);
  if (userKey) {
    const validation = validateUserApiKey(storageProvider, userKey);
    if (validation.valid) return userKey;
  }
  return null;
}

/**
 * Get environment info for debugging (browser-safe)
 */
export function getEnvironmentInfo(): {
  availableProviders: string[];
  missingKeys: string[];
} {
  const providers = ['openai', 'gemini', 'gemini-nano', 'leonardo', 'giphy'] as const;
  const availableProviders = providers.filter(provider => hasValidApiKey(provider));

  const requiredKeys = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

  const config = getEnvironmentConfig();
  const missingKeys = requiredKeys.filter(key => !config[key as keyof BrowserEnvironmentConfig]);

  return {
    availableProviders,
    missingKeys
  };
}
