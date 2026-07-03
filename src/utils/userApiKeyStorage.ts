/**
 * User API Key Storage Module
 *
 * Provides synchronous, runtime access to user-provided API keys.
 * User keys are stored in localStorage and synced to Supabase
 * personalization_tokens table for authenticated users.
 *
 * Priority order for API key resolution:
 * 1. User-provided keys (via this module)
 * 2. Environment variables (VITE_*)
 */

export type ApiKeyProvider = 
  | 'openai'
  | 'gemini'
  | 'gemini-nano'
  | 'imagen'
  | 'leonardo'
  | 'giphy'
  | 'freepik';

const USER_API_KEY_PROVIDERS: Array<ApiKeyProvider> = [
  'openai',
  'gemini',
  'gemini-nano',
  'leonardo',
  'giphy',
  'freepik',
];

/**
 * Get the storage provider for a given API key provider.
 * Some providers (e.g., imagen) share storage with their base model.
 */
function getStorageProvider(provider: ApiKeyProvider): string {
  if (provider === 'imagen') return 'gemini';
  return provider;
}

export interface ApiKeyStatus {
  provider: ApiKeyProvider;
  label: string;
  isSet: boolean;
  hint: string;
}

const PROVIDER_META: Record<ApiKeyProvider, { label: string; hint: string }> = {
  openai: {
    label: 'OpenAI',
    hint: 'Starts with sk-... Used for GPT, DALL-E, Whisper',
  },
  gemini: {
    label: 'Google Gemini',
    hint: 'Starts with AIza... Used for image generation and description',
  },
  'gemini-nano': {
    label: 'Gemini Nano',
    hint: 'Reuses Gemini key if not set',
  },
  imagen: {
    label: 'Imagen',
    hint: 'Reuses Gemini key if not set',
  },
  leonardo: {
    label: 'Leonardo AI',
    hint: 'Used for Leonardo image generation models',
  },
  giphy: {
    label: 'GIPHY',
    hint: 'Used for GIF search and sticker generation',
  },
  freepik: {
    label: 'Freepik',
    hint: 'Used for stock image and vector search',
  },
};

const USER_KEY_STORAGE_PREFIX = 'user_api_key_';

function getStorageKey(provider: ApiKeyProvider): string {
  return `${USER_KEY_STORAGE_PREFIX}${getStorageProvider(provider)}`;
}

/**
 * Get user-provided API key from localStorage
 */
export function getUserApiKey(provider: ApiKeyProvider): string | null {
  try {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(getStorageKey(provider));
    if (!value || value.trim() === '') return null;
    return value.trim();
  } catch {
    return null;
  }
}

/**
 * Set user-provided API key in localStorage
 */
export function setUserApiKey(provider: ApiKeyProvider, key: string): void {
  try {
    if (typeof window === 'undefined') return;
    if (!key || key.trim() === '') {
      localStorage.removeItem(getStorageKey(provider));
    } else {
      localStorage.setItem(getStorageKey(provider), key.trim());
    }
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Remove user-provided API key from localStorage
 */
export function removeUserApiKey(provider: ApiKeyProvider): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getStorageKey(provider));
  } catch {
    // ignore
  }
}

/**
 * Check if a user-provided API key exists
 */
export function hasUserApiKey(provider: ApiKeyProvider): boolean {
  return getUserApiKey(provider) !== null;
}

/**
 * Get all API key statuses for UI display
 */
export function getUserApiKeyStatuses(): ApiKeyStatus[] {
  return USER_API_KEY_PROVIDERS.map(provider => ({
    provider,
    label: PROVIDER_META[provider].label,
    isSet: hasUserApiKey(provider),
    hint: PROVIDER_META[provider].hint,
  }));
}

/**
 * Clear all user-provided API keys
 */
export function clearAllUserApiKeys(): void {
  USER_API_KEY_PROVIDERS.forEach(provider => removeUserApiKey(provider));
}

/**
 * Validate API key format per provider
 */
export function validateUserApiKey(provider: ApiKeyProvider, key: string): { valid: boolean; message?: string } {
  if (!key || key.trim().length === 0) {
    return { valid: false, message: 'API key cannot be empty' };
  }

  switch (provider) {
    case 'openai':
      if (!key.startsWith('sk-')) {
        return { valid: false, message: 'OpenAI keys should start with sk-' };
      }
      if (key.length < 20) {
        return { valid: false, message: 'OpenAI key appears too short' };
      }
      break;
    case 'gemini':
    case 'gemini-nano':
    case 'imagen':
      if (!key.startsWith('AIza')) {
        return { valid: false, message: 'Google API keys should start with AIza' };
      }
      break;
    case 'leonardo':
      if (key.length < 10) {
        return { valid: false, message: 'Leonardo key appears too short' };
      }
      break;
    case 'giphy':
      if (key.length < 10) {
        return { valid: false, message: 'GIPHY key appears too short' };
      }
      break;
    case 'freepik':
      if (!/^[A-Za-z0-9]{20,}$/.test(key)) {
        return { valid: false, message: 'Freepik key must be alphanumeric and at least 20 characters' };
      }
      break;
  }

  return { valid: true };
}
