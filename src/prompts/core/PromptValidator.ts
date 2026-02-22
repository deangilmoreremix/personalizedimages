import type { PromptStyle } from '../types/PromptTypes';

export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  breakdown: {
    hasSubject: boolean;
    hasStyle: boolean;
    hasLighting: boolean;
    hasComposition: boolean;
    hasQuality: boolean;
    hasColor: boolean;
    hasMood: boolean;
  };
}

const CONFLICTING_PAIRS: [string, string][] = [
  ['photorealistic', 'cartoon'],
  ['photorealistic', 'anime'],
  ['photorealistic', 'pixel art'],
  ['minimalist', 'highly detailed'],
  ['monochrome', 'vibrant colors'],
  ['bright', 'dark moody'],
  ['2d flat', '3d render'],
  ['vector', 'oil painting'],
];

const VAGUE_TERMS = [
  'nice', 'good', 'beautiful', 'amazing', 'cool', 'awesome',
  'great', 'best', 'perfect', 'fantastic', 'wonderful',
];

const SUBJECT_PATTERNS = /\b(person|figure|character|object|product|scene|landscape|portrait|animal|building|car|robot|creature|woman|man|child|hero|villain|warrior|dragon|cat|dog)\b/i;
const STYLE_PATTERNS = /\b(style|aesthetic|art|photography|painting|illustration|render|sketch|cartoon|anime|ghibli|watercolor|pixel|vector|digital|oil|pencil|charcoal)\b/i;
const LIGHTING_PATTERNS = /\b(light|shadow|bright|dark|golden|ambient|rim|volumetric|neon|glow|backlit|sunset|sunrise|overcast|studio|dramatic|soft|harsh|natural)\b/i;
const COMPOSITION_PATTERNS = /\b(composition|frame|angle|perspective|centered|close-up|wide|macro|overhead|eye-level|bird.?s eye|worm.?s eye|rule of thirds|symmetr|asymmetr)\b/i;
const QUALITY_PATTERNS = /\b(detailed|quality|resolution|4k|8k|hd|professional|masterpiece|ultra|crisp|sharp|precise)\b/i;
const COLOR_PATTERNS = /\b(color|palette|vibrant|muted|warm|cool|monochrome|tone|hue|saturated|pastel|neon|earth tone|complementary)\b/i;
const MOOD_PATTERNS = /\b(mood|atmosphere|feeling|emotion|dramatic|serene|energetic|melancholy|joyful|mysterious|eerie|peaceful|chaotic|tense|calm|epic|intimate)\b/i;

export function validatePrompt(prompt: string, style?: PromptStyle): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const lower = prompt.toLowerCase();

  if (!prompt.trim()) {
    return {
      isValid: false,
      score: 0,
      errors: ['Prompt is empty'],
      warnings: [],
      suggestions: ['Start by describing what you want to see in the image'],
      breakdown: {
        hasSubject: false, hasStyle: false, hasLighting: false,
        hasComposition: false, hasQuality: false, hasColor: false, hasMood: false,
      },
    };
  }

  if (prompt.trim().length < 10) {
    errors.push('Prompt is too short for reliable results');
  }

  if (prompt.length > 3000) {
    warnings.push('Prompt is very long -- some models may truncate it');
  }

  for (const [a, b] of CONFLICTING_PAIRS) {
    if (lower.includes(a) && lower.includes(b)) {
      warnings.push(`Conflicting styles: "${a}" and "${b}"`);
    }
  }

  for (const term of VAGUE_TERMS) {
    if (new RegExp(`\\b${term}\\b`, 'i').test(lower)) {
      warnings.push(`"${term}" is vague -- replace with specific visual descriptors`);
      break;
    }
  }

  const breakdown = {
    hasSubject: SUBJECT_PATTERNS.test(lower),
    hasStyle: STYLE_PATTERNS.test(lower) || !!style,
    hasLighting: LIGHTING_PATTERNS.test(lower),
    hasComposition: COMPOSITION_PATTERNS.test(lower),
    hasQuality: QUALITY_PATTERNS.test(lower),
    hasColor: COLOR_PATTERNS.test(lower),
    hasMood: MOOD_PATTERNS.test(lower),
  };

  if (!breakdown.hasSubject) suggestions.push('Add a clear subject (person, object, scene, etc.)');
  if (!breakdown.hasStyle) suggestions.push('Specify an art style (photograph, illustration, anime, etc.)');
  if (!breakdown.hasLighting) suggestions.push('Describe lighting (natural, studio, dramatic, golden hour, etc.)');
  if (!breakdown.hasComposition) suggestions.push('Add composition details (close-up, wide angle, centered, etc.)');
  if (!breakdown.hasQuality) suggestions.push('Include quality modifiers (detailed, professional, 4K, etc.)');
  if (!breakdown.hasColor) suggestions.push('Mention color palette (vibrant, muted, warm tones, etc.)');

  let score = 20;
  const wordCount = prompt.split(/\s+/).length;
  if (wordCount >= 8) score += 5;
  if (wordCount >= 15) score += 5;
  if (breakdown.hasSubject) score += 15;
  if (breakdown.hasStyle) score += 15;
  if (breakdown.hasLighting) score += 12;
  if (breakdown.hasComposition) score += 10;
  if (breakdown.hasQuality) score += 8;
  if (breakdown.hasColor) score += 8;
  if (breakdown.hasMood) score += 7;
  score -= warnings.length * 3;
  score -= errors.length * 10;
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    suggestions,
    breakdown,
  };
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-600' };
  if (score >= 70) return { label: 'Good', color: 'text-teal-600' };
  if (score >= 50) return { label: 'Fair', color: 'text-amber-600' };
  if (score >= 30) return { label: 'Needs Work', color: 'text-orange-600' };
  return { label: 'Poor', color: 'text-red-600' };
}
