import React, { useState, useEffect } from 'react';
import { Wand2, Download, Share2, RefreshCw, Sparkles, Image as ImageIcon, Dices } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import FullScreenLayout from '../layout/FullScreenLayout';
import ModernTopHeader from '../layout/ModernTopHeader';
import LeftPanel, { LeftPanelSection, LeftPanelFooter } from '../layout/LeftPanel';
import RightPanel from '../layout/RightPanel';
import EmptyState from '../layout/EmptyState';
import GuideContent from '../layout/GuideContent';
import APIContent from '../layout/APIContent';
import DroppableTextArea from '../DroppableTextArea';
import { FontSelector } from '../ui/FontSelector';
import { TokenDragItem } from '../../types/DragTypes';
import { generateMemeWithReference } from '../../utils/api';
import { getAllTemplates } from '../../data/memeTemplates';

interface ModernMemeGeneratorProps {
  tokens: Record<string, string>;
  onMemeGenerated?: (imageUrl: string) => void;
}

const ModernMemeGenerator: React.FC<ModernMemeGeneratorProps> = ({ tokens, onMemeGenerated }) => {
  const [activeTab, setActiveTab] = useState<'result' | 'guide' | 'api'>('result');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [memeImage, setMemeImage] = useState<string | null>(null);
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [textColor, setTextColor] = useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [textTransform, setTextTransform] = useState<'uppercase' | 'lowercase' | 'capitalize'>('uppercase');
  const [useAiEnhancement, setUseAiEnhancement] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false);

  const templates = getAllTemplates();

  useEffect(() => {
    if (templates.length > 0) {
      setMemeImage(templates[0].url);
    }
  }, []);

  const replaceTokens = (text: string): string => {
    let result = text;
    Object.entries(tokens).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value || `[${key}]`);
    });
    return result;
  };

  const handleDrop = (item: TokenDragItem, caretPosition: number, field: 'top' | 'bottom') => {
    const tokenText = `[${item.tokenKey}]`;
    if (field === 'top') {
      const newValue = topText.substring(0, caretPosition) + tokenText + topText.substring(caretPosition);
      setTopText(newValue);
    } else {
      const newValue = bottomText.substring(0, caretPosition) + tokenText + bottomText.substring(caretPosition);
      setBottomText(newValue);
    }
  };

  const handleGenerate = async () => {
    if (!memeImage) {
      setError('Please select a meme template');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const processedTop = replaceTokens(topText);
      const processedBottom = replaceTokens(bottomText);

      if (useAiEnhancement && aiPrompt) {
        const enhancedUrl = await generateMemeWithReference(processedTop, processedBottom, memeImage, aiPrompt);
        setGeneratedMeme(enhancedUrl);
        if (onMemeGenerated) onMemeGenerated(enhancedUrl);
      } else {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(img, 0, 0);
            ctx.textAlign = 'center';
            ctx.fillStyle = textColor;
            ctx.font = `bold ${fontSize}px ${fontFamily}`;

            const drawText = (text: string, x: number, y: number) => {
              ctx.strokeStyle = strokeColor;
              ctx.lineWidth = strokeWidth;
              ctx.lineJoin = 'round';
              ctx.strokeText(text, x, y);
              ctx.fillText(text, x, y);
            };

            const applyTransform = (text: string) => {
              if (textTransform === 'uppercase') return text.toUpperCase();
              if (textTransform === 'lowercase') return text.toLowerCase();
              return text.charAt(0).toUpperCase() + text.slice(1);
            };

            if (processedTop) {
              drawText(applyTransform(processedTop), canvas.width / 2, fontSize + 20);
            }
            if (processedBottom) {
              drawText(applyTransform(processedBottom), canvas.width / 2, canvas.height - 30);
            }

            const memeUrl = canvas.toDataURL('image/png');
            setGeneratedMeme(memeUrl);
            if (onMemeGenerated) onMemeGenerated(memeUrl);
          }
        };

        img.src = memeImage;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meme');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedMeme) return;
    const link = document.createElement('a');
    link.href = generatedMeme;
    link.download = `meme-${Date.now()}.png`;
    link.click();
  };

  const leftPanelContent = (
    <LeftPanel>
      <LeftPanelSection title="Meme Generator">
        <p className="text-sm text-gray-600">Create viral memes with popular templates and custom text</p>
      </LeftPanelSection>

      <LeftPanelSection title="Templates">
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setMemeImage(template.url)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                memeImage === template.url
                  ? 'border-violet-500 ring-2 ring-violet-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img src={template.url} alt={template.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </LeftPanelSection>

      <LeftPanelSection title="Top Text">
        <DroppableTextArea
          value={topText}
          onChange={(e) => setTopText(e.target.value)}
          onDrop={(item, pos) => handleDrop(item, pos, 'top')}
          placeholder="Enter top text..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 resize-none text-sm"
          rows={2}
        />
      </LeftPanelSection>

      <LeftPanelSection title="Bottom Text">
        <DroppableTextArea
          value={bottomText}
          onChange={(e) => setBottomText(e.target.value)}
          onDrop={(item, pos) => handleDrop(item, pos, 'bottom')}
          placeholder="Enter bottom text..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 resize-none text-sm"
          rows={2}
        />
      </LeftPanelSection>

      <LeftPanelSection title="Text Styling" collapsible={true} defaultExpanded={false}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Font Family</label>
            <FontSelector selectedFont={fontFamily} onFontChange={setFontFamily} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Font Size: {fontSize}px</label>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Text Transform</label>
            <div className="flex gap-2">
              {['uppercase', 'lowercase', 'capitalize'].map((transform) => (
                <button
                  key={transform}
                  onClick={() => setTextTransform(transform as any)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    textTransform === transform ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {transform}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Text Color</label>
            <div className="relative">
              <button
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                className="w-full h-10 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: textColor }}
              />
              {showTextColorPicker && (
                <div className="absolute z-10 mt-2">
                  <HexColorPicker color={textColor} onChange={setTextColor} />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Stroke Color</label>
            <div className="relative">
              <button
                onClick={() => setShowStrokeColorPicker(!showStrokeColorPicker)}
                className="w-full h-10 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: strokeColor }}
              />
              {showStrokeColorPicker && (
                <div className="absolute z-10 mt-2">
                  <HexColorPicker color={strokeColor} onChange={setStrokeColor} />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Stroke Width: {strokeWidth}px</label>
            <input
              type="range"
              min="0"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={useAiEnhancement}
                onChange={(e) => setUseAiEnhancement(e.target.checked)}
                className="rounded"
              />
              AI Enhancement
            </label>
            {useAiEnhancement && (
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enhancement instructions..."
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            )}
          </div>
        </div>
      </LeftPanelSection>

      <LeftPanelFooter>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !memeImage}
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
              Generate Meme
            </>
          )}
        </button>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </LeftPanelFooter>
    </LeftPanel>
  );

  const resultContent = generatedMeme ? (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <img src={generatedMeme} alt="Generated Meme" className="w-full rounded-lg shadow-lg" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
        >
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
      title="No Meme Generated Yet"
      description="Select a template, add your text, and click Generate"
      tips={[
        'Keep text short and punchy for maximum impact',
        'Use contrasting colors for better readability',
        'Try the AI enhancement for creative twists',
        'Drag tokens to personalize your memes'
      ]}
    />
  );

  const guideContent = (
    <GuideContent
      steps={[
        { title: 'Select Template', description: 'Choose from popular meme templates' },
        { title: 'Add Text', description: 'Enter top and bottom text with personalization tokens' },
        { title: 'Customize Style', description: 'Adjust font, colors, and effects' },
        { title: 'Generate & Share', description: 'Create and download your viral meme' }
      ]}
      bestPractices={[
        { title: 'Keep It Simple', description: 'Short, impactful text works best for memes' },
        { title: 'Use High Contrast', description: 'White text with black stroke is most readable' },
        { title: 'Stay Relevant', description: 'Use current templates for maximum engagement' }
      ]}
      faqs={[
        { question: 'Can I upload my own template?', answer: 'Yes! Use the reference image uploader in advanced options.' },
        { question: 'What is AI enhancement?', answer: 'AI can add creative effects and modifications to your meme.' },
        { question: 'Can I use personalization tokens?', answer: 'Absolutely! Drag tokens into the text fields for personalized memes.' }
      ]}
    />
  );

  const apiContent = (
    <APIContent
      endpoint="/api/v1/meme/generate"
      method="POST"
      description="Generate custom memes with templates and text overlays."
      parameters={[
        { name: 'topText', type: 'string', required: false, description: 'Text for top of meme' },
        { name: 'bottomText', type: 'string', required: false, description: 'Text for bottom of meme' },
        { name: 'templateUrl', type: 'string', required: true, description: 'URL of meme template image' },
        { name: 'fontSize', type: 'number', required: false, description: 'Font size in pixels (12-72)' },
        { name: 'textColor', type: 'string', required: false, description: 'Hex color code for text' }
      ]}
      codeExamples={[
        {
          language: 'JavaScript',
          code: `const response = await fetch('/api/v1/meme/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    topText: 'WHEN YOU FINISH',
    bottomText: 'ALL YOUR TASKS',
    templateUrl: 'https://example.com/template.jpg',
    fontSize: 36,
    textColor: '#FFFFFF'
  })
});`
        }
      ]}
      responseExample={`{
  "success": true,
  "imageUrl": "https://example.com/meme123.png"
}`}
      rateLimit="100 requests per minute"
    />
  );

  return (
    <>
      <ModernTopHeader
        title="Meme Generator"
        breadcrumbs={[
          { label: 'Editor', path: '/editor' },
          { label: 'Meme Generator' }
        ]}
      />
      <FullScreenLayout
        leftPanel={leftPanelContent}
        rightPanel={
          <RightPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            resultContent={resultContent}
            guideContent={guideContent}
            apiContent={apiContent}
          />
        }
      />
    </>
  );
};

export default ModernMemeGenerator;
