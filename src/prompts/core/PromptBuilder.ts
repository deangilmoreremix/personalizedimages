import {
  PromptResult,
  PromptComponent,
  PromptToken,
  PromptBuilderOptions,
  PromptStyle,
  PromptQuality,
  PromptAspectRatio
} from '../types/PromptTypes';
import { BasePrompt } from './BasePrompt';

/**
 * Fluent API for building prompts with method chaining
 * Provides a clean, readable way to construct complex prompts
 */
export class PromptBuilder {
  private components: PromptComponent[] = [];
  private tokens: Record<string, string> = {};
  private options: PromptBuilderOptions;

  constructor(options: PromptBuilderOptions = {}) {
    this.options = {
      validateTokens: true,
      strictMode: false,
      maxLength: 4000,
      includeMetadata: false,
      ...options
    };
  }

  /**
   * Add text content to the prompt
   */
  text(content: string): this {
    this.components.push({
      type: 'text',
      content
    });
    return this;
  }

  /**
   * Add a token placeholder
   */
  token(key: string, description?: string): this {
    this.components.push({
      type: 'token',
      content: `[${key}]`,
      tokens: [{
        key,
        value: '',
        description: description || `Token for ${key}`
      }]
    });
    return this;
  }

  /**
   * Add conditional content based on token presence/value
   */
  conditional(token: string, thenContent: string, elseContent?: string): this {
    this.components.push({
      type: 'conditional',
      content: '',
      conditions: [{
        token,
        operator: 'exists',
        then: { type: 'text', content: thenContent },
        else: elseContent ? { type: 'text', content: elseContent } : undefined
      }]
    });
    return this;
  }

  /**
   * Add a composite component (group of related elements)
   */
  composite(name: string, components: PromptComponent[]): this {
    this.components.push({
      type: 'composite',
      content: name,
      children: components
    });
    return this;
  }

  /**
   * Set token values
   */
  withTokens(tokens: Record<string, string>): this {
    this.tokens = { ...this.tokens, ...tokens };
    return this;
  }

  /**
   * Set a single token value
   */
  withToken(key: string, value: string): this {
    this.tokens[key] = value;
    return this;
  }

  /**
   * Add style modifier
   */
  style(style: PromptStyle): this {
    return this.text(`in ${style} style`);
  }

  /**
   * Add quality modifier
   */
  quality(quality: PromptQuality): this {
    const qualityMap = {
      low: 'basic quality',
      medium: 'good quality',
      high: 'high quality',
      ultra: 'ultra high quality',
      maximum: 'maximum quality, ultra detailed'
    };
    return this.text(qualityMap[quality]);
  }

  /**
   * Add aspect ratio
   */
  aspectRatio(ratio: PromptAspectRatio): this {
    return this.text(`${ratio} aspect ratio`);
  }

  /**
   * Add lighting description
   */
  lighting(description: string): this {
    return this.text(`with ${description} lighting`);
  }

  /**
   * Add composition description
   */
  composition(description: string): this {
    return this.text(description);
  }

  /**
   * Add color scheme
   */
  colors(description: string): this {
    return this.text(`with ${description} color scheme`);
  }

  /**
   * Build the final prompt
   */
  async build(): Promise<PromptResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Process all components
    let promptParts: string[] = [];

    for (const component of this.components) {
      try {
        const result = await this.processComponent(component);
        if (result) {
          promptParts.push(result);
        }
      } catch (error) {
        errors.push(`Error processing component: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Join all parts
    let finalPrompt = promptParts.join(' ');

    // Apply length limit
    if (this.options.maxLength && finalPrompt.length > this.options.maxLength) {
      finalPrompt = finalPrompt.substring(0, this.options.maxLength - 3) + '...';
      warnings.push(`Prompt truncated to ${this.options.maxLength} characters`);
    }

    // Validate tokens if enabled
    if (this.options.validateTokens) {
      const tokenValidation = this.validateTokens();
      errors.push(...tokenValidation.errors);
      warnings.push(...tokenValidation.warnings);
    }

    return {
      success: errors.length === 0,
      prompt: finalPrompt,
      tokens: this.tokens,
      errors,
      warnings,
      metadata: {
        templateId: 'custom-built',
        generatedAt: new Date(),
        tokenCount: Object.keys(this.tokens).length,
        characterCount: finalPrompt.length
      }
    };
  }

  /**
   * Process a single component
   */
  private async processComponent(component: PromptComponent): Promise<string | null> {
    switch (component.type) {
      case 'text':
        return component.content;

      case 'token':
        const tokenKey = component.content.replace(/^\[|\]$/g, '');
        const tokenValue = this.tokens[tokenKey];
        if (tokenValue !== undefined) {
          return tokenValue;
        }
        return component.content; // Keep placeholder if no value

      case 'conditional':
        if (component.conditions) {
          for (const condition of component.conditions) {
            const tokenValue = this.tokens[condition.token];
            const conditionMet = condition.operator === 'exists'
              ? (tokenValue !== undefined && tokenValue !== '')
              : tokenValue === condition.value;

            if (conditionMet) {
              return await this.processComponent(condition.then);
            } else if (condition.else) {
              return await this.processComponent(condition.else);
            }
          }
        }
        return null;

      case 'composite':
        if (component.children) {
          const childResults = await Promise.all(
            component.children.map(child => this.processComponent(child))
          );
          return childResults.filter(result => result !== null).join(' ');
        }
        return null;

      default:
        return null;
    }
  }

  /**
   * Validate tokens
   */
  private validateTokens(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Find all token placeholders in the components
    const tokenRegex = /\[([^\]]+)\]/g;
    const requiredTokens = new Set<string>();

    for (const component of this.components) {
      let match;
      while ((match = tokenRegex.exec(component.content)) !== null) {
        requiredTokens.add(match[1]);
      }
    }

    // Check if required tokens have values
    for (const token of requiredTokens) {
      if (!this.tokens[token] || this.tokens[token].trim() === '') {
        errors.push(`Required token [${token}] is missing or empty`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Get current components
   */
  getComponents(): PromptComponent[] {
    return [...this.components];
  }

  /**
   * Clear all components
   */
  clear(): this {
    this.components = [];
    return this;
  }

  /**
   * Clone the builder
   */
  clone(): PromptBuilder {
    const clone = new PromptBuilder(this.options);
    clone.components = [...this.components];
    clone.tokens = { ...this.tokens };
    return clone;
  }
}