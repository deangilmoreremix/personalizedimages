import React, { useState } from 'react';
import { Wand2, Download, Share2, RefreshCw, Image as ImageIcon } from 'lucide-react';
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
import { cartoonThemes } from '../../data/cartoonThemes';

interface ModernCartoonImageGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const ModernCartoonImageGenerator: React.FC<ModernCartoonImageGeneratorProps> = ({ tokens, onImageGenerated }) => {
  const [activeTab, setActiveTab] = useState<'result' | 'guide' | 'api'>('result');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(cartoonThemes[0]);
  const [colorfulness, setColorfulness] = useState(80);

  const handleDrop = (item: TokenDragItem, caretPosition: number) => {
    const tokenText = `[${item.tokenKey}]`;
    setPrompt(prompt.substring(0, caretPosition) + tokenText + prompt.substring(caretPosition));
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
      const stylePrompt = `${processedPrompt}, ${selectedTheme.name} style, ${selectedTheme.description}, colorfulness ${colorfulness}%`;

      const imageUrl = await generateImageWithGemini(stylePrompt, '1:1', 'illustration');
      setGeneratedImage(imageUrl);
      onImageGenerated(imageUrl);
      setActiveTab('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const leftPanelContent = (
    <LeftPanel>
      <LeftPanelSection title="Cartoon Style Generator">
        <p className="text-sm text-gray-600">Create artwork in various cartoon and animation styles</p>
      </LeftPanelSection>

      <LeftPanelSection title="Cartoon Style">
        <div className="space-y-2">
          {cartoonThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                selectedTheme.id === theme.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{theme.name}</div>
              <div className="text-xs text-gray-500 mt-1">{theme.description}</div>
            </button>
          ))}
        </div>
      </LeftPanelSection>

      <LeftPanelSection title="Prompt">
        <DroppableTextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onDrop={handleDrop}
          placeholder="Describe your cartoon character or scene..."
          className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 resize-none text-sm"
        />
      </LeftPanelSection>

      <LeftPanelSection title="Colorfulness">
        <input type="range" min="20" max="100" value={colorfulness} onChange={(e) => setColorfulness(Number(e.target.value))} className="w-full" />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Muted</span>
          <span>{colorfulness}%</span>
          <span>Vibrant</span>
        </div>
      </LeftPanelSection>

      <LeftPanelFooter>
        <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
          {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" />Generating...</> : <><Wand2 className="w-5 h-5" />Generate Cartoon</>}
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
        <button onClick={() => { const link = document.createElement('a'); link.href = generatedImage; link.download = `cartoon-${Date.now()}.png`; link.click(); }} className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center justify-center gap-2"><Download className="w-4 h-4" />Download</button>
        <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"><Share2 className="w-4 h-4" />Share</button>
      </div>
    </div>
  ) : (
    <EmptyState icon={ImageIcon} title="No Cartoon Generated Yet" description="Select a style and describe your character or scene" tips={['Try Disney style for classic characters', 'Anime works great for action scenes', 'Pixar style for 3D-looking cartoons']} />
  );

  return (
    <>
      <ModernTopHeader title="Cartoon Style Generator" breadcrumbs={[{ label: 'Editor', path: '/editor' }, { label: 'Cartoon Style' }]} />
      <FullScreenLayout leftPanel={leftPanelContent} rightPanel={<RightPanel activeTab={activeTab} onTabChange={setActiveTab} resultContent={resultContent} guideContent={<GuideContent steps={[{ title: 'Choose Style', description: 'Select Disney, Anime, Pixar or other styles' }, { title: 'Describe Scene', description: 'Write your character or scene description' }, { title: 'Adjust Colors', description: 'Set colorfulness level' }, { title: 'Generate', description: 'Create your cartoon artwork' }]} />} apiContent={<APIContent endpoint="/api/v1/cartoon/generate" method="POST" description="Generate cartoon-style artwork." parameters={[{ name: 'prompt', type: 'string', required: true, description: 'Character or scene description' }]} codeExamples={[{ language: 'JavaScript', code: 'fetch("/api/v1/cartoon/generate", { method: "POST", body: JSON.stringify({ prompt: "A happy robot" }) })' }]} responseExample='{"imageUrl": "https://example.com/cartoon.png"}' rateLimit="50 requests/min" />} />} />
    </>
  );
};

export default ModernCartoonImageGenerator;
