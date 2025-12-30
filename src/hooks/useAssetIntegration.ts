import { useState, useCallback } from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { Asset } from '../contexts/AssetContext';

export type ToolType =
  | 'image-generator'
  | 'video-creator'
  | 'email-editor'
  | 'social-media'
  | 'presentation'
  | 'website-builder'
  | 'print-design'
  | 'marketing-assets';

export interface AssetIntegrationOptions {
  toolType: ToolType;
  preferredTypes?: Asset['type'][];
  allowMultiSelect?: boolean;
  maxSelection?: number;
  autoTrackUsage?: boolean;
}

export interface AssetIntegrationResult {
  selectedAsset: Asset | null;
  selectedAssets: Asset[];
  isAssetPickerOpen: boolean;
  openAssetPicker: () => void;
  closeAssetPicker: () => void;
  integrateAsset: (asset: Asset, targetElement?: string) => Promise<any>;
  integrateMultipleAssets: (assets: Asset[], targetElements?: string[]) => Promise<any>;
  clearSelection: () => void;
  getRecommendedAssets: (context?: string) => Promise<Asset[]>;
}

export const useAssetIntegration = (options: AssetIntegrationOptions): AssetIntegrationResult => {
  const {
    getAssetById,
    trackAssetUsage,
    addToUserLibrary,
    searchAssets
  } = useAssetContext();

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);

  const openAssetPicker = useCallback(() => {
    setIsAssetPickerOpen(true);
  }, []);

  const closeAssetPicker = useCallback(() => {
    setIsAssetPickerOpen(false);
  }, []);

  const integrateAsset = useCallback(async (asset: Asset, targetElement?: string) => {
    try {
      // Track usage if enabled
      if (options.autoTrackUsage !== false) {
        await trackAssetUsage(asset.id, options.toolType, 'integrated');
      }

      // Add to user library if not already there
      const userAsset = getAssetById(`user-${asset.id}`);
      if (!userAsset) {
        await addToUserLibrary(asset);
      }

      // Set as selected asset
      setSelectedAsset(asset);

      // Return asset in tool-specific format
      return formatAssetForTool(asset, options.toolType, targetElement);
    } catch (error) {
      console.error('Failed to integrate asset:', error);
      throw error;
    }
  }, [options.toolType, options.autoTrackUsage, trackAssetUsage, addToUserLibrary, getAssetById]);

  const integrateMultipleAssets = useCallback(async (assets: Asset[], targetElements?: string[]) => {
    try {
      const integrationPromises = assets.map((asset, index) =>
        integrateAsset(asset, targetElements?.[index])
      );

      const results = await Promise.all(integrationPromises);
      setSelectedAssets(assets);

      return results;
    } catch (error) {
      console.error('Failed to integrate multiple assets:', error);
      throw error;
    }
  }, [integrateAsset]);

  const clearSelection = useCallback(() => {
    setSelectedAsset(null);
    setSelectedAssets([]);
  }, []);

  const getRecommendedAssets = useCallback(async (context?: string) => {
    try {
      // Get assets based on tool type and context
      const recommendations = await searchAssets({
        type: options.preferredTypes?.[0] || 'image',
        limit: 10
      });

      // Sort by relevance (this could be enhanced with ML)
      return recommendations.slice(0, 6);
    } catch (error) {
      console.error('Failed to get recommended assets:', error);
      return [];
    }
  }, [options.preferredTypes, searchAssets]);

  return {
    selectedAsset,
    selectedAssets,
    isAssetPickerOpen,
    openAssetPicker,
    closeAssetPicker,
    integrateAsset,
    integrateMultipleAssets,
    clearSelection,
    getRecommendedAssets
  };
};

// Helper function to format assets for different tools
function formatAssetForTool(asset: Asset, toolType: ToolType, targetElement?: string): any {
  const baseFormat = {
    id: asset.id,
    title: asset.title,
    url: asset.downloadUrl || asset.thumbnailUrl,
    thumbnailUrl: asset.thumbnailUrl,
    type: asset.type,
    dimensions: {
      width: asset.width,
      height: asset.height
    },
    metadata: asset.metadata
  };

  switch (toolType) {
    case 'image-generator':
      return {
        ...baseFormat,
        referenceImage: asset.downloadUrl,
        style: asset.metadata?.style || 'photographic',
        usage: 'reference'
      };

    case 'video-creator':
      return {
        ...baseFormat,
        mediaType: asset.type === 'video' ? 'video' : 'image',
        duration: asset.type === 'video' ? asset.metadata?.duration : undefined,
        targetElement: targetElement || 'background',
        fitMode: 'cover'
      };

    case 'email-editor':
      return {
        ...baseFormat,
        elementType: targetElement || 'hero-image',
        responsive: true,
        altText: asset.title,
        linkUrl: asset.metadata?.linkUrl
      };

    case 'social-media':
      return {
        ...baseFormat,
        platform: targetElement || 'instagram',
        aspectRatio: calculateAspectRatio(asset),
        hashtags: asset.tags || []
      };

    case 'presentation':
      return {
        ...baseFormat,
        slideElement: targetElement || 'background',
        transition: 'fade',
        caption: asset.title
      };

    case 'website-builder':
      return {
        ...baseFormat,
        componentType: targetElement || 'hero-background',
        responsiveBreakpoints: ['mobile', 'tablet', 'desktop'],
        lazyLoad: true
      };

    case 'print-design':
      return {
        ...baseFormat,
        dpi: 300,
        colorMode: asset.metadata?.colorMode || 'CMYK',
        bleed: 0.125, // inches
        printReady: true
      };

    case 'marketing-assets':
      return {
        ...baseFormat,
        campaignType: targetElement || 'banner',
        brandColors: asset.metadata?.brandColors || [],
        targetAudience: asset.metadata?.targetAudience
      };

    default:
      return baseFormat;
  }
}

// Helper function to calculate aspect ratio
function calculateAspectRatio(asset: Asset): string {
  if (asset.width && asset.height) {
    const ratio = asset.width / asset.height;
    if (ratio > 1.7) return '16:9';
    if (ratio > 1.3) return '4:3';
    if (ratio > 0.8) return '1:1';
    if (ratio > 0.6) return '3:4';
    return '9:16';
  }
  return '1:1';
}

// Hook for quick asset access in components
export const useQuickAssetAccess = () => {
  const { availableAssets, favoriteAssets, userLibrary, searchAssets } = useAssetContext();

  const getQuickAssets = useCallback((limit: number = 5) => {
    return {
      recent: availableAssets.slice(0, limit),
      favorites: favoriteAssets.slice(0, limit),
      library: userLibrary.slice(0, limit).map(ua => ({ ...ua, id: ua.id.replace('user-', '') }))
    };
  }, [availableAssets, favoriteAssets, userLibrary]);

  const searchQuick = useCallback(async (query: string, type?: Asset['type']) => {
    return await searchAssets({ query, type, limit: 10 });
  }, [searchAssets]);

  return {
    getQuickAssets,
    searchQuick
  };
};