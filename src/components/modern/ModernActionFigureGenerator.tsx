import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Download, Share2, Edit3, Trash2, RefreshCw, Sparkles, Image as ImageIcon, Brain, Clock, Dices } from 'lucide-react';
import FullScreenLayout from '../layout/FullScreenLayout';
import ModernTopHeader from '../layout/ModernTopHeader';
import LeftPanel, { LeftPanelSection, LeftPanelFooter } from '../layout/LeftPanel';
import RightPanel from '../layout/RightPanel';
import EmptyState from '../layout/EmptyState';
import GuideContent from '../layout/GuideContent';
import APIContent from '../layout/APIContent';
import DroppableTextArea from '../DroppableTextArea';
import ReferenceImageUploader from '../ReferenceImageUploader';
import { TokenDragItem } from '../../types/DragTypes';
import { generateActionFigure } from '../../utils/api';
import templatesService, { ActionFigureTemplate } from '../../services/templatesService';

interface ModernActionFigureGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const ModernActionFigureGenerator: React.FC<ModernActionFigureGeneratorProps> = ({ tokens, onImageGenerated }) => {
  const [activeTab, setActiveTab] = useState<'result' | 'guide' | 'api'>('result');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'gemini-nano'>('openai');
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'wrestling' | 'music' | 'retro'>('general');
  const [templates, setTemplates] = useState<ActionFigureTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [customName, setCustomName] = useState('');
  const [figureStyle, setFigureStyle] = useState('realistic');
  const [figureTheme, setFigureTheme] = useState('superhero');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [packagingStyle, setPackagingStyle] = useState('retro');
  const [poseStyle, setPoseStyle] = useState('action');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);

  const providerOptions = [
    { value: 'openai', label: 'DALL-E 3', speed: 'Medium', quality: 'Excellent' },
    { value: 'gemini', label: 'Gemini', speed: 'Fast', quality: 'Very Good' },
    { value: 'gemini-nano', label: 'Gemini Nano (On-Device)', speed: 'Very Fast', quality: 'Good' }
  ];

  const categories = [
    { value: 'general', label: 'General Action Figures' },
    { value: 'wrestling', label: 'Wrestling Legends' },
    { value: 'music', label: 'Music Stars' },
    { value: 'retro', label: 'Retro Style' }
  ];

  const figureStyles = ['Realistic', 'Cartoon', '3D Render', 'Anime', 'Sketch'];
  const themes = ['Superhero', 'Fantasy', 'Sci-Fi', 'Modern', 'Historical'];
  const packagingStyles = ['Retro', 'Modern', 'Premium', 'Minimalist'];
  const poses = ['Action', 'Standing', 'Flying', 'Fighting', 'Heroic'];

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const data = await templatesService.getActionFigureTemplates(selectedCategory);
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(0);
        }
      } catch (err) {
        console.error('Error loading templates:', err);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, [selectedCategory]);

  const accessoryOptions = Array.from(new Set(templates.flatMap(t => t.accessories || [])));

  const toggleAccessory = (accessory: string) => {
    setSelectedAccessories(prev =>
      prev.includes(accessory) ? prev.filter(a => a !== accessory) : [...prev, accessory]
    );
  };

  const handleDrop = (item: TokenDragItem, caretPosition: number) => {
    const tokenText = `[${item.tokenKey}]`;
    const newValue = prompt.substring(0, caretPosition) + tokenText + prompt.substring(caretPosition);
    setPrompt(newValue);
  };

  const generatePrompt = () => {
    const name = tokens['FIRSTNAME'] || customName || 'the character';

    if (templates[selectedTemplate]) {
      const template = templates[selectedTemplate];
      return templatesService.generateActionFigurePrompt(template, {
        NAME: name,
        COMPANY: tokens['COMPANY'] || 'your company'
      });
    }

    return `A highly detailed ${figureStyle.toLowerCase()} style action figure of ${name} in a ${figureTheme.toLowerCase()} theme. ${poseStyle} pose. ${packagingStyle} packaging style. Professional toy photography, high resolution.`;
  };

  const handleRandomize = () => {
    const randomTemplate = Math.floor(Math.random() * templates.length);
    setSelectedTemplate(randomTemplate);
    const newPrompt = generatePrompt();
    setPrompt(newPrompt);
  };

  const handleGenerate = async () => {
    const finalPrompt = prompt || generatePrompt();
    if (!finalPrompt.trim()) {
      setError('Please enter a prompt or use templates');
      return;
    }

    setIsGenerating(true);
    setError(null);
    const startTime = Date.now();

    try {
      const imageUrl = await generateActionFigure(finalPrompt, selectedProvider, referenceImage || undefined);
      setGeneratedImage(imageUrl);
      setGenerationTime(Date.now() - startTime);
      setGenerationHistory(prev => [imageUrl, ...prev].slice(0, 10));
      onImageGenerated(imageUrl);
      setActiveTab('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate action figure');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `action-figure-${Date.now()}.png`;
    link.click();
  };

  const leftPanelContent = (
    <LeftPanel>
      <LeftPanelSection title="Action Figure Generator">
        <p className="text-sm text-gray-600">Create custom action figures with AI using templates or your own designs</p>
      </LeftPanelSection>

      <LeftPanelSection title="Category">
        <div className="grid grid-cols-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </LeftPanelSection>

      <LeftPanelSection title="Templates">
        {isLoadingTemplates ? (
          <div className="text-center py-4 text-gray-500">Loading templates...</div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template, index) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedTemplate === index
                    ? 'border-violet-500 ring-2 ring-violet-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {template.preview_image ? (
                  <img src={template.preview_image} alt={template.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No templates available</p>
        )}
      </LeftPanelSection>

      <LeftPanelSection title="Model">
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
        >
          {providerOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.speed}
            </option>
          ))}
        </select>
      </LeftPanelSection>

      <LeftPanelSection title="Prompt">
        <DroppableTextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onDrop={handleDrop}
          placeholder="Describe your action figure or use templates..."
          className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 resize-none text-sm"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setPrompt(generatePrompt())}
            className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Generate from Template
          </button>
          <button
            onClick={handleRandomize}
            className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <Dices className="w-3 h-3" />
            Randomize
          </button>
        </div>
      </LeftPanelSection>

      <LeftPanelSection title="Character Name">
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Enter character name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
        />
      </LeftPanelSection>

      <LeftPanelSection title="Customization" collapsible={true} defaultExpanded={false}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Figure Style</label>
            <div className="flex flex-wrap gap-2">
              {figureStyles.map(style => (
                <button
                  key={style}
                  onClick={() => setFigureStyle(style)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    figureStyle === style ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={figureTheme}
              onChange={(e) => setFigureTheme(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {themes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Pose</label>
            <div className="flex flex-wrap gap-2">
              {poses.map(pose => (
                <button
                  key={pose}
                  onClick={() => setPoseStyle(pose)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    poseStyle === pose ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {pose}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Packaging Style</label>
            <div className="flex flex-wrap gap-2">
              {packagingStyles.map(pkg => (
                <button
                  key={pkg}
                  onClick={() => setPackagingStyle(pkg)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    packagingStyle === pkg ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {pkg}
                </button>
              ))}
            </div>
          </div>

          {accessoryOptions.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Accessories</label>
              <div className="flex flex-wrap gap-2">
                {accessoryOptions.map(accessory => (
                  <button
                    key={accessory}
                    onClick={() => toggleAccessory(accessory)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedAccessories.includes(accessory)
                        ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                    }`}
                  >
                    {accessory}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Reference Image</label>
            <ReferenceImageUploader
              onImageUploaded={(url) => setReferenceImage(url)}
              currentImage={referenceImage}
            />
          </div>
        </div>
      </LeftPanelSection>

      <LeftPanelFooter>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
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
              Generate Action Figure
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

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Brain className="w-4 h-4" />
            <span>{providerOptions.find(p => p.value === selectedProvider)?.label}</span>
          </div>
          {generationTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{(generationTime / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>
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
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
          <Edit3 className="w-4 h-4" />
        </button>
        <button onClick={() => setGeneratedImage(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {generationHistory.length > 1 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Generations</h3>
          <div className="grid grid-cols-4 gap-3">
            {generationHistory.slice(1).map((url, index) => (
              <button
                key={index}
                onClick={() => setGeneratedImage(url)}
                className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-violet-500 transition-all"
              >
                <img src={url} alt={`History ${index}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : (
    <EmptyState
      icon={ImageIcon}
      title="No Action Figure Generated Yet"
      description="Select a template or customize your settings, then click Generate"
      tips={[
        'Choose from wrestling, music star, or retro categories',
        'Customize accessories and packaging style',
        'Use reference images for better accuracy',
        'Try the randomize button for inspiration'
      ]}
    />
  );

  const guideContent = (
    <GuideContent
      steps={[
        { title: 'Select Category', description: 'Choose from General, Wrestling, Music Stars, or Retro styles' },
        { title: 'Pick a Template', description: 'Browse pre-made templates or start from scratch' },
        { title: 'Customize Details', description: 'Add name, accessories, pose, and packaging style' },
        { title: 'Generate & Download', description: 'Create your custom action figure in seconds' }
      ]}
      bestPractices={[
        { title: 'Use Reference Images', description: 'Upload a photo for more accurate character representation' },
        { title: 'Mix Accessories', description: 'Combine different accessories for unique figures' },
        { title: 'Try Different Styles', description: 'Experiment with realistic, cartoon, and anime styles' }
      ]}
      faqs={[
        { question: 'Can I create custom wrestlers?', answer: 'Yes! Use the Wrestling category and add a reference image for best results.' },
        { question: 'What packaging styles are available?', answer: 'Choose from Retro, Modern, Premium, or Minimalist packaging designs.' },
        { question: 'Can I use personalization tokens?', answer: 'Absolutely! Drag tokens into the prompt for personalized figures.' }
      ]}
    />
  );

  const apiContent = (
    <APIContent
      endpoint="/api/v1/action-figure/generate"
      method="POST"
      description="Generate custom action figures with templates, accessories, and packaging options."
      parameters={[
        { name: 'prompt', type: 'string', required: true, description: 'Description of the action figure' },
        { name: 'provider', type: 'string', required: false, description: 'AI provider: openai, gemini, gemini-nano' },
        { name: 'category', type: 'string', required: false, description: 'Category: general, wrestling, music, retro' },
        { name: 'style', type: 'string', required: false, description: 'Figure style: realistic, cartoon, 3d-render, anime' },
        { name: 'accessories', type: 'array', required: false, description: 'Array of accessory names' }
      ]}
      codeExamples={[
        {
          language: 'JavaScript',
          code: `const response = await fetch('/api/v1/action-figure/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'A superhero action figure with cape and shield',
    provider: 'openai',
    category: 'general',
    style: 'realistic',
    accessories: ['cape', 'shield', 'helmet']
  })
});

const data = await response.json();`
        }
      ]}
      responseExample={`{
  "success": true,
  "imageUrl": "https://example.com/figure123.png",
  "metadata": {
    "category": "general",
    "style": "realistic",
    "accessories": ["cape", "shield"]
  }
}`}
      rateLimit="50 requests per minute"
    />
  );

  return (
    <>
      <ModernTopHeader
        title="Action Figure Generator"
        breadcrumbs={[
          { label: 'Editor', path: '/editor' },
          { label: 'Action Figure Generator' }
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

export default ModernActionFigureGenerator;
