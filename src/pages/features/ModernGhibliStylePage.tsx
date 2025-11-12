import React, { useState } from 'react';
import ModernGhibliImageGenerator from '../../components/modern/ModernGhibliImageGenerator';
import { createDefaultTokenValues } from '../../types/personalization';

const ModernGhibliStylePage: React.FC = () => {
  const [tokens] = useState(createDefaultTokenValues());
  return <ModernGhibliImageGenerator tokens={tokens} onImageGenerated={(url) => console.log('Generated:', url)} />;
};

export default ModernGhibliStylePage;
