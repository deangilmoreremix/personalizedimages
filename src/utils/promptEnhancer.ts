import { TECHNICAL_SPECS, CATEGORY_ENHANCEMENTS } from './promptBuilder';

export type ImageType =
  | 'photograph'
  | 'illustration'
  | '3d-render'
  | 'digital-art'
  | 'oil-painting'
  | 'watercolor'
  | 'vector'
  | 'pixel-art'
  | 'sketch'
  | 'anime';

export type GeneratorCategory =
  | 'ai-image'
  | 'action-figure'
  | 'ghibli'
  | 'cartoon'
  | 'meme'
  | 'video'
  | 'musicStar'
  | 'retro'
  | 'tvShow'
  | 'wrestling';

export interface EnhancementOptions {
  category: GeneratorCategory;
  imageType?: ImageType;
  quality?: 'standard' | 'high' | 'ultra';
  negativePrompt?: boolean;
  technicalSpecs?: boolean;
  styleDescriptors?: boolean;
  compositionGuidance?: boolean;
}

export interface EnhancementResult {
  original: string;
  enhanced: string;
  negativePrompt: string;
  keyImprovements: string[];
  expectedResult: string;
  qualityScore: number;
  detectedImageType: ImageType;
  warnings: string[];
}

const IMAGE_TYPE_KEYWORDS: Record<ImageType, string[]> = {
  'photograph': ['photo', 'photograph', 'camera', 'dslr', 'lens', 'portrait', 'headshot', 'candid'],
  'illustration': ['illustration', 'illustrate', 'draw', 'graphic', 'editorial'],
  '3d-render': ['3d', 'render', 'blender', 'cgi', 'unreal engine', 'octane'],
  'digital-art': ['digital art', 'concept art', 'digital painting', 'artstation'],
  'oil-painting': ['oil painting', 'brush strokes', 'canvas', 'impressionist'],
  'watercolor': ['watercolor', 'watercolour', 'wash', 'wet media'],
  'vector': ['vector', 'flat design', 'svg', 'geometric'],
  'pixel-art': ['pixel', '8-bit', '16-bit', 'retro game'],
  'sketch': ['sketch', 'pencil', 'charcoal', 'line drawing', 'hand-drawn'],
  'anime': ['anime', 'manga', 'cel-shaded', 'japanese animation'],
};

const STYLE_DESCRIPTORS: Record<ImageType, string> = {
  'photograph': 'photorealistic, shot on Canon EOS R5, professional photography',
  'illustration': 'detailed illustration, clean line work, professional editorial quality',
  '3d-render': '3D rendered, physically based rendering, detailed materials and textures',
  'digital-art': 'digital painting, concept art quality, trending on ArtStation',
  'oil-painting': 'oil on canvas, visible brush strokes, rich color depth',
  'watercolor': 'watercolor on cold-pressed paper, soft washes, organic bleeding edges',
  'vector': 'clean vector illustration, flat design, crisp edges, minimal gradients',
  'pixel-art': 'pixel art, limited color palette, clean pixel placement, retro aesthetic',
  'sketch': 'detailed pencil sketch, fine cross-hatching, tonal value range',
  'anime': 'anime style, cel-shaded, vibrant colors, expressive character design',
};

const QUALITY_MODIFIERS: Record<string, string> = {
  'standard': 'high quality, well-composed',
  'high': 'highly detailed, professional quality, 4K resolution',
  'ultra': 'masterpiece quality, ultra-detailed, 8K resolution, award-winning',
};

const LIGHTING_TEMPLATES: Record<ImageType, string> = {
  'photograph': 'natural golden hour lighting with soft fill',
  'illustration': 'balanced lighting with clear value structure',
  '3d-render': 'three-point studio lighting with ambient occlusion',
  'digital-art': 'dramatic volumetric lighting with color grading',
  'oil-painting': 'chiaroscuro lighting with warm color temperature',
  'watercolor': 'soft diffused natural light',
  'vector': 'flat lighting with subtle drop shadows',
  'pixel-art': 'pixel-consistent lighting direction',
  'sketch': 'single directional light source for clear shadows',
  'anime': 'rim lighting with vibrant color highlights',
};

const COMPOSITION_GUIDANCE: Record<string, string> = {
  'portrait': 'rule of thirds, eye-level camera angle, shallow depth of field',
  'landscape': 'wide angle, leading lines, foreground interest, atmospheric perspective',
  'product': 'centered composition, clean background, even lighting, slight angle',
  'scene': 'dynamic composition, depth layers, visual focal point',
  'character': 'full body framing, balanced pose, environmental context',
  'abstract': 'asymmetric balance, color harmony, visual rhythm',
};

const CATEGORY_TO_SPEC_KEY: Record<string, string> = {
  'action-figure': 'actionFigure',
  'ghibli': 'ghibli',
  'cartoon': 'cartoon',
  'meme': 'meme',
  'musicStar': 'musicStar',
  'retro': 'retro',
  'tvShow': 'tvShow',
  'wrestling': 'wrestling',
};

const NEGATIVE_PROMPTS: Record<string, string[]> = {
  universal: [
    'blurry', 'low quality', 'distorted', 'deformed', 'watermark', 'signature',
    'ugly', 'poorly drawn', 'bad anatomy', 'disfigured', 'out of frame',
  ],
  'photograph': ['cartoon', 'illustration', 'painting', 'drawing', 'anime', 'cgi'],
  'illustration': ['photorealistic', 'photograph', 'blurry', '3d render'],
  '3d-render': ['flat', '2d', 'hand-drawn', 'sketch', 'watercolor'],
  'cartoon': ['photorealistic', 'photograph', 'hyper-realistic', '3d render'],
  'anime': ['western cartoon', 'photorealistic', 'oil painting'],
  'action-figure': ['broken plastic', 'damaged packaging', 'poor sculpt', 'missing limbs'],
  'meme': ['small text', 'unreadable text', 'low contrast', 'blurry background'],
};

function detectImageType(prompt: string, category: GeneratorCategory): ImageType {
  const lower = prompt.toLowerCase();

  for (const [type, keywords] of Object.entries(IMAGE_TYPE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return type as ImageType;
    }
  }

  const categoryDefaults: Record<GeneratorCategory, ImageType> = {
    'ai-image': 'digital-art',
    'action-figure': 'photograph',
    'ghibli': 'watercolor',
    'cartoon': 'illustration',
    'meme': 'digital-art',
    'video': 'digital-art',
    'musicStar': 'photograph',
    'retro': 'photograph',
    'tvShow': 'photograph',
    'wrestling': 'photograph',
  };

  return categoryDefaults[category] || 'digital-art';
}

function detectCompositionType(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (/portrait|face|headshot|person/.test(lower)) return 'portrait';
  if (/landscape|scenery|vista|nature|mountain|ocean/.test(lower)) return 'landscape';
  if (/product|packaging|toy|figure.*box|blister/.test(lower)) return 'product';
  if (/character|hero|villain|warrior/.test(lower)) return 'character';
  if (/abstract|pattern|texture|geometric/.test(lower)) return 'abstract';
  return 'scene';
}

function scorePromptQuality(prompt: string): { score: number; missing: string[] } {
  const lower = prompt.toLowerCase();
  let score = 30;
  const missing: string[] = [];

  if (prompt.split(/\s+/).length >= 10) score += 10;
  if (prompt.split(/\s+/).length >= 20) score += 5;

  if (/\b(style|aesthetic|look|art|design)\b/i.test(lower)) {
    score += 15;
  } else {
    missing.push('style/aesthetic');
  }

  if (/\b(light|shadow|bright|dark|golden|glow|ambient|rim|volumetric)\b/i.test(lower)) {
    score += 15;
  } else {
    missing.push('lighting');
  }

  if (/\b(composition|frame|angle|perspective|centered|rule of thirds)\b/i.test(lower)) {
    score += 10;
  } else {
    missing.push('composition');
  }

  if (/\b(detailed|quality|resolution|4k|8k|hd|professional)\b/i.test(lower)) {
    score += 10;
  } else {
    missing.push('quality indicator');
  }

  if (/\b(color|palette|vibrant|muted|warm|cool|monochrome|tone)\b/i.test(lower)) {
    score += 10;
  } else {
    missing.push('color direction');
  }

  if (/\b(mood|atmosphere|feeling|emotion|dramatic|serene|energetic)\b/i.test(lower)) {
    score += 5;
  }

  return { score: Math.min(score, 100), missing };
}

function buildNegativePrompt(imageType: ImageType, category: GeneratorCategory): string {
  const parts = [...NEGATIVE_PROMPTS.universal];

  if (NEGATIVE_PROMPTS[imageType]) {
    parts.push(...NEGATIVE_PROMPTS[imageType]);
  }

  const catKey = category as string;
  if (NEGATIVE_PROMPTS[catKey]) {
    parts.push(...NEGATIVE_PROMPTS[catKey]);
  }

  return [...new Set(parts)].join(', ');
}

function buildExpectedResult(prompt: string, imageType: ImageType, category: GeneratorCategory): string {
  const compositionType = detectCompositionType(prompt);
  const subject = prompt.split(/[.,!?]/)[0].trim();
  const truncated = subject.length > 60 ? subject.slice(0, 60) + '...' : subject;

  const styleLabel = category === 'ghibli'
    ? 'Studio Ghibli'
    : category === 'cartoon'
      ? 'cartoon'
      : 'professional';

  return `A ${imageType.replace('-', ' ')} ${compositionType} depicting "${truncated}" with ${styleLabel} styling, consistent quality and well-defined composition.`;
}

export function enhancePrompt(
  prompt: string,
  options: EnhancementOptions
): EnhancementResult {
  const {
    category,
    quality = 'high',
    negativePrompt: includeNegative = true,
    technicalSpecs = true,
    styleDescriptors = true,
    compositionGuidance = true,
  } = options;

  const imageType = options.imageType || detectImageType(prompt, category);
  const compositionType = detectCompositionType(prompt);
  const { score: _originalScore, missing } = scorePromptQuality(prompt);

  const improvements: string[] = [];
  const warnings: string[] = [];
  const parts: string[] = [prompt.trim()];

  if (prompt.trim().length < 10) {
    warnings.push('Prompt is very short -- results may be unpredictable');
  }

  if (prompt.length > 2000) {
    warnings.push('Prompt exceeds recommended length -- consider simplifying');
  }

  if (styleDescriptors && !prompt.toLowerCase().includes(imageType.replace('-', ' '))) {
    parts.push(STYLE_DESCRIPTORS[imageType]);
    improvements.push(`Added ${imageType} style descriptors`);
  }

  if (technicalSpecs) {
    const specKey = CATEGORY_TO_SPEC_KEY[category];
    if (specKey && TECHNICAL_SPECS[specKey as keyof typeof TECHNICAL_SPECS]) {
      const specs = TECHNICAL_SPECS[specKey as keyof typeof TECHNICAL_SPECS];
      if (!prompt.toLowerCase().includes('lighting') && !prompt.toLowerCase().includes('light')) {
        parts.push(specs.lighting);
        improvements.push('Added category-specific lighting');
      }
      if (!prompt.toLowerCase().includes('resolution') && !prompt.toLowerCase().includes('quality')) {
        parts.push(specs.resolution);
        improvements.push('Added resolution/quality spec');
      }
    } else if (missing.includes('lighting')) {
      parts.push(LIGHTING_TEMPLATES[imageType]);
      improvements.push(`Added ${imageType}-appropriate lighting`);
    }
  }

  const qualityMod = QUALITY_MODIFIERS[quality];
  if (qualityMod && !prompt.toLowerCase().includes('quality') && !prompt.toLowerCase().includes('resolution')) {
    parts.push(qualityMod);
    improvements.push(`Applied "${quality}" quality tier`);
  }

  if (compositionGuidance && COMPOSITION_GUIDANCE[compositionType]) {
    const lower = prompt.toLowerCase();
    if (!lower.includes('composition') && !lower.includes('angle') && !lower.includes('frame')) {
      parts.push(COMPOSITION_GUIDANCE[compositionType]);
      improvements.push(`Added ${compositionType} composition guidance`);
    }
  }

  const catKey = CATEGORY_TO_SPEC_KEY[category];
  if (catKey && CATEGORY_ENHANCEMENTS[catKey as keyof typeof CATEGORY_ENHANCEMENTS]) {
    const enhancements = CATEGORY_ENHANCEMENTS[catKey as keyof typeof CATEGORY_ENHANCEMENTS];
    const lower = prompt.toLowerCase();
    const newEnhancements = enhancements.filter(
      (e: string) => !lower.includes(e.toLowerCase().split(',')[0])
    );
    if (newEnhancements.length > 0) {
      parts.push(newEnhancements.slice(0, 3).join(', '));
      improvements.push(`Added ${category}-specific enhancements`);
    }
  }

  const enhanced = parts.join('. ').replace(/\.\s*\./g, '.').replace(/,\s*\./g, '.').trim();
  const { score: enhancedScore } = scorePromptQuality(enhanced);
  const negativeText = includeNegative ? buildNegativePrompt(imageType, category) : '';

  return {
    original: prompt,
    enhanced,
    negativePrompt: negativeText,
    keyImprovements: improvements,
    expectedResult: buildExpectedResult(prompt, imageType, category),
    qualityScore: enhancedScore,
    detectedImageType: imageType,
    warnings,
  };
}

export function quickEnhance(prompt: string, category: GeneratorCategory): string {
  const result = enhancePrompt(prompt, {
    category,
    quality: 'high',
    negativePrompt: false,
    technicalSpecs: true,
    styleDescriptors: true,
    compositionGuidance: true,
  });
  return result.enhanced;
}

const TOKEN_PLACEHOLDER_RE = /(\{[A-Z_]+\}|\[[A-Z_]+\]|__[A-Z_]+__|%[A-Z_]+%)/g;

export function enhanceWithTokenPreservation(
  prompt: string,
  category: GeneratorCategory,
  tokenValues: Record<string, string>
): { enhanced: string; resolvedTokens: string[]; warnings: string[] } {
  const placeholderMap = new Map<string, string>();
  let counter = 0;

  const stripped = prompt.replace(TOKEN_PLACEHOLDER_RE, (match) => {
    const id = `__TKNPH${counter++}__`;
    placeholderMap.set(id, match);
    return id;
  });

  const enhanced = quickEnhance(stripped, category);

  let resolved = enhanced;
  const resolvedTokens: string[] = [];
  const warnings: string[] = [];

  placeholderMap.forEach((original, placeholder) => {
    const tokenKey = original.replace(/^[\[{%_]+|[\]}%_]+$/g, '');
    const value = tokenValues[tokenKey];

    if (value) {
      resolved = resolved.replace(placeholder, value);
      resolvedTokens.push(tokenKey);
    } else {
      resolved = resolved.replace(placeholder, original);
      warnings.push(`Unresolved token: ${tokenKey}`);
    }
  });

  return { enhanced: resolved, resolvedTokens, warnings };
}

export function getImageTypeOptions(): { value: ImageType; label: string }[] {
  return [
    { value: 'photograph', label: 'Photograph' },
    { value: 'illustration', label: 'Illustration' },
    { value: '3d-render', label: '3D Render' },
    { value: 'digital-art', label: 'Digital Art' },
    { value: 'oil-painting', label: 'Oil Painting' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'vector', label: 'Vector' },
    { value: 'pixel-art', label: 'Pixel Art' },
    { value: 'sketch', label: 'Sketch' },
    { value: 'anime', label: 'Anime' },
  ];
}

export { detectImageType, detectCompositionType, scorePromptQuality };
