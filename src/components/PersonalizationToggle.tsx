import React from 'react';
import { Shapes } from 'lucide-react';
import { usePersonalizationPreferences } from '../hooks/usePersonalizationPreferences';

interface PersonalizationToggleProps {
  generatorType: string;
  className?: string;
  size?: 'sm' | 'default';
}

const PersonalizationToggle: React.FC<PersonalizationToggleProps> = ({
  generatorType,
  className = '',
  size = 'default'
}) => {
  const { shouldShowPanel, updateGeneratorPreferences, markAsExperienced } = usePersonalizationPreferences(generatorType);
  const [showPersonalizationPanel, setShowPersonalizationPanel] = React.useState(shouldShowPanel);

  const handleToggle = () => {
    const newState = !showPersonalizationPanel;
    setShowPersonalizationPanel(newState);
    updateGeneratorPreferences({ autoShowPanel: newState });
    if (newState) markAsExperienced();
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center justify-center rounded transition-colors ${
        showPersonalizationPanel
          ? 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200'
          : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
      } ${sizeClasses} ${className}`}
      title={showPersonalizationPanel ? 'Hide Personalization Panel' : 'Show Personalization Panel'}
    >
      <Shapes className={`${iconSize} mr-1`} />
      {showPersonalizationPanel ? 'Hide' : 'Show'} Personalization
    </button>
  );
};

export default PersonalizationToggle;