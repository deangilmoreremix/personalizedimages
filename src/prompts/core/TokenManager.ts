import { TokenReplacementResult, getTokenDefinition, validateTokenValue } from '../types/TokenTypes';

/**
 * Advanced token replacement system with support for:
 * - Simple token replacement: [TOKEN]
 * - Conditional tokens: [TOKEN?if present text]
 * - Default values: [TOKEN|default value]
 * - Nested tokens: [FIRSTNAME] [LASTNAME]
 * - Validation and error handling
 */
export class TokenManager {
  private tokens: Record<string, string> = {};
  private strictMode: boolean = false;

  constructor(tokens: Record<string, string> = {}, strictMode: boolean = false) {
    this.tokens = { ...tokens };
    this.strictMode = strictMode;
  }

  /**
   * Set token values
   */
  setTokens(tokens: Record<string, string>): this {
    this.tokens = { ...this.tokens, ...tokens };
    return this;
  }

  /**
   * Set a single token value
   */
  setToken(key: string, value: string): this {
    this.tokens[key] = value;
    return this;
  }

  /**
   * Get token value
   */
  getToken(key: string): string | undefined {
    return this.tokens[key];
  }

  /**
   * Get all tokens
   */
  getAllTokens(): Record<string, string> {
    return { ...this.tokens };
  }

  /**
   * Replace all tokens in a text string
   */
  replaceTokens(text: string): TokenReplacementResult {
    let result = text;
    const tokensFound: string[] = [];
    const tokensReplaced: string[] = [];
    const errors: string[] = [];

    // Handle different token formats
    const patterns = [
      // Conditional tokens: [TOKEN?if present text]
      /\[([^\]|?]+)\?([^\]]+)\]/g,
      // Default value tokens: [TOKEN|default value]
      /\[([^\]|?]+)\|([^\]]+)\]/g,
      // Simple tokens: [TOKEN]
      /\[([^\]]+)\]/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        const tokenKey = match[1];

        tokensFound.push(tokenKey);

        if (pattern === patterns[0]) {
          // Conditional token
          const conditionalText = match[2];
          const tokenValue = this.tokens[tokenKey];
          const replacement = tokenValue ? conditionalText : '';
          result = result.replace(fullMatch, replacement);
          if (tokenValue) tokensReplaced.push(tokenKey);

        } else if (pattern === patterns[1]) {
          // Default value token
          const defaultValue = match[2];
          const tokenValue = this.tokens[tokenKey];
          const replacement = tokenValue || defaultValue;
          result = result.replace(fullMatch, replacement);
          if (tokenValue) tokensReplaced.push(tokenKey);

        } else {
          // Simple token
          const tokenValue = this.tokens[tokenKey];
          if (tokenValue !== undefined) {
            result = result.replace(fullMatch, tokenValue);
            tokensReplaced.push(tokenKey);
          } else if (this.strictMode) {
            errors.push(`Required token [${tokenKey}] is not defined`);
          }
        }
      }
    }

    // Handle nested token replacement (e.g., [FIRSTNAME] [LASTNAME] -> John Smith)
    result = this.processNestedTokens(result);

    return {
      original: text,
      replaced: result,
      tokensFound,
      tokensReplaced,
      errors
    };
  }

  /**
   * Process nested tokens within replaced content
   */
  private processNestedTokens(text: string): string {
    let result = text;
    let hasChanges = true;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (hasChanges && iterations < maxIterations) {
      hasChanges = false;
      const replacement = this.replaceTokens(result);

      if (replacement.replaced !== result) {
        result = replacement.replaced;
        hasChanges = true;
      }

      iterations++;
    }

    return result;
  }

  /**
   * Validate all tokens
   */
  validateTokens(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [key, value] of Object.entries(this.tokens)) {
      const definition = getTokenDefinition(key);
      if (definition) {
        const validation = validateTokenValue(key, value);
        errors.push(...validation.errors);
      } else {
        warnings.push(`Unknown token: ${key}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Check if a token exists
   */
  hasToken(key: string): boolean {
    return key in this.tokens;
  }

  /**
   * Get missing required tokens
   */
  getMissingTokens(requiredTokens: string[]): string[] {
    return requiredTokens.filter(token => !this.hasToken(token) || !this.tokens[token]);
  }

  /**
   * Bulk replace tokens in multiple texts
   */
  replaceTokensInBatch(texts: string[]): TokenReplacementResult[] {
    return texts.map(text => this.replaceTokens(text));
  }

  /**
   * Create a token context for scoped replacements
   */
  createContext(additionalTokens: Record<string, string> = {}): TokenManager {
    return new TokenManager({ ...this.tokens, ...additionalTokens }, this.strictMode);
  }

  /**
   * Export tokens as JSON
   */
  toJSON(): Record<string, string> {
    return { ...this.tokens };
  }

  /**
   * Import tokens from JSON
   */
  fromJSON(data: Record<string, string>): this {
    this.tokens = { ...data };
    return this;
  }

  /**
   * Clear all tokens
   */
  clear(): this {
    this.tokens = {};
    return this;
  }

  /**
   * Clone the token manager
   */
  clone(): TokenManager {
    return new TokenManager({ ...this.tokens }, this.strictMode);
  }

  /**
   * Enable or disable strict mode
   */
  setStrictMode(strict: boolean): this {
    this.strictMode = strict;
    return this;
  }

  /**
   * Get token statistics
   */
  getStats(): {
    totalTokens: number;
    definedTokens: number;
    undefinedTokens: number;
    tokenKeys: string[];
  } {
    const definedTokens = Object.keys(this.tokens).filter(key => this.tokens[key] !== undefined);
    const undefinedTokens = Object.keys(this.tokens).filter(key => this.tokens[key] === undefined);

    return {
      totalTokens: Object.keys(this.tokens).length,
      definedTokens: definedTokens.length,
      undefinedTokens: undefinedTokens.length,
      tokenKeys: Object.keys(this.tokens)
    };
  }
}