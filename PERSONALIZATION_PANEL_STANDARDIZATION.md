# UniversalPersonalizationPanel Visibility Standardization

## Overview

This document outlines a standardized approach for UniversalPersonalizationPanel visibility across all image generators in the Personalized Images application. The goal is to provide consistent user experience while allowing configurability and future extensibility.

## Current Issues

1. **Inconsistent Behavior**: Some generators auto-show the panel, others require user interaction
2. **User Experience Impact**: Balance between reducing clutter and maintaining accessibility
3. **Technical Implementation**: Need configurable, maintainable solution
4. **Future Extensibility**: Allow user preferences and easy addition of new generators

## Recommended Approach

### Core Principles

1. **Smart Defaults**: Panel shows automatically for new users, remembers user preferences
2. **User Control**: Easy toggle available in all generators
3. **Consistency**: Same behavior across all generators
4. **Persistence**: Preferences saved per generator and globally

### Implementation Strategy

#### Phase 1: Core Infrastructure (Week 1-2)
1. **Enhance UniversalPersonalizationPanel** with generator-specific content types
2. **Update usePersonalizationPreferences** hook for better defaults
3. **Create PersonalizationPanelManager** component for consistent toggle behavior

#### Phase 2: Generator Migration (Week 3-6)
1. **Migrate dual-panel generators** (Cartoon, EnhancedActionFigure, Ghibli, Meme)
2. **Add preference management** to simple boolean generators
3. **Remove PersonalizationPanel** usage, standardize on UniversalPersonalizationPanel

#### Phase 3: User Experience Polish (Week 7-8)
1. **Add global personalization settings** in user preferences
2. **Implement smart defaults** based on user behavior
3. **Add onboarding flow** for first-time users

#### Phase 4: Testing & Documentation (Week 9-10)
1. **Update all tests** for consistent behavior
2. **Create documentation** for the standardized approach
3. **Add migration guide** for future generators

### Technical Implementation

#### Hook Enhancement

```typescript
export const usePersonalizationPreferences = (generatorType?: string) => {
  // ... existing code ...

  // Get current visibility for this generator with smart defaults
  const shouldShowPanel = useMemo(() => {
    if (!generatorType) return false;

    const globalPrefs = getPersonalizationPreferences();
    const generatorPrefs = getGeneratorPersonalizationPreference(generatorType);

    // Smart defaults: show for new users, respect preferences for experienced users
    if (!globalPrefs.isExperiencedUser) {
      return true; // Show by default for new users
    }

    return generatorPrefs?.autoShowPanel ?? globalPrefs.defaultShowPersonalization;
  }, [generatorType]);

  // ... rest of hook ...
};
```

#### Generator Integration Pattern

```typescript
const MyGenerator = () => {
  const { shouldShowPanel, updateGeneratorPreferences } = usePersonalizationPreferences('my-generator');
  const [showPersonalizationPanel, setShowPersonalizationPanel] = useState(shouldShowPanel);

  // Toggle handler with preference persistence
  const handleTogglePersonalization = () => {
    const newState = !showPersonalizationPanel;
    setShowPersonalizationPanel(newState);
    updateGeneratorPreferences({ autoShowPanel: newState });
  };

  return (
    <div>
      {/* Generator UI */}
      <PersonalizationToggle
        isVisible={showPersonalizationPanel}
        onToggle={handleTogglePersonalization}
      />

      {showPersonalizationPanel && (
        <UniversalPersonalizationPanel
          generatorType="my-generator"
          onClose={() => setShowPersonalizationPanel(false)}
        />
      )}
    </div>
  );
};
```

#### PersonalizationToggle Component

```typescript
interface PersonalizationToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

export const PersonalizationToggle = ({ isVisible, onToggle, className }: PersonalizationToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isVisible
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        className
      )}
      aria-label={isVisible ? "Hide personalization panel" : "Show personalization panel"}
    >
      <SparklesIcon className="w-4 h-4" />
      {isVisible ? "Hide Personalization" : "Show Personalization"}
    </button>
  );
};
```

### Benefits

1. **Consistency**: All generators behave identically
2. **User Control**: Configurable visibility with persistent preferences
3. **Scalability**: Easy to add new generators following the pattern
4. **Maintainability**: Single source of truth for personalization logic
5. **User Experience**: Reduced clutter while maintaining accessibility

### Migration Checklist

- [ ] Update usePersonalizationPreferences hook with smart defaults
- [ ] Create PersonalizationToggle component
- [ ] Migrate CartoonImageGenerator
- [ ] Migrate EnhancedActionFigureGenerator
- [ ] Migrate GhibliImageGenerator
- [ ] Migrate MemeGenerator
- [ ] Migrate WrestlingActionFigureGenerator
- [ ] Migrate RetroActionFigureGenerator
- [ ] Migrate TVShowActionFigureGenerator
- [ ] Migrate MusicStarActionFigureGenerator
- [ ] Migrate GifEditor
- [ ] Migrate ImageEditor
- [ ] Update AIImageGenerator for consistency
- [ ] Add global personalization settings
- [ ] Implement onboarding flow
- [ ] Update tests
- [ ] Create documentation

This standardized approach addresses all four considerations: current inconsistencies, UX impact, technical implementation, and future extensibility. The UniversalPersonalizationPanel provides the comprehensive functionality needed while the preference system ensures users have control over their experience.