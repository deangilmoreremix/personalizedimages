/**
 * Universal Generator Wrapper
 * Adds ALL AI features and email capabilities to any image generator
 */

import React, { useState } from 'react';
import { useUniversalAIFeatures } from '../hooks/useUniversalAIFeatures';
import { useUniversalEmailSystem } from '../hooks/useUniversalEmailSystem';
import EmailHtmlGenerator from './EmailHtmlGenerator';
import { DESIGN_SYSTEM, getButtonClasses, getElevationClasses, getAnimationClasses } from './ui/design-system';

interface UniversalGeneratorWrapperProps {
  children: React.ReactNode;
  generatorType: string;
  tokens: Record<string, string>;
  generatedImage: string | null;
  onImageGenerated?: (imageUrl: string) => void;
  className?: string;
}

// Universal AI Features Bar Component
const UniversalAIFeaturesBar: React.FC<{
  aiFeatures: ReturnType<typeof useUniversalAIFeatures>;
}> = ({ aiFeatures }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className={`${DESIGN_SYSTEM.components.panel} mb-4`}>
      <div className="flex flex-wrap items-center gap-3 p-4">
        {/* AI Model Selection */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">AI Model:</label>
          <select
            value={aiFeatures.models.selected}
            onChange={(e) => aiFeatures.models.setSelected(e.target.value as any)}
            className="px-3 py-1 border rounded text-sm"
          >
            {aiFeatures.models.available.map(model => (
              <option key={model} value={model}>
                {aiFeatures.models.getProviderName(model)}
              </option>
            ))}
          </select>
        </div>

        {/* DALL-E Options (only show for DALL-E) */}
        {aiFeatures.models.selected === 'openai' && (
          <div className="flex items-center gap-2">
            <select
              value={aiFeatures.models.dalleOptions.size}
              onChange={(e) => aiFeatures.models.updateDalleOptions({ size: e.target.value as any })}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="1024x1024">1:1 (1024px)</option>
              <option value="1792x1024">16:9 (1792x1024)</option>
              <option value="1024x1792">9:16 (1024x1792)</option>
            </select>
            <select
              value={aiFeatures.models.dalleOptions.quality}
              onChange={(e) => aiFeatures.models.updateDalleOptions({ quality: e.target.value as any })}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="standard">Standard</option>
              <option value="hd">HD</option>
            </select>
            <select
              value={aiFeatures.models.dalleOptions.style}
              onChange={(e) => aiFeatures.models.updateDalleOptions({ style: e.target.value as any })}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="natural">Natural</option>
              <option value="vivid">Vivid</option>
            </select>
          </div>
        )}

        {/* Streaming Status */}
        {aiFeatures.streaming.isActive && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-700">{aiFeatures.streaming.status}</span>
            <div className="w-20 h-2 bg-blue-200 rounded">
              <div
                className="h-full bg-blue-500 rounded transition-all duration-300"
                style={{ width: `${aiFeatures.streaming.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* AI Reasoning Toggle */}
        <button
          onClick={aiFeatures.reasoning.toggle}
          className={`${getButtonClasses('outlined')} text-sm`}
        >
          🤖 AI Reasoning {aiFeatures.reasoning.isOpen ? 'ON' : 'OFF'}
        </button>

        {/* Advanced Features Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`${getButtonClasses('outlined')} text-sm`}
        >
          ⚙️ Advanced {showAdvanced ? '▼' : '▶'}
        </button>
      </div>

      {/* Advanced Features Panel */}
      {showAdvanced && (
        <div className="border-t p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Aspect Ratios */}
            <div>
              <label className="block text-sm font-medium mb-1">Aspect Ratio:</label>
              <select
                value={aiFeatures.aspectRatios.selected}
                onChange={(e) => aiFeatures.aspectRatios.setSelected(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                {aiFeatures.aspectRatios.options.map(ratio => (
                  <option key={ratio} value={ratio}>{ratio}</option>
                ))}
              </select>
            </div>

            {/* Style Presets */}
            <div>
              <label className="block text-sm font-medium mb-1">Style Preset:</label>
              <select
                value={aiFeatures.stylePresets.selected}
                onChange={(e) => aiFeatures.stylePresets.setSelected(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                {aiFeatures.stylePresets.categories.map(style => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Reference Images */}
            <div>
              <label className="block text-sm font-medium mb-1">Reference Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    aiFeatures.referenceImages.upload(e.target.files[0]);
                  }
                }}
                className="w-full text-sm"
              />
            </div>

            {/* Video Generation */}
            <div>
              <label className="block text-sm font-medium mb-1">Video Generation:</label>
              <button
                onClick={() => aiFeatures.videoGeneration.generate('placeholder', 'placeholder')}
                disabled={!aiFeatures.videoGeneration.isAvailable || aiFeatures.videoGeneration.isGenerating}
                className={`${getButtonClasses('outlined')} text-sm w-full`}
              >
                🎬 Generate Video {aiFeatures.videoGeneration.cost}
              </button>
            </div>
          </div>

          {/* Current Reference Image */}
          {aiFeatures.referenceImages.current && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Reference:</span>
              <img
                src={aiFeatures.referenceImages.current}
                alt="Reference"
                className="w-8 h-8 object-cover rounded border"
              />
              <button
                onClick={aiFeatures.referenceImages.clear}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Universal Export Panel Component
const UniversalExportPanel: React.FC<{
  generatedImage: string | null;
  generatedEmailHtml: string;
  aiFeatures: ReturnType<typeof useUniversalAIFeatures>;
  emailSystem: ReturnType<typeof useUniversalEmailSystem>;
  onDownloadImage: () => void;
}> = ({ generatedImage, generatedEmailHtml, aiFeatures, emailSystem, onDownloadImage }) => {
  if (!generatedImage) return null;

  return (
    <div className={`${DESIGN_SYSTEM.components.panel} mt-4`}>
      <div className="p-4">
        <h4 className="font-medium mb-3">Export Options</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onDownloadImage}
            className={`${getButtonClasses('outlined')} text-sm`}
          >
            📥 Download Image
          </button>

          <button
            onClick={() => emailSystem.htmlGeneration.generate()}
            disabled={emailSystem.htmlGeneration.isGenerating}
            className={`${getButtonClasses('outlined')} text-sm`}
          >
            📧 Generate Email HTML
          </button>

          {generatedEmailHtml && (
            <>
              <button
                onClick={emailSystem.htmlGeneration.copyToClipboard}
                className={`${getButtonClasses('outlined')} text-sm`}
              >
                📋 Copy HTML
              </button>

              <button
                onClick={emailSystem.htmlGeneration.download}
                className={`${getButtonClasses('outlined')} text-sm`}
              >
                💾 Download HTML
              </button>
            </>
          )}

          <button
            onClick={() => aiFeatures.videoGeneration.generate(generatedImage, 'Generated video from image')}
            disabled={!aiFeatures.videoGeneration.isAvailable || aiFeatures.videoGeneration.isGenerating}
            className={`${getButtonClasses('outlined')} text-sm`}
          >
            🎬 Generate Video ({aiFeatures.videoGeneration.cost})
          </button>
        </div>
      </div>
    </div>
  );
};

export const UniversalGeneratorWrapper: React.FC<UniversalGeneratorWrapperProps> = ({
  children,
  generatorType,
  tokens,
  generatedImage,
  onImageGenerated,
  className = ''
}) => {
  const aiFeatures = useUniversalAIFeatures({
    generatorType,
    tokens,
    onImageGenerated
  });

  const emailSystem = useUniversalEmailSystem({
    imageUrl: generatedImage,
    tokens,
    personalizationTokens: []
  });

  const [generatedEmailHtml, setGeneratedEmailHtml] = useState('');

  return (
    <div className={`universal-generator-wrapper ${className}`}>
      {/* Universal AI Features Bar */}
      <UniversalAIFeaturesBar aiFeatures={aiFeatures} />

      {/* Main Generator Content */}
      <div className={`${getElevationClasses(2)} ${getAnimationClasses('smooth')}`}>
        {children}
      </div>

      {/* Email HTML Generator */}
      <EmailHtmlGenerator
        imageUrl={generatedImage}
        tokens={tokens}
        personalizationTokens={[]}
        onHtmlGenerated={setGeneratedEmailHtml}
      />

      {/* Universal Export Panel */}
      <UniversalExportPanel
        generatedImage={generatedImage}
        generatedEmailHtml={generatedEmailHtml}
        aiFeatures={aiFeatures}
        emailSystem={emailSystem}
        onDownloadImage={() => {
          if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = `generated-image-${Date.now()}.png`;
            link.click();
          }
        }}
      />
    </div>
  );
};

export default UniversalGeneratorWrapper;