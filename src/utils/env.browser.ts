/**
 * Browser-compatible environment utilities
 *
 * This module provides client-side access to environment variables
 * without using Node.js APIs like fs and path.
 */

import type { AIProvider } from './api/core/types';

// Environment variable schema (browser-safe subset)
interface BrowserEnvironmentConfig {
  // Supabase
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;

  // AI API Keys
  VITE_OPENAI_API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
  VITE_GEMINI_NANO_API_KEY?: string;
  VITE_LEONARDO_API_KEY?: string;
  VITE_GIPHY_API_KEY?: string;

  // Assistant Configuration
  VITE_OPENAI_ASSISTANT_ID?: string;

  // Payment
  VITE_STRIPE_PUBLISHABLE_KEY?: string;

  // Feature Flags
  VITE_ENABLE_DEBUG_MODE?: string;
  VITE_ENABLE_ANALYTICS?: string;
}

/**
 * Get environment variable from browser environment
 */
function getBrowserEnvVar(key: string): string | undefined {
  // In browser, environment variables are available via import.meta.env
  return (import.meta.env as any)?.[key];
}

/**
 * Get validated environment configuration for browser
 */
export function getEnvironmentConfig(): BrowserEnvironmentConfig {
  return {
    VITE_SUPABASE_URL: getBrowserEnvVar('VITE_SUPABASE_URL'),
    VITE_SUPABASE_ANON_KEY: getBrowserEnvVar('VITE_SUPABASE_ANON_KEY'),
    VITE_OPENAI_API_KEY: getBrowserEnvVar('VITE_OPENAI_API_KEY'),
    VITE_GEMINI_API_KEY: getBrowserEnvVar('VITE_GEMINI_API_KEY'),
    VITE_GEMINI_NANO_API_KEY: getBrowserEnvVar('VITE_GEMINI_NANO_API_KEY'),
    VITE_LEONARDO_API_KEY: getBrowserEnvVar('VITE_LEONARDO_API_KEY'),
    VITE_GIPHY_API_KEY: getBrowserEnvVar('VITE_GIPHY_API_KEY'),
    VITE_OPENAI_ASSISTANT_ID: getBrowserEnvVar('VITE_OPENAI_ASSISTANT_ID'),
    VITE_STRIPE_PUBLISHABLE_KEY: getBrowserEnvVar('VITE_STRIPE_PUBLISHABLE_KEY'),
    VITE_ENABLE_DEBUG_MODE: getBrowserEnvVar('VITE_ENABLE_DEBUG_MODE'),
    VITE_ENABLE_ANALYTICS: getBrowserEnvVar('VITE_ENABLE_ANALYTICS')
  };
}

/**
 * Check if a specific API key is available and valid
 */
export function hasValidApiKey(provider: AIProvider): boolean {
  const config = getEnvironmentConfig();

  switch (provider) {
    case 'openai':
      return !!(config.VITE_OPENAI_API_KEY && config.VITE_OPENAI_API_KEY.startsWith('sk-'));
    case 'gemini':
    case 'gemini-nano':
      const key = provider === 'gemini' ? config.VITE_GEMINI_API_KEY : config.VITE_GEMINI_NANO_API_KEY;
      return !!(key && key.startsWith('AIza'));
    case 'leonardo':
      return !!config.VITE_LEONARDO_API_KEY;
    case 'giphy':
      return !!config.VITE_GIPHY_API_KEY;
    default:
      return false;
  }
}

/**
 * Get API key for a specific provider with validation
 */
export function getApiKey(provider: AIProvider): string | null {
  if (!hasValidApiKey(provider)) {
    return null;
  }

  const config = getEnvironmentConfig();

  switch (provider) {
    case 'openai':
      return config.VITE_OPENAI_API_KEY || null;
    case 'gemini':
      return config.VITE_GEMINI_API_KEY || null;
    case 'gemini-nano':
      return config.VITE_GEMINI_NANO_API_KEY || null;
    case 'leonardo':
      return config.VITE_LEONARDO_API_KEY || null;
    case 'giphy':
      return config.VITE_GIPHY_API_KEY || null;
    default:
      return null;
  }
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
  const optionalKeys = [
    'VITE_OPENAI_API_KEY',
    'VITE_GEMINI_API_KEY',
    'VITE_GEMINI_NANO_API_KEY',
    'VITE_LEONARDO_API_KEY',
    'VITE_GIPHY_API_KEY'
  ];

  const config = getEnvironmentConfig();
  const missingKeys = [
    ...requiredKeys.filter(key => !config[key as keyof BrowserEnvironmentConfig]),
    ...optionalKeys.filter(key => {
      const value = config[key as keyof BrowserEnvironmentConfig];
      return !value || value.trim() === '';
    })
  ];

  return {
    availableProviders,
    missingKeys
  };
}