/**
 * Secure Encryption using Web Crypto API
 * 
 * This module provides secure encryption and decryption using AES-256-GCM.
 * This replaces the weak XOR encryption with proper cryptographic security.
 * 
 * WARNING: This is a demonstration. In production, use proper key management
 * services like AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault.
 */

import { getEnvironmentConfig } from './env';

/**
 * Secure encryption service using Web Crypto API
 */
export class SecureEncryption {
  private static instance: SecureEncryption;
  private keyCache: CryptoKey | null = null;

  private constructor() {}

  static getInstance(): SecureEncryption {
    if (!SecureEncryption.instance) {
      SecureEncryption.instance = new SecureEncryption();
    }
    return SecureEncryption.instance;
  }

  /**
   * Get or derive encryption key
   */
  private async getKey(): Promise<CryptoKey> {
    if (this.keyCache) {
      return this.keyCache;
    }

    const config = getEnvironmentConfig();
    const encryptionKey = config.VITE_ENCRYPTION_KEY || 'fallback-encryption-key-change-in-production';

    // Import key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(encryptionKey),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive key using PBKDF2
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('personalized-images-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    this.keyCache = key;
    return key;
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getKey();
      const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(data)
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Return as base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  async decrypt(encrypted: string): Promise<string> {
    try {
      const key = await this.getKey();
      
      // Decode from base64
      const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
      
      // Extract IV (first 12 bytes)
      const iv = combined.slice(0, 12);
      
      // Extract encrypted data (remaining bytes)
      const data = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Decryption failed - data may be corrupted or tampered with');
    }
  }

  /**
   * Clear key cache (useful for testing)
   */
  clearCache(): void {
    this.keyCache = null;
  }

  /**
   * Generate a secure random string
   */
  generateRandomString(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Export singleton instance
export const secureEncryption = SecureEncryption.getInstance();

/**
 * Convenience functions for common encryption scenarios
 */
export async function encryptData(data: string): Promise<string> {
  return secureEncryption.encrypt(data);
}

export async function decryptData(encrypted: string): Promise<string> {
  return secureEncryption.decrypt(encrypted);
}

/**
 * Generate secure API key for storage
 */
export function generateSecureApiKey(): string {
  return secureEncryption.generateRandomString(64);
}
