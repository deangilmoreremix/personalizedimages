import { useState, useCallback } from 'react';
import { TokenData } from '../components/ui/DraggableToken';

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

  // Apply token to image
  const applyTokenToImage = useCallback((imageId: string, token: TokenData, position?: { x: number; y: number }) => {
    const effect = generateTokenEffect(token, position);

    const appliedToken: AppliedToken = {
      id: `${token.id}_${Date.now()}`,
      token,
      position,
      appliedAt: new Date(),
      effect
    };

    setAppliedTokens(prev => ({
      ...prev,
      [imageId]: [...(prev[imageId] || []), appliedToken]
    }));

    onTokenApplied?.(imageId, appliedToken);

    // Simulate processing delay for UI feedback
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // In a real implementation, this would apply the effect to the image
        console.log(`Applied ${token.type} effect to image ${imageId}:`, effect);
        resolve();
      }, 1500);
    });
  }, [generateTokenEffect, onTokenApplied]);

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