import React, { useState } from 'react';
import ModernAIImageGenerator from '../../components/modern/ModernAIImageGenerator';
import { createDefaultTokenValues } from '../../types/personalization';
import DraggableContentPanel from '../../components/DraggableContentPanel';

const ModernAIImagePage: React.FC = () => {
  const [tokens, setTokens] = useState(createDefaultTokenValues());
  const [showTokensPanel, setShowTokensPanel] = useState(false);

  const handleImageGenerated = (imageUrl: string) => {
    console.log('Image generated:', imageUrl);
  };

  return (
    <div className="relative">
      <ModernAIImageGenerator
        tokens={tokens}
        onImageGenerated={handleImageGenerated}
      />

      {showTokensPanel && (
        <DraggableContentPanel
          tokens={tokens}
          onClose={() => setShowTokensPanel(false)}
        />
      )}
    </div>
  );
};

export default ModernAIImagePage;
