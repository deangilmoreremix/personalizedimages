import React, { useState } from 'react';
import ModernMemeGenerator from '../../components/modern/ModernMemeGenerator';
import { createDefaultTokenValues } from '../../types/personalization';

const ModernMemeGeneratorPage: React.FC = () => {
  const [tokens] = useState(createDefaultTokenValues());
  return <ModernMemeGenerator tokens={tokens} onMemeGenerated={(url) => console.log('Generated:', url)} />;
};

export default ModernMemeGeneratorPage;
