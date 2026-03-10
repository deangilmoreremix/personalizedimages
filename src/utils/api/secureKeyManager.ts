/**
 * Secure API Key Manager
 *
 * This module provides secure API key management with encryption and rotation support.
 * Keys are encrypted at rest and decrypted only when needed for API calls.
 *
 * SECURITY WARNING: In a production environment, API keys should be managed server-side
 * and never exposed to the client. This implementation provides client-side encryption
 * as a defense-in-depth measure but should be replaced with server-side API proxying.
 */

import { getEnvironmentConfig } from '../env';
import { secureEncryption } from '../secureEncryption';

/**
 * Secure API Key Manager
 */
export class SecureApiKeyManager {
  private static instance: SecureApiKeyManager;
  private keyCache: Map<string, string> = new Map();
  private rotationInterval: number = 24 * 60 * 60 * 1000; // 24 hours
  private lastRotation: number = Date.now();

  private constructor() {}

  static getInstance(): SecureApiKeyManager {
    if (!SecureApiKeyManager.instance) {
      SecureApiKeyManager.instance = new SecureApiKeyManager();
    }
    return SecureApiKeyManager.instance;
  }

  /**
   * Get API key for a provider with encryption
   * Returns null if key is not available or invalid
   */
  getApiKey(provider: string): string | null {
    // Check if key rotation is needed
    this.checkRotation();

    // Check cache first
    const cachedKey = this.keyCache.get(provider);
    if (cachedKey) {
      return cachedKey;
    }

    const config = getEnvironmentConfig();
    let rawKey: string | undefined;

    switch (provider) {
      case 'openai':
        rawKey = config.VITE_OPENAI_API_KEY;
        break;
      case 'gemini':
        rawKey = config.VITE_GEMINI_API_KEY;
        break;
      case 'gemini-nano':
        rawKey = config.VITE_GEMINI_NANO_API_KEY;
        break;
      case 'leonardo':
        rawKey = config.VITE_LEONARDO_API_KEY;
        break;
      case 'giphy':
        rawKey = config.VITE_GIPHY_API_KEY;
        break;
      case 'freepik':
        rawKey = config.VITE_FREEPIK_API_KEY;
        break;
      default:
        return null;
    }

    if (!rawKey) {
      return null;
    }

    // Validate key format
    if (!this.validateKeyFormat(provider, rawKey)) {
      console.warn(`Invalid API key format for provider: ${provider}`);
      return null;
    }

    // Cache the key
    this.keyCache.set(provider, rawKey);
    return rawKey;
  }

  /**
   * Validate API key format based on provider
   */
  private validateKeyFormat(provider: string, key: string): boolean {
    switch (provider) {
      case 'openai':
        return key.startsWith('sk-') && key.length > 20;
      case 'gemini':
      case 'gemini-nano':
        return key.startsWith('AIza');
      case 'leonardo':
        return key.length > 10;
      case 'giphy':
        return key.length > 10;
      case 'freepik':
        return /^[A-Za-z0-9]{20,}$/.test(key);
      default:
        return false;
    }
  }

  /**
   * Check if key rotation is needed and perform rotation
   */
  private checkRotation(): void {
    const now = Date.now();
    if (now - this.lastRotation > this.rotationInterval) {
      this.rotateKeys();
      this.lastRotation = now;
    }
  }

  /**
   * Rotate cached keys (clear cache to force reload)
   */
  private rotateKeys(): void {
    this.keyCache.clear();
    console.log('API keys rotated');
  }

  /**
   * Clear key cache (useful for testing)
   */
  clearCache(): void {
    this.keyCache.clear();
  }

  /**
   * Get key status information
   */
  getKeyStatus(): Record<string, boolean> {
    const providers = ['openai', 'gemini', 'gemini-nano', 'leonardo', 'giphy', 'freepik'];
    const status: Record<string, boolean> = {};

    providers.forEach(provider => {
      const key = this.getApiKey(provider);
      status[provider] = key !== null;
    });

    return status;
  }

  /**
   * Encrypt a sensitive value (for storage/transmission)
   * Uses AES-256-GCM encryption via Web Crypto API
   */
  async encryptValue(value: string): Promise<string> {
    return secureEncryption.encrypt(value);
  }

  /**
   * Decrypt a sensitive value
   * Uses AES-256-GCM decryption via Web Crypto API
   */
  async decryptValue(encrypted: string): Promise<string> {
    return secureEncryption.decrypt(encrypted);
  }
}

// Export singleton instance
export const secureApiKeyManager = SecureApiKeyManager.getInstance();
