import { describe, it, expect } from 'vitest';
import {
  sanitizeTokenValue,
  isValidTokenKey,
  isValidEmail,
  isValidUrl,
  isValidPhone,
  sanitizePrompt,
  isValidImageUrl,
  sanitizeHtml,
  validateTokenReplacement,
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('sanitizeTokenValue', () => {
    it('should remove HTML/XML injection characters', () => {
      const dirty = '<script>alert("xss")</script>';
      const clean = sanitizeTokenValue(dirty);
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
      expect(clean).not.toContain('"');
      expect(clean).not.toContain("'");
      expect(clean).not.toContain('&');
    });

    it('should remove control characters', () => {
      const dirty = 'Hello\x00World\x1F';
      expect(sanitizeTokenValue(dirty)).toBe('HelloWorld');
    });

    it('should trim whitespace', () => {
      expect(sanitizeTokenValue('  hello world  ')).toBe('hello world');
    });

    it('should limit length to 500 characters', () => {
      const longString = 'a'.repeat(600);
      expect(sanitizeTokenValue(longString).length).toBe(500);
    });

    it('should handle empty or invalid input', () => {
      expect(sanitizeTokenValue('')).toBe('');
      expect(sanitizeTokenValue(null as unknown as string)).toBe('');
      expect(sanitizeTokenValue(undefined as unknown as string)).toBe('');
      expect(sanitizeTokenValue(123 as unknown as string)).toBe('');
    });
  });

  describe('isValidTokenKey', () => {
    it('should validate correct token keys', () => {
      expect(isValidTokenKey('FIRSTNAME')).toBe(true);
      expect(isValidTokenKey('USER_ID')).toBe(true);
      expect(isValidTokenKey('A')).toBe(true);
      expect(isValidTokenKey('TOKEN123')).toBe(true);
    });

    it('should reject invalid token keys', () => {
      expect(isValidTokenKey('lowercase')).toBe(false);
      expect(isValidTokenKey('123START')).toBe(false);
      expect(isValidTokenKey('')).toBe(false);
      expect(isValidTokenKey('TOO_LONG_'.repeat(10))).toBe(false);
      expect(isValidTokenKey('invalid-key')).toBe(false);
      expect(isValidTokenKey('invalid key')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@sub.domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
      expect(isValidEmail('123@456.789')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user space@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should reject emails over 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
    });

    it('should reject URLs over 2000 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);
      expect(isValidUrl(longUrl)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+44 20 7946 0958')).toBe(true);
      expect(isValidPhone('(555) 123-4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('123')).toBe(false); // Too short
      expect(isValidPhone('0123456789')).toBe(false); // Can't start with 0
    });

    it('should reject phones over 20 characters', () => {
      const longPhone = '+123456789012345678901';
      expect(isValidPhone(longPhone)).toBe(false);
    });
  });

  describe('sanitizePrompt', () => {
    it('should remove control characters', () => {
      const dirty = 'Hello\x00World\x1F';
      expect(sanitizePrompt(dirty)).toBe('HelloWorld');
    });

    it('should trim whitespace', () => {
      expect(sanitizePrompt('  hello world  ')).toBe('hello world');
    });

    it('should limit length to 2000 characters', () => {
      const longString = 'a'.repeat(3000);
      expect(sanitizePrompt(longString).length).toBe(2000);
    });

    it('should handle empty or invalid input', () => {
      expect(sanitizePrompt('')).toBe('');
      expect(sanitizePrompt(null as unknown as string)).toBe('');
      expect(sanitizePrompt(undefined as unknown as string)).toBe('');
    });
  });

  describe('isValidImageUrl', () => {
    it('should validate image URLs with extensions', () => {
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
      expect(isValidImageUrl('https://example.com/image.jpeg')).toBe(true);
      expect(isValidImageUrl('https://example.com/image.png')).toBe(true);
      expect(isValidImageUrl('https://example.com/image.gif')).toBe(true);
      expect(isValidImageUrl('https://example.com/image.webp')).toBe(true);
      expect(isValidImageUrl('https://example.com/image.svg')).toBe(true);
    });

    it('should validate data URLs', () => {
      expect(isValidImageUrl('data:image/png;base64,abc123')).toBe(true);
      expect(isValidImageUrl('data:image/jpeg;base64,xyz789')).toBe(true);
    });

    it('should reject non-image URLs', () => {
      expect(isValidImageUrl('https://example.com/document.pdf')).toBe(false);
      expect(isValidImageUrl('https://example.com/page.html')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isValidImageUrl('not-a-url')).toBe(false);
      expect(isValidImageUrl('')).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const dirty = '<script>alert("xss")</script><p>Safe content</p>';
      expect(sanitizeHtml(dirty)).not.toContain('<script>');
      expect(sanitizeHtml(dirty)).toContain('<p>Safe content</p>');
    });

    it('should remove iframe tags', () => {
      const dirty = '<iframe src="evil.com"></iframe><div>Safe</div>';
      expect(sanitizeHtml(dirty)).not.toContain('<iframe');
      expect(sanitizeHtml(dirty)).toContain('<div>Safe</div>');
    });

    it('should remove event handlers', () => {
      const dirty = '<div onclick="alert(1)">Click me</div>';
      expect(sanitizeHtml(dirty)).not.toContain('onclick');
    });

    it('should remove javascript: URLs', () => {
      const dirty = '<a href="javascript:alert(1)">Link</a>';
      expect(sanitizeHtml(dirty)).not.toContain('javascript:');
    });

    it('should limit length to 50000 characters', () => {
      const longHtml = '<p>' + 'a'.repeat(60000) + '</p>';
      expect(sanitizeHtml(longHtml).length).toBe(50000);
    });

    it('should handle empty or invalid input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null as unknown as string)).toBe('');
      expect(sanitizeHtml(undefined as unknown as string)).toBe('');
    });
  });

  describe('validateTokenReplacement', () => {
    it('should return true when all tokens have values', () => {
      const text = 'Hello [FIRSTNAME] [LASTNAME]';
      const tokens = { FIRSTNAME: 'John', LASTNAME: 'Doe' };
      expect(validateTokenReplacement(text, tokens)).toBe(true);
    });

    it('should return false when a token is missing', () => {
      const text = 'Hello [FIRSTNAME] [LASTNAME]';
      const tokens = { FIRSTNAME: 'John' };
      expect(validateTokenReplacement(text, tokens)).toBe(false);
    });

    it('should return true for text without tokens', () => {
      const text = 'Hello World';
      const tokens = {};
      expect(validateTokenReplacement(text, tokens)).toBe(true);
    });

    it('should handle multiple occurrences of same token', () => {
      const text = '[NAME] says hello to [NAME]';
      const tokens = { NAME: 'John' };
      expect(validateTokenReplacement(text, tokens)).toBe(true);
    });
  });
});
