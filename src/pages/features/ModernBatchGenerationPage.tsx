import React, { useState } from 'react';
import ModernBatchGenerator from '../../components/modern/ModernBatchGenerator';
import { createDefaultTokenValues } from '../../types/personalization';

const ModernBatchGenerationPage: React.FC = () => {
  const [tokens] = useState(createDefaultTokenValues());
  return <ModernBatchGenerator tokens={tokens} />;
};

export default ModernBatchGenerationPage;
