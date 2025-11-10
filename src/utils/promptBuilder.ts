/**
 * Unified Prompt Builder System
 * Handles prompt construction, token replacement, and enhancement for all image types
 */

import { callGPT } from './gptApi';
import { resolveTokens, validateTokens, TokenResolutionOptions } from './tokenResolver';
import { PERSONALIZATION_TOKENS, TokenCategory } from '../types/personalization';

// Token validation patterns
const TOKEN_PATTERN = /\[([A-Z_]+)\]/g;
const PLACEHOLDER_PATTERN = /"([^"]+)"/g;

// Technical specifications by category
const TECHNICAL_SPECS = {
  actionFigure: {
    resolution: "8K resolution, high detail",
    lighting: "studio lighting with soft fill, dramatic shadows",
    camera: "professional product photography, shallow depth of field",
    quality: "photorealistic materials and textures",
    composition: "clean white background, centered composition"
  },
  meme: {
    resolution: "high contrast, readable typography",
    lighting: "bright, viral social media aesthetic",
    camera: "clean composition with text overlay",
    quality: "bold typography, impact font, proper spacing",
    composition: "meme format with top and bottom text areas"
  },
  cartoon: {
    resolution: "clean line art, consistent stroke width",
    lighting: "vibrant cartoon colors, limited palette",
    camera: "exaggerated features and expressions",
    quality: "simplified anatomy, animated character design",
    composition: "dynamic poses, clear focal points"
  },
  ghibli: {
    resolution: "soft watercolor painting technique",
    lighting: "hand-drawn animation aesthetic, whimsical atmosphere",
    camera: "detailed background elements, emotional expressions",
    quality: "Studio Ghibli watercolor style, magical elements",
    composition: "balanced composition with depth and atmosphere"
  },
  musicStar: {
    resolution: "professional concert photography",
    lighting: "stage lighting with dramatic effects",
    camera: "performance capture with motion and energy",
    quality: "vibrant colors, dynamic expressions",
    composition: "entertainment focus with personality emphasis"
  },
  retro: {
    resolution: "nostalgic aesthetic with period-appropriate detail",
    lighting: "era-specific lighting and atmosphere",
    camera: "classic photography style for the time period",
    quality: "authentic materials and period styling",
    composition: "iconic poses and settings from the era"
  },
  tvShow: {
    resolution: "professional production quality",
    lighting: "studio and location lighting appropriate to genre",
    camera: "character-focused composition with emotional depth",
    quality: "authentic costuming and production design",
    composition: "dramatic framing with character emphasis"
  },
  wrestling: {
    resolution: "high-energy action photography",
    lighting: "arena lighting with dramatic spotlights",
    camera: "dynamic action capture with motion blur",
    quality: "authentic wrestling gear and expressions",
    composition: "powerful poses with arena atmosphere"
  }
};

// Category-specific enhancements
const CATEGORY_ENHANCEMENTS = {
  actionFigure: [
    "highly detailed articulation points",
    "realistic plastic textures and materials",
    "professional toy packaging design",
    "commercial product photography standards",
    "studio lighting with product shadows"
  ],
  meme: [
    "high contrast text for readability",
    "meme format with top and bottom text areas",
    "exaggerated facial expressions and reactions",
    "bold typography and impact font",
    "viral social media aesthetic"
  ],
  cartoon: [
    "clean line art with consistent stroke width",
    "vibrant color palette appropriate for style",
    "exaggerated features and expressions",
    "simplified anatomy and proportions",
    "animated character design principles"
  ],
  ghibli: [
    "soft, painterly animation look",
    "natural lighting with magical elements",
    "peaceful landscape and character harmony",
    "oversized eyes with emotional depth",
    "dreamy fantasy atmosphere"
  ],
  musicStar: [
    "stage presence and performance energy",
    "musical instrument integration",
    "crowd interaction and showmanship",
    "vibrant performance lighting",
    "entertainment industry professionalism"
  ],
  retro: [
    "period-appropriate technology and styling",
    "nostalgic color palettes and materials",
    "era-specific cultural references",
    "classic design elements and motifs",
    "authentic retro atmosphere"
  ],
  tvShow: [
    "character-driven emotional storytelling",
    "production design authenticity",
    "genre-specific visual language",
    "professional acting and expression",
    "narrative composition and framing"
  ],
  wrestling: [
    "high-intensity athletic performance",
    "arena atmosphere and crowd energy",
    "dramatic lighting and special effects",
    "authentic wrestling gear and accessories",
    "powerful physical presence and poses"
  ]
};

export interface PromptTemplate {
  id: string;
  category: string;
  name: string;
  basePrompt: string;
  tokens: string[];
  enhancements: string[];
  packaging?: string;
  preview?: string;
}

export interface PromptBuildOptions {
  category: string;
  tokens?: Record<string, string>;
  includeEnhancements?: boolean;
  customEnhancements?: string[];
  technicalSpecs?: boolean;
  aiEnhancement?: boolean;
  tokenResolutionOptions?: TokenResolutionOptions;
  validateTokens?: boolean;
  requiredTokenCategories?: TokenCategory[];
}

/**
 * Extract tokens from a prompt template
 */
export function extractTokens(prompt: string): string[] {
  const tokens: string[] = [];
  const tokenMatches = prompt.match(TOKEN_PATTERN);

  if (tokenMatches) {
    tokenMatches.forEach(match => {
      const token = match.slice(1, -1); // Remove brackets
      if (!tokens.includes(token)) {
        tokens.push(token);
      }
    });
  }

  return tokens;
}

/**
 * Replace tokens in a prompt with actual values
 */
export function replaceTokens(prompt: string, tokenValues: Record<string, string>): string {
  let result = prompt;

  Object.entries(tokenValues).forEach(([token, value]) => {
    if (value && value.trim()) {
      const tokenRegex = new RegExp(`\\[${token}\\]`, 'gi');
      result = result.replace(tokenRegex, value);
    }
  });

  return result;
}

/**
 * Validate prompt template for common issues
 */
export function validatePromptTemplate(prompt: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for inconsistent token formats
  if (prompt.includes('"') && prompt.includes('[')) {
    issues.push('Mixed token formats detected');
    suggestions.push('Use consistent [TOKEN] format instead of "PLACEHOLDER"');
  }

  // Check for missing technical details
  if (!prompt.toLowerCase().includes('lighting')) {
    suggestions.push('Add lighting specifications (studio, natural, dramatic, etc.)');
  }

  if (!prompt.toLowerCase().includes('resolution') && !prompt.toLowerCase().includes('8k')) {
    suggestions.push('Specify resolution or quality level');
  }

  // Check for category-specific requirements
  if (prompt.toLowerCase().includes('action figure') && !prompt.toLowerCase().includes('packaging')) {
    suggestions.push('Add packaging details for action figures');
  }

  return { isValid: issues.length === 0, issues, suggestions };
}

/**
 * Build enhanced prompt with all optimizations
 */
export async function buildEnhancedPrompt(
  basePrompt: string,
  options: PromptBuildOptions
): Promise<string> {
  const {
    category,
    tokens = {},
    includeEnhancements = true,
    customEnhancements = [],
    technicalSpecs = true,
    aiEnhancement = false,
    tokenResolutionOptions = {},
    validateTokens: shouldValidateTokens = false,
    requiredTokenCategories = []
  } = options;

  let enhancedPrompt = basePrompt;

  // 1. Validate tokens if requested
  if (shouldValidateTokens) {
    const validation = validateTokens(enhancedPrompt, 'prompt');
    if (!validation.isValid) {
      console.warn('Token validation issues:', validation.invalidTokens);
      // Continue processing but log warnings
    }
  }

  // 2. Resolve tokens using the universal resolver
  const tokenResolution = resolveTokens(
    enhancedPrompt,
    tokens,
    { contentType: 'prompt', ...tokenResolutionOptions }
  );

  enhancedPrompt = tokenResolution.resolvedContent;

  // Log any token resolution warnings
  if (tokenResolution.warnings.length > 0) {
    console.warn('Token resolution warnings:', tokenResolution.warnings);
  }

  // 3. Add technical specifications
  if (technicalSpecs && TECHNICAL_SPECS[category as keyof typeof TECHNICAL_SPECS]) {
    const specs = TECHNICAL_SPECS[category as keyof typeof TECHNICAL_SPECS];
    enhancedPrompt += `. ${specs.resolution}, ${specs.lighting}, ${specs.camera}, ${specs.quality}, ${specs.composition}`;
  }

  // 4. Add category-specific enhancements
  if (includeEnhancements) {
    const enhancements = [
      ...CATEGORY_ENHANCEMENTS[category as keyof typeof CATEGORY_ENHANCEMENTS] || [],
      ...customEnhancements
    ];

    if (enhancements.length > 0) {
      enhancedPrompt += `. ${enhancements.join(', ')}`;
    }
  }

  // 5. AI enhancement (optional)
  if (aiEnhancement) {
    try {
      const aiEnhanced = await callGPT({
        messages: [
          {
            role: 'system',
            content: `You are a prompt engineering expert. Enhance this ${category} prompt while maintaining its core intent. Make it more detailed, professional, and optimized for high-quality AI image generation. Keep the enhancement concise and focused.`
          },
          {
            role: 'user',
            content: `Enhance this prompt: "${enhancedPrompt}"`
          }
        ],
        model: 'gpt-4o-mini',
        max_output_tokens: 200
      });

      if (aiEnhanced.text && aiEnhanced.text.length > enhancedPrompt.length * 0.8) {
        enhancedPrompt = aiEnhanced.text;
      }
    } catch (error) {
      console.warn('AI enhancement failed, using base prompt:', error);
    }
  }

  return enhancedPrompt;
}

/**
 * Create prompt template from existing data
 */
export function createPromptTemplate(
  id: string,
  category: string,
  name: string,
  basePrompt: string,
  additionalData?: {
    packaging?: string;
    preview?: string;
    additions?: string[];
    removals?: string[];
    poses?: string[];
  }
): PromptTemplate {
  const tokens = extractTokens(basePrompt);

  return {
    id,
    category,
    name,
    basePrompt,
    tokens,
    enhancements: CATEGORY_ENHANCEMENTS[category as keyof typeof CATEGORY_ENHANCEMENTS] || [],
    packaging: additionalData?.packaging,
    preview: additionalData?.preview
  };
}

/**
 * Get prompt suggestions for a category
 */
export function getPromptSuggestions(category: string): string[] {
  const enhancements = CATEGORY_ENHANCEMENTS[category as keyof typeof CATEGORY_ENHANCEMENTS] || [];
  const specs = TECHNICAL_SPECS[category as keyof typeof TECHNICAL_SPECS];

  const suggestions = [
    'Add specific lighting conditions',
    'Include camera angle specifications',
    'Specify art style or aesthetic',
    'Add environmental details',
    'Include mood or atmosphere descriptions'
  ];

  if (specs) {
    suggestions.push(`Use ${specs.resolution} for quality`);
    suggestions.push(`Consider ${specs.lighting} approach`);
  }

  if (enhancements.length > 0) {
    suggestions.push(`Incorporate ${enhancements[0]} for authenticity`);
  }

  return suggestions;
}

/**
 * Batch process multiple prompts
 */
export async function batchEnhancePrompts(
  prompts: Array<{ prompt: string; options: PromptBuildOptions }>
): Promise<string[]> {
  const results = await Promise.allSettled(
    prompts.map(({ prompt, options }) =>
      buildEnhancedPrompt(prompt, options)
    )
  );

  return results.map(result =>
    result.status === 'fulfilled' ? result.value : 'Error: Enhancement failed'
  );
}

export {
  TECHNICAL_SPECS,
  CATEGORY_ENHANCEMENTS,
  TOKEN_PATTERN,
  PLACEHOLDER_PATTERN
};