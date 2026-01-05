// Security headers and Content Security Policy utilities

export interface SecurityConfig {
  enableCSP?: boolean;
  enableHSTS?: boolean;
  enableXFrameOptions?: boolean;
  enableXContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
  customCSP?: string;
}

class SecurityHeadersManager {
  private config: Required<SecurityConfig>;

  constructor(config: SecurityConfig = {}) {
    this.config = {
      enableCSP: true,
      enableHSTS: true,
      enableXFrameOptions: true,
      enableXContentTypeOptions: true,
      enableReferrerPolicy: true,
      enablePermissionsPolicy: true,
      customCSP: '',
      ...config
    };

    this.applySecurityHeaders();
  }

  private applySecurityHeaders() {
    // Only apply in browser environment
    if (typeof document === 'undefined') return;

    // Content Security Policy
    if (this.config.enableCSP) {
      this.setCSP();
    }

    // HTTP Strict Transport Security
    if (this.config.enableHSTS && window.location.protocol === 'https:') {
      this.setHSTS();
    }

    // X-Frame-Options
    if (this.config.enableXFrameOptions) {
      this.setXFrameOptions();
    }

    // X-Content-Type-Options
    if (this.config.enableXContentTypeOptions) {
      this.setXContentTypeOptions();
    }

    // Referrer Policy
    if (this.config.enableReferrerPolicy) {
      this.setReferrerPolicy();
    }

    // Permissions Policy
    if (this.config.enablePermissionsPolicy) {
      this.setPermissionsPolicy();
    }
  }

  private setCSP() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com https://*.supabase.co wss://*.supabase.co",
      "media-src 'self' blob: data:",
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ];

    // Add custom CSP if provided
    if (this.config.customCSP) {
      cspDirectives.push(this.config.customCSP);
    }

    const csp = cspDirectives.join('; ');

    // Set CSP via meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);
  }

  private setHSTS() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Strict-Transport-Security';
    meta.content = 'max-age=31536000; includeSubDomains; preload';
    document.head.appendChild(meta);
  }

  private setXFrameOptions() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'X-Frame-Options';
    meta.content = 'DENY';
    document.head.appendChild(meta);
  }

  private setXContentTypeOptions() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'X-Content-Type-Options';
    meta.content = 'nosniff';
    document.head.appendChild(meta);
  }

  private setReferrerPolicy() {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(meta);
  }

  private setPermissionsPolicy() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Permissions-Policy';
    meta.content = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'payment=()',
      'usb=()'
    ].join(', ');
    document.head.appendChild(meta);
  }

  // Validate CSP violations
  setupCSPViolationReporting() {
    document.addEventListener('securitypolicyviolation', (event) => {
      console.error('CSP Violation:', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber
      });

      // Report to monitoring service
      this.reportSecurityViolation('CSP', event);
    });
  }

  // Input sanitization utilities
  static sanitizeInput(input: string, options: {
    allowHtml?: boolean;
    maxLength?: number;
    allowedTags?: string[];
  } = {}): string {
    const { allowHtml = false, maxLength, allowedTags = [] } = options;

    let sanitized = input;

    // Trim whitespace
    sanitized = sanitized.trim();

    // Limit length
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // HTML sanitization
    if (!allowHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    } else if (allowedTags.length > 0) {
      // Allow only specific tags
      const allowedTagsPattern = allowedTags.join('|');
      const tagRegex = new RegExp(`<(?!/?(${allowedTagsPattern})\\b)[^>]*>`, 'gi');
      sanitized = sanitized.replace(tagRegex, '');
    }

    // Prevent script injection
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    return sanitized;
  }

  // Validate file uploads
  static validateFile(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): { valid: boolean; error?: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` };
    }

    // Check MIME type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return { valid: false, error: `File type ${file.type} not allowed` };
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        return { valid: false, error: `File extension not allowed` };
      }
    }

    return { valid: true };
  }

  // Generate secure random values
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Hash sensitive data
  static async hashData(data: string, algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256'): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private reportSecurityViolation(type: string, event: any) {
    // Report security violations to monitoring service
    if (import.meta.env.PROD) {
      try {
        // Implement your security monitoring integration
        console.warn(`Security violation reported: ${type}`, event);
      } catch (error) {
        console.error('Failed to report security violation:', error);
      }
    }
  }
}

// Initialize security headers
export const securityManager = new SecurityHeadersManager();

// Export utilities
export { SecurityHeadersManager };

// React hook for secure form handling
export const useSecureForm = () => {
  const sanitizeInput = (input: string, options?: Parameters<typeof SecurityHeadersManager.sanitizeInput>[1]) => {
    return SecurityHeadersManager.sanitizeInput(input, options);
  };

  const validateFile = (file: File, options?: Parameters<typeof SecurityHeadersManager.validateFile>[1]) => {
    return SecurityHeadersManager.validateFile(file, options);
  };

  const generateToken = (length?: number) => {
    return SecurityHeadersManager.generateSecureToken(length);
  };

  return { sanitizeInput, validateFile, generateToken };
};