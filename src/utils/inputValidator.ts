/**
 * Comprehensive Input Validation Utility
 *
 * Provides robust validation and sanitization for all user inputs
 * to prevent injection attacks, XSS, and other security vulnerabilities.
 */

import {
  sanitizeTokenValue,
  isValidTokenKey,
  isValidEmail,
  isValidUrl,
  isValidPhone,
  sanitizePrompt,
  isValidImageUrl,
  sanitizeHtml,
  validateTokenReplacement
} from './validation';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

/**
 * Comprehensive input validator
 */
export class InputValidator {
  private static instance: InputValidator;

  private constructor() {}

  static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }

  /**
   * Validate and sanitize personalization token value
   */
  validateTokenValue(value: string): ValidationResult {
    const errors: string[] = [];

    if (!value || typeof value !== 'string') {
      errors.push('Token value must be a non-empty string');
      return { isValid: false, errors };
    }

    const sanitized = sanitizeTokenValue(value);

    if (sanitized.length === 0) {
      errors.push('Token value contains only dangerous characters');
    }

    if (sanitized.length > 500) {
      errors.push('Token value exceeds maximum length of 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitized
    };
  }

  /**
   * Validate personalization token key
   */
  validateTokenKey(key: string): ValidationResult {
    const errors: string[] = [];

    if (!key || typeof key !== 'string') {
      errors.push('Token key must be a non-empty string');
      return { isValid: false, errors };
    }

    if (!isValidTokenKey(key)) {
      errors.push('Token key must start with uppercase letter and contain only uppercase letters, numbers, and underscores');
    }

    if (key.length > 50) {
      errors.push('Token key exceeds maximum length of 50 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: key
    };
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email || typeof email !== 'string') {
      errors.push('Email must be a non-empty string');
      return { isValid: false, errors };
    }

    if (!isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: email
    };
  }

  /**
   * Validate URL
   */
  validateUrl(url: string): ValidationResult {
    const errors: string[] = [];

    if (!url || typeof url !== 'string') {
      errors.push('URL must be a non-empty string');
      return { isValid: false, errors };
    }

    if (!isValidUrl(url)) {
      errors.push('Invalid URL format');
    }

    if (url.length > 2000) {
      errors.push('URL exceeds maximum length of 2000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: url
    };
  }

  /**
   * Validate image URL
   */
  validateImageUrl(url: string): ValidationResult {
    const errors: string[] = [];

    if (!url || typeof url !== 'string') {
      errors.push('Image URL must be a non-empty string');
      return { isValid: false, errors };
    }

    if (!isValidImageUrl(url)) {
      errors.push('Invalid image URL format. Must be a valid URL with image extension or data URL');
    }

    if (url.length > 2000) {
      errors.push('Image URL exceeds maximum length of 2000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: url
    };
  }

  /**
   * Validate phone number
   */
  validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];

    if (!phone || typeof phone !== 'string') {
      errors.push('Phone number must be a non-empty string');
      return { isValid: false, errors };
    }

    if (!isValidPhone(phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: phone
    };
  }

  /**
   * Validate and sanitize AI prompt
   */
  validatePrompt(prompt: string): ValidationResult {
    const errors: string[] = [];

    if (!prompt || typeof prompt !== 'string') {
      errors.push('Prompt must be a non-empty string');
      return { isValid: false, errors };
    }

    const sanitized = sanitizePrompt(prompt);

    if (sanitized.length === 0) {
      errors.push('Prompt contains only dangerous characters');
    }

    if (sanitized.length > 2000) {
      errors.push('Prompt exceeds maximum length of 2000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitized
    };
  }

  /**
   * Validate and sanitize HTML content
   */
  validateHtml(html: string): ValidationResult {
    const errors: string[] = [];

    if (!html || typeof html !== 'string') {
      errors.push('HTML must be a non-empty string');
      return { isValid: false, errors };
    }

    const sanitized = sanitizeHtml(html);

    if (sanitized.length === 0) {
      errors.push('HTML contains only dangerous content');
    }

    if (sanitized.length > 50000) {
      errors.push('HTML exceeds maximum length of 50000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitized
    };
  }

  /**
   * Validate token replacement in text
   */
  validateTokenReplacement(text: string, tokens: Record<string, string>): ValidationResult {
    const errors: string[] = [];

    if (!text || typeof text !== 'string') {
      errors.push('Text must be a non-empty string');
      return { isValid: false, errors };
    }

    if (!tokens || typeof tokens !== 'object') {
      errors.push('Tokens must be a valid object');
      return { isValid: false, errors };
    }

    if (!validateTokenReplacement(text, tokens)) {
      errors.push('Text contains token placeholders without corresponding values');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate batch of inputs
   */
  validateBatch(inputs: Array<{ type: string; value: string; tokens?: Record<string, string> }>): ValidationResult {
    const errors: string[] = [];
    const sanitizedValues: Record<string, string> = {};

    for (const input of inputs) {
      let result: ValidationResult;

      switch (input.type) {
        case 'tokenValue':
          result = this.validateTokenValue(input.value);
          break;
        case 'tokenKey':
          result = this.validateTokenKey(input.value);
          break;
        case 'email':
          result = this.validateEmail(input.value);
          break;
        case 'url':
          result = this.validateUrl(input.value);
          break;
        case 'imageUrl':
          result = this.validateImageUrl(input.value);
          break;
        case 'phone':
          result = this.validatePhone(input.value);
          break;
        case 'prompt':
          result = this.validatePrompt(input.value);
          break;
        case 'html':
          result = this.validateHtml(input.value);
          break;
        case 'tokenReplacement':
          result = this.validateTokenReplacement(input.value, input.tokens || {});
          break;
        default:
          errors.push(`Unknown input type: ${input.type}`);
          continue;
      }

      if (!result.isValid) {
        errors.push(...result.errors);
      }

      if (result.sanitizedValue) {
        sanitizedValues[input.type] = result.sanitizedValue;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: JSON.stringify(sanitizedValues)
    };
  }

  /**
   * Sanitize arbitrary string input
   */
  sanitizeString(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove control characters
    let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>\"'&]/g, '');

    // Trim and limit length
    return sanitized.trim().substring(0, maxLength);
  }

  /**
   * Validate numeric input
   */
  validateNumber(value: string, min?: number, max?: number): ValidationResult {
    const errors: string[] = [];

    if (!value || typeof value !== 'string') {
      errors.push('Value must be a non-empty string');
      return { isValid: false, errors };
    }

    const num = parseFloat(value);

    if (isNaN(num)) {
      errors.push('Value must be a valid number');
      return { isValid: false, errors };
    }

    if (min !== undefined && num < min) {
      errors.push(`Value must be at least ${min}`);
    }

    if (max !== undefined && num > max) {
      errors.push(`Value must be at most ${max}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: num.toString()
    };
  }

  /**
   * Validate boolean input
   */
  validateBoolean(value: string): ValidationResult {
    const errors: string[] = [];

    if (!value || typeof value !== 'string') {
      errors.push('Value must be a non-empty string');
      return { isValid: false, errors };
    }

    const lowerValue = value.toLowerCase();

    if (!['true', 'false', '1', '0', 'yes', 'no'].includes(lowerValue)) {
      errors.push('Value must be a valid boolean (true/false/1/0/yes/no)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: lowerValue
    };
  }
}

// Export singleton instance
export const inputValidator = InputValidator.getInstance();

/**
 * Convenience functions for common validation scenarios
 */
export const validateToken = (value: string) => inputValidator.validateTokenValue(value);
export const validateEmail = (email: string) => inputValidator.validateEmail(email);
export const validateUrl = (url: string) => inputValidator.validateUrl(url);
export const validatePrompt = (prompt: string) => inputValidator.validatePrompt(prompt);
export const sanitizeInput = (input: string, maxLength?: number) => inputValidator.sanitizeString(input, maxLength);
