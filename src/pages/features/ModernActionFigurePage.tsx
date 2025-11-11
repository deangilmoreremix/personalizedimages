import React, { useState } from 'react';
import ModernActionFigureGenerator from '../../components/modern/ModernActionFigureGenerator';
import { createDefaultTokenValues } from '../../types/personalization';

const ModernActionFigurePage: React.FC = () => {
  const [tokens] = useState(createDefaultTokenValues());
  return <ModernActionFigureGenerator tokens={tokens} onImageGenerated={(url) => console.log('Generated:', url)} />;
};

export default ModernActionFigurePage;
