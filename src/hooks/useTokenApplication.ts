import { useState, useCallback } from 'react';
import { TokenData } from '../components/ui/DraggableToken';
import { generateImage } from '../utils/api/image/generation';
import { ImageGenerationRequest } from '../utils/api/core/types';

export interface AppliedToken {
  id: string;
  token: TokenData;
  position?: { x: number; y: number };
  appliedAt: Date;
  effect: TokenEffect;
}

export interface TokenEffect {
  type: 'text-overlay' | 'filter' | 'style' | 'color-adjustment' | 'transformation';
  parameters: Record<string, any>;
  preview?: string;
}

interface UseTokenApplicationProps {
  onTokenApplied?: (imageId: string, appliedToken: AppliedToken) => void;
  onTokenRemoved?: (imageId: string, tokenId: string) => void;
}

export const useTokenApplication = ({
  onTokenApplied,
  onTokenRemoved
}: UseTokenApplicationProps = {}) => {
  const [appliedTokens, setAppliedTokens] = useState<Record<string, AppliedToken[]>>({});

  // Generate effect based on token type
  const generateTokenEffect = useCallback((token: TokenData, position?: { x: number; y: number }): TokenEffect => {
    switch (token.type) {
      case 'text':
        return {
          type: 'text-overlay',
          parameters: {
            text: token.value,
            position: position || { x: 50, y: 50 },
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeWidth: 2,
            fontFamily: 'Arial',
            textAlign: 'center'
          }
        };

      case 'filter':
        return {
          type: 'filter',
          parameters: {
            filterType: token.key.toLowerCase().replace('filter_', ''),
            intensity: 0.7,
            blendMode: 'multiply'
          }
        };

      case 'style':
        return {
          type: 'style',
          parameters: {
            stylePrompt: token.value,
            strength: 0.8,
            preserveComposition: true
          }
        };

      case 'color':
        return {
          type: 'color-adjustment',
          parameters: {
            color: token.value,
            adjustmentType: 'tint',
            opacity: 0.3
          }
        };

      default:
        return {
          type: 'text-overlay',
          parameters: {
            text: `${token.displayName}: ${token.value}`,
            position: position || { x: 10, y: 10 },
            fontSize: 16,
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 8,
            borderRadius: 4
          }
        };
    }
  }, []);

  // Generate prompt that includes token effect
  const generateTokenPrompt = useCallback((appliedToken: AppliedToken, basePrompt?: string): string => {
    const { token, effect } = appliedToken;
    let prompt = basePrompt || 'Apply the following effect to an image';

    switch (effect.type) {
      case 'text-overlay':
        prompt += `. Add the text "${effect.parameters.text}" at position (${effect.parameters.position.x}%, ${effect.parameters.position.y}%) with ${effect.parameters.fontSize}px ${effect.parameters.fontFamily} font in ${effect.parameters.color} color`;
        if (effect.parameters.strokeWidth > 0) {
          prompt += ` with ${effect.parameters.strokeWidth}px ${effect.parameters.stroke} outline`;
        }
        break;

      case 'filter':
        prompt += `. Apply a ${effect.parameters.filterType} filter with ${Math.round(effect.parameters.intensity * 100)}% intensity using ${effect.parameters.blendMode} blend mode`;
        break;

      case 'style':
        prompt += `. Transform the image with ${effect.parameters.stylePrompt} style at ${Math.round(effect.parameters.strength * 100)}% strength`;
        if (effect.parameters.preserveComposition) {
          prompt += ', preserving the original composition';
        }
        break;

      case 'color-adjustment':
        prompt += `. Apply ${effect.parameters.adjustmentType} with ${effect.parameters.color} color at ${Math.round(effect.parameters.opacity * 100)}% opacity`;
        break;

      default:
        prompt += `. Apply ${token.displayName} effect: ${token.value}`;
    }

    return prompt;
  }, []);

  // Apply token to image
  const applyTokenToImage = useCallback(async (imageId: string, token: TokenData, position?: { x: number; y: number }) => {
    const effect = generateTokenEffect(token, position);

    const appliedToken: AppliedToken = {
      id: `${token.id}_${Date.now()}`,
      token,
      position,
      appliedAt: new Date(),
      effect
    };

    // Add token to state immediately for UI feedback
    setAppliedTokens(prev => ({
      ...prev,
      [imageId]: [...(prev[imageId] || []), appliedToken]
    }));

    onTokenApplied?.(imageId, appliedToken);

    try {
      // Generate a prompt that describes applying the token effect
      const tokenPrompt = generateTokenPrompt(appliedToken);

      console.log(`Applying ${token.type} effect to image ${imageId}:`, effect);

      // Call the unified API to apply the token effect
      const result = await generateImage(tokenPrompt, {
        provider: 'gemini', // Default to Gemini for token processing
        appliedTokens: [appliedToken] // Pass the applied token for backend processing
      });

      if (result.success && result.imageUrl) {
        console.log(`Token applied successfully, new image URL: ${result.imageUrl}`);
        return result.imageUrl;
      } else {
        throw new Error(result.error || 'Failed to apply token effect');
      }
    } catch (error) {
      console.error('Failed to apply token:', error);
      // Remove the token from state if application failed
      setAppliedTokens(prev => {
        const imageTokens = prev[imageId] || [];
        const filteredTokens = imageTokens.filter(t => t.id !== appliedToken.id);

        if (filteredTokens.length === 0) {
          const { [imageId]: removed, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [imageId]: filteredTokens
        };
      });
      throw error;
    }
  }, [generateTokenEffect, generateTokenPrompt, onTokenApplied]);

  // Remove token from image
  const removeTokenFromImage = useCallback((imageId: string, tokenId: string) => {
    setAppliedTokens(prev => {
      const imageTokens = prev[imageId] || [];
      const filteredTokens = imageTokens.filter(t => t.id !== tokenId);

      if (filteredTokens.length === 0) {
        const { [imageId]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [imageId]: filteredTokens
      };
    });

    onTokenRemoved?.(imageId, tokenId);
  }, [onTokenRemoved]);

  // Get applied tokens for image
  const getAppliedTokens = useCallback((imageId: string): AppliedToken[] => {
    return appliedTokens[imageId] || [];
  }, [appliedTokens]);

  // Clear all tokens from image
  const clearTokensFromImage = useCallback((imageId: string) => {
    setAppliedTokens(prev => {
      const { [imageId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // Export image with applied effects
  const exportImageWithEffects = useCallback(async (imageId: string, originalImageUrl: string) => {
    const tokens = getAppliedTokens(imageId);

    if (tokens.length === 0) {
      // No effects applied, return original
      return originalImageUrl;
    }

    // In a real implementation, this would:
    // 1. Load the original image
    // 2. Apply each effect in sequence
    // 3. Return the processed image URL

    console.log(`Exporting image ${imageId} with ${tokens.length} effects:`, tokens);

    // Simulate processing
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        // For now, return the original image
        // In production, this would return the processed image
        resolve(originalImageUrl);
      }, 2000);
    });
  }, [getAppliedTokens]);

  // Get effect preview for token
  const getTokenPreview = useCallback((token: TokenData): string => {
    // Generate a preview description of what the effect will do
    switch (token.type) {
      case 'text':
        return `Add "${token.value}" as text overlay`;
      case 'filter':
        return `Apply ${token.displayName.toLowerCase()} filter`;
      case 'style':
        return `Apply ${token.displayName.toLowerCase()} style`;
      case 'color':
        return `Apply ${token.value} color adjustment`;
      default:
        return `Apply ${token.displayName} effect`;
    }
  }, []);

  return {
    appliedTokens,
    applyTokenToImage,
    removeTokenFromImage,
    getAppliedTokens,
    clearTokensFromImage,
    exportImageWithEffects,
    getTokenPreview
  };
};