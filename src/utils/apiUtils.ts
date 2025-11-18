/**
 * Common API utilities and helper functions
 * Updated to use centralized environment configuration
 */

import { getApiKey, hasValidApiKey } from './env';

// Helper function to get the GIPHY API key from environment variables
export const getGiphyApiKey = () => getApiKey('giphy') || '';

// Helper function to get the OpenAI API key from environment variables
export const getOpenAIApiKey = () => getApiKey('openai') || '';

// Helper function to get the Gemini API key from environment variables
export const getGeminiApiKey = () => getApiKey('gemini') || '';

// Helper function to get the Gemini Nano API key from environment variables
// Note: Gemini Nano uses the same API key as regular Gemini
export const getGeminiNanoApiKey = () => getApiKey('gemini-nano') || getApiKey('gemini') || '';

// Helper function to check if an API key is available
export const hasApiKey = (provider: string): boolean => {
  switch (provider) {
    case 'openai':
      return hasValidApiKey('openai');
    case 'gemini':
    case 'imagen':
      return hasValidApiKey('gemini');
    case 'gemini-nano':
      return hasValidApiKey('gemini-nano') || hasValidApiKey('gemini');
    case 'giphy':
      return hasValidApiKey('giphy');
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
  // Create a temporary element
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  
  // Return the text content
  return tempElement.textContent || tempElement.innerText || '';
}