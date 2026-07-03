/**
 * Common API utilities and helper functions
 * Updated to use centralized environment configuration with user-provided key support
 */

import { getApiKey, hasValidApiKey } from './env';
import { getUserApiKey, validateUserApiKey } from './userApiKeyStorage';

// Helper function to get the GIPHY API key from environment variables or user settings
export const getGiphyApiKey = () => {
  const userKey = getUserApiKey('giphy');
  if (userKey) return userKey;
  return getApiKey('giphy') || '';
};

// Helper function to get the OpenAI API key from environment variables or user settings
export const getOpenAIApiKey = () => {
  const userKey = getUserApiKey('openai');
  if (userKey) return userKey;
  return getApiKey('openai') || '';
};

// Helper function to get the Gemini API key from environment variables or user settings
export const getGeminiApiKey = () => {
  const userKey = getUserApiKey('gemini');
  if (userKey) return userKey;
  return getApiKey('gemini') || '';
};

// Helper function to get the Gemini Nano API key from environment variables or user settings
// Note: Gemini Nano uses the same API key as regular Gemini
export const getGeminiNanoApiKey = () => {
  const userKey = getUserApiKey('gemini-nano') || getUserApiKey('gemini');
  if (userKey) return userKey;
  return getApiKey('gemini-nano') || getApiKey('gemini') || '';
};

// Helper function to get the Freepik API key from environment variables or user settings
export const getFreepikApiKey = () => {
  const userKey = getUserApiKey('freepik');
  if (userKey) return userKey;
  return getApiKey('freepik') || '';
};

// Helper function to check if an API key is available
export const hasApiKey = (provider: string): boolean => {
  switch (provider) {
    case 'openai': {
      const key = getUserApiKey('openai') || getApiKey('openai');
      return !!(key && key.startsWith('sk-'));
    }
    case 'gemini':
    case 'imagen': {
      const key = getUserApiKey('gemini') || getApiKey('gemini');
      return !!(key && key.startsWith('AIza'));
    }
    case 'gemini-nano': {
      const key = getUserApiKey('gemini-nano') || getUserApiKey('gemini') || getApiKey('gemini-nano') || getApiKey('gemini');
      return !!(key && key.startsWith('AIza'));
    }
    case 'giphy': {
      const key = getUserApiKey('giphy') || getApiKey('giphy');
      return !!key;
    }
    case 'freepik': {
      const key = getUserApiKey('freepik') || getApiKey('freepik');
      return !!(key && /^[A-Za-z0-9]{20,}$/.test(key));
    }
    case 'leonardo': {
      const key = getUserApiKey('leonardo') || getApiKey('leonardo');
      return !!key;
    }
    default:
      return false;
  }
};

/**
 * Convert a blob to a base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Debounce function to limit the rate of function calls
 */
function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(...args: Parameters<F>): void {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

/**
 * Generate a unique request ID for tracking API calls
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format tokens for API requests
 */
function formatTokensForApi(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
}

/**
 * Extract text from HTML content
 */
function extractTextFromHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}