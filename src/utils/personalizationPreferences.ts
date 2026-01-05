/**
 * Personalization Preferences Management
 * Handles user preferences for personalization panel visibility and behavior
 */

export interface PersonalizationPreferences {
  autoShowPanels: boolean;
  generatorSpecificSettings: Record<string, {
    autoShowPanel: boolean;
    lastUsedMode: 'basic' | 'action-figure' | 'advanced';
  }>;
  firstTimeUser: boolean;
}

const PREFERENCES_KEY = 'personalized-images-personalization-prefs';
const DEFAULT_PREFERENCES: PersonalizationPreferences = {
  autoShowPanels: false,
  generatorSpecificSettings: {},
  firstTimeUser: true
};

/**
 * Get user personalization preferences from localStorage
 */
export const getPersonalizationPreferences = (): PersonalizationPreferences => {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load personalization preferences:', error);
  }
  return DEFAULT_PREFERENCES;
};

/**
 * Save user personalization preferences to localStorage
 */
export const savePersonalizationPreferences = (preferences: PersonalizationPreferences): void => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save personalization preferences:', error);
  }
};

/**
 * Update a specific preference
 */
export const updatePersonalizationPreference = (
  key: keyof PersonalizationPreferences,
  value: any
): void => {
  const currentPrefs = getPersonalizationPreferences();
  const updatedPrefs = { ...currentPrefs, [key]: value };
  savePersonalizationPreferences(updatedPrefs);
};

/**
 * Get preference for a specific generator
 */
export const getGeneratorPersonalizationPreference = (
  generatorType: string
): { autoShowPanel: boolean; lastUsedMode: 'basic' | 'action-figure' | 'advanced' } => {
  const prefs = getPersonalizationPreferences();
  return prefs.generatorSpecificSettings[generatorType] || {
    autoShowPanel: prefs.autoShowPanels,
    lastUsedMode: 'basic'
  };
};

/**
 * Update preference for a specific generator
 */
export const updateGeneratorPersonalizationPreference = (
  generatorType: string,
  settings: { autoShowPanel?: boolean; lastUsedMode?: 'basic' | 'action-figure' | 'advanced' }
): void => {
  const currentPrefs = getPersonalizationPreferences();
  const currentGeneratorSettings = currentPrefs.generatorSpecificSettings[generatorType] || {
    autoShowPanel: currentPrefs.autoShowPanels,
    lastUsedMode: 'basic'
  };

  const updatedGeneratorSettings = { ...currentGeneratorSettings, ...settings };
  const updatedPrefs = {
    ...currentPrefs,
    generatorSpecificSettings: {
      ...currentPrefs.generatorSpecificSettings,
      [generatorType]: updatedGeneratorSettings
    }
  };

  savePersonalizationPreferences(updatedPrefs);
};

/**
 * Mark user as no longer a first-time user
 */
export const markUserAsExperienced = (): void => {
  updatePersonalizationPreference('firstTimeUser', false);
};

/**
 * Check if user should see personalization panel for a generator
 */
export const shouldShowPersonalizationPanel = (generatorType: string): boolean => {
  const generatorPref = getGeneratorPersonalizationPreference(generatorType);
  return generatorPref.autoShowPanel;
};