import React, { useState } from 'react';
import { createDefaultTokenValues } from '../../types/personalization';
import { sanitizeTokenValue } from '../../utils/validation';
import GeminiNanoPersonalizationEditor from '../../components/GeminiNanoPersonalizationEditor';
import TokensContainer from '../../components/ui/TokensContainer';

const GeminiNanoEditorPage: React.FC = () => {
  const [tokens, setTokens] = useState<Record<string, string>>(createDefaultTokenValues());
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImages([imageUrl, ...generatedImages]);
  };

  const handleTokenUpdate = (key: string, value: string) => {
    setTokens({ ...tokens, [key]: sanitizeTokenValue(value) });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Gemini Nano Personalization Studio
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered image generation with smart personalization tokens
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8">
        {/* Token Management */}
        <div className="mb-6">
          <TokensContainer
            tokens={tokens}
            onTokenUpdate={handleTokenUpdate}
          />
        </div>

        {/* Editor */}
        <GeminiNanoPersonalizationEditor
          tokens={tokens}
          onImageGenerated={handleImageGenerated}
        />

        {/* Generation History */}
        {generatedImages.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Generation History ({generatedImages.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {generatedImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <img
                    src={imageUrl}
                    alt={`Generated ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiNanoEditorPage;
