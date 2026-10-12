/**
 * Common API utilities and helper functions
 * Updated to use centralized environment configuration with user-provided key support
 */

import { hasValidApiKey } from './env';
import { getUserApiKey, validateUserApiKey } from './userApiKeyStorage';

// Helper function to check if an API key is available
export const hasApiKey = (provider: string): boolean => {
  switch (provider) {
    case 'openai': {
      const key = getUserApiKey('openai');
      return !!(key && key.startsWith('sk-'));
    }
    case 'muapi': {
      const key = getUserApiKey('muapi');
      return !!key;
    }
    default:
      return false;
  }
};

// Direct browser provider calls are only permitted with the USER'S OWN key (BYOK).
// Shared deployment credentials (VITE_* env vars) must never be used from the browser.
export const getUserProvidedApiKey = (provider: 'openai' | 'muapi'): string | null => {
  const userKey = getUserApiKey(provider);
  if (!userKey) return null;
  if (provider === 'openai') {
    return userKey.startsWith('sk-') ? userKey : null;
  }
  return userKey.length >= 8 ? userKey : null;
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