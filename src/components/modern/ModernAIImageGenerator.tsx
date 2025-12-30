import React, { useState } from 'react';
import { Upload, Sparkles, RefreshCw, Download, Heart, Folder, Tag, Image as ImageIcon, Search } from 'lucide-react';
import FullScreenLayout from '../layout/FullScreenLayout';
import ModernTopHeader from '../layout/ModernTopHeader';
import LeftPanel, { LeftPanelSection, LeftPanelFooter } from '../layout/LeftPanel';
import RightPanel from '../layout/RightPanel';
import EmptyState from '../layout/EmptyState';
import GuideContent from '../layout/GuideContent';
import APIContent from '../layout/APIContent';
import DroppableTextArea from '../DroppableTextArea';
import AssetPicker from '../AssetPicker';
import { TokenDragItem } from '../../types/DragTypes';
import { useAssetIntegration } from '../../hooks/useAssetIntegration';
import {
  generateImageWithDalle,
  generateImageWithGemini,
  generateImageWithGemini2Flash,
  generateImageWithImagen,
  generateImageWithGptImage
} from '../../utils/api';
import { cloudGalleryService } from '../../services/cloudGalleryService';
import { promptEnhancementService } from '../../services/promptEnhancementService';

interface ModernAIImageGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const ModernAIImageGenerator: React.FC<ModernAIImageGeneratorProps> = ({
  tokens,
  onImageGenerated
}) => {
  const [activeTab, setActiveTab] = useState<'result' | 'guide' | 'api'>('result');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, chaotic, deformed, watermark, bad anatomy, shaky camera view point');
  const [selectedModel, setSelectedModel] = useState('openai');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('natural');

  // Asset integration
  const assetIntegration = useAssetIntegration({
    toolType: 'image-generator',
    preferredTypes: ['image'],
    autoTrackUsage: true
  });

  const exampleImages = [
    'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100',
    'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
    'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=100',
    'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100',
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
    'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=100'
  ];

  const models = [
    { id: 'openai', name: 'DALL-E 3', description: 'OpenAI\'s latest model' },
    { id: 'gemini', name: 'Gemini', description: 'Google\'s AI model' },
    { id: 'gemini2flash', name: 'Gemini 2 Flash', description: 'Fast generation' },
    { id: 'imagen', name: 'Imagen 3', description: 'High quality images' },
    { id: 'gpt-image-1', name: 'GPT Image', description: 'Advanced AI' }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setReferenceImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

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
    if (!prompt.trim()) return;

    setIsGenerating(true);
    const startTime = Date.now();

    try {
      const processedPrompt = replaceTokens(prompt);

      // Try to enhance the prompt with AI
      let enhancedPrompt = processedPrompt;
      try {
        const enhancement = await promptEnhancementService.enhancePrompt(processedPrompt, 'professional', 'portrait');
        enhancedPrompt = enhancement.enhanced;
      } catch (err) {
        console.warn('Prompt enhancement failed, using original:', err);
      }

      let imageUrl: string;

      switch (selectedModel) {
        case 'gemini':
          imageUrl = await generateImageWithGemini(enhancedPrompt, aspectRatio, style);
          break;
        case 'gemini2flash':
          imageUrl = await generateImageWithGemini2Flash(enhancedPrompt);
          break;
        case 'imagen':
          imageUrl = await generateImageWithImagen(enhancedPrompt, aspectRatio);
          break;
        case 'gpt-image-1':
          imageUrl = await generateImageWithGptImage(enhancedPrompt);
          break;
        default:
          imageUrl = await generateImageWithDalle(enhancedPrompt, {
            size: aspectRatio === '1:1' ? '1024x1024' : aspectRatio === '16:9' ? '1792x1024' : '1024x1792',
            quality,
            style: style === 'natural' ? 'natural' : 'vivid'
          });
      }

      const generationTimeMs = Date.now() - startTime;
      setGenerationTime(generationTimeMs);
      setGeneratedImages(prev => [imageUrl, ...prev]);
      onImageGenerated(imageUrl);
      setActiveTab('result');

      // Save to cloud gallery
      try {
        await cloudGalleryService.saveImage({
          image_url: imageUrl,
          prompt: processedPrompt,
          enhanced_prompt: enhancedPrompt,
          tokens,
          model: selectedModel,
          style,
          aspect_ratio: aspectRatio,
          quality,
          tags: [],
          generation_time_ms: generationTimeMs
        });
      } catch (err) {
        console.warn('Failed to save to gallery:', err);
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const leftPanelContent = (
    <LeftPanel>
      <LeftPanelSection title="AI Image Generator">
        <p className="text-sm text-gray-600">Create stunning images with AI-powered generation</p>
      </LeftPanelSection>

      <LeftPanelSection title="Photo">
        <label className="block w-full px-4 py-12 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-violet-500 transition-colors bg-gray-50">
          {referenceImage ? (
            <img src={referenceImage} alt="Reference" className="max-h-32 mx-auto rounded" />
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">Upload Image</p>
              <p className="text-xs text-gray-500 mt-1">Click or drag a file to this area to upload</p>
              <p className="text-xs text-gray-400 mt-1">Format: jpg/png/webp, Size: up to 10M</p>
              <p className="text-xs text-gray-400">Dimensions: Width and height between 300-4000 pixels</p>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-700">Reference Options</p>
            <button
              onClick={assetIntegration.openAssetPicker}
              className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              Browse Asset Library
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {exampleImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Example ${idx + 1}`}
                className="w-16 h-16 rounded object-cover cursor-pointer hover:ring-2 hover:ring-violet-500 transition-all"
                onClick={() => setReferenceImage(img)}
              />
            ))}
          </div>
        </div>
      </LeftPanelSection>

      <LeftPanelSection title="Prompt (Desired Effect)">
        <DroppableTextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onDrop={handleDrop}
          placeholder="Describe the image you want to create..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 min-h-[100px] text-sm"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">{prompt.length}/500</span>
          <button
            onClick={async () => {
              try {
                const suggestions = await promptEnhancementService.getSmartSuggestions(prompt, 'portrait');
                if (suggestions.length > 0) {
                  setPrompt(prompt + ' ' + suggestions[0]);
                }
              } catch (err) {
                console.error('Failed to get suggestions:', err);
              }
            }}
            className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            AI Enhance
          </button>
        </div>
      </LeftPanelSection>

      <LeftPanelSection title="Negative Prompt (Undesired Effect)">
        <textarea
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="What you don't want in the image..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 min-h-[80px] text-sm"
        />
        <div className="text-xs text-gray-500 mt-2">{negativePrompt.length}/200</div>
      </LeftPanelSection>

      <LeftPanelSection title="Model">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
        >
          {models.map(model => (
            <option key={model.id} value={model.id}>{model.name} - {model.description}</option>
          ))}
        </select>
      </LeftPanelSection>

      <LeftPanelSection title="Settings">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Quality</label>
            <div className="flex gap-2">
              <button
                onClick={() => setQuality('standard')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  quality === 'standard' ? 'bg-violet-100 text-violet-700 border-2 border-violet-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setQuality('hd')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  quality === 'hd' ? 'bg-violet-100 text-violet-700 border-2 border-violet-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                HD
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {['1:1', '16:9', '9:16'].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    aspectRatio === ratio ? 'bg-violet-100 text-violet-700 border-2 border-violet-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
            >
              <option value="natural">Natural</option>
              <option value="vivid">Vivid</option>
              <option value="cinematic">Cinematic</option>
              <option value="artistic">Artistic</option>
            </select>
          </div>
        </div>
      </LeftPanelSection>

      <LeftPanelFooter>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 bg-violet-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-violet-700 transition-all"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate
            </>
          )}
        </button>
        {generationTime && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Generated in {(generationTime / 1000).toFixed(2)}s
          </p>
        )}
      </LeftPanelFooter>
    </LeftPanel>
  );

  const resultContent = generatedImages.length > 0 ? (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">My Result</h2>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Folder className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Tag className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {generatedImages.map((img, idx) => (
          <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={img}
              alt={`Generated ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = img;
                  link.download = `ai-image-${Date.now()}.png`;
                  link.click();
                }}
                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <EmptyState
      icon={ImageIcon}
      title="No Images Generated Yet"
      description="Enter a prompt and click Generate to create your first AI image"
      tips={[
        'Be specific and detailed in your prompts',
        'Use the AI Enhance button for better results',
        'Try different models to compare quality',
        'Reference images can improve accuracy'
      ]}
    />
  );

  const guideContent = (
    <GuideContent
      title="AI Image Generation Process"
      steps={[
        {
          title: 'Upload Reference (Optional)',
          description: 'Upload a photo for style reference. AI will use this to understand the visual style you want.'
        },
        {
          title: 'Write Your Prompt',
          description: 'Describe the image you want in detail. Include subjects, setting, lighting, style, and mood.'
        },
        {
          title: 'Add Negative Prompt',
          description: 'Specify what you DON\'T want in the image to avoid unwanted elements.'
        },
        {
          title: 'Choose Model & Settings',
          description: 'Select AI model, quality level, aspect ratio, and style preferences.'
        },
        {
          title: 'Generate & Download',
          description: 'Click Generate to create your image. Results appear in the gallery where you can download or save.'
        }
      ]}
      tips={[
        'DALL-E 3 produces highly realistic and detailed images',
        'Gemini Flash is fastest for quick iterations',
        'HD quality doubles generation time but improves details',
        'Use specific art styles (oil painting, watercolor, etc.) for better results'
      ]}
    />
  );

  const apiContent = (
    <APIContent
      endpoint="/api/v1/image/generate"
      method="POST"
      description="Generate AI images using various models with customizable parameters."
      parameters={[
        { name: 'prompt', type: 'string', required: true, description: 'Detailed description of the desired image' },
        { name: 'negative_prompt', type: 'string', required: false, description: 'Elements to avoid in the generation' },
        { name: 'model', type: 'string', required: false, description: 'AI model: openai, gemini, imagen, etc.' },
        { name: 'quality', type: 'string', required: false, description: 'Image quality: standard or hd' },
        { name: 'aspect_ratio', type: 'string', required: false, description: 'Aspect ratio: 1:1, 16:9, or 9:16' },
        { name: 'style', type: 'string', required: false, description: 'Visual style: natural, vivid, cinematic, artistic' }
      ]}
      codeExamples={[
        {
          language: 'JavaScript',
          code: `const response = await fetch('/api/v1/image/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A professional headshot photo',
    model: 'openai',
    quality: 'hd',
    aspect_ratio: '1:1'
  })
});

const data = await response.json();
console.log(data.imageUrl);`
        },
        {
          language: 'Python',
          code: `import requests

response = requests.post('/api/v1/image/generate', json={
    'prompt': 'A professional headshot photo',
    'model': 'openai',
    'quality': 'hd',
    'aspect_ratio': '1:1'
})

data = response.json()
print(data['imageUrl'])`
        }
      ]}
      responseExample={`{
  "success": true,
  "imageUrl": "https://example.com/generated-image.png",
  "generationTime": 3500,
  "model": "openai",
  "dimensions": {
    "width": 1024,
    "height": 1024
  }
}`}
      rateLimit="50 requests per hour"
    />
  );

  return (
    <>
      <ModernTopHeader
        title="AI Image Generator"
        breadcrumbs={[{ label: 'Features', path: '/features' }, { label: 'AI Image Generator' }]}
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

      {/* Asset Picker Modal */}
      <AssetPicker
        isOpen={assetIntegration.isAssetPickerOpen}
        onClose={assetIntegration.closeAssetPicker}
        onSelect={async (asset) => {
          // Integrate the selected asset
          const integratedAsset = await assetIntegration.integrateAsset(asset, 'reference-image');
          setReferenceImage(integratedAsset.url);
          assetIntegration.closeAssetPicker();
        }}
        title="Choose Reference Asset"
        assetType="image"
      />
    </>
  );
};

export default ModernAIImageGenerator;
