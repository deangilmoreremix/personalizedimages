import React, { useState } from 'react';
import { Sparkles, Download, Image as ImageIcon, RefreshCw, Shapes, Search } from 'lucide-react';
import { generateImageWithDalle, generateImageWithGemini } from '../utils/api';
import EmailPersonalizationToggle from './EmailPersonalizationToggle';
import { useEmailPersonalization } from '../hooks/useEmailPersonalization';
import { usePersonalizationPreferences } from '../hooks/usePersonalizationPreferences';
import EmailPersonalizationPanel from './EmailPersonalizationPanel';
import UniversalPersonalizationPanel from './UniversalPersonalizationPanel';
import { StockImageButton } from './shared/StockImageButton';
import { StockResource } from '../services/stockImageService';
import { FreepikCompliance } from '../utils/freepikCompliance';
import { FreepikAttribution } from './shared/FreepikAttribution';

interface AIImageGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({ tokens, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai');
  const [referenceImage, setReferenceImage] = useState<StockResource | null>(null);

  // Personalization panel state - now uses preferences
  const { shouldShowPanel, updateGeneratorPreferences, markAsExperienced } = usePersonalizationPreferences('ai-image');
  const [showPersonalizationPanel, setShowPersonalizationPanel] = useState(shouldShowPanel);

  const emailPersonalization = useEmailPersonalization({
    imageUrl: generatedImage,
    tokens,
    generatorType: 'ai-image'
  });

  const handleReferenceImageSelect = (resource: StockResource) => {
    setReferenceImage(resource);
    FreepikCompliance.trackFreepikUsage(resource.id, 'ai-image-generator', 'reference');
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      let enhancedPrompt = prompt;
      if (referenceImage) {
        enhancedPrompt = `${prompt} (using reference image: ${referenceImage.title || 'Freepik image'})`;
      }

      const imageUrl = selectedProvider === 'openai'
        ? await generateImageWithDalle(enhancedPrompt)
        : await generateImageWithGemini(enhancedPrompt);

      setGeneratedImage(imageUrl);
      onImageGenerated(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">AI Image Generator</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">AI Model</label>
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded ${selectedProvider === 'openai' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setSelectedProvider('openai')}
              >
                OpenAI
              </button>
              <button
                className={`px-4 py-2 rounded ${selectedProvider === 'gemini' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setSelectedProvider('gemini')}
              >
                Gemini
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reference Image (Optional)</label>
            <div className="flex gap-2">
              <StockImageButton
                onSelect={handleReferenceImageSelect}
                buttonText={referenceImage ? "Change Reference" : "Browse Freepik"}
                buttonIcon={Search}
                defaultSearchTerm={prompt || 'professional'}
              />
              {referenceImage && (
                <button
                  onClick={() => setReferenceImage(null)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                >
                  Clear
                </button>
              )}
            </div>
            {referenceImage && (
              <div className="mt-2 p-2 border rounded bg-gray-50">
                <div className="flex items-center gap-3">
                  <img
                    src={referenceImage.thumbnailUrl || ''}
                    alt={referenceImage.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {referenceImage.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      AI will use this as visual inspiration
                    </p>
                  </div>
                </div>
                <FreepikAttribution
                  resources={[referenceImage]}
                  isPremiumUser={false}
                  variant="inline"
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                const newState = !showPersonalizationPanel;
                setShowPersonalizationPanel(newState);
                updateGeneratorPreferences({ autoShowPanel: newState });
                if (newState) markAsExperienced();
              }}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 flex items-center justify-center"
            >
              <Shapes className="w-4 h-4 mr-2" />
              {showPersonalizationPanel ? 'Hide' : 'Show'} Personalization
            </button>

            <button
              onClick={handleGenerateImage}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="inline w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="inline w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
            {generatedImage ? (
              <img src={generatedImage} alt="Generated" className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="text-center text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                Generated image will appear here
              </div>
            )}
          </div>

          {generatedImage && (
            <div className="flex gap-2">
              <a
                href={generatedImage}
                download="generated-image.png"
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded text-center"
              >
                <Download className="inline w-4 h-4 mr-2" />
                Download
              </a>
              <EmailPersonalizationToggle
                isActive={emailPersonalization.isActive}
                onToggle={emailPersonalization.toggle}
              />
            </div>
          )}
        </div>
      </div>

      {emailPersonalization.isActive && (
        <EmailPersonalizationPanel
          imageUrl={generatedImage}
          personalizationTokens={[]}
          selectedProvider={emailPersonalization.selectedProvider}
          template={emailPersonalization.template}
          subject={emailPersonalization.subject}
          linkText={emailPersonalization.linkText}
          linkUrl={emailPersonalization.linkUrl}
          bgColor={emailPersonalization.bgColor}
          textColor={emailPersonalization.textColor}
          accentColor={emailPersonalization.accentColor}
          width={emailPersonalization.width}
          imageHeight={emailPersonalization.imageHeight}
          generatedHtml={emailPersonalization.generatedHtml}
          isGenerating={emailPersonalization.isGenerating}
          error={emailPersonalization.error}
          recommendedTokens={emailPersonalization.recommendedTokens}
          tokenValidation={emailPersonalization.tokenValidation}
          onAddToken={() => {}}
          onRemoveToken={() => {}}
          onUpdateToken={() => {}}
          onUpdateSettings={emailPersonalization.updateSettings}
          onGenerate={emailPersonalization.generateEmailImage}
          onCopyHtml={emailPersonalization.copyHtmlToClipboard}
          onDownloadHtml={emailPersonalization.downloadHtml}
        />
      )}
    </div>
  );
};

export default AIImageGenerator;