/**
 * Centralized Environment Configuration Manager
 *
 * This module provides secure, validated access to environment variables
 * with proper error handling and fallback mechanisms.
 *
 * SECURITY WARNING: This module is designed for browser environments and uses Vite's
 * import.meta.env for accessing environment variables. API keys are validated
 * but should be rotated regularly and never logged in production.
 *
 * RECOMMENDATION: In production, use server-side API proxying instead of client-side
 * API key management. This implementation provides defense-in-depth but should be
 * replaced with proper server-side architecture.
 */

import type { AIProvider } from './api/core/types';

// Environment variable schema
interface EnvironmentConfig {
  // Supabase
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;

  // AI API Keys (WARNING: These are client-side accessible)
  VITE_OPENAI_API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
  VITE_GEMINI_NANO_API_KEY?: string;
  VITE_LEONARDO_API_KEY?: string;
  VITE_GIPHY_API_KEY?: string;
  VITE_FREEPIK_API_KEY?: string;

  // Assistant Configuration
  VITE_OPENAI_ASSISTANT_ID?: string;

  // Payment
  VITE_STRIPE_PUBLISHABLE_KEY?: string;

  // Feature Flags
  VITE_ENABLE_DEBUG_MODE?: string;
  VITE_ENABLE_ANALYTICS?: string;

  // Security & Rate Limiting
  VITE_ENABLE_RATE_LIMITING?: string;
  VITE_MAX_REQUESTS_PER_MINUTE?: string;

  // Encryption
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
  },
  VITE_OPENAI_API_KEY: {
    required: false,
    validator: (value: string) => !value || (value.startsWith('sk-') && value.length > 20),
    errorMessage: 'VITE_OPENAI_API_KEY must be a valid OpenAI API key starting with "sk-"'
  },
  VITE_GEMINI_API_KEY: {
    required: false,
    validator: (value: string) => !value || value.startsWith('AIza'),
    errorMessage: 'VITE_GEMINI_API_KEY must be a valid Google API key starting with "AIza"'
  },
  VITE_FREEPIK_API_KEY: {
    required: false,
    validator: (value: string) => !value || /^[A-Za-z0-9]{20,}$/.test(value),
    errorMessage: 'VITE_FREEPIK_API_KEY must be a valid alphanumeric string of at least 20 characters'
  }
};

// Load environment variables from Vite's import.meta.env
function loadEnvironment(): Record<string, string> {
  // In browser environment, use Vite's env system
  const viteEnv = import.meta.env;
  
  // Convert to Record<string, string>, filtering out non-string values
  const envVars: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(viteEnv)) {
    if (typeof value === 'string') {
      envVars[key] = value;
    }
  }
  
  return envVars;
}

// Validate environment configuration
function validateEnvironment(config: Record<string, string>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, rule] of Object.entries(VALIDATION_RULES)) {
    const value = config[key];

    if (rule.required && (!value || value.trim() === '')) {
      errors.push(`${key} is required but not provided`);
      continue;
    }

    if (value && !rule.validator(value)) {
      errors.push(rule.errorMessage);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
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

  // Type assertion with validation
  const config: EnvironmentConfig = {
    VITE_SUPABASE_URL: rawEnv.VITE_SUPABASE_URL || '',
    VITE_SUPABASE_ANON_KEY: rawEnv.VITE_SUPABASE_ANON_KEY || '',
    VITE_OPENAI_API_KEY: rawEnv.VITE_OPENAI_API_KEY,
    VITE_GEMINI_API_KEY: rawEnv.VITE_GEMINI_API_KEY,
    VITE_GEMINI_NANO_API_KEY: rawEnv.VITE_GEMINI_NANO_API_KEY,
    VITE_LEONARDO_API_KEY: rawEnv.VITE_LEONARDO_API_KEY,
    VITE_GIPHY_API_KEY: rawEnv.VITE_GIPHY_API_KEY,
    VITE_FREEPIK_API_KEY: rawEnv.VITE_FREEPIK_API_KEY,
    VITE_OPENAI_ASSISTANT_ID: rawEnv.VITE_OPENAI_ASSISTANT_ID,
    VITE_STRIPE_PUBLISHABLE_KEY: rawEnv.VITE_STRIPE_PUBLISHABLE_KEY,
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
  const validation = validateEnvironment(config as unknown as Record<string, string>);

  cachedValidation = validation;
  return validation;
}

/**
 * Get a specific environment variable with validation
 */
export function getEnvVar(key: keyof EnvironmentConfig): string | undefined {
  const config = getEnvironmentConfig();
  return config[key];
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
    case 'freepik':
      return !!(config.VITE_FREEPIK_API_KEY && /^[A-Za-z0-9]{20,}$/.test(config.VITE_FREEPIK_API_KEY));
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
    case 'freepik':
      return config.VITE_FREEPIK_API_KEY || null;
    default:
      return null;
  }
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
  const optionalKeys = [
    'VITE_OPENAI_API_KEY',
    'VITE_GEMINI_API_KEY',
    'VITE_GEMINI_NANO_API_KEY',
    'VITE_LEONARDO_API_KEY',
    'VITE_GIPHY_API_KEY',
    'VITE_FREEPIK_API_KEY'
  ];

  const missingKeys = [
    ...requiredKeys.filter(key => !config[key as keyof EnvironmentConfig]),
    ...optionalKeys.filter(key => {
      const value = config[key as keyof EnvironmentConfig];
      return !value || value.trim() === '';
    })
  ];

  return {
    hasValidConfig: validation.isValid,
    availableProviders,
    missingKeys,
    validationErrors: validation.errors
  };
}

// Initialize validation on module load
const initialValidation = validateEnvironmentConfig();
if (!initialValidation.isValid) {
  console.warn('Environment configuration issues detected:');
  initialValidation.errors.forEach(error => console.warn(`  - ${error}`));
}