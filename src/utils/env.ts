/**
 * Centralized Environment Configuration Manager
 *
 * Direct browser provider calls require user-provided keys (BYOK) only.
 * Shared deployment credentials (VITE_* env vars) must never be used from the browser.
 */

import type { AIProvider } from './api/core/types';
import { getUserApiKey, validateUserApiKey, type ApiKeyProvider } from './userApiKeyStorage';

// Environment variable schema
interface EnvironmentConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_OPENAI_ASSISTANT_ID?: string;
  VITE_ENABLE_DEBUG_MODE?: string;
  VITE_ENABLE_ANALYTICS?: string;
  VITE_ENABLE_RATE_LIMITING?: string;
  VITE_MAX_REQUESTS_PER_MINUTE?: string;
  VITE_ENCRYPTION_KEY?: string;
}

// Validation rules for environment variables
const VALIDATION_RULES = {
  VITE_SUPABASE_URL: {
    required: true,
    validator: (value: string) => value.startsWith('http') && value.includes('supabase.co'),
    errorMessage: 'VITE_SUPABASE_URL must be a valid Supabase URL'
  },
  VITE_SUPABASE_ANON_KEY: {
    required: true,
    validator: (value: string) => value.length > 20,
    errorMessage: 'VITE_SUPABASE_ANON_KEY must be a valid Supabase key'
  }
};

// Load environment variables from Vite's import.meta.env
function loadEnvironment(): Record<string, string> {
  const viteEnv = import.meta.env;
  const envVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(viteEnv)) {
    if (typeof value === 'string') {
      envVars[key] = value;
    }
  }
  return envVars;
}

// Cached environment configuration
let cachedConfig: EnvironmentConfig | null = null;
let cachedValidation: { isValid: boolean; errors: string[] } | null = null;

/**
 * Get validated environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const rawEnv = loadEnvironment();
  const config: EnvironmentConfig = {
    VITE_SUPABASE_URL: rawEnv.VITE_SUPABASE_URL || '',
    VITE_SUPABASE_ANON_KEY: rawEnv.VITE_SUPABASE_ANON_KEY || '',
    VITE_OPENAI_ASSISTANT_ID: rawEnv.VITE_OPENAI_ASSISTANT_ID,
    VITE_ENABLE_DEBUG_MODE: rawEnv.VITE_ENABLE_DEBUG_MODE,
    VITE_ENABLE_ANALYTICS: rawEnv.VITE_ENABLE_ANALYTICS
  };

  cachedConfig = config;
  return config;
}

/**
 * Validate current environment configuration
 */
export function validateEnvironmentConfig(): { isValid: boolean; errors: string[] } {
  if (cachedValidation) {
    return cachedValidation;
  }

  const config = getEnvironmentConfig();
  const errors: string[] = [];
  if (!config.VITE_SUPABASE_URL || !config.VITE_SUPABASE_ANON_KEY) {
    if (!config.VITE_SUPABASE_URL) errors.push('VITE_SUPABASE_URL is required');
    if (!config.VITE_SUPABASE_ANON_KEY) errors.push('VITE_SUPABASE_ANON_KEY is required');
  } else {
    if (!(config.VITE_SUPABASE_URL.startsWith('http') && config.VITE_SUPABASE_URL.includes('supabase.co'))) {
      errors.push('VITE_SUPABASE_URL must be a valid Supabase URL');
    }
    if (config.VITE_SUPABASE_ANON_KEY.length <= 20) {
      errors.push('VITE_SUPABASE_ANON_KEY must be a valid Supabase key');
    }
  }

  cachedValidation = { isValid: errors.length === 0, errors };
  return cachedValidation;
}

/**
 * Get a specific environment variable with validation
 */
export function getEnvVar(key: keyof EnvironmentConfig): string | undefined {
  const config = getEnvironmentConfig();
  return config[key];
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
 * Clear cached configuration (useful for testing)
 */
export function clearCache(): void {
  cachedConfig = null;
  cachedValidation = null;
}

/**
 * Get environment info for debugging
 */
export function getEnvironmentInfo(): {
  hasValidConfig: boolean;
  availableProviders: string[];
  missingKeys: string[];
  validationErrors: string[];
} {
  const validation = validateEnvironmentConfig();
  const config = getEnvironmentConfig();

  const providers = ['openai', 'gemini', 'gemini-nano', 'leonardo', 'giphy', 'freepik'] as const;
  const availableProviders = providers.filter(provider => hasValidApiKey(provider));

  const requiredKeys = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingKeys = requiredKeys.filter(key => !config[key as keyof EnvironmentConfig]);

  return {
    hasValidConfig: validation.isValid,
    availableProviders,
    missingKeys,
    validationErrors: validation.errors
  };
}
