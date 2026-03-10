/**
 * Feature Flags Configuration
 * 
 * Centralized feature flag management for A/B testing, feature rollouts,
 * and consolidating duplicate route components.
 */

// Feature flag definitions
export interface FeatureFlags {
  // Consolidate duplicate routes - use modern versions
  useModernActionFigures: boolean;
  useModernCartoon: boolean;
  useModernGhibli: boolean;
  useModernMeme: boolean;
  useModernAIImage: boolean;
  useModernBatchGeneration: boolean;
  useModernVideoConverter: boolean;

  // Performance features
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableRetryLogic: boolean;

  // Analytics and monitoring
  enableErrorTracking: boolean;
  enablePerformanceMetrics: boolean;

  // UI features
  enableNewNavigation: boolean;
  enableDarkModeDefault: boolean;
  enableBetaFeatures: boolean;
}

// Default feature flags
const DEFAULT_FLAGS: FeatureFlags = {
  useModernActionFigures: true,
  useModernCartoon: true,
  useModernGhibli: true,
  useModernMeme: true,
  useModernAIImage: true,
  useModernBatchGeneration: true,
  useModernVideoConverter: true,

  enableLazyLoading: true,
  enableImageOptimization: false, // Requires vite-plugin-image-optimizer
  enableRetryLogic: true,

  enableErrorTracking: import.meta.env.PROD,
  enablePerformanceMetrics: import.meta.env.PROD,

  enableNewNavigation: false,
  enableDarkModeDefault: false,
  enableBetaFeatures: false,
};

// Storage key for feature flags
const STORAGE_KEY = 'feature_flags';

/**
 * Get current feature flags
 * Merges defaults with local storage overrides and environment variables
 */
export function getFeatureFlags(): FeatureFlags {
  const stored = getStoredFlags();
  const envFlags = getEnvFlags();

  return {
    ...DEFAULT_FLAGS,
    ...stored,
    ...envFlags,
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return getFeatureFlags()[feature];
}

/**
 * Toggle a feature flag (for development/testing)
 */
export function toggleFeature(feature: keyof FeatureFlags): void {
  if (import.meta.env.PROD) {
    console.warn('[Features] Cannot toggle features in production');
    return;
  }

  const flags = getFeatureFlags();
  const newFlags = { ...flags, [feature]: !flags[feature] };
  storeFlags(newFlags);

  console.log(`[Features] Toggled ${feature} to ${newFlags[feature]}`);
}

/**
 * Override feature flags (for development/testing)
 */
export function setFeatureFlags(overrides: Partial<FeatureFlags>): void {
  if (import.meta.env.PROD) {
    console.warn('[Features] Cannot set features in production');
    return;
  }

  const flags = getFeatureFlags();
  const newFlags = { ...flags, ...overrides };
  storeFlags(newFlags);
}

/**
 * Reset all feature flags to defaults
 */
export function resetFeatureFlags(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('[Features] Reset to defaults');
}

/**
 * Get flags from local storage
 */
function getStoredFlags(): Partial<FeatureFlags> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Store flags to local storage
 */
function storeFlags(flags: FeatureFlags): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get flags from environment variables
 */
function getEnvFlags(): Partial<FeatureFlags> {
  const flags: Partial<FeatureFlags> = {};

  // Parse VITE_FEATURE_* environment variables
  const envPrefix = 'VITE_FEATURE_';

  Object.keys(import.meta.env).forEach((key) => {
    if (key.startsWith(envPrefix)) {
      const featureName = key
        .replace(envPrefix, '')
        .toLowerCase()
        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()) as keyof FeatureFlags;

      const value = import.meta.env[key];
      if (value === 'true' || value === '1') {
        flags[featureName] = true;
      } else if (value === 'false' || value === '0') {
        flags[featureName] = false;
      }
    }
  });

  return flags;
}

/**
 * Feature Flag Hook for React components
 * Usage: const isEnabled = useFeature('useModernActionFigures');
 */
export function useFeature(feature: keyof FeatureFlags): boolean {
  return isFeatureEnabled(feature);
}

// Export singleton instance for convenience
export const FEATURE_FLAGS = getFeatureFlags();

// Console helper for development
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).featureFlags = {
    get: getFeatureFlags,
    toggle: toggleFeature,
    set: setFeatureFlags,
    reset: resetFeatureFlags,
  };

  console.log('[Features] Available commands: window.featureFlags.get(), toggle(), set(), reset()');
}
