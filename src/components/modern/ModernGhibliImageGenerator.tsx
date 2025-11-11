import React, { useState } from 'react';
import { Wand2, Download, Share2, RefreshCw, Image as ImageIcon, Sparkles } from 'lucide-react';
import FullScreenLayout from '../layout/FullScreenLayout';
import ModernTopHeader from '../layout/ModernTopHeader';
import LeftPanel, { LeftPanelSection, LeftPanelFooter } from '../layout/LeftPanel';
import RightPanel from '../layout/RightPanel';
import EmptyState from '../layout/EmptyState';
import GuideContent from '../layout/GuideContent';
import APIContent from '../layout/APIContent';
import DroppableTextArea from '../DroppableTextArea';
import { TokenDragItem } from '../../types/DragTypes';
import { generateImageWithGemini } from '../../utils/api';
import { ghibliStyles } from '../../data/ghibliStyles';

interface ModernGhibliImageGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const ModernGhibliImageGenerator: React.FC<ModernGhibliImageGeneratorProps> = ({ tokens, onImageGenerated }) => {
  const [activeTab, setActiveTab] = useState<'result' | 'guide' | 'api'>('result');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(ghibliStyles[0]);
  const [intensity, setIntensity] = useState(80);
  const [mode, setMode] = useState<'character' | 'scene'>('scene');

  const handleDrop = (item: TokenDragItem, caretPosition: number) => {
    const tokenText = `[${item.tokenKey}]`;
    const newValue = prompt.substring(0, caretPosition) + tokenText + prompt.substring(caretPosition);
    setPrompt(newValue);
  };

  const replaceTokens = (text: string): string => {
    let result = text;
    Object.entries(tokens).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value || `[${key}]`);
    });
    return result;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const processedPrompt = replaceTokens(prompt);
      const stylePrompt = `${processedPrompt}, in the style of ${selectedStyle.name}, ${selectedStyle.description}, Studio Ghibli aesthetic, ${mode === 'character' ? 'character focus' : 'landscape scene'}, intensity ${intensity}%`;

      const imageUrl = await generateImageWithGemini(stylePrompt, '16:9', 'illustration');
      setGeneratedImage(imageUrl);
      onImageGenerated(imageUrl);
      setActiveTab('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ghibli-${Date.now()}.png`;
    link.click();
  };

  const leftPanelContent = (
    <LeftPanel>
      <LeftPanelSection title="Ghibli Style Generator">
        <p className="text-sm text-gray-600">Create beautiful Studio Ghibli inspired artwork</p>
      </LeftPanelSection>

      <LeftPanelSection title="Ghibli Style">
        <div className="grid grid-cols-2 gap-3">
          {ghibliStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedStyle.id === style.id
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{style.name}</div>
              <div className="text-xs text-gray-500 mt-1">{style.description.substring(0, 50)}...</div>
            </button>
          ))}
        </div>
      </LeftPanelSection>

      <LeftPanelSection title="Mode">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('scene')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              mode === 'scene' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Scene
          </button>
          <button
            onClick={() => setMode('character')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              mode === 'character' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Character
          </button>
        </div>
      </LeftPanelSection>

      <LeftPanelSection title="Prompt">
        <DroppableTextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onDrop={handleDrop}
          placeholder="Describe your scene or character..."
          className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 resize-none text-sm"
        />
      </LeftPanelSection>

      <LeftPanelSection title="Style Intensity">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Subtle</span>
            <span>{intensity}%</span>
            <span>Strong</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </LeftPanelSection>

      <LeftPanelFooter>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate Ghibli Art
            </>
          )}
        </button>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </LeftPanelFooter>
    </LeftPanel>
  );

  const resultContent = generatedImage ? (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <img src={generatedImage} alt="Generated" className="w-full rounded-lg shadow-lg" />
      </div>
      <div className="flex gap-3">
        <button onClick={handleDownload} className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  ) : (
    <EmptyState
      icon={ImageIcon}
      title="No Ghibli Art Generated Yet"
      description="Choose a style, describe your vision, and create magical Studio Ghibli inspired artwork"
      tips={[
        'Try character mode for portraits, scene mode for landscapes',
        'Adjust intensity for subtle or strong Ghibli styling',
        'Describe natural elements like forests, clouds, or water',
        'Add emotional descriptors for more authentic results'
      ]}
    />
  );

  const guideContent = (
    <GuideContent
      steps={[
        { title: 'Choose Style', description: 'Select from various Ghibli-inspired art styles' },
        { title: 'Set Mode', description: 'Choose character focus or landscape scene' },
        { title: 'Describe Scene', description: 'Write your prompt with natural and emotional elements' },
        { title: 'Adjust Intensity', description: 'Control how strong the Ghibli aesthetic appears' }
      ]}
      bestPractices={[
        { title: 'Use Natural Settings', description: 'Ghibli style works best with nature, villages, and pastoral scenes' },
        { title: 'Include Emotion', description: 'Add words like peaceful, whimsical, or nostalgic' },
        { title: 'Think Cinematic', description: 'Imagine scenes from Ghibli films for inspiration' }
      ]}
    />
  );

  const apiContent = (
    <APIContent
      endpoint="/api/v1/ghibli/generate"
      method="POST"
      description="Generate Studio Ghibli inspired artwork with various styles."
      parameters={[
        { name: 'prompt', type: 'string', required: true, description: 'Scene or character description' },
        { name: 'style', type: 'string', required: false, description: 'Ghibli style variant' },
        { name: 'mode', type: 'string', required: false, description: 'character or scene' },
        { name: 'intensity', type: 'number', required: false, description: 'Style intensity 20-100' }
      ]}
      codeExamples={[
        {
          language: 'JavaScript',
          code: `const response = await fetch('/api/v1/ghibli/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'A peaceful countryside with rolling hills',
    style: 'spirited-away',
    mode: 'scene',
    intensity: 80
  })
});`
        }
      ]}
      responseExample={`{
  "success": true,
  "imageUrl": "https://example.com/ghibli123.png"
}`}
      rateLimit="50 requests per minute"
    />
  );

  return (
    <>
      <ModernTopHeader title="Ghibli Style Generator" breadcrumbs={[{ label: 'Editor', path: '/editor' }, { label: 'Ghibli Style' }]} />
      <FullScreenLayout
        leftPanel={leftPanelContent}
        rightPanel={<RightPanel activeTab={activeTab} onTabChange={setActiveTab} resultContent={resultContent} guideContent={guideContent} apiContent={apiContent} />}
      />
    </>
  );
};

export default ModernGhibliImageGenerator;
