/**
 * Image Replacement Utility
 *
 * Provides functions to replace image URLs in the application with custom URLs.
 * Supports batch updates, validation, and JSON import/export.
 */

import {
  ImageAsset,
  allImageAssets,
  getImageAsset,
  updateImageUrl
} from '../constants/imageAssets';

export interface ImageReplacement {
  section: string;
  slot: string;
  url: string;
  description?: string;
}

export interface BulkReplacementResult {
  success: number;
  failed: number;
  errors: Array<{
    section: string;
    slot: string;
    error: string;
  }>;
}

/**
 * Validate if a URL is properly formatted
 */
export function validateImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check if it's a valid URL or local path
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Check if it's a relative path with valid image extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return validExtensions.some(ext => url.toLowerCase().endsWith(ext));
}

/**
 * Replace a single image URL
 */
export function replaceSingleImage(
  section: string,
  slot: string,
  newUrl: string
): boolean {
  if (!validateImageUrl(newUrl)) {
    console.error(`Invalid URL format: ${newUrl}`);
    return false;
  }

  return updateImageUrl(section, slot, newUrl);
}

/**
 * Replace multiple images at once
 */
export function replaceMultipleImages(
  replacements: ImageReplacement[]
): BulkReplacementResult {
  const result: BulkReplacementResult = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const replacement of replacements) {
    try {
      if (!validateImageUrl(replacement.url)) {
        result.failed++;
        result.errors.push({
          section: replacement.section,
          slot: replacement.slot,
          error: `Invalid URL format: ${replacement.url}`
        });
        continue;
      }

      const success = updateImageUrl(
        replacement.section,
        replacement.slot,
        replacement.url
      );

      if (success) {
        result.success++;
      } else {
        result.failed++;
        result.errors.push({
          section: replacement.section,
          slot: replacement.slot,
          error: 'Image asset not found'
        });
      }
    } catch (error) {
      result.failed++;
      result.errors.push({
        section: replacement.section,
        slot: replacement.slot,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return result;
}

/**
 * Load replacements from JSON file
 */
export async function loadReplacementsFromJson(
  jsonData: { replacements: ImageReplacement[] }
): Promise<BulkReplacementResult> {
  if (!jsonData || !Array.isArray(jsonData.replacements)) {
    throw new Error('Invalid JSON format. Expected { replacements: [...] }');
  }

  return replaceMultipleImages(jsonData.replacements);
}

/**
 * Export current image configuration
 */
export function exportImageConfiguration(): ImageAsset[] {
  return allImageAssets.map(asset => ({
    ...asset
  }));
}

/**
 * Generate a replacement template with empty URLs
 */
export function generateReplacementTemplate(): {
  replacements: Array<{
    section: string;
    slot: string;
    currentUrl: string;
    description: string;
    url: string;
  }>;
} {
  return {
    replacements: allImageAssets.map(asset => ({
      section: asset.section,
      slot: asset.slot,
      currentUrl: asset.currentUrl || asset.url,
      description: asset.description,
      url: '' // To be filled by user
    }))
  };
}

/**
 * Get images by section
 */
export function getImagesBySection(section: string): ImageAsset[] {
  return allImageAssets.filter(asset => asset.section === section);
}

/**
 * Get images by priority
 */
export function getImagesByPriority(priority: 'high' | 'medium' | 'low'): ImageAsset[] {
  return allImageAssets.filter(asset => {
    // Priority is not directly in the ImageAsset type,
    // but we can infer it from the section
    if (priority === 'high') {
      return asset.section === 'hero' ||
             asset.section === 'action-figures' ||
             asset.section === 'action-figure-carousel';
    }
    return true; // Return all for medium/low
  });
}

/**
 * Search images by description
 */
export function searchImages(query: string): ImageAsset[] {
  const lowerQuery = query.toLowerCase();
  return allImageAssets.filter(asset =>
    asset.description.toLowerCase().includes(lowerQuery) ||
    asset.alt.toLowerCase().includes(lowerQuery) ||
    asset.section.toLowerCase().includes(lowerQuery) ||
    asset.slot.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get image statistics
 */
export function getImageStats(): {
  total: number;
  bySections: Record<string, number>;
  byDimensions: Record<string, number>;
} {
  const stats = {
    total: allImageAssets.length,
    bySections: {} as Record<string, number>,
    byDimensions: {} as Record<string, number>
  };

  for (const asset of allImageAssets) {
    // Count by section
    stats.bySections[asset.section] = (stats.bySections[asset.section] || 0) + 1;

    // Count by dimensions
    stats.byDimensions[asset.dimensions] = (stats.byDimensions[asset.dimensions] || 0) + 1;
  }

  return stats;
}

/**
 * Validate all image URLs in the system
 */
export function validateAllImages(): Array<{
  section: string;
  slot: string;
  url: string;
  isValid: boolean;
  error?: string;
}> {
  return allImageAssets.map(asset => {
    const isValid = validateImageUrl(asset.url);
    return {
      section: asset.section,
      slot: asset.slot,
      url: asset.url,
      isValid,
      error: isValid ? undefined : 'Invalid URL format'
    };
  });
}

/**
 * Example usage for replacing images with custom URLs
 */
export const exampleReplacements: ImageReplacement[] = [
  {
    section: 'action-figures',
    slot: 'classic_blister',
    url: '01_Classic_Action_Figure_Modern_Glassmorphism.png',
    description: 'Custom classic blister pack design'
  },
  {
    section: 'hero',
    slot: 'main_image',
    url: 'https://cdn1.genspark.ai/user-upload-image/gemini_generated/hero-ai-studio.png',
    description: 'Custom hero section image'
  }
  // Add more replacements as needed
];

/**
 * Helper to convert local filename to CDN URL
 */
export function convertToFullUrl(
  filename: string,
  baseCdnUrl = 'https://cdn1.genspark.ai/user-upload-image/gemini_generated/'
): string {
  // If already a full URL, return as-is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  // If it's a local filename, prepend CDN URL
  return `${baseCdnUrl}${filename}`;
}

/**
 * Batch replace with description matching
 * Matches images based on description keywords
 */
export function replaceByDescriptionMatch(
  customImages: Array<{
    description: string;
    url: string;
  }>
): BulkReplacementResult {
  const replacements: ImageReplacement[] = [];

  for (const customImage of customImages) {
    // Find matching images by description
    const matches = searchImages(customImage.description);

    if (matches.length > 0) {
      // Use the first match
      const match = matches[0];
      replacements.push({
        section: match.section,
        slot: match.slot,
        url: customImage.url,
        description: customImage.description
      });
    }
  }

  return replaceMultipleImages(replacements);
}

export default {
  validateImageUrl,
  replaceSingleImage,
  replaceMultipleImages,
  loadReplacementsFromJson,
  exportImageConfiguration,
  generateReplacementTemplate,
  getImagesBySection,
  getImagesByPriority,
  searchImages,
  getImageStats,
  validateAllImages,
  convertToFullUrl,
  replaceByDescriptionMatch,
  exampleReplacements
};
