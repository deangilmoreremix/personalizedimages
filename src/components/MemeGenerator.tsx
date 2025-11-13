import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Sparkles, RefreshCw, Download, Image as ImageIcon, Zap, SlidersHorizontal, Lightbulb, MessageSquare, Shapes, PaintBucket } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { generateMemeWithReference, generateImageWithGeminiNano } from '../utils/api';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';
import { FontSelector } from './ui/FontSelector';
import ReferenceImageUploader from './ReferenceImageUploader';
import EnhancedImageEditorWithChoice from './EnhancedImageEditorWithChoice';
import SemanticMaskingEditor from './SemanticMaskingEditor';
import ConversationalRefinementPanel from './ConversationalRefinementPanel';
import NanoBananaModal from './shared/nano-banana/NanoBananaModal';
import TokenPalette from './shared/tokens/TokenPalette';
import UniversalPersonalizationPanel from './UniversalPersonalizationPanel';
import { useEmailPersonalization } from '../hooks/useEmailPersonalization';
import EmailPersonalizationToggle from './EmailPersonalizationToggle';
import EmailPersonalizationPanel from './EmailPersonalizationPanel';
import memeConfig, { getAllTemplates, getQuickTemplate } from '../data/memeTemplates';
import { DESIGN_SYSTEM, getGridClasses, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';

interface MemeGeneratorProps {
  tokens: Record<string, string>;
  onMemeGenerated?: (imageUrl: string) => void;
}

const MemeGenerator: React.FC<MemeGeneratorProps> = ({ tokens, onMemeGenerated }) => {
  // Core state
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [memeImage, setMemeImage] = useState<string | null>(null);
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Model selection
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'gemini-nano'>('openai');

  // Personalization panel state
  const [showPersonalizationPanel, setShowPersonalizationPanel] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState('');

  // Advanced editing panels
  const [showSemanticMasking, setShowSemanticMasking] = useState(false);
  const [showConversationalRefinement, setShowConversationalRefinement] = useState(false);

  // Nano Banana editing
  const [showNanoBanana, setShowNanoBanana] = useState(false);
  const [showTokenPalette, setShowTokenPalette] = useState(false);

  // Advanced options
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean | string>(false);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [useAiEnhancement, setUseAiEnhancement] = useState(false);
  const [aiEnhancementPrompt, setAiEnhancementPrompt] = useState('');
  const [textTransform, setTextTransform] = useState('uppercase');
  
  // Use templates from configuration
  const templates = getAllTemplates();

  // Email personalization hook
  const emailPersonalization = useEmailPersonalization({
    imageUrl: generatedMeme,
    tokens,
    generatorType: 'meme',
    onEmailImageGenerated: (emailImage, html) => {
      // Handle email-ready meme generation
      console.log('Email-ready meme generated:', emailImage, html);
    }
  });

  useEffect(() => {
    // Initialize with first template
    if (templates.length > 0) {
      setMemeImage(templates[0].url);
    }
  }, []);

  const handleTemplateSelect = (templateUrl: string) => {
    setMemeImage(templateUrl);
    setGeneratedMeme(null); // Reset generated meme when template changes
  };

  const handleGenerateMeme = async () => {
    if (!memeImage) {
      setError('Please select a meme template or upload your own image.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      // Replace tokens in text
      const processedTopText = replaceTokens(topText);
      const processedBottomText = replaceTokens(bottomText);
      
      if (useAiEnhancement && aiEnhancementPrompt) {
        try {
          console.log('🎭 Generating enhanced meme with AI');
          const enhancedMemeUrl = await generateMemeWithReference(
            processedTopText,
            processedBottomText,
            memeImage,
            aiEnhancementPrompt
          );
          
          setGeneratedMeme(enhancedMemeUrl);
          if (onMemeGenerated) {
            onMemeGenerated(enhancedMemeUrl);
          }
          setIsGenerating(false);
          return;
        } catch (err) {
          console.warn('❌ AI enhancement failed, falling back to standard meme generation:', err);
          // Continue with standard generation
        }
      }
      
      // Standard meme generation using canvas
      const canvas = document.createElement('canvas');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw the background image
          ctx.drawImage(img, 0, 0);
          
          // Set text style
          ctx.textAlign = 'center';
          ctx.fillStyle = textColor;
          ctx.font = `${textTransform === 'uppercase' ? 'bold' : 'normal'} ${fontSize}px ${fontFamily}`;
          
          // Function to draw text with stroke
          const drawText = (text: string, x: number, y: number) => {
            // Draw text stroke
            if (strokeWidth > 0) {
              ctx.strokeStyle = strokeColor;
              ctx.lineWidth = strokeWidth;
              ctx.lineJoin = 'round';
              ctx.miterLimit = 2;
              ctx.strokeText(text, x, y);
            }
            
            // Draw text fill
            ctx.fillText(text, x, y);
          };
          
          // Function to draw multiline text
          const drawMultilineText = (text: string, x: number, y: number, isTop: boolean) => {
            const formattedText = textTransform === 'uppercase' ? text.toUpperCase() : text;
            const lines = [];
            const words = formattedText.split(' ');
            let line = '';
            
            // Split text into lines that fit the canvas width
            const maxWidth = canvas.width * 0.9;
            for (let i = 0; i < words.length; i++) {
              const testLine = line + words[i] + ' ';
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
              } else {
                line = testLine;
              }
            }
            lines.push(line);
            
            // Draw each line
            const lineHeight = fontSize * 1.2;
            if (isTop) {
              // Draw from top down
              for (let i = 0; i < lines.length; i++) {
                drawText(lines[i], x, y + i * lineHeight);
              }
            } else {
              // Draw from bottom up
              for (let i = 0; i < lines.length; i++) {
                drawText(lines[i], x, y - (lines.length - 1 - i) * lineHeight);
              }
            }
          };
          
          // Draw top text
          if (processedTopText) {
            drawMultilineText(processedTopText, canvas.width / 2, fontSize + 10, true);
          }
          
          // Draw bottom text
          if (processedBottomText) {
            drawMultilineText(processedBottomText, canvas.width / 2, canvas.height - 20, false);
          }
          
          // Convert canvas to data URL
          const memeDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setGeneratedMeme(memeDataUrl);
          
          if (onMemeGenerated) {
            onMemeGenerated(memeDataUrl);
          }
        }
        
        setIsGenerating(false);
      };
      
      img.onerror = () => {
        console.error('Error loading image');
        setError('Failed to load the meme template image. Please try another image.');
        setIsGenerating(false);
      };
      
      img.src = memeImage;
    } catch (err) {
      console.error('❌ Failed to generate meme:', err);
      setError(`Failed to generate meme: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsGenerating(false);
    }
  };

  const replaceTokens = (text: string): string => {
    let result = text;
    Object.entries(tokens).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
    });
    return result;
  };

  const applyMemeTemplate = (templateId: string) => {
    const template = getQuickTemplate(templateId);
    if (template) {
      setTopText(template.topText);
      setBottomText(template.bottomText);

      // Apply some default styling based on template type
      switch (templateId) {
        case 'birthday':
          setTextColor('#FFFF00');
          setStrokeColor('#FF0000');
          setStrokeWidth(3);
          break;
        case 'motivational':
          setTextColor('#FFFFFF');
          setStrokeColor('#000000');
          setStrokeWidth(2);
          break;
        default:
          // Keep current styling
          break;
      }
    }
  };
  
  // Handle token drop for top text
  const handleTopTextTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = topText.substring(0, position) + 
                  item.tokenDisplay + 
                  topText.substring(position);
    setTopText(newText);
  };
  
  // Handle token drop for bottom text
  const handleBottomTextTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = bottomText.substring(0, position) + 
                  item.tokenDisplay + 
                  bottomText.substring(position);
    setBottomText(newText);
  };
  
  // Handle token drop for AI enhancement prompt
  const handleAIPromptTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = aiEnhancementPrompt.substring(0, position) + 
                  item.tokenDisplay + 
                  aiEnhancementPrompt.substring(position);
    setAiEnhancementPrompt(newText);
  };

  return (
    <div className={DESIGN_SYSTEM.components.section}>
      <div className={commonStyles.actionBar}>
        <h3 className={commonStyles.sectionHeader}>
          <MessageSquare className="h-6 w-6 text-purple-500 mr-2" />
          Personalized Meme Generator
        </h3>
        <motion.div
          className="px-3 py-1 bg-purple-100 rounded-full flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles className="h-4 w-4 text-purple-600 mr-1" />
          <span className="text-sm font-medium text-purple-700">New Feature</span>
        </motion.div>
      </div>

      <div className={DESIGN_SYSTEM.grid.sidebar}>
        {/* Canvas Column */}
        <div className="lg:col-span-2">
          <div 
            className="relative bg-gray-100 border-2 border-gray-200 rounded-lg mb-6 overflow-hidden"
            style={{ aspectRatio: "1/1" }}
          >
            {memeImage && (
              <img 
                src={memeImage} 
                alt="Meme template" 
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            )}
            
            {!memeImage && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <ImageIcon className="h-16 w-16 mx-auto mb-2" />
                  <p>Select a meme template or upload your own</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Meme Template Gallery */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <motion.div 
                className="text-purple-500 mr-2" 
                animate={{ rotate: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
              >
                <Zap className="h-4 w-4" />
              </motion.div>
              Meme Templates
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  whileHover={{ y: -5, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    memeImage === template.url ? 'border-purple-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTemplateSelect(template.url)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={template.url} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                </motion.div>
              ))}
              <motion.div
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-purple-300 aspect-square flex items-center justify-center"
              >
                <ReferenceImageUploader
                  onImageSelected={(url) => setMemeImage(url)}
                  className="h-full w-full"
                  showHistory={false}
                  category="meme-templates"
                />
              </motion.div>
            </div>
          </div>
          
          {/* Controls */}
          <div className={getGridClasses(2)}>
            <div className={commonStyles.formGroup}>
              <label className={commonStyles.formLabel}>
                Top Text
              </label>
              <DroppableTextArea
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="Top text (supports [TOKENS])"
                className={DESIGN_SYSTEM.components.input}
                onDrop={handleTopTextTokenDrop}
                rows={2}
              />
            </div>

            <div className={commonStyles.formGroup}>
              <label className={commonStyles.formLabel}>
                Bottom Text
              </label>
              <DroppableTextArea
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="Bottom text (supports [TOKENS])"
                className={DESIGN_SYSTEM.components.input}
                onDrop={handleBottomTextTokenDrop}
                rows={2}
              />
            </div>
          </div>
          
          {/* AI Enhancement Controls */}
          <div className={`${DESIGN_SYSTEM.colors.info[50]} p-4 rounded-lg mb-4`}>
            <div className="flex items-start gap-3">
              <div>
                <input
                  type="checkbox" 
                  id="aiEnhancement"
                  checked={useAiEnhancement}
                  onChange={(e) => setUseAiEnhancement(e.target.checked)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="aiEnhancement" className="block font-medium text-purple-700 mb-1">
                  Use AI Image Enhancement
                </label>
                <p className="text-sm text-purple-600 mb-2">
                  Let AI enhance your meme based on your description
                </p>
                
                {useAiEnhancement && (
                  <div className="space-y-3">
                    <DroppableTextArea
                      value={aiEnhancementPrompt}
                      onChange={(e) => setAiEnhancementPrompt(e.target.value)}
                      placeholder="Describe how you want the AI to enhance your meme (e.g., 'Make it look like an old comic book', 'Add a cosmic background')"
                      className="w-full px-3 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      rows={2}
                      onDrop={handleAIPromptTokenDrop}
                    />
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        className={`py-2 px-3 text-sm rounded ${
                          selectedProvider === 'openai'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                        onClick={() => setSelectedProvider('openai')}
                      >
                        DALL-E 3
                      </button>
                      <button
                        className={`py-2 px-3 text-sm rounded ${
                          selectedProvider === 'gemini'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                        onClick={() => setSelectedProvider('gemini')}
                      >
                        Gemini AI
                      </button>
                      <button
                        className={`py-2 px-3 text-sm rounded ${
                          selectedProvider === 'gemini-nano'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                        onClick={() => setSelectedProvider('gemini-nano')}
                      >
                        Gemini Nano
                      </button>
                    </div>
                    
                    <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
                      <strong>Note:</strong> AI enhancement will apply your text on top of a modified version of your template. For simple text overlay without image modification, uncheck this option.
                    </div>

                    {/* Personalization Toggle */}
                    <div className="flex items-center gap-2 pt-2 border-t border-purple-200">
                      <button
                        onClick={() => setShowPersonalizationPanel(!showPersonalizationPanel)}
                        className="text-xs text-purple-600 hover:text-purple-700 flex items-center"
                      >
                        <Shapes className="w-3 h-3 mr-1" />
                        {showPersonalizationPanel ? "Hide" : "Show"} Personalization
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Meme Templates */}
          <div className={`${DESIGN_SYSTEM.components.panel} mb-4`}>
            <h4 className={DESIGN_SYSTEM.typography.h4}>Quick Text Templates</h4>
            <div className="flex flex-wrap gap-2">
              {memeConfig.quickTemplates.map(template => (
                <button
                  key={template.id}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50"
                  onClick={() => applyMemeTemplate(template.id)}
                  title={template.description}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Generate Button */}
          <div className={commonStyles.buttonGroup}>
            <button
              onClick={handleGenerateMeme}
              disabled={isGenerating || !memeImage}
              className={getButtonClasses('primary')}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Meme
                </>
              )}
            </button>
          </div>
          
          {/* Generated Meme */}
          {generatedMeme && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <Sparkles className="h-4 w-4 text-purple-500 mr-2" />
                Generated Meme
              </h4>
              <div className="flex justify-center">
                <img
                  src={generatedMeme}
                  alt="Generated Meme"
                  className="max-h-[300px] rounded-lg shadow-md"
                />
              </div>

              <div className="mt-4 flex justify-center gap-4">
                <EmailPersonalizationToggle
                  isActive={emailPersonalization.isActive}
                  onToggle={emailPersonalization.toggle}
                />

                <button
                  className={getButtonClasses('secondary')}
                  onClick={() => {
                    if (generatedMeme) {
                      const link = document.createElement('a');
                      link.href = generatedMeme;
                      link.download = 'meme.jpg';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Image Editor with AI and Classic Options */}
          {generatedMeme && (
            <div className="mt-6 space-y-4">
              <EnhancedImageEditorWithChoice
                imageUrl={generatedMeme}
                onImageUpdated={(newImageUrl) => {
                  setGeneratedMeme(newImageUrl);
                  if (onMemeGenerated) {
                    onMemeGenerated(newImageUrl);
                  }
                }}
                tokens={tokens}
              />

              {/* Advanced Editing Options */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowNanoBanana(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Dices className="w-4 h-4" />
                  Nano Banana AI Edit
                </button>
                <button
                  onClick={() => setShowSemanticMasking(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <PaintBucket className="w-4 h-4" />
                  Semantic Masking
                </button>
                <button
                  onClick={() => setShowConversationalRefinement(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Conversational Refinement
                </button>
                <button
                  onClick={() => setShowTokenPalette(!showTokenPalette)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Shapes className="w-4 h-4" />
                  {showTokenPalette ? 'Hide' : 'Show'} Tokens
                </button>
              </div>
            </div>
          )}

          {/* Email Personalization Panel */}
          {emailPersonalization.isActive && (
            <div className="mt-6">
              <EmailPersonalizationPanel
                imageUrl={generatedMeme}
                personalizationTokens={[]} // Memes don't use tokens the same way
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
                onAddToken={() => {}} // Memes don't need token management
                onRemoveToken={() => {}}
                onUpdateToken={() => {}}
                onUpdateSettings={emailPersonalization.updateSettings}
                onGenerate={emailPersonalization.generateEmailImage}
                onCopyHtml={emailPersonalization.copyHtmlToClipboard}
                onDownloadHtml={emailPersonalization.downloadHtml}
              />
            </div>
          )}
        </div>
        
        {/* Controls Column */}
        <div className="space-y-4">
          {/* Text Style Controls */}
          <div className={DESIGN_SYSTEM.components.card}>
            <div className={commonStyles.actionBar}>
              <h4 className={DESIGN_SYSTEM.typography.h4}>Text Style</h4>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-xs text-gray-600 hover:text-purple-600 flex items-center"
              >
                <SlidersHorizontal className="w-3 h-3 mr-1" />
                {showAdvancedOptions ? "Hide" : "Show"} Advanced
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Font Family
                </label>
                <FontSelector
                  value={fontFamily}
                  onChange={setFontFamily}
                  className="w-full"
                  size="sm"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Font Size
                  </label>
                  <span className="text-xs text-gray-500">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Text Case
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`py-1 px-2 text-xs rounded ${
                      textTransform === 'uppercase'
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setTextTransform('uppercase')}
                  >
                    UPPERCASE
                  </button>
                  <button
                    className={`py-1 px-2 text-xs rounded ${
                      textTransform === 'none'
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setTextTransform('none')}
                  >
                    Normal
                  </button>
                  <button
                    className={`py-1 px-2 text-xs rounded ${
                      textTransform === 'lowercase'
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'bg-white border border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setTextTransform('lowercase')}
                  >
                    lowercase
                  </button>
                </div>
              </div>
              
              <AnimatePresence>
                {showAdvancedOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border cursor-pointer"
                          style={{ backgroundColor: textColor }}
                          onClick={() => setShowColorPicker(showColorPicker === 'text' ? false : 'text')}
                        ></div>
                        <input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      
                      {showColorPicker === 'text' && (
                        <div className="mt-2 relative">
                          <div className="absolute z-10">
                            <div 
                              className="fixed inset-0" 
                              onClick={() => setShowColorPicker(false)}
                            ></div>
                            <HexColorPicker
                              color={textColor}
                              onChange={setTextColor}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Stroke Width
                        </label>
                        <span className="text-xs text-gray-500">{strokeWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stroke Color
                      </label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border cursor-pointer"
                          style={{ backgroundColor: strokeColor }}
                          onClick={() => setShowColorPicker(showColorPicker === 'stroke' ? false : 'stroke')}
                        ></div>
                        <input
                          type="text"
                          value={strokeColor}
                          onChange={(e) => setStrokeColor(e.target.value)}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      
                      {showColorPicker === 'stroke' && (
                        <div className="mt-2 relative">
                          <div className="absolute z-10">
                            <div 
                              className="fixed inset-0" 
                              onClick={() => setShowColorPicker(false)}
                            ></div>
                            <HexColorPicker
                              color={strokeColor}
                              onChange={setStrokeColor}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                <p className="font-medium">Preview:</p>
                <div 
                  className="mt-2 p-2 bg-gray-800 rounded text-center"
                  style={{
                    fontFamily,
                    fontSize: `${Math.min(fontSize, 36)}px`,
                    color: textColor,
                    textTransform: textTransform as any,
                    textShadow: strokeWidth > 0 ? 
                      `-${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                      ${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                      -${strokeWidth}px ${strokeWidth}px 0 ${strokeColor},
                      ${strokeWidth}px ${strokeWidth}px 0 ${strokeColor}` : 'none'
                  }}
                >
                  {topText || 'Sample Text'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Personalization Tokens */}
          <div className={DESIGN_SYSTEM.components.card}>
            <h4 className={DESIGN_SYSTEM.typography.h4}>Personalization Tokens</h4>
            <div className="space-y-2">
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <div className="font-medium">[FIRSTNAME]</div>
                <div className="text-xs text-gray-500">Current value: {tokens['FIRSTNAME'] || 'Not set'}</div>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <div className="font-medium">[LASTNAME]</div>
                <div className="text-xs text-gray-500">Current value: {tokens['LASTNAME'] || 'Not set'}</div>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <div className="font-medium">[COMPANY]</div>
                <div className="text-xs text-gray-500">Current value: {tokens['COMPANY'] || 'Not set'}</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Drag and drop tokens into the text fields to personalize your meme.
            </p>
          </div>
          
          {/* Meme Tips */}
          <div className={`${DESIGN_SYSTEM.colors.info[50]} p-4 rounded-lg`}>
            <h4 className={`${DESIGN_SYSTEM.typography.h4} text-purple-700 mb-3 flex items-center`}>
              <Zap className="w-4 h-4 mr-2" />
              Meme Creation Tips
            </h4>
            <ul className="text-sm text-purple-700 space-y-2 list-disc pl-4">
              <li>Classic memes typically use Impact font with a black outline</li>
              <li>Keep text short and punchy for maximum impact</li>
              <li>Add personalization tokens like [FIRSTNAME] to connect with your audience</li>
              <li>Try AI enhancement for unique creative effects</li>
              <li>Use contrasting text colors for better readability</li>
            </ul>
          </div>
          
          {/* Business Use Cases */}
          <div className={`${DESIGN_SYSTEM.colors.info[50]} p-4 rounded-lg`}>
            <h4 className={`${DESIGN_SYSTEM.typography.h4} text-indigo-700 mb-3`}>Marketing Use Cases</h4>
            <ul className="text-sm text-indigo-700 space-y-2 list-disc pl-4">
              <li>Send personalized memes in birthday emails</li>
              <li>Welcome new team members with custom memes</li>
              <li>Celebrate client achievements with personalized humor</li>
              <li>Stand out in social media by tagging clients with custom content</li>
              <li>Create engagement in chat apps with personalized meme responses</li>
            </ul>
          </div>
          
          {error && (
            <div className={getAlertClasses('error')}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Universal Personalization Panel */}
      {showPersonalizationPanel && (
        <div className="mt-6">
          <UniversalPersonalizationPanel
            initialContent={`${topText}\n${bottomText}`}
            initialContentType="prompt-ai"
            onContentGenerated={(content, type) => {
              const lines = content.split('\n');
              setTopText(lines[0] || '');
              setBottomText(lines[1] || '');
              setPersonalizedContent(content);
              setShowPersonalizationPanel(false);
            }}
          />
        </div>
      )}

      {/* Semantic Masking Editor */}
      {showSemanticMasking && generatedMeme && (
        <SemanticMaskingEditor
          imageUrl={generatedMeme}
          onEditComplete={(editedUrl) => {
            setGeneratedMeme(editedUrl);
            if (onMemeGenerated) {
              onMemeGenerated(editedUrl);
            }
            setShowSemanticMasking(false);
          }}
          onClose={() => setShowSemanticMasking(false)}
        />
      )}

      {/* Conversational Refinement Panel */}
      {showConversationalRefinement && generatedMeme && (
        <div className="mt-6">
          <ConversationalRefinementPanel
            initialImageUrl={generatedMeme}
            onImageUpdated={(imageUrl) => {
              setGeneratedMeme(imageUrl);
              if (onMemeGenerated) {
                onMemeGenerated(imageUrl);
              }
            }}
            onClose={() => setShowConversationalRefinement(false)}
          />
        </div>
      )}

      {/* Nano Banana AI Editor */}
      {showNanoBanana && generatedMeme && (
        <NanoBananaModal
          imageUrl={generatedMeme}
          onSave={(editedImageUrl) => {
            setGeneratedMeme(editedImageUrl);
            if (onMemeGenerated) {
              onMemeGenerated(editedImageUrl);
            }
            setShowNanoBanana(false);
          }}
          onClose={() => setShowNanoBanana(false)}
          moduleType="meme"
          tokens={tokens}
        />
      )}

      {/* Token Palette Panel */}
      {showTokenPalette && (
        <div className="mt-6">
          <TokenPalette
            tokens={tokens}
            onTokenUpdate={(key, value) => {
              console.log('Token updated:', key, value);
            }}
            onTokenAdd={(token) => {
              console.log('Token added:', token);
            }}
            onTokenDelete={(key) => {
              console.log('Token deleted:', key);
            }}
            onTokenInsert={(tokenKey) => {
              // Insert token into top or bottom text
              const tokenText = `[${tokenKey}]`;
              if (topText.length <= bottomText.length) {
                setTopText(topText + tokenText);
              } else {
                setBottomText(bottomText + tokenText);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MemeGenerator;
export { MemeGenerator };
