import {
  PromptTemplate,
  PromptResult,
  PromptComponent,
  PromptToken,
  PromptMetadata,
  PromptBuilderOptions,
  PromptValidationRule
} from '../types/PromptTypes';

/**
 * Abstract base class for all prompt templates
 * Provides common functionality for prompt building, validation, and token replacement
 */
export abstract class BasePrompt {
  protected template: PromptTemplate;
  protected tokens: Record<string, string> = {};
  protected options: PromptBuilderOptions;

  constructor(template: PromptTemplate, options: PromptBuilderOptions = {}) {
    this.template = template;
    this.options = {
      validateTokens: true,
      strictMode: false,
      maxLength: 4000,
      includeMetadata: false,
      ...options
    };
  }

  /**
   * Build the final prompt string
   */
  abstract build(): Promise<PromptResult>;

  /**
   * Set token values for replacement
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
   * Get current token values
   */
  getTokens(): Record<string, string> {
    return { ...this.tokens };
  }

  /**
   * Validate the current token set against template requirements
   */
  validateTokens(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required tokens
    for (const rule of this.template.validationRules) {
      if (rule.rule === 'required') {
        const tokenValue = this.tokens[rule.field];
        if (!tokenValue || tokenValue.trim() === '') {
          errors.push(`Required token [${rule.field}] is missing or empty`);
        }
      }
    }

    // Check token validation rules
    for (const [key, value] of Object.entries(this.tokens)) {
      const rule = this.template.validationRules.find(r => r.field === key);
      if (rule) {
        switch (rule.rule) {
          case 'minLength':
            if (value.length < (rule.value || 0)) {
              errors.push(`Token [${key}] must be at least ${rule.value} characters`);
            }
            break;
          case 'maxLength':
            if (value.length > (rule.value || 0)) {
              warnings.push(`Token [${key}] exceeds recommended length of ${rule.value} characters`);
            }
            break;
          case 'pattern':
            if (rule.value && !rule.value.test(value)) {
              errors.push(`Token [${key}] format is invalid: ${rule.message}`);
            }
            break;
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Get template metadata
   */
  getMetadata(): PromptMetadata {
    return this.template.metadata;
  }

  /**
   * Get available token definitions
   */
  getTokenDefinitions(): PromptToken[] {
    return this.template.components
      .flatMap(component => component.tokens || [])
      .filter((token, index, arr) =>
        arr.findIndex(t => t.key === token.key) === index
      );
  }

  /**
   * Clone this prompt with new options
   */
  clone(options?: Partial<PromptBuilderOptions>): BasePrompt {
    const newOptions = { ...this.options, ...options };
    const Constructor = this.constructor as new (template: PromptTemplate, options: PromptBuilderOptions) => BasePrompt;
    const clone = new Constructor(this.template, newOptions);
    clone.setTokens(this.tokens);
    return clone;
  }

  /**
   * Export template as JSON
   */
  toJSON(): PromptTemplate {
    return this.template;
  }

  /**
   * Create a new instance from JSON
   */
  static fromJSON(json: PromptTemplate, options?: PromptBuilderOptions): BasePrompt {
    throw new Error('fromJSON must be implemented by subclasses');
  }
}