import React, { useState, useEffect, useRef } from 'react';
import { Wand2, Image as ImageIcon, Download, RefreshCw, Zap, Sparkles, SlidersHorizontal, Lightbulb, Dices, Paintbrush as PaintBrush } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateImageWithDalle, generateImageWithGemini, generateCartoonImage } from '../utils/api';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';
import cartoonThemesConfig from '../data/cartoonThemes';
import ReferenceImageUploader from './ReferenceImageUploader';
import EnhancedImageEditorWithChoice from './EnhancedImageEditorWithChoice';
import { DESIGN_SYSTEM, getGridClasses, getButtonClasses, getAlertClasses, getElevationClasses, getAnimationClasses, commonStyles } from './ui/design-system';

interface CartoonImageGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const CartoonImageGenerator: React.FC<CartoonImageGeneratorProps> = ({ tokens, onImageGenerated }) => {
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai');
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('Cartoon Styles');
  const [showAllThemes, setShowAllThemes] = useState(false);
  
  // Initialize with the first theme
  useEffect(() => {
    if (cartoonThemesConfig.themes.length > 0) {
      const themePrompt = cartoonThemesConfig.themes[0].prompt;
      setPrompt(themePrompt);
    }
  }, []);

  const handleThemeSelect = (index: number) => {
    setSelectedTheme(index);
    const themePrompt = cartoonThemesConfig.themes[index].prompt;
    setPrompt(themePrompt);
  };

  const handleGenerateImage = async () => {
    if (!prompt) {
      setError('Please select a theme or enter a custom prompt.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      // Combine the theme prompt with any custom additions
      const finalPrompt = customPrompt 
        ? `${prompt} ${customPrompt}`
        : prompt;
      
      console.log(`🎨 Generating cartoon image with ${selectedProvider}:`, { finalPrompt, hasReferenceImage: !!referenceImage });
      
      let imageUrl;
      
      try {
        // Use the cartoon generator function that handles reference images
        imageUrl = await generateCartoonImage(
          finalPrompt,
          selectedProvider,
          referenceImage || undefined,
          cartoonThemesConfig.themes[selectedTheme].label
        );
      } catch (err) {
        console.warn('❌ Cartoon image generation failed with API:', err);
        
        // If the specialized function fails, fall back to basic image generation
        if (selectedProvider === 'gemini') {
          imageUrl = await generateImageWithGemini(finalPrompt);
        } else {
          imageUrl = await generateImageWithDalle(finalPrompt);
        }
      }
      
      console.log('✅ Successfully generated cartoon image');
      
      setGeneratedImage(imageUrl);
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }
    } catch (err) {
      console.error('❌ Failed to generate cartoon image:', err);
      setError(`Failed to generate cartoon image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Fallback to a placeholder image
      const placeholderUrl = `https://placehold.co/600x400/f5f5f5/6d28d9?text=Could+not+generate+cartoon+image`;
      setGeneratedImage(placeholderUrl);
      if (onImageGenerated) {
        onImageGenerated(placeholderUrl);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * cartoonThemesConfig.themes.length);
    handleThemeSelect(randomIndex);
  };
  
  // Handle token drop on the prompt textarea
  const handleTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = customPrompt.substring(0, position) + 
                  item.tokenDisplay + 
                  customPrompt.substring(position);
    setCustomPrompt(newText);
  };

  // Get themes to display based on showAllThemes state
  const displayedThemes = showAllThemes 
    ? cartoonThemesConfig.themes 
    : cartoonThemesConfig.themes.slice(0, 8);

  return (
    <div className={`${DESIGN_SYSTEM.components.section} ${getElevationClasses(3)} ${getAnimationClasses('smooth')}`}>
      <div className={commonStyles.actionBar}>
        <h3 className={commonStyles.sectionHeader}>
          <PaintBrush className="h-6 w-6 text-primary-500 mr-2" />
          Cartoon Style Image Generator
        </h3>
        <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
          {cartoonThemesConfig.themes.length} Styles Available
        </div>
      </div>

      <div className={getGridClasses('creative')}>
        <div className="space-y-4">
          {/* Theme Gallery */}
          <div className={commonStyles.formGroup}>
            <div className={commonStyles.actionBar}>
              <label className={commonStyles.formLabel}>
                Cartoon Style
              </label>
              {cartoonThemesConfig.ui.enableSurpriseMeButton && (
                <button 
                  onClick={handleSurpriseMe}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
                >
                  <Dices className="w-3 h-3 mr-1" />
                  Surprise Me
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {displayedThemes.map((theme, index) => (
                <div
                  key={theme.label}
                  className={`cursor-pointer rounded-lg overflow-hidden border transition-all ${
                    selectedTheme === index 
                      ? 'border-primary-500 ring-2 ring-primary-500/30' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleThemeSelect(index)}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {theme.preview ? (
                      <img 
                        src={theme.preview} 
                        alt={theme.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback for missing previews
                          const target = e.target as HTMLImageElement;
                          target.src = `https://placehold.co/200x200/f5f5f5/a1a1aa?text=${encodeURIComponent(theme.label)}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <PaintBrush className="w-8 h-8" />
                      </div>
                    )}
                    
                    {/* Selected indicator */}
                    {selectedTheme === index && (
                      <div className="absolute inset-0 bg-primary-500/10 flex items-center justify-center">
                        <div className="bg-white rounded-full p-1 shadow-md">
                          <Sparkles className="w-4 h-4 text-primary-500" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-xs font-medium truncate">{theme.label}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show more/less button */}
            {cartoonThemesConfig.themes.length > 8 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAllThemes(!showAllThemes)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  {showAllThemes ? 'Show Less Styles' : `Show All ${cartoonThemesConfig.themes.length} Styles`}
                </button>
              </div>
            )}
          </div>
          
          {/* Custom Prompt Addition */}
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.formLabel}>
              Custom Additions (Optional)
            </label>
            <DroppableTextArea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add custom details or modifications to the cartoon style..."
              className={DESIGN_SYSTEM.components.textarea}
              onDrop={handleTokenDrop}
              rows={2}
            />
          </div>
          
          {/* Model Selection */}
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.formLabel}>
              AI Model
            </label>
            <div className="grid grid-cols-2 gap-2">
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
          
          {/* Reference Image Upload */}
          {cartoonThemesConfig.ui.enableImageToImageUpload && (
            <div className={commonStyles.formGroup}>
              <label className={commonStyles.formLabel}>
                Reference Image (Optional)
              </label>
              <ReferenceImageUploader
                onImageSelected={(url) => setReferenceImage(url)}
                currentImage={referenceImage}
                onClearImage={() => setReferenceImage(null)}
                category="cartoon-style"
                showHistory={true}
              />
            </div>
          )}
          
          {/* Show error messages */}
          {error && (
            <div className={getAlertClasses('error')}>
              {error}
            </div>
          )}
          
          {/* Additional options toggle */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-xs text-gray-600 hover:text-primary-600 flex items-center"
            >
              <SlidersHorizontal className="w-3 h-3 mr-1" />
              {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
            </button>
          </div>
          
          {/* Advanced Options */}
          <AnimatePresence>
            {showAdvancedOptions && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Personalization Options</h4>
                    <p className="text-xs text-gray-600">
                      Customize your cartoon with personalization tokens like [FIRSTNAME] or by uploading a reference image.
                    </p>
                    
                    <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                      <p className="font-medium">Cartoon Style Tips:</p>
                      <ul className="mt-1 space-y-1 list-disc pl-4">
                        <li>Reference images work best when they have clear facial features</li>
                        <li>For best results, add custom details related to the cartoon style</li>
                        <li>Personalize with tokens like [FIRSTNAME] for custom text elements</li>
                        <li>Try different AI models for varying cartoon style interpretations</li>
                      </ul>
                    </div>
                    
                    {referenceImage && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-700">
                          <span className="font-medium">Reference Image Active:</span> Your uploaded image will be used as inspiration for the cartoon style transformation.
                        </p>
                      </div>
                    )}
                    
                    {/* Fallback warning for edge functions */}
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-700">
                        <span className="font-medium">Note:</span> If edge functions are unavailable, the system will automatically fall back to direct API calls. You may need to add your API keys to the .env file for direct calls to work.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Generate Button */}
          <button
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className={`${getButtonClasses('filled')} ${DESIGN_SYSTEM.accessibility.focus} ${getAnimationClasses('stateLayer')}`}
            aria-label="Generate cartoon style image"
          >
            {isGenerating ? (
              <>
                <div className={`${DESIGN_SYSTEM.components.loading.spinner} w-4 h-4 mr-2`}></div>
                Generating Cartoon...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Cartoon Style Image
              </>
            )}
          </button>
        </div>
        
        {/* Preview Column */}
        <div className="flex flex-col space-y-4">
          {/* Preview of theme or generated image */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: "300px" }}>
            {generatedImage ? (
              <img 
                src={generatedImage} 
                alt="Generated Cartoon" 
                className="max-w-full max-h-[400px] object-contain" 
              />
            ) : (
              <div className="text-center p-6">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your cartoon style image will appear here</p>
                <p className="text-sm text-gray-400 mt-2">Select a style and click Generate</p>
              </div>
            )}
          </div>
          
          {/* Download buttons (when image is generated) */}
          {generatedImage && (
            <div className={commonStyles.buttonGroup}>
              <button
                onClick={() => window.open(generatedImage)}
                className={`${getButtonClasses('secondary')} ${DESIGN_SYSTEM.accessibility.focus}`}
                aria-label="View full size cartoon image"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                View Full Size
              </button>

              <a
                href={generatedImage}
                download="cartoon-style.png"
                className={`${getButtonClasses('primary')} ${DESIGN_SYSTEM.accessibility.focus}`}
                aria-label="Download cartoon style image"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </div>
          )}

          {/* Enhanced Image Editor with AI and Classic Options */}
          {generatedImage && (
            <div className="mt-6">
              <EnhancedImageEditorWithChoice
                imageUrl={generatedImage}
                onImageUpdated={(newImageUrl) => {
                  setGeneratedImage(newImageUrl);
                  if (onImageGenerated) {
                    onImageGenerated(newImageUrl);
                  }
                }}
                tokens={tokens}
              />
            </div>
          )}
          
          {/* Theme preview */}
          {cartoonThemesConfig.ui.enablePreviewPanel && !generatedImage && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Selected Style Preview</h4>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {cartoonThemesConfig.themes[selectedTheme].label}
                </div>
                <p className="text-sm text-gray-600 mb-3 max-h-20 overflow-y-auto">
                  {cartoonThemesConfig.themes[selectedTheme].prompt}
                </p>
                {cartoonThemesConfig.themes[selectedTheme].preview ? (
                  <div className="mt-2 border border-gray-200 rounded-lg p-2">
                    <img 
                      src={cartoonThemesConfig.themes[selectedTheme].preview}
                      alt={cartoonThemesConfig.themes[selectedTheme].label}
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-400">Preview not available</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Style Information */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h4 className="font-medium text-primary-700 flex items-center mb-2">
              <Lightbulb className="w-4 h-4 mr-1" />
              About Cartoon Styles
            </h4>
            <p className="text-sm text-gray-700">
              Our cartoon style generator transforms photos into various popular animation styles:
            </p>
            <ul className="text-xs text-gray-700 mt-2 space-y-1 list-disc pl-4">
              <li>Classic cartoon looks with bold outlines and simplified features</li>
              <li>Stylized 3D character designs with exaggerated proportions</li>
              <li>Vintage animation effects with authentic period details</li>
              <li>Modern cartoon aesthetics with clean lines and vibrant colors</li>
              <li>Specialty styles inspired by popular animated shows and movies</li>
              <li>Fantasy-themed cartoon transformations for whimsical results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartoonImageGenerator;
export { CartoonImageGenerator };