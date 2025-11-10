import React, { useState, useEffect, useRef } from 'react';
import { Wand2, Image as ImageIcon, Download, RefreshCw, Zap, Camera, Layers, Sparkles, SlidersHorizontal, Lightbulb, Dices, Upload, Box, Package, X, Shapes } from 'lucide-react';
import { generateActionFigure, generateImageWithGeminiNano } from '../utils/api';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';
import { actionFigureTemplates, generateActionFigurePrompt, getRandomAccessories, getCompanyColors } from '../data/actionFigureTemplates';
import { FontSelector } from './ui/FontSelector';
import EnhancedImageEditorWithChoice from './EnhancedImageEditorWithChoice';
import UniversalPersonalizationPanel from './UniversalPersonalizationPanel';

interface EnhancedActionFigureGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const EnhancedActionFigureGenerator: React.FC<EnhancedActionFigureGeneratorProps> = ({ tokens, onImageGenerated }) => {
  // Template and configuration state
  const [selectedTemplate, setSelectedTemplate] = useState(actionFigureTemplates[0].id);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedFigure, setGeneratedFigure] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'gemini-nano'>('gemini');

  // Personalization panel state
  const [showPersonalizationPanel, setShowPersonalizationPanel] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Personalization fields
  const [characterName, setCharacterName] = useState(tokens['FIRSTNAME'] || '');
  const [companyName, setCompanyName] = useState(tokens['COMPANY'] || '');
  const [jobTitle, setJobTitle] = useState('');
  const [customAccessories, setCustomAccessories] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState('');
  
  // Reference image
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get the current template
  const getCurrentTemplate = () => {
    return actionFigureTemplates.find(t => t.id === selectedTemplate) || actionFigureTemplates[0];
  };
  
  // Update the character name when tokens change
  useEffect(() => {
    if (tokens['FIRSTNAME'] && !characterName) {
      setCharacterName(tokens['FIRSTNAME']);
    }
    if (tokens['COMPANY'] && !companyName) {
      setCompanyName(tokens['COMPANY']);
    }
  }, [tokens]);
  
  // Generate a complete prompt based on template and customizations
  const generateCompletePrompt = () => {
    // Get the template
    const template = getCurrentTemplate();
    
    // Start with any custom prompt
    let finalPrompt = customPrompt ? customPrompt + '. ' : '';
    
    // Add the personalized template prompt
    finalPrompt += generateActionFigurePrompt(selectedTemplate, {
      'NAME': characterName || '[Character Name]',
      'COMPANY': companyName || '[Company Name]',
      'TITLE': jobTitle || '[Job Title]',
    });
    
    // Add any custom accessories if specified
    if (customAccessories.length > 0) {
      finalPrompt = finalPrompt.replace('Accessories include', `Accessories include ${customAccessories.join(', ')}`);
    }
    
    // Add custom colors if specified
    if (customColors) {
      finalPrompt = finalPrompt.replace('[COMPANY] colors', customColors);
    } else if (companyName) {
      // Generate consistent colors based on company name
      finalPrompt = finalPrompt.replace('[COMPANY] colors', getCompanyColors(companyName));
    }
    
    // Adding style emphasis
    finalPrompt += ` Style: ${template.style}, professional product photography, premium toy packaging design.`;
    
    return finalPrompt;
  };
  
  // Generate random options
  const handleRandomize = () => {
    // Select a random template
    const randomIndex = Math.floor(Math.random() * actionFigureTemplates.length);
    setSelectedTemplate(actionFigureTemplates[randomIndex].id);
    
    // Generate random accessories
    setCustomAccessories(getRandomAccessories());
    
    // Generate random colors if no company name
    if (!companyName) {
      setCustomColors(getCompanyColors());
    } else {
      // Or use company based colors
      setCustomColors(getCompanyColors(companyName));
    }
    
    // Clear the custom prompt
    setCustomPrompt('');
  };

  const handleGenerateActionFigure = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Generate the full prompt
      const finalPrompt = generateCompletePrompt();
      
      console.log(`🤖 Generating action figure with ${selectedProvider}:`, { 
        prompt: finalPrompt,
        hasReferenceImage: !!referenceImage
      });
      
      // Call the API to generate the figure
      const imageUrl = await generateActionFigure(finalPrompt, selectedProvider, referenceImage || undefined);
      
      console.log('✅ Successfully generated action figure');
      setGeneratedFigure(imageUrl);
      
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }
    } catch (err) {
      console.error('❌ Failed to generate action figure:', err);
      setError(`Failed to generate action figure: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Fallback to a placeholder image for better UX
      const placeholderUrl = `https://placehold.co/800/333/FFF?text=Generation+Failed`;
      setGeneratedFigure(placeholderUrl);
      
      if (onImageGenerated) {
        onImageGenerated(placeholderUrl);
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle file selection for reference image
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle token drop on the prompt textarea
  const handleTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = customPrompt.substring(0, position) + 
                  item.tokenDisplay + 
                  customPrompt.substring(position);
    setCustomPrompt(newText);
  };
  
  // Handle accessory toggle
  const toggleAccessory = (accessory: string) => {
    if (customAccessories.includes(accessory)) {
      setCustomAccessories(customAccessories.filter(item => item !== accessory));
    } else {
      setCustomAccessories([...customAccessories, accessory]);
    }
  };
  
  // Get standard accessories to display
  const standardAccessories = [
    "Laptop", "Smartphone", "Briefcase", "Coffee Mug", "ID Badge",
    "Business Cards", "Headset", "Tablet", "Notebook", "Pen"
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <Box className="h-6 w-6 text-primary-500 mr-2" />
        Action Figure Creator
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Figure Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {actionFigureTemplates.slice(0, 6).map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-2 cursor-pointer transition hover:shadow ${
                    selectedTemplate === template.id ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="text-sm font-medium truncate">{template.name}</div>
                  <div className="text-xs text-gray-500 truncate">{template.packaging}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-2 text-right">
              <button
                className="text-xs text-primary-600 hover:underline"
                onClick={() => setShowAdvancedOptions(true)}
              >
                View all {actionFigureTemplates.length} styles
              </button>
            </div>
          </div>
          
          {/* Personalization Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Character Name
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder={tokens['FIRSTNAME'] || "Character Name"}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={tokens['COMPANY'] || "Company Name"}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Job Title"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Colors
              </label>
              <input
                type="text"
                value={customColors}
                onChange={(e) => setCustomColors(e.target.value)}
                placeholder={companyName ? getCompanyColors(companyName) : "Brand colors"}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          {/* Custom Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Details (Optional)
            </label>
            <DroppableTextArea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add any custom details you want to include in the action figure..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
              onDrop={handleTokenDrop}
            />
          </div>
          
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Model
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`py-2 px-3 text-sm rounded ${selectedProvider === 'openai'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('openai')}
              >
                DALL-E 3
              </button>
              <button
                className={`py-2 px-3 text-sm rounded ${selectedProvider === 'gemini'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('gemini')}
              >
                Gemini AI
              </button>
              <button
                className={`py-2 px-3 text-sm rounded ${selectedProvider === 'gemini-nano'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('gemini-nano')}
              >
                Gemini Nano
              </button>
            </div>
          </div>
          
          {/* Reference Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Image (Optional)
            </label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUploadClick}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Reference
                </button>
                {referenceImage && (
                  <button 
                    onClick={() => setReferenceImage(null)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                  >
                    Clear Image
                  </button>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />

              {referenceImage && (
                <div className="relative border border-gray-200 rounded-lg p-2">
                  <img 
                    src={referenceImage} 
                    alt="Reference" 
                    className="w-full h-32 object-contain rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This image will be used as a reference for creating your action figure
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleRandomize}
              className="btn btn-outline flex-1 flex items-center justify-center"
              disabled={isGenerating}
            >
              <Dices className="w-4 h-4 mr-2" />
              Randomize Options
            </button>

            <button
              onClick={() => setShowPersonalizationPanel(!showPersonalizationPanel)}
              className="btn btn-secondary flex items-center justify-center px-3"
              disabled={isGenerating}
            >
              <Shapes className="w-4 h-4 mr-2" />
              Personalize
            </button>

            <button
              onClick={handleGenerateActionFigure}
              disabled={isGenerating}
              className="btn btn-primary flex-1 flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating Figure...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Figure
                </>
              )}
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-4">
          {/* Preview Image Area */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ height: "350px" }}>
            {generatedFigure ? (
              <img 
                src={generatedFigure} 
                alt="Generated Action Figure" 
                className="max-w-full max-h-full object-contain" 
              />
            ) : (
              <div className="text-center p-6">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your action figure will appear here</p>
                <p className="text-sm text-gray-400 mt-2">Fill out the form and click Generate</p>
              </div>
            )}
          </div>
          
          {/* Download Buttons */}
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
                download="custom-action-figure.png"
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
          
          {/* Template Preview */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-2 flex items-center">
              <Package className="w-4 h-4 text-primary-600 mr-1" />
              Selected Style: {getCurrentTemplate().name}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {getCurrentTemplate().description}
            </p>
            
            {/* Accessories Selection */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Figure Accessories
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                {standardAccessories.map((accessory) => (
                  <button
                    key={accessory}
                    className={`py-1 px-2 text-xs rounded-md ${
                      customAccessories.includes(accessory) 
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
          </div>

          {/* Style Information */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h4 className="font-medium text-primary-700 flex items-center mb-2">
              <Lightbulb className="w-4 h-4 mr-1" />
              Action Figure Creation Tips
            </h4>
            <ul className="text-xs text-primary-700 space-y-1 list-disc pl-5">
              <li>Choose a template that matches your desired action figure style</li>
              <li>Add a reference image of your subject for more personalized results</li>
              <li>Custom package colors should match company branding</li>
              <li>For best results, provide a clear description of accessories</li>
              <li>Try different AI models for varied artistic interpretations</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Advanced Options Panel - Template Gallery */}
      {showAdvancedOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between">
              <h3 className="text-xl font-bold">Action Figure Templates</h3>
              <button
                onClick={() => setShowAdvancedOptions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {actionFigureTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition ${
                      selectedTemplate === template.id ? 'ring-2 ring-primary-500 shadow-md' : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setShowAdvancedOptions(false);
                    }}
                  >
                    <div className="aspect-video bg-gray-200 relative">
                      {template.preview ? (
                        <img
                          src={template.preview}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {template.packaging}
                        </span>
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                          {template.style}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAdvancedOptions(false)}
                className="btn btn-primary"
              >
                Select & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Personalization Panel */}
      {showPersonalizationPanel && (
        <div className="mt-6">
          <UniversalPersonalizationPanel
            initialContent={generateCompletePrompt()}
            initialContentType="prompt-ai"
            onContentGenerated={(content, type) => {
              setCustomPrompt(content);
              setPersonalizedContent(content);
              setShowPersonalizationPanel(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export { EnhancedActionFigureGenerator };