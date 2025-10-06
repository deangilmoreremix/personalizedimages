/**
 * Prompt Enhancement Service
 * AI-powered prompt analysis, enhancement, and validation
 */

import { getOpenAIApiKey } from '../utils/apiUtils';

export interface PromptAnalysis {
  quality_score: number; // 0-100
  clarity: number; // 0-100
  specificity: number; // 0-100
  completeness: number; // 0-100
  issues: string[];
  suggestions: string[];
  missing_elements: string[];
  strengths: string[];
}

export interface EnhancedPrompt {
  original: string;
  enhanced: string;
  improvements: string[];
  analysis: PromptAnalysis;
}

class PromptEnhancementService {
  private apiKey: string;

  constructor() {
    this.apiKey = getOpenAIApiKey();
  }

  /**
   * Analyze prompt quality and provide suggestions
   */
  async analyzePrompt(prompt: string, category?: string): Promise<PromptAnalysis> {
    if (!this.apiKey) {
      return this.fallbackAnalysis(prompt);
    }

    try {
      const systemPrompt = `You are a prompt engineering expert. Analyze the given image generation prompt and provide structured feedback.

Focus on:
1. Clarity - Is the prompt clear and unambiguous?
2. Specificity - Are details specific enough?
3. Completeness - Does it include all necessary elements (subject, environment, style, lighting, composition)?
4. Issues - Any problems or conflicts?
5. Suggestions - How to improve it?

Respond in JSON format with this structure:
{
  "quality_score": 0-100,
  "clarity": 0-100,
  "specificity": 0-100,
  "completeness": 0-100,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "missing_elements": ["element1", "element2"],
  "strengths": ["strength1", "strength2"]
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analyze this ${category || 'image generation'} prompt:\n\n${prompt}` }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content;
      const analysis = JSON.parse(analysisText);

      return analysis;
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      return this.fallbackAnalysis(prompt);
    }
  }

  /**
   * Enhance a prompt with AI suggestions
   */
  async enhancePrompt(prompt: string, style?: string, category?: string): Promise<EnhancedPrompt> {
    if (!this.apiKey) {
      return {
        original: prompt,
        enhanced: prompt,
        improvements: ['API key not available - using original prompt'],
        analysis: this.fallbackAnalysis(prompt)
      };
    }

    try {
      const systemPrompt = `You are an expert at writing prompts for AI image generation. Your task is to enhance the given prompt while maintaining the user's intent.

Guidelines:
1. Keep the user's core idea intact
2. Add specific details about composition, lighting, style, and quality
3. Make it more descriptive and vivid
4. Include technical photography/art terms when appropriate
5. Suggest specific improvements

If a style is specified (${style}), incorporate it naturally.
Category: ${category || 'general'}

Respond in JSON format:
{
  "enhanced": "The improved prompt",
  "improvements": ["improvement1", "improvement2", "improvement3"]
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.choices[0].message.content;
      const result = JSON.parse(resultText);

      // Analyze the enhanced prompt
      const analysis = await this.analyzePrompt(result.enhanced, category);

      return {
        original: prompt,
        enhanced: result.enhanced,
        improvements: result.improvements,
        analysis
      };
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      return {
        original: prompt,
        enhanced: prompt,
        improvements: ['Error enhancing prompt - using original'],
        analysis: this.fallbackAnalysis(prompt)
      };
    }
  }

  /**
   * Get smart suggestions as user types
   */
  async getSmartSuggestions(partialPrompt: string, category?: string): Promise<string[]> {
    if (!this.apiKey || partialPrompt.length < 10) {
      return this.getFallbackSuggestions(partialPrompt, category);
    }

    try {
      const systemPrompt = `You are helping users write image generation prompts. Based on what they've typed so far, suggest 5 completions or additions.

Rules:
1. Be specific and helpful
2. Suggest elements they might be missing (lighting, composition, style, mood)
3. Keep suggestions concise (3-8 words each)
4. Make suggestions contextual to what they've already written

Category: ${category || 'general'}

Respond with JSON array of strings:
["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: partialPrompt }
          ],
          temperature: 0.8,
          max_tokens: 200,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.choices[0].message.content;
      const result = JSON.parse(resultText);

      return Array.isArray(result) ? result : (result.suggestions || []);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return this.getFallbackSuggestions(partialPrompt, category);
    }
  }

  /**
   * Validate prompt for common issues
   */
  validatePrompt(prompt: string): { valid: boolean; warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check length
    if (prompt.length < 10) {
      errors.push('Prompt is too short. Add more details for better results.');
    }

    if (prompt.length > 1000) {
      warnings.push('Prompt is very long. Consider simplifying for better results.');
    }

    // Check for conflicting instructions
    const conflicts = [
      ['photorealistic', 'cartoon'],
      ['modern', 'vintage'],
      ['minimalist', 'detailed'],
      ['bright', 'dark']
    ];

    const lowerPrompt = prompt.toLowerCase();
    conflicts.forEach(([term1, term2]) => {
      if (lowerPrompt.includes(term1) && lowerPrompt.includes(term2)) {
        warnings.push(`Conflicting styles detected: "${term1}" and "${term2}"`);
      }
    });

    // Check for vague terms
    const vagueTerms = ['nice', 'good', 'beautiful', 'amazing', 'cool', 'awesome'];
    vagueTerms.forEach(term => {
      if (lowerPrompt.includes(term)) {
        warnings.push(`Vague term "${term}" - be more specific`);
      }
    });

    // Check for missing key elements
    const hasSubject = /person|figure|character|object|product|scene/.test(lowerPrompt);
    const hasStyle = /style|aesthetic|look|photography|painting|art/.test(lowerPrompt);
    const hasLighting = /light|shadow|bright|dark|golden|natural/.test(lowerPrompt);

    if (!hasSubject) {
      warnings.push('Consider adding a clear subject');
    }
    if (!hasStyle) {
      warnings.push('Consider specifying a style or aesthetic');
    }
    if (!hasLighting) {
      warnings.push('Consider adding lighting details');
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * Get negative prompt suggestions
   */
  getNegativePromptSuggestions(category?: string): string[] {
    const base = [
      'blurry',
      'low quality',
      'distorted',
      'deformed',
      'watermark',
      'text',
      'amateur',
      'bad anatomy',
      'poorly drawn',
      'low resolution'
    ];

    const categorySpecific: Record<string, string[]> = {
      'portrait': ['bad face', 'asymmetric eyes', 'distorted features'],
      'product': ['cluttered background', 'poor lighting', 'reflections'],
      'action-figure': ['broken plastic', 'poor packaging', 'damaged'],
      'cartoon': ['realistic', 'photographic', 'blurry edges'],
      'meme': ['small text', 'unreadable', 'low contrast']
    };

    if (category && categorySpecific[category]) {
      return [...base, ...categorySpecific[category]];
    }

    return base;
  }

  /**
   * Fallback analysis when API is not available
   */
  private fallbackAnalysis(prompt: string): PromptAnalysis {
    const wordCount = prompt.split(/\s+/).length;
    const hasDetails = /\b(with|featuring|including|in|at)\b/i.test(prompt);
    const hasStyle = /\b(style|aesthetic|look)\b/i.test(prompt);
    const hasLighting = /\b(light|bright|dark|shadow)\b/i.test(prompt);

    let quality_score = 50;
    if (wordCount > 15) quality_score += 15;
    if (hasDetails) quality_score += 15;
    if (hasStyle) quality_score += 10;
    if (hasLighting) quality_score += 10;

    const issues: string[] = [];
    const missing: string[] = [];

    if (wordCount < 10) issues.push('Prompt is very short');
    if (!hasStyle) missing.push('Style specification');
    if (!hasLighting) missing.push('Lighting details');

    return {
      quality_score: Math.min(quality_score, 100),
      clarity: wordCount > 5 ? 70 : 40,
      specificity: hasDetails ? 70 : 40,
      completeness: missing.length === 0 ? 80 : 50,
      issues,
      suggestions: ['Add more specific details', 'Include style and mood', 'Specify lighting'],
      missing_elements: missing,
      strengths: wordCount > 10 ? ['Good length'] : []
    };
  }

  /**
   * Fallback suggestions when API is not available
   */
  private getFallbackSuggestions(partialPrompt: string, category?: string): string[] {
    const suggestions: string[] = [
      'professional lighting',
      'high quality',
      '8K resolution',
      'detailed composition',
      'vibrant colors'
    ];

    if (category === 'action-figure') {
      return [
        'in packaging',
        'with accessories',
        'retro style card',
        'collectible quality',
        'detailed sculpt'
      ];
    }

    if (category === 'portrait') {
      return [
        'professional headshot',
        'natural lighting',
        'shallow depth of field',
        'confident expression',
        'modern office background'
      ];
    }

    return suggestions;
  }
}

export const promptEnhancementService = new PromptEnhancementService();
export default promptEnhancementService;
