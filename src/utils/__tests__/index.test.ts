import { describe, it, expect, beforeEach } from 'vitest';
import { 
  sanitizeTokenValue, 
  isValidTokenKey, 
  isValidEmail, 
  isValidUrl,
  sanitizePrompt,
  validateTokenReplacement 
} from '../validation';
import { logger, LogLevel } from '../logger';

describe('Validation Utils', () => {
  describe('sanitizeTokenValue', () => {
    it('should remove HTML characters from token values', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeTokenValue(input);
      // The function removes < > " ' & characters
      expect(result).toBe('scriptalert(xss)/scriptHello');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const result = sanitizeTokenValue(input);
      expect(result).toBe('hello world');
    });

    it('should limit length to 500 characters', () => {
      const input = 'a'.repeat(600);
      const result = sanitizeTokenValue(input);
      expect(result.length).toBe(500);
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeTokenValue(null as unknown as string)).toBe('');
      expect(sanitizeTokenValue(undefined as unknown as string)).toBe('');
      expect(sanitizeTokenValue(123 as unknown as string)).toBe('');
    });
  });

  describe('isValidTokenKey', () => {
    it('should validate correct token key format', () => {
      expect(isValidTokenKey('FIRSTNAME')).toBe(true);
      expect(isValidTokenKey('COMPANY_NAME')).toBe(true);
      expect(isValidTokenKey('USER_ID_123')).toBe(true);
    });

    it('should reject invalid token key formats', () => {
      expect(isValidTokenKey('lowercase')).toBe(false);
      expect(isValidTokenKey('123_START')).toBe(false);
      expect(isValidTokenKey('with spaces')).toBe(false);
      expect(isValidTokenKey('')).toBe(false);
      expect(isValidTokenKey('A'.repeat(51))).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should reject emails over 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(true); // Valid protocol
    });

    it('should reject URLs over 2000 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);
      expect(isValidUrl(longUrl)).toBe(false);
    });
  });

  describe('sanitizePrompt', () => {
    it('should remove control characters', () => {
      const input = 'Hello\x00World\x1F';
      const result = sanitizePrompt(input);
      expect(result).toBe('HelloWorld');
    });

    it('should trim whitespace', () => {
      const input = '  prompt text  ';
      const result = sanitizePrompt(input);
      expect(result).toBe('prompt text');
    });

    it('should limit length to 2000 characters', () => {
      const input = 'a'.repeat(2500);
      const result = sanitizePrompt(input);
      expect(result.length).toBe(2000);
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizePrompt(null as unknown as string)).toBe('');
      expect(sanitizePrompt(undefined as unknown as string)).toBe('');
    });
  });

  describe('validateTokenReplacement', () => {
    it('should return true when all tokens have values', () => {
      const text = 'Hello [FIRSTNAME] from [COMPANY]';
      const tokens = { FIRSTNAME: 'John', COMPANY: 'Acme' };
      expect(validateTokenReplacement(text, tokens)).toBe(true);
    });

    it('should return false when tokens are missing', () => {
      const text = 'Hello [FIRSTNAME] from [COMPANY]';
      const tokens = { FIRSTNAME: 'John' };
      expect(validateTokenReplacement(text, tokens)).toBe(false);
    });

    it('should return true when no tokens in text', () => {
      const text = 'Hello world';
      const tokens = {};
      expect(validateTokenReplacement(text, tokens)).toBe(true);
    });
  });
});

describe('Logger', () => {
  beforeEach(() => {
    logger.clearLogs();
  });

  it('should create log entries with correct structure', () => {
    logger.info('Test message', { key: 'value' });
    const logs = logger.getRecentLogs();
    
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]).toHaveProperty('timestamp');
    expect(logs[0]).toHaveProperty('level');
    expect(logs[0]).toHaveProperty('message');
    expect(logs[0].message).toBe('Test message');
  });

  it('should filter logs by level', () => {
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    const warnAndAbove = logger.getRecentLogs(LogLevel.WARN);
    expect(warnAndAbove.length).toBe(2);
  });

  it('should track user actions', () => {
    logger.trackUserAction('button_click', { buttonId: 'submit' });
    const logs = logger.getRecentLogs();
    
    const actionLog = logs.find(log => log.context?.category === 'user_action');
    expect(actionLog).toBeDefined();
    expect(actionLog?.context?.action).toBe('button_click');
  });

  it('should limit log entries', () => {
    // Generate more than max entries
    for (let i = 0; i < 1100; i++) {
      logger.info(`Message ${i}`);
    }
    
    const logs = logger.getRecentLogs(undefined, 1500);
    expect(logs.length).toBeLessThanOrEqual(1000);
  });
});

describe('Environment Configuration', () => {
  it('should have environment variables available', () => {
    // Test that import.meta.env is available (Vite environment)
    expect(import.meta.env).toBeDefined();
  });

  it('should validate token key format', () => {
    // Test various token key formats
    expect(isValidTokenKey('VITE_TEST_VAR')).toBe(true);
    expect(isValidTokenKey('lowercase')).toBe(false);
    expect(isValidTokenKey('123_START')).toBe(false);
  });
});
