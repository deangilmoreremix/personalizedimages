/**
 * Fail-Fast Environment Configuration
 * 
 * This module validates all required environment variables at startup.
 * It throws clear errors immediately if configuration is missing or invalid,
 * preventing runtime failures due to misconfiguration.
 * 
 * SECURITY NOTE: This file ONLY reads VITE_* prefixed variables which are
 * safe to expose to the frontend. Server secrets MUST be handled in
 * Netlify Functions only.
 */

import { logger } from '../lib/logger';

// Environment variable type definitions
interface EnvConfig {
  // Supabase (required)
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  
  // App Environment
  VITE_APP_ENV: 'development' | 'staging' | 'production';
  
  // AI Services (optional but recommended)
  VITE_OPENAI_API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
  VITE_GEMINI_NANO_API_KEY?: string;
  VITE_LEONARDO_API_KEY?: string;
  VITE_GIPHY_API_KEY?: string;
  
  // AI Configuration
  VITE_OPENAI_ASSISTANT_ID?: string;
  
  // Payments
  VITE_STRIPE_PUBLISHABLE_KEY?: string;
  
  // Feature Flags
  VITE_FEATURE_USE_MODERN_UI?: string;
  VITE_FEATURE_ENABLE_BETA?: string;
}

// Required environment variables that must be present
const REQUIRED_VARS: Array<keyof EnvConfig> = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

// Variables that must be URLs
const URL_VARS: Array<keyof EnvConfig> = [
  'VITE_SUPABASE_URL',
];

// Variables that should be secrets (sanitized in logs)
const SECRET_VARS = [
  'VITE_SUPABASE_ANON_KEY',
  'VITE_OPENAI_API_KEY',
  'VITE_GEMINI_API_KEY',
  'VITE_GEMINI_NANO_API_KEY',
  'VITE_LEONARDO_API_KEY',
  'VITE_GIPHY_API_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
];

/**
 * Validate a URL string
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Sanitize a value for safe logging
 */
function sanitizeForLogging(key: string, value: string | undefined): string {
  if (!value) return '[EMPTY]';
  if (SECRET_VARS.some(secret => key.includes(secret))) {
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }
  return value;
}

/**
 * Validate all environment variables
 * Throws descriptive errors on failure
 */
function validateEnv(): EnvConfig {
  const env = import.meta.env as Record<string, string | undefined>;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of REQUIRED_VARS) {
    const value = env[key];
    
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${key}`);
      continue;
    }
    
    // Check for placeholder values
    if (value.toLowerCase().includes('your_') || value.toLowerCase().includes('placeholder')) {
      errors.push(`${key} appears to contain a placeholder value: "${sanitizeForLogging(key, value)}"`);
    }
    
    // URL validation
    if (URL_VARS.includes(key) && !isValidUrl(value)) {
      errors.push(`${key} must be a valid URL, got: "${value}"`);
    }
    
    // Supabase URL should use HTTPS in production
    if (key === 'VITE_SUPABASE_URL' && env.VITE_APP_ENV === 'production') {
      if (!value.startsWith('https://')) {
        warnings.push(`${key} should use HTTPS in production`);
      }
    }
  }

  // Validate SUPABASE_ANON_KEY format
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (anonKey) {
    // Check if it looks like a service role key (starts with different pattern)
    if (anonKey.includes('service_role') || anonKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS')) {
      errors.push('VITE_SUPABASE_ANON_KEY appears to be a service_role key! Use the anon/public key for frontend.');
    }
  }

  // Validate APP_ENV if set
  const appEnv = env.VITE_APP_ENV;
  if (appEnv && !['development', 'staging', 'production'].includes(appEnv)) {
    errors.push(`VITE_APP_ENV must be one of: development, staging, production. Got: "${appEnv}"`);
  }

  // Log configuration status
  logger.info('Environment Configuration', {
    appEnv: appEnv || 'development (default)',
    supabaseConfigured: !!env.VITE_SUPABASE_URL && !!env.VITE_SUPABASE_ANON_KEY,
    features: {
      openai: !!env.VITE_OPENAI_API_KEY,
      gemini: !!env.VITE_GEMINI_API_KEY,
      geminiNano: !!env.VITE_GEMINI_NANO_API_KEY,
      leonardo: !!env.VITE_LEONARDO_API_KEY,
      stripe: !!env.VITE_STRIPE_PUBLISHABLE_KEY,
    }
  });

  // Log warnings
  for (const warning of warnings) {
    logger.warn('Environment Warning', { warning });
  }

  // Throw on errors
  if (errors.length > 0) {
    const errorMessage = [
      '╔══════════════════════════════════════════════════════════════════╗',
      '║           ENVIRONMENT CONFIGURATION ERROR                        ║',
      '╠══════════════════════════════════════════════════════════════════╣',
      ...errors.map(e => `║  ❌ ${e.padEnd(62)} ║`),
      '║                                                                  ║',
      '║  Please check your environment variables:                        ║',
      '║  - Local: .env file                                              ║',
      '║  - Netlify: Site settings → Environment variables                ║',
      '║                                                                  ║',
      '║  Required variables:                                             ║',
      '║  - VITE_SUPABASE_URL                                             ║',
      '║  - VITE_SUPABASE_ANON_KEY                                        ║',
      '║                                                                  ║',
      '║  See .env.example for full documentation.                        ║',
      '╚══════════════════════════════════════════════════════════════════╝',
    ].join('\n');
    
    logger.error('Environment Validation Failed', { errors });
    throw new Error(errorMessage);
  }

  // Return typed config
  return {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL || '',
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY || '',
    VITE_APP_ENV: (env.VITE_APP_ENV as 'development' | 'staging' | 'production') || 'development',
    VITE_OPENAI_API_KEY: env.VITE_OPENAI_API_KEY,
    VITE_GEMINI_API_KEY: env.VITE_GEMINI_API_KEY,
    VITE_GEMINI_NANO_API_KEY: env.VITE_GEMINI_NANO_API_KEY,
    VITE_LEONARDO_API_KEY: env.VITE_LEONARDO_API_KEY,
    VITE_GIPHY_API_KEY: env.VITE_GIPHY_API_KEY,
    VITE_OPENAI_ASSISTANT_ID: env.VITE_OPENAI_ASSISTANT_ID,
    VITE_STRIPE_PUBLISHABLE_KEY: env.VITE_STRIPE_PUBLISHABLE_KEY,
    VITE_FEATURE_USE_MODERN_UI: env.VITE_FEATURE_USE_MODERN_UI,
    VITE_FEATURE_ENABLE_BETA: env.VITE_FEATURE_ENABLE_BETA,
  };
}

// Validate immediately on import (fail-fast)
export const env = validateEnv();

// Environment helpers
export const isDevelopment = env.VITE_APP_ENV === 'development';
export const isStaging = env.VITE_APP_ENV === 'staging';
export const isProduction = env.VITE_APP_ENV === 'production';

// Feature flag helpers
export const hasOpenAI = !!env.VITE_OPENAI_API_KEY;
export const hasGemini = !!env.VITE_GEMINI_API_KEY;
export const hasStripe = !!env.VITE_STRIPE_PUBLISHABLE_KEY;

export default env;
