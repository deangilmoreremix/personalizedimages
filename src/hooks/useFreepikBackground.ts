import { useState } from 'react';
import { StockResource } from '../services/stockImageService';
import { FreepikCompliance } from '../utils/freepikCompliance';

interface UseFreepikBackgroundOptions {
  generatorType: string;
  onBackgroundSelect?: (resource: StockResource) => void;
}

export function useFreepikBackground(options: UseFreepikBackgroundOptions) {
  const { generatorType, onBackgroundSelect } = options;
  const [freepikBackground, setFreepikBackground] = useState<StockResource | null>(null);

  const handleSelectBackground = (resource: StockResource) => {
    setFreepikBackground(resource);
    FreepikCompliance.trackFreepikUsage(resource.id, generatorType, 'composite');

    if (onBackgroundSelect) {
      onBackgroundSelect(resource);
    }
  };

  const clearBackground = () => {
    setFreepikBackground(null);
  };

  const getBackgroundUrl = (): string | null => {
    if (!freepikBackground) return null;
    return freepikBackground.previewUrl || freepikBackground.thumbnailUrl || null;
  };

  const requiresAttribution = (): boolean => {
    return freepikBackground !== null;
  };

  const getAttributionText = (): string => {
    if (!freepikBackground) return '';
    return FreepikCompliance.getAttributionText(freepikBackground, false);
  };

  return {
    freepikBackground,
    selectBackground: handleSelectBackground,
    clearBackground,
    getBackgroundUrl,
    requiresAttribution: requiresAttribution(),
    attributionText: getAttributionText()
  };
}

export default useFreepikBackground;
