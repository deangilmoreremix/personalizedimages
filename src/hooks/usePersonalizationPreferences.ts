/**
 * Hook for managing personalization panel preferences
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPersonalizationPreferences,
  savePersonalizationPreferences,
  updateGeneratorPersonalizationPreference,
  shouldShowPersonalizationPanel,
  getGeneratorPersonalizationPreference,
  markUserAsExperienced,
  PersonalizationPreferences
} from '../utils/personalizationPreferences';

export const usePersonalizationPreferences = (generatorType?: string) => {
  const [preferences, setPreferences] = useState<PersonalizationPreferences>(getPersonalizationPreferences());

  // Update local state when preferences change
  const refreshPreferences = useCallback(() => {
    setPreferences(getPersonalizationPreferences());
  }, []);

  // Update global preferences
  const updateGlobalPreferences = useCallback((updates: Partial<PersonalizationPreferences>) => {
    const currentPrefs = getPersonalizationPreferences();
    const updatedPrefs = { ...currentPrefs, ...updates };
    savePersonalizationPreferences(updatedPrefs);
    setPreferences(updatedPrefs);
  }, []);

  // Update generator-specific preferences
  const updateGeneratorPreferences = useCallback((
    settings: { autoShowPanel?: boolean; lastUsedMode?: 'basic' | 'action-figure' | 'advanced' }
  ) => {
    if (!generatorType) return;
    updateGeneratorPersonalizationPreference(generatorType, settings);
    refreshPreferences();
  }, [generatorType, refreshPreferences]);

  // Get current visibility for this generator
  const shouldShowPanel = generatorType ? shouldShowPersonalizationPanel(generatorType) : false;

  // Get generator-specific settings
  const generatorSettings = generatorType ? getGeneratorPersonalizationPreference(generatorType) : null;

  // Mark user as experienced
  const markAsExperienced = useCallback(() => {
    markUserAsExperienced();
    refreshPreferences();
  }, [refreshPreferences]);

  return {
    preferences,
    shouldShowPanel,
    generatorSettings,
    updateGlobalPreferences,
    updateGeneratorPreferences,
    markAsExperienced,
    refreshPreferences
  };
};