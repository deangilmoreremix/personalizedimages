/**
 * Input validation utilities for personalization tokens and user inputs
 */

/**
 * Sanitize token values to prevent injection attacks
 */
export const sanitizeTokenValue = (value: string): string => {
  if (!value || typeof value !== 'string') return '';

  // Remove potentially dangerous characters
  return value
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML injection characters
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim()
    .substring(0, 500); // Limit length to prevent abuse
};

/**
 * Validate token key format
 */
export const isValidTokenKey = (key: string): boolean => {
  return /^[A-Z][A-Z0-9_]*$/.test(key) && key.length <= 50;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.length <= 2000;
  } catch {
    return false;
  }
};

/**
 * Validate phone number format (basic validation)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, '')) && phone.length <= 20;
};

/**
 * Sanitize prompt text for AI generation
 */
export const sanitizePrompt = (prompt: string): string => {
  if (!prompt || typeof prompt !== 'string') return '';

  return prompt
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim()
    .substring(0, 2000); // Reasonable limit for prompts
};

/**
 * Validate image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;

  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff?)(\?.*)?$/i;
  return imageExtensions.test(url) || url.includes('data:image/');
};

/**
 * Sanitize HTML content for email templates
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';

  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .substring(0, 50000); // Reasonable limit for HTML content
};

/**
 * Validate token replacement in text
 */
export const validateTokenReplacement = (text: string, tokens: Record<string, string>): boolean => {
  // Check that all token placeholders have corresponding values
  const tokenRegex = /\[([A-Z][A-Z0-9_]*)\]/g;
  const matches = text.match(tokenRegex) || [];

  for (const match of matches) {
    const tokenKey = match.slice(1, -1); // Remove brackets
    if (!(tokenKey in tokens)) {
      return false; // Missing token value
    }
  }

  return true;
};