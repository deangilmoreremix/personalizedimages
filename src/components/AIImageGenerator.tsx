import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Image as ImageIcon, AlertCircle, HelpCircle, Sliders, Book, Wand2, Camera, RefreshCw, Scan, PaintBucket, Palette, FileVideo, Cpu, RotateCw, Shapes, Zap, Sparkles, X, Brain, Video, Download, Tag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  generateImageWithDalle,
  generateImageWithGemini,
  generateImageWithGemini2Flash,
  generateImageWithImagen,
  generateImageWithGptImage,
  generateImageDescriptionWithAI
} from '../utils/api';
import { streamImageGeneration, streamAIReasoning } from '../utils/streamingApi';
import ImagenPromptGuide from './ImagenPromptGuide';
import PromptHelper from './PromptHelper';
import PromptPolisher from './PromptPolisher';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';
import VideoGenerationButton from './VideoGenerationButton';
import ReferenceImageUploader from './ReferenceImageUploader';
import EnhancedImageEditorWithChoice from './EnhancedImageEditorWithChoice';
import SemanticMaskingEditor from './SemanticMaskingEditor';
import ConversationalRefinementPanel from './ConversationalRefinementPanel';
import NanoBananaModal from './shared/nano-banana/NanoBananaModal';
import TokenPalette from './shared/tokens/TokenPalette';
import { DESIGN_SYSTEM, getGridClasses, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';
import UniversalPersonalizationPanel from './UniversalPersonalizationPanel';

interface AIImageGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({ tokens, onImageGenerated }) => {
  // Core state
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Model selection
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai' | 'imagen' | 'gemini2flash' | 'gpt-image-1'>('openai');
  
  // Advanced options
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageStyle, setImageStyle] = useState<string>('photography');
  const [inputImage, setInputImage] = useState<string | null>(null);

  // DALL-E 3 specific options
  const [dalleSize, setDalleSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024');
  const [dalleQuality, setDalleQuality] = useState<'standard' | 'hd'>('standard');
  const [dalleStyle, setDalleStyle] = useState<'natural' | 'vivid'>('natural');
  
  // Help panels
  const [showPromptGuide, setShowPromptGuide] = useState(false);
  const [showPromptHelper, setShowPromptHelper] = useState(false);
  
  // Auto-generation features
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  
  // Streaming UI state
  const [generationStatus, setGenerationStatus] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isReasoningPanelOpen, setIsReasoningPanelOpen] = useState(false);
  const [reasoningText, setReasoningText] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [isStreamingActive, setIsStreamingActive] = useState(false);

  // Personalization panel state
  const [showPersonalizationPanel, setShowPersonalizationPanel] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState('');

  // Advanced editing panels
  const [showSemanticMasking, setShowSemanticMasking] = useState(false);
  const [showConversationalRefinement, setShowConversationalRefinement] = useState(false);

  // Nano Banana editing
  const [showNanoBanana, setShowNanoBanana] = useState(false);
  const [showTokenPalette, setShowTokenPalette] = useState(false);

  // Refs for cancelation
  const generationRef = useRef<(() => void) | null>(null);
  const reasoningRef = useRef<(() => void) | null>(null);

  // Clean up any active streams when component unmounts
  useEffect(() => {
    return () => {
      if (generationRef.current) {
        generationRef.current();
      }
      if (reasoningRef.current) {
        reasoningRef.current();
      }
    };
  }, []);

  const handleGenerateDescription = async () => {
    try {
      setIsGeneratingDescription(true);
      setError(null);
      
      console.log('🖋️ Generating AI image description with tokens:', tokens);
      let description;
      try {
        description = await generateImageDescriptionWithAI(tokens);
        console.log('✅ Successfully generated image description');
      } catch (err) {
        console.warn('❌ Failed to generate description via API:', err);
        // Create a fallback description based on tokens
        description = `A professional marketing image${tokens['FIRSTNAME'] ? ` featuring ${tokens['FIRSTNAME']}` : ''}${
          tokens['COMPANY'] ? ` with ${tokens['COMPANY']} branding` : ''
        } with modern design elements and a striking visual composition.`;
      }
      
      setGeneratedDescription(description);
      setPrompt(description);
    } catch (err) {
      console.error('❌ Failed to generate description:', err);
      setError(`Failed to generate description: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) {
      setError('Please enter a prompt or generate a description first.');
      return;
    }

    // Clear any previous generation
    setError(null);
    setGeneratedImage(null);
    setGenerationStatus('');
    setGenerationProgress(0);
    setIsGenerating(true);
    setIsStreamingActive(true);
    
    // If reasoning panel open, start reasoning stream
    if (isReasoningPanelOpen) {
      reasoningRef.current = streamAIReasoning({
        prompt,
        onReasoningUpdate: (reasoning) => {
          setReasoningText(reasoning);
          setLastUpdateTime(Date.now());
        },
        onComplete: (fullReasoning) => {
          setReasoningText(fullReasoning);
        }
      });
    }
    
    // Start image generation stream
    generationRef.current = streamImageGeneration({
      prompt,
      provider: selectedProvider,
      onStatusUpdate: (message) => {
        setGenerationStatus(message);
        setLastUpdateTime(Date.now());
      },
      onProgress: (progress) => {
        setGenerationProgress(progress);
      },
      onComplete: (imageUrl) => {
        setIsStreamingActive(false);
        generateRealImage();
      },
      dalleOptions: selectedProvider === 'openai' ? {
        size: dalleSize,
        quality: dalleQuality,
        style: dalleStyle
      } : undefined
    });
  };

  // This function makes the actual API call after streaming simulation
  const generateRealImage = async () => {
    try {
      setGenerationStatus("Finalizing image...");
      
      // Add style tag if provided
      let enhancedPrompt = prompt;
      if (imageStyle && imageStyle !== 'photography' && !prompt.toLowerCase().includes(imageStyle.toLowerCase())) {
        enhancedPrompt = `${prompt} (${imageStyle} style)`;
      }
      
      // Add aspect ratio if not already in prompt
      if (!enhancedPrompt.toLowerCase().includes('aspect ratio')) {
        enhancedPrompt = `${enhancedPrompt} (${aspectRatio} aspect ratio)`;
      }
      
      console.log(`🖼️ Generating image with ${selectedProvider}:`, { enhancedPrompt, aspectRatio, imageStyle });
      
      let imageUrl;
      try {
        switch (selectedProvider) {
          case 'gemini':
            imageUrl = await generateImageWithGemini(enhancedPrompt, aspectRatio, imageStyle);
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
          default: // openai - DALL-E 3 with enhanced options
            imageUrl = await generateImageWithDalle(enhancedPrompt, {
              size: dalleSize,
              quality: dalleQuality,
              style: dalleStyle
            });
        }
        
        console.log('✅ Successfully generated image');
        
        setGeneratedImage(imageUrl);
        onImageGenerated(imageUrl);
        setInputImage(imageUrl);
      } catch (err) {
        console.error('❌ Failed to generate image via API:', err);

        // Set an informative error message
        if (err instanceof Error) {
          if (err.message.includes('API key') || err.message.includes('API configuration')) {
            setError(`API Configuration Required: ${err.message}\n\nPlease add your API keys to your environment variables and redeploy.`);
          } else {
            setError(`Failed to generate image: ${err.message}`);
          }
        } else {
          setError(`Failed to generate image: Unknown error occurred.`);
        }
        throw err;
      }

      setIsGenerating(false);
    } catch (err) {
      console.error('❌ Failed to generate image:', err);
      setError(`Failed to generate image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsGenerating(false);
    }
  };

  const cancelGeneration = () => {
    if (generationRef.current) {
      generationRef.current();
      generationRef.current = null;
    }
    if (reasoningRef.current) {
      reasoningRef.current();
      reasoningRef.current = null;
    }
    setIsGenerating(false);
    setIsStreamingActive(false);
    setGenerationStatus('Generation canceled');
  };

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  const togglePromptGuide = () => {
    setShowPromptGuide(!showPromptGuide);
    if (showPromptGuide) {
      setShowPromptHelper(false);
    }
  };

  const togglePromptHelper = () => {
    setShowPromptHelper(!showPromptHelper);
    if (showPromptHelper) {
      setShowPromptGuide(false);
    }
  };

  const toggleReasoningPanel = () => {
    setIsReasoningPanelOpen(!isReasoningPanelOpen);
  };

  const styleOptions = [
    { value: 'photography', label: 'Photography' },
    { value: 'painting', label: 'Painting' },
    { value: 'digital-art', label: '3D Render' },
    { value: 'sketch', label: 'Sketch' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'anime', label: 'Anime' },
    { value: 'illustration', label: 'Illustration' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'openai': return 'DALL-E 3';
      case 'imagen': return 'Imagen 3';
      case 'gemini': return 'Gemini';
      case 'gemini2flash': return 'Gemini 2.5 Flash';
      case 'gpt-image-1': return 'GPT-4 Vision';
      default: return provider;
    }
  };

  // Handle token drop on the prompt textarea
  const handlePromptTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = prompt.substring(0, position) + 
                  item.tokenDisplay + 
                  prompt.substring(position);
    setPrompt(newText);
  };

  return (
    <div className={DESIGN_SYSTEM.components.section}>
      <div className={commonStyles.actionBar}>
        <h3 className={commonStyles.sectionHeader}>
          <Cpu className="h-6 w-6 text-indigo-500 mr-2" />
          Streaming AI Image Generator
          <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full font-medium">Real-time</span>
        </h3>
      </div>

      <div className={getGridClasses(2)}>
        <div className="space-y-4">
          {/* Model Selection */}
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.formLabel}>
              AI Model
            </label>
            <div className={getGridClasses(3)}>
              <button
                className={`py-2 px-4 text-sm rounded flex items-center justify-center ${selectedProvider === 'openai' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('openai')}
              >
                <FileVideo className="w-4 h-4 mr-2" />
                DALL-E 3
              </button>
              <button
                className={`py-2 px-4 text-sm rounded flex items-center justify-center ${selectedProvider === 'imagen' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('imagen')}
              >
                <Camera className="w-4 h-4 mr-2" />
                Imagen 3
              </button>
              <button
                className={`py-2 px-4 text-sm rounded flex items-center justify-center ${selectedProvider === 'gemini' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('gemini')}
              >
                <Cpu className="w-4 h-4 mr-2" />
                Gemini
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                className={`py-2 px-4 text-sm rounded flex items-center justify-center ${selectedProvider === 'gemini2flash' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('gemini2flash')}
              >
                <Zap className="w-4 h-4 mr-2" />
                Gemini Flash
              </button>
              <button
                className={`py-2 px-4 text-sm rounded flex items-center justify-center ${selectedProvider === 'gpt-image-1' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('gpt-image-1')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                GPT-4 Vision
              </button>
            </div>
          </div>
          
          {/* Prompt Input */}
          <div className={commonStyles.formGroup}>
            <div className={commonStyles.actionBar}>
              <label className={commonStyles.formLabel}>
                Prompt
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePromptGuide}
                  className="text-xs text-gray-600 hover:text-indigo-600 flex items-center"
                >
                  <Book className="w-3 h-3 mr-1" />
                  {showPromptGuide ? "Hide Guide" : "Prompt Guide"}
                </button>
                <button
                  onClick={togglePromptHelper}
                  className="text-xs text-gray-600 hover:text-indigo-600 flex items-center"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  {showPromptHelper ? "Hide Ideas" : "Prompt Ideas"}
                </button>
                <button
                  onClick={toggleReasoningPanel}
                  className={`text-xs py-1 px-2 rounded flex items-center border ${
                    isReasoningPanelOpen 
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 mr-1.5" />
                  AI Reasoning
                </button>
                <button
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDescription}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  {isGeneratingDescription ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  Auto-generate
                </button>
                <button
                  onClick={() => setShowPersonalizationPanel(!showPersonalizationPanel)}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center"
                >
                  <Shapes className="w-3 h-3 mr-1" />
                  {showPersonalizationPanel ? "Hide" : "Show"} Personalization
                </button>
              </div>
            </div>
            <DroppableTextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate with specific details..."
              className={DESIGN_SYSTEM.components.textarea}
              onDrop={handlePromptTokenDrop}
            />

            {/* AI Prompt Polisher */}
            <PromptPolisher
              currentPrompt={prompt}
              onPromptUpdate={setPrompt}
              disabled={isGenerating}
            />
          </div>
          
          {showAdvancedOptions && (
            <div className={`${DESIGN_SYSTEM.components.panel} ${commonStyles.contentArea}`}>
              <h4 className="font-medium text-sm mb-2">Advanced Options</h4>

              {/* DALL-E 3 Specific Options */}
              {selectedProvider === 'openai' && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-sm text-blue-800 mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    DALL-E 3 Advanced Features
                  </h5>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">
                        Image Size
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: '1024x1024', label: 'Square (1:1)' },
                          { value: '1792x1024', label: 'Landscape (16:9)' },
                          { value: '1024x1792', label: 'Portrait (9:16)' }
                        ].map((size) => (
                          <button
                            key={size.value}
                            className={`py-1 px-2 text-xs rounded ${
                              dalleSize === size.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700'
                            }`}
                            onClick={() => setDalleSize(size.value as any)}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">
                        Quality
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          className={`py-1 px-2 text-xs rounded ${
                            dalleQuality === 'standard'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                          onClick={() => setDalleQuality('standard')}
                        >
                          Standard
                        </button>
                        <button
                          className={`py-1 px-2 text-xs rounded ${
                            dalleQuality === 'hd'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                          onClick={() => setDalleQuality('hd')}
                        >
                          HD (Higher quality)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">
                        Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          className={`py-1 px-2 text-xs rounded ${
                            dalleStyle === 'natural'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                          onClick={() => setDalleStyle('natural')}
                        >
                          Natural
                        </button>
                        <button
                          className={`py-1 px-2 text-xs rounded ${
                            dalleStyle === 'vivid'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                          onClick={() => setDalleStyle('vivid')}
                        >
                          Vivid
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['1:1', '4:3', '3:4', '16:9', '9:16'].map((ratio) => (
                    <button
                      key={ratio}
                      className={`py-1 px-2 text-xs rounded ${
                        aspectRatio === ratio
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setAspectRatio(ratio)}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Aspect ratio will be applied for Imagen, Gemini, and GPT-4 Vision
                </p>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Image Style
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {styleOptions.map((style) => (
                    <button
                      key={style.value}
                      className={`py-1 px-2 text-xs rounded ${
                        imageStyle === style.value
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setImageStyle(style.value)}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selecting a style helps generate more focused results
                </p>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reference Image (Optional)
                </label>
                <ReferenceImageUploader
                  onImageSelected={(url) => setInputImage(url)}
                  currentImage={inputImage}
                  onClearImage={() => setInputImage(null)}
                  category="ai-image"
                  showHistory={true}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload an image for reference or editing with the selected model
                </p>
              </div>
              
              <div className="p-3 bg-indigo-50 rounded-lg mt-3">
                <p className="text-xs text-indigo-700">
                  <strong>Real-time generation:</strong> Watch the AI's thought process and see how your image takes shape step by step with our streaming technology.
                </p>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg mt-3">
                <p className="text-xs text-yellow-700">
                  <strong>API Key Notice:</strong> If API keys aren't configured in your environment, the system will fall back to using placeholder images. For the full experience, add your API keys to the .env file.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleAdvancedOptions}
              className="text-xs text-gray-600 hover:text-indigo-600 flex items-center"
            >
              <Sliders className="w-3 h-3 mr-1" />
              {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
            </button>
          </div>
          
          {generatedDescription && (
            <div className={`${DESIGN_SYSTEM.components.panel} text-sm text-gray-700 max-h-40 overflow-y-auto`}>
              <p className="font-medium mb-1">Generated Description:</p>
              <p>{generatedDescription}</p>
            </div>
          )}

          {error && (
            <div className={getAlertClasses('error')}>
              {error}
            </div>
          )}

          <button
            onClick={isGenerating && isStreamingActive ? cancelGeneration : handleGenerateImage}
            disabled={isGenerating && !isStreamingActive || !prompt}
            className={getButtonClasses('primary')}
          >
            {isGenerating && isStreamingActive ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel Generation
              </>
            ) : isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with Real-Time Updates
              </>
            )}
          </button>
        </div>
        
        <div className="flex flex-col space-y-4">
          {/* Preview Container */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: "300px" }}>
            {generatedImage ? (
              <img 
                src={generatedImage} 
                alt="Generated image" 
                className="max-w-full max-h-[400px] object-contain" 
              />
            ) : isGenerating ? (
              <div className="text-center p-6 w-full">
                <div className="relative w-full h-48 border border-gray-200 rounded-lg bg-white mb-4 overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 h-1 bg-indigo-600" 
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="flex flex-col items-center justify-center h-full">
                    <Cpu className="w-10 h-10 text-indigo-300 mb-4" />
                    <motion.div
                      animate={{
                        opacity: [0, 1, 0],
                        y: [-5, 0, 5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-center"
                    >
                      <div className="text-indigo-700 font-medium mb-2">
                        {generationStatus || "Initializing..."}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {generationProgress}% complete
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Simulated image progress placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                    <motion.div 
                      initial={{ filter: "blur(20px)", opacity: 0 }}
                      animate={{ 
                        filter: `blur(${Math.max(20 - generationProgress/5, 2)}px)`,
                        opacity: Math.min(generationProgress/25, 1)
                      }}
                      className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-50"
                    >
                      {/* This would show progressive image formation in a real implementation */}
                    </motion.div>
                  </div>
                </div>
                
                <div className="text-gray-500 text-sm">
                  {isStreamingActive ? (
                    <motion.div 
                      className="flex items-center justify-center"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-indigo-400" />
                      <span>Real-time generation in progress...</span>
                    </motion.div>
                  ) : (
                    <span>Generation paused</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <Cpu className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your AI-generated image will appear here</p>
                <p className="text-sm text-gray-400 mt-2">Experience real-time generation</p>
              </div>
            )}
          </div>
          
          {/* Download buttons */}
          {generatedImage && (
            <div className={commonStyles.buttonGroup}>
              <button
                onClick={() => window.open(generatedImage)}
                className={getButtonClasses('secondary')}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                View Full Size
              </button>

              <a
                href={generatedImage}
                download="ai-generated-image.png"
                className={getButtonClasses('primary')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>

              {/* Video Generation Button */}
              <VideoGenerationButton
                imageUrl={generatedImage}
                prompt={prompt}
                className="flex-1"
              />
            </div>
          )}

          {/* Enhanced Image Editor with AI and Classic Options */}
          {generatedImage && (
            <div className="mt-6 space-y-4">
              <EnhancedImageEditorWithChoice
                imageUrl={generatedImage}
                onImageUpdated={(newImageUrl) => {
                  setGeneratedImage(newImageUrl);
                  onImageGenerated(newImageUrl);
                }}
                tokens={tokens}
              />

              {/* Advanced Editing Options */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowNanoBanana(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Wand2 className="w-4 h-4" />
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
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Conversational Refinement
                </button>
                <button
                  onClick={() => setShowTokenPalette(!showTokenPalette)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  {showTokenPalette ? 'Hide' : 'Show'} Tokens
                </button>
              </div>
            </div>
          )}
          
          {/* AI Reasoning Panel */}
          <AnimatePresence initial={false}>
            {isReasoningPanelOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-indigo-600" />
                      AI Reasoning Panel
                      {lastUpdateTime > 0 && isStreamingActive && (
                        <motion.span 
                          className="ml-2 h-2 w-2 bg-indigo-500 rounded-full"
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                    </h4>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={toggleReasoningPanel}
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-md p-3 max-h-[200px] overflow-y-auto">
                    {reasoningText ? (
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {reasoningText}
                      </div>
                    ) : isGenerating ? (
                      <div className="text-sm text-gray-500 flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Waiting for AI reasoning...
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Generate an image to see the AI's reasoning process in real-time.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Model Information */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-700 flex items-center mb-2">
              <Cpu className="w-4 h-4 mr-1" />
              Enhanced Generation Features
            </h4>
            <ul className="text-sm space-y-1 text-indigo-700">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                Real-time generation visualization
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                AI reasoning panel with generation insights
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                Multi-model support with optimized parameters
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                {selectedProvider === 'gpt-image-1' ? "Advanced GPT-4 Vision image generation" : 
                 selectedProvider === 'gemini2flash' ? "Ultra-fast generation with Gemini Flash" : 
                 "High quality output with detailed control"}
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                Video generation from images ($1 per download)
              </li>
            </ul>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            <p className="font-medium">Selected Model: {getProviderName(selectedProvider)}</p>
            <ul className="list-disc list-inside mt-1">
              {selectedProvider === 'openai' && (
                <>
                  <li>Multiple image sizes: 1024×1024, 1792×1024, 1024×1792</li>
                  <li>Quality options: Standard or HD (higher detail)</li>
                  <li>Style options: Natural or Vivid rendering</li>
                  <li>Advanced prompt understanding and text rendering</li>
                  <li>Image variations and editing capabilities</li>
                </>
              )}
              {selectedProvider === 'imagen' && (
                <>
                  <li>Excellent at style control with detailed prompts</li>
                  <li>Multiple aspect ratio options</li>
                  <li>Good at understanding detailed compositions</li>
                </>
              )}
              {selectedProvider === 'gemini' && (
                <>
                  <li>Strong context understanding</li>
                  <li>Good at interpreting complex scenes</li>
                  <li>Natural-looking compositions</li>
                </>
              )}
              {selectedProvider === 'gemini2flash' && (
                <>
                  <li>Ultra-fast generation (2-4x faster)</li>
                  <li>Streaming capabilities for real-time feedback</li>
                  <li>Interactive generation experience</li>
                </>
              )}
              {selectedProvider === 'gpt-image-1' && (
                <>
                  <li>Latest OpenAI GPT-4 Vision model</li>
                  <li>Superior understanding of complex prompts</li>
                  <li>Exceptional detail and photorealism</li>
                  <li>Advanced personalization capabilities</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {showPromptHelper && (
        <div className="mt-4">
          <PromptHelper
            basePrompt={prompt}
            onPromptSelect={handlePromptSelect}
            tokens={tokens}
            provider={selectedProvider === 'gemini2flash' ? 'gemini' : selectedProvider === 'gpt-image-1' ? 'openai' : selectedProvider}
          />
        </div>
      )}

      {showPromptGuide && (
        <div className="mt-4">
          <ImagenPromptGuide onPromptSelect={handlePromptSelect} />
        </div>
      )}

      {/* Universal Personalization Panel */}
      {showPersonalizationPanel && (
        <div className="mt-6">
          <UniversalPersonalizationPanel
            initialContent={prompt}
            initialContentType="prompt-ai"
            onContentGenerated={(content, type) => {
              setPersonalizedContent(content);
              setPrompt(content);
              setShowPersonalizationPanel(false);
            }}
          />
        </div>
      )}

      {/* Semantic Masking Editor */}
      {showSemanticMasking && generatedImage && (
        <SemanticMaskingEditor
          imageUrl={generatedImage}
          onEditComplete={(editedUrl) => {
            setGeneratedImage(editedUrl);
            onImageGenerated(editedUrl);
            setShowSemanticMasking(false);
          }}
          onClose={() => setShowSemanticMasking(false)}
        />
      )}

      {/* Conversational Refinement Panel */}
      {showConversationalRefinement && generatedImage && (
        <div className="mt-6">
          <ConversationalRefinementPanel
            initialImageUrl={generatedImage}
            onImageUpdated={(imageUrl) => {
              setGeneratedImage(imageUrl);
              onImageGenerated(imageUrl);
            }}
            onClose={() => setShowConversationalRefinement(false)}
          />
        </div>
      )}

      {/* Nano Banana AI Editor */}
      {showNanoBanana && generatedImage && (
        <NanoBananaModal
          imageUrl={generatedImage}
          onSave={(editedImageUrl) => {
            setGeneratedImage(editedImageUrl);
            onImageGenerated(editedImageUrl);
            setShowNanoBanana(false);
          }}
          onClose={() => setShowNanoBanana(false)}
          moduleType="ai-image"
          tokens={tokens}
        />
      )}

      {/* Token Palette Panel */}
      {showTokenPalette && (
        <div className="mt-6">
          <TokenPalette
            tokens={tokens}
            onTokenUpdate={(key, value) => {
              // Update token in parent component
              const updatedTokens = { ...tokens, [key]: value };
              // This would typically be handled by parent component
              console.log('Token updated:', key, value);
            }}
            onTokenAdd={(token) => {
              console.log('Token added:', token);
            }}
            onTokenDelete={(key) => {
              console.log('Token deleted:', key);
            }}
            onTokenInsert={(tokenKey) => {
              // Insert token into prompt
              const tokenText = `[${tokenKey}]`;
              const newPrompt = prompt + tokenText;
              setPrompt(newPrompt);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AIImageGenerator;