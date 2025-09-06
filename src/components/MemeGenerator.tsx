import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Sparkles, RefreshCw, Download, Image as ImageIcon, Zap, SlidersHorizontal, Lightbulb, MessageSquare } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { generateMemeWithReference } from '../utils/api';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';
import { FontSelector } from './ui/FontSelector';
import ReferenceImageUploader from './ReferenceImageUploader';
import memeConfig, { getAllTemplates, getQuickTemplate } from '../data/memeTemplates';

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
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai');
  
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
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Top Text
              </label>
              <DroppableTextArea
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="Top text (supports [TOKENS])"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onDrop={handleTopTextTokenDrop}
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bottom Text
              </label>
              <DroppableTextArea
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="Bottom text (supports [TOKENS])"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onDrop={handleBottomTextTokenDrop}
                rows={2}
              />
            </div>
          </div>
          
          {/* AI Enhancement Controls */}
          <div className="bg-purple-50 p-4 rounded-lg mb-4">
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
                    
                    <div className="flex gap-2">
                      <button
                        className={`flex-1 py-2 px-3 text-sm rounded ${
                          selectedProvider === 'openai' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                        onClick={() => setSelectedProvider('openai')}
                      >
                        DALL-E 3
                      </button>
                      <button
                        className={`flex-1 py-2 px-3 text-sm rounded ${
                          selectedProvider === 'gemini' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                        onClick={() => setSelectedProvider('gemini')}
                      >
                        Gemini AI
                      </button>
                    </div>
                    
                    <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
                      <strong>Note:</strong> AI enhancement will apply your text on top of a modified version of your template. For simple text overlay without image modification, uncheck this option.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Meme Templates */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-700 mb-3">Quick Text Templates</h4>
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
          <div className="flex gap-3">
            <button
              onClick={handleGenerateMeme}
              disabled={isGenerating || !memeImage}
              className="btn btn-primary flex-1 flex items-center justify-center"
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
                <button
                  className="btn btn-outline flex items-center"
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
        </div>
        
        {/* Controls Column */}
        <div className="space-y-4">
          {/* Text Style Controls */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700">Text Style</h4>
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
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-700 mb-3">Personalization Tokens</h4>
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
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-700 mb-3 flex items-center">
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
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-700 mb-3">Marketing Use Cases</h4>
            <ul className="text-sm text-indigo-700 space-y-2 list-disc pl-4">
              <li>Send personalized memes in birthday emails</li>
              <li>Welcome new team members with custom memes</li>
              <li>Celebrate client achievements with personalized humor</li>
              <li>Stand out in social media by tagging clients with custom content</li>
              <li>Create engagement in chat apps with personalized meme responses</li>
            </ul>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemeGenerator;
export { MemeGenerator };