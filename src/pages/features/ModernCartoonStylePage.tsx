import React, { useState } from 'react';
import ModernCartoonImageGenerator from '../../components/modern/ModernCartoonImageGenerator';
import { createDefaultTokenValues } from '../../types/personalization';

const ModernCartoonStylePage: React.FC = () => {
  const [tokens] = useState(createDefaultTokenValues());
  return <ModernCartoonImageGenerator tokens={tokens} onImageGenerated={(url) => console.log('Generated:', url)} />;
};

export default ModernCartoonStylePage;
