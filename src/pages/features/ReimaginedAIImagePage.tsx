import React, { useState } from 'react';
import AIImageWorkspace from '../../components/reimagined/AIImageWorkspace';
import { createDefaultTokenValues } from '../../types/personalization';

const ReimaģinedAIImagePage: React.FC = () => {
  const [tokens, setTokens] = useState(createDefaultTokenValues());

  return (
    <div className="h-screen w-full">
      <AIImageWorkspace
        tokens={tokens}
        onTokensUpdate={setTokens}
      />
    </div>
  );
};

export default ReimaģinedAIImagePage;
