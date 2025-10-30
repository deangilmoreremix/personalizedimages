import React, { useState, useEffect, useRef } from 'react';
import { Wand2, Image as ImageIcon, Download, RefreshCw, Zap, Camera, Layers, Sparkles, SlidersHorizontal, Lightbulb, Dices, Upload, Box, ChevronDown, ChevronUp, History } from 'lucide-react';
import { generateActionFigure } from '../utils/api';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';
import ReferenceImageUploader from './ReferenceImageUploader';
import EnhancedImageEditorWithChoice from './EnhancedImageEditorWithChoice';
import templatesService, { ActionFigureTemplate } from '../services/templatesService';

interface ActionFigureGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const ActionFigureGenerator: React.FC<ActionFigureGeneratorProps> = ({ tokens, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedFigure, setGeneratedFigure] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai');
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [figureStyle, setFigureStyle] = useState<string>('realistic');
  const [figureTheme, setFigureTheme] = useState<string>('superhero');
  const [figureAccessories, setFigureAccessories] = useState<string[]>([]);
  const [customName, setCustomName] = useState('');
  const [selectedStyleOption, setSelectedStyleOption] = useState(0);
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'wrestling' | 'music' | 'retro'>('general');
  const [templates, setTemplates] = useState<ActionFigureTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load templates from Supabase
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const data = await templatesService.getActionFigureTemplates(selectedCategory);
        setTemplates(data);
        if (data.length > 0) {
          setSelectedStyleOption(0);
        }
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load templates from database');
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, [selectedCategory]);

  // Use accessories from loaded templates
  const accessoryOptions = Array.from(new Set(templates.flatMap(template => template.accessories || [])));

  // Simple theme options for fallback
  const themeOptions = ['Superhero', 'Fantasy', 'Sci-Fi', 'Modern'];

  const styles = templates;

  // Example predefined styles (simplified list from the 30 styles)
  const styleOptions = [
    { value: 'realistic', label: 'Realistic' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'digital-art', label: '3D Render' },
    { value: 'sketch', label: 'Sketch' },
    { value: 'anime', label: 'Anime' },
    { value: 'illustration', label: 'Illustration' }
  ];

  useEffect(() => {
    // Initialize with first template when category changes
    if (styles.length > 0) {
      setSelectedStyleOption(0);
    }
  }, [selectedCategory, styles]);

  const toggleAccessory = (accessory: string) => {
    if (figureAccessories.includes(accessory)) {
      setFigureAccessories(figureAccessories.filter(item => item !== accessory));
    } else {
      setFigureAccessories([...figureAccessories, accessory]);
    }
  };

  const generatePrompt = () => {
    // Apply personalization from tokens
    const name = tokens['FIRSTNAME'] || customName || 'the character';

    // If we're using a style from the dropdown, use that template
    if (selectedStyleOption !== null && styles[selectedStyleOption]) {
      const template = styles[selectedStyleOption];

      // Use the templates service to generate personalized prompt
      const personalizedPrompt = templatesService.generateActionFigurePrompt(template, {
        NAME: name,
        COMPANY: tokens['COMPANY'] || 'your company'
      });

      setPrompt(personalizedPrompt);
      return personalizedPrompt;
    } else {
      // Fallback to the original prompt construction
      const basePrompt = `A highly detailed ${figureStyle.toLowerCase()} style action figure of ${name} in a ${figureTheme.toLowerCase()} theme. The figure should have realistic details, joints, packaging, and accessories like a real commercial toy product. Professional toy photography style, high resolution.`;
      setPrompt(basePrompt);
      return basePrompt;
    }
  };

  const generateRandomPrompt = () => {
    // Select a random template from the styles array
    const randomStyleIndex = Math.floor(Math.random() * styles.length);
    setSelectedStyleOption(randomStyleIndex);

    // Generate and set the prompt with the new random selection
    setTimeout(() => {
      const newPrompt = generatePrompt();
      setPrompt(newPrompt);
    }, 100);
  };

  const handleGenerateActionFigure = async () => {
    if (!prompt) {
      const newPrompt = generatePrompt();
      if (!newPrompt) {
        setError('Please enter a prompt or generate one using the options below.');
        return;
      }
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      const finalPrompt = prompt || generatePrompt();
      console.log(`🤖 Generating action figure with ${selectedProvider}:`, { 
        prompt: finalPrompt,
        hasReferenceImage: !!referenceImage
      });
      
      const imageUrl = await generateActionFigure(finalPrompt, selectedProvider, referenceImage || undefined);
      console.log('✅ Successfully generated action figure');

      setGeneratedFigure(imageUrl);
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }

      // Save generated image to database
      const selectedTemplate = styles[selectedStyleOption];
      await templatesService.saveGeneratedImage({
        image_url: imageUrl,
        prompt: finalPrompt,
        template_type: 'action_figure',
        template_id: selectedTemplate?.template_id,
        provider: selectedProvider,
        metadata: {
          category: selectedCategory,
          hasReferenceImage: !!referenceImage,
          accessories: figureAccessories
        }
      });
    } catch (err) {
      console.error('❌ Failed to generate action figure:', err);
      if (err instanceof Error) {
        if (err.message.includes('API key') || err.message.includes('API configuration')) {
          setError(`API Configuration Required: ${err.message}\n\nPlease add your API keys to your environment variables and redeploy.`);
        } else {
          setError(`Failed to generate action figure: ${err.message}`);
        }
      } else {
        setError(`Failed to generate action figure: Unknown error occurred.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Create the prompt based on the selected options
  useEffect(() => {
    if (templates.length > 0 || (figureStyle && figureTheme)) {
      generatePrompt();
    }
  }, [selectedStyleOption, figureStyle, figureTheme, figureAccessories, tokens, customName]);
  
  // Handle token drop on the prompt textarea
  const handleTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = prompt.substring(0, position) + 
                  item.tokenDisplay + 
                  prompt.substring(position);
    setPrompt(newText);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">AI Action Figure Generator</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Figure Description
            </label>
            <div className="relative">
              <DroppableTextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the action figure you want to create..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]"
                onDrop={handleTokenDrop}
              />
              <button
                onClick={generateRandomPrompt}
                className="absolute bottom-2 right-2 p-1 text-gray-500 hover:text-primary-600 bg-white rounded"
                title="Generate random action figure concept"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                AI Model
              </label>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-xs text-gray-600 hover:text-primary-600 flex items-center"
              >
                <SlidersHorizontal className="w-3 h-3 mr-1" />
                {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                className={`py-2 px-4 text-sm rounded ${selectedProvider === 'openai' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('openai')}
              >
                DALL-E 3
              </button>
              <button
                className={`py-2 px-4 text-sm rounded ${selectedProvider === 'gemini' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('gemini')}
              >
                Gemini AI
              </button>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Figure Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                className={`py-2 px-3 text-sm rounded ${
                  selectedCategory === 'general'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => {
                  setSelectedCategory('general');
                  setSelectedStyleOption(0);
                }}
              >
                General
              </button>
              <button
                className={`py-2 px-3 text-sm rounded ${
                  selectedCategory === 'wrestling'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => {
                  setSelectedCategory('wrestling');
                  setSelectedStyleOption(0);
                }}
              >
                Wrestling
              </button>
              <button
                className={`py-2 px-3 text-sm rounded ${
                  selectedCategory === 'music'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => {
                  setSelectedCategory('music');
                  setSelectedStyleOption(0);
                }}
              >
                Music Stars
              </button>
              <button
                className={`py-2 px-3 text-sm rounded ${
                  selectedCategory === 'retro'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => {
                  setSelectedCategory('retro');
                  setSelectedStyleOption(0);
                }}
              >
                Retro Toys
              </button>
            </div>
          </div>

          {/* Reference Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Image (Optional)
            </label>
            <ReferenceImageUploader
              onImageSelected={(url) => setReferenceImage(url)}
              currentImage={referenceImage}
              onClearImage={() => setReferenceImage(null)}
              category="action-figure"
              showHistory={true}
            />
          </div>
          
          {showAdvancedOptions && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Character Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={tokens['FIRSTNAME'] || "Custom character name"}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use the first name from personalization tokens: {tokens['FIRSTNAME'] || "Not set"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style Type
                </label>
                <select
                  value={selectedStyleOption}
                  onChange={(e) => setSelectedStyleOption(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {/* Display either first 10 styles or all 30 based on showAllStyles state */}
                  {(showAllStyles ? styles : styles.slice(0, 10)).map((style, index) => (
                    <option key={index} value={index}>
                      {(style as any).name || (style as any).title}
                    </option>
                  ))}
                </select>

                {!showAllStyles && (
                  <button 
                    onClick={() => setShowAllStyles(true)}
                    className="mt-2 text-xs text-primary-600 hover:underline"
                  >
                    Show all 30 styles
                  </button>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Figure Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {styleOptions.map((style) => (
                    <button
                      key={style.value}
                      className={`py-2 px-3 text-xs rounded ${
                        figureStyle.toLowerCase() === style.value.toLowerCase()
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setFigureStyle(style.value)}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Figure Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {themeOptions.map((theme) => (
                    <button
                      key={theme}
                      className={`py-2 px-3 text-xs rounded ${
                        figureTheme.toLowerCase() === theme.toLowerCase()
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setFigureTheme(theme)}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accessories & Features
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {accessoryOptions.map((accessory) => (
                    <button
                      key={accessory}
                      className={`py-2 px-3 text-xs rounded ${
                        figureAccessories.includes(accessory)
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => toggleAccessory(accessory)}
                    >
                      {accessory}
                    </button>
                  ))}
                </div>
              </div>

              {referenceImage && (
                <div className="p-3 bg-green-50 rounded-lg text-xs text-green-700">
                  <p className="font-medium">Reference Image Active:</p>
                  <p>Your uploaded image will be used as inspiration when creating your action figure. The AI will incorporate elements from your reference.</p>
                </div>
              )}
              
              <div className="p-3 bg-yellow-50 rounded-lg text-xs text-yellow-800">
                <p className="font-medium">Tip:</p>
                <p>For best results, choose a style that complements your theme. For example, "3D Rendered" works well with "Sci-Fi" themes, while "Vintage Action Figure" pairs nicely with "Superhero" themes.</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={handleGenerateActionFigure}
            disabled={isGenerating}
            className="btn btn-primary w-full flex justify-center items-center"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Action Figure...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Action Figure
              </>
            )}
          </button>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: "300px" }}>
            {generatedFigure ? (
              <img 
                src={generatedFigure} 
                alt="Generated Action Figure" 
                className="max-w-full max-h-[400px] object-contain" 
              />
            ) : (
              <div className="text-center p-6">
                <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your action figure will appear here</p>
              </div>
            )}
          </div>
          
          {generatedFigure && (
            <div className="flex gap-2">
              <button
                onClick={() => window.open(generatedFigure)}
                className="btn btn-outline flex-1 flex items-center justify-center"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                View Full Size
              </button>

              <a
                href={generatedFigure}
                download="action-figure.png"
                className="btn btn-primary flex-1 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </div>
          )}

          {/* Enhanced Image Editor with AI and Classic Options */}
          {generatedFigure && (
            <div className="mt-6">
              <EnhancedImageEditorWithChoice
                imageUrl={generatedFigure}
                onImageUpdated={(newImageUrl) => {
                  setGeneratedFigure(newImageUrl);
                  if (onImageGenerated) {
                    onImageGenerated(newImageUrl);
                  }
                }}
                tokens={tokens}
              />
            </div>
          )}

          {generatedFigure && (
            <div className="bg-primary-50 p-4 rounded-lg">
              <h4 className="font-medium text-primary-700 flex items-center mb-2">
                <Sparkles className="w-4 h-4 mr-1" />
                Personalization Features
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                This image has been personalized with:
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Character name: <span className="font-medium ml-1">{tokens['FIRSTNAME'] || customName || 'Custom'}</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Style: <span className="font-medium ml-1">{(styles[selectedStyleOption] as any)?.name || (styles[selectedStyleOption] as any)?.title || figureStyle}</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Theme: <span className="font-medium ml-1">{figureTheme}</span>
                </li>
                {figureAccessories.length > 0 && (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 mt-1.5"></span>
                    <div>
                      Accessories: 
                      <span className="font-medium ml-1">{figureAccessories.join(', ')}</span>
                    </div>
                  </li>
                )}
                {referenceImage && (
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                    Custom reference image used
                  </li>
                )}
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                This action figure image is fully personalized and can be used in email campaigns, social media, or marketing materials.
              </p>
            </div>
          )}

          {/* Style Gallery Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700">Popular Style Previews</h4>
              <button
                onClick={() => setShowAllStyles(!showAllStyles)}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
              >
                {showAllStyles ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                {showAllStyles ? "Show Less" : "Show All 30"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(showAllStyles ? styles : styles.slice(0, 6)).map((style, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg cursor-pointer text-center ${
                    selectedStyleOption === index ? 'bg-primary-100 border border-primary-300' : 'bg-white border border-gray-200'
                  }`}
                  onClick={() => setSelectedStyleOption(index)}
                >
                  <div className="text-xs font-medium mb-1 truncate">{(style as any).name || (style as any).title}</div>
                  <div className="text-xs text-gray-500 truncate">{(style as any).description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg text-xs text-yellow-700">
            <p className="font-medium">Prompt Details:</p>
            <p className="mt-1 whitespace-pre-wrap">{prompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionFigureGenerator;