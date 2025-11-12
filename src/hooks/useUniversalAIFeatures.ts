/**
 * Universal AI Features Hook
 * Provides all AI capabilities from the AI Image Generator to all image generators
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  generateImageWithDalle,
  generateImageWithGemini,
  generateImageWithGemini2Flash,
  generateImageWithImagen,
  generateImageWithGptImage,
  generateImageDescriptionWithAI
} from '../utils/api';
import { streamImageGeneration, streamAIReasoning } from '../utils/streamingApi';

export type AIModel = 'openai' | 'imagen' | 'gemini' | 'gemini2flash' | 'gpt-image-1';

export interface DalleOptions {
  size: '1024x1024' | '1792x1024' | '1024x1792';
  quality: 'standard' | 'hd';
  style: 'natural' | 'vivid';
}

export interface StreamingState {
  isActive: boolean;
  progress: number;
  status: string;
  reasoning: string;
  lastUpdateTime: number;
}

export interface AIReasoningState {
  isOpen: boolean;
  text: string;
  isActive: boolean;
}

export interface PromptEnhancement {
  enhancePrompt: (prompt: string) => Promise<string>;
  generateDescription: (tokens: Record<string, string>) => Promise<string>;
  isGeneratingDescription: boolean;
}

export interface ReferenceImageState {
  current: string | null;
  history: string[];
  isUploading: boolean;
}

export interface VideoGeneration {
  generate: (imageUrl: string, prompt: string) => Promise<void>;
  isAvailable: boolean;
  cost: string;
  isGenerating: boolean;
}

export interface ImageEditor {
  open: (imageUrl: string) => void;
  classic: () => void;
  ai: () => void;
}

export interface TokenDragDrop {
  isEnabled: boolean;
  handleDrop: (token: any, position: { x: number; y: number }) => void;
  renderTokens: () => React.ReactNode;
}

export interface AspectRatioControls {
  options: string[];
  selected: string;
  setSelected: (ratio: string) => void;
  applyToPrompt: boolean;
}

export interface StylePresets {
  categories: string[];
  selected: string;
  setSelected: (style: string) => void;
  visualPicker: boolean;
}

export interface UseUniversalAIFeaturesOptions {
  generatorType: string;
  tokens: Record<string, string>;
  onImageGenerated?: (imageUrl: string) => void;
}

export const useUniversalAIFeatures = ({
  generatorType,
  tokens,
  onImageGenerated
}: UseUniversalAIFeaturesOptions) => {
  // AI Model Selection
  const [selectedModel, setSelectedModel] = useState<AIModel>('openai');
  const [dalleOptions, setDalleOptions] = useState<DalleOptions>({
    size: '1024x1024',
    quality: 'standard',
    style: 'natural'
  });

  // Streaming State
  const [streaming, setStreaming] = useState<StreamingState>({
    isActive: false,
    progress: 0,
    status: '',
    reasoning: '',
    lastUpdateTime: 0
  });

  // AI Reasoning
  const [reasoning, setReasoning] = useState<AIReasoningState>({
    isOpen: false,
    text: '',
    isActive: false
  });

  // Prompt Enhancement
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // Reference Images
  const [referenceImages, setReferenceImages] = useState<ReferenceImageState>({
    current: null,
    history: [],
    isUploading: false
  });

  // Video Generation
  const [videoGen, setVideoGen] = useState({
    isGenerating: false
  });

  // Aspect Ratios
  const [aspectRatio, setAspectRatio] = useState({
    selected: '1:1',
    applyToPrompt: true
  });

  // Style Presets
  const [stylePreset, setStylePreset] = useState('photography');

  // Refs for cleanup
  const generationRef = useRef<(() => void) | null>(null);
  const reasoningRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (generationRef.current) generationRef.current();
      if (reasoningRef.current) reasoningRef.current();
    };
  }, []);

  // Model selection functions
  const getProviderName = useCallback((model: AIModel) => {
    switch (model) {
      case 'openai': return 'DALL-E 3';
      case 'imagen': return 'Imagen 3';
      case 'gemini': return 'Gemini';
      case 'gemini2flash': return 'Gemini 2.5 Flash';
      case 'gpt-image-1': return 'GPT-4 Vision';
      default: return model;
    }
  }, []);

  const updateDalleOptions = useCallback((updates: Partial<DalleOptions>) => {
    setDalleOptions(prev => ({ ...prev, ...updates }));
  }, []);

  // Streaming functions
  const startStreamingGeneration = useCallback(async (prompt: string) => {
    setStreaming(prev => ({ ...prev, isActive: true, progress: 0, status: 'Initializing...' }));

    // Start reasoning stream if panel is open
    if (reasoning.isOpen) {
      setReasoning(prev => ({ ...prev, isActive: true }));
      reasoningRef.current = streamAIReasoning({
        prompt,
        onReasoningUpdate: (reasoningText) => {
          setReasoning(prev => ({ ...prev, text: reasoningText }));
          setStreaming(prev => ({ ...prev, lastUpdateTime: Date.now() }));
        },
        onComplete: (fullReasoning) => {
          setReasoning(prev => ({ ...prev, text: fullReasoning, isActive: false }));
        }
      });
    }

    // Start image generation stream
    generationRef.current = streamImageGeneration({
      prompt,
      provider: selectedModel,
      onStatusUpdate: (status) => {
        setStreaming(prev => ({ ...prev, status, lastUpdateTime: Date.now() }));
      },
      onProgress: (progress) => {
        setStreaming(prev => ({ ...prev, progress }));
      },
      onComplete: async (imageUrl) => {
        setStreaming(prev => ({ ...prev, isActive: false }));
        await generateRealImage(prompt);
      },
      dalleOptions: selectedModel === 'openai' ? dalleOptions : undefined
    });
  }, [selectedModel, dalleOptions, reasoning.isOpen]);

  const cancelStreaming = useCallback(() => {
    if (generationRef.current) {
      generationRef.current();
      generationRef.current = null;
    }
    if (reasoningRef.current) {
      reasoningRef.current();
      reasoningRef.current = null;
    }
    setStreaming(prev => ({ ...prev, isActive: false, status: 'Generation canceled' }));
    setReasoning(prev => ({ ...prev, isActive: false }));
  }, []);

  // Real image generation (called after streaming simulation)
  const generateRealImage = useCallback(async (prompt: string) => {
    try {
      setStreaming(prev => ({ ...prev, status: "Finalizing image..." }));

      // Enhance prompt with style and aspect ratio
      let enhancedPrompt = prompt;
      if (stylePreset && stylePreset !== 'photography' && !prompt.toLowerCase().includes(stylePreset.toLowerCase())) {
        enhancedPrompt = `${prompt} (${stylePreset} style)`;
      }
      if (aspectRatio.applyToPrompt && !enhancedPrompt.toLowerCase().includes('aspect ratio')) {
        enhancedPrompt = `${enhancedPrompt} (${aspectRatio.selected} aspect ratio)`;
      }

      console.log(`🖼️ Generating image with ${selectedModel}:`, { enhancedPrompt, aspectRatio: aspectRatio.selected, stylePreset });

      let imageUrl;
      switch (selectedModel) {
        case 'gemini':
          imageUrl = await generateImageWithGemini(enhancedPrompt, aspectRatio.selected, stylePreset);
          break;
        case 'gemini2flash':
          imageUrl = await generateImageWithGemini2Flash(enhancedPrompt);
          break;
        case 'imagen':
          imageUrl = await generateImageWithImagen(enhancedPrompt, aspectRatio.selected);
          break;
        case 'gpt-image-1':
          imageUrl = await generateImageWithGptImage(enhancedPrompt);
          break;
        default: // openai - DALL-E 3
          imageUrl = await generateImageWithDalle(enhancedPrompt, dalleOptions);
      }

      console.log('✅ Successfully generated image');
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }

      return imageUrl;
    } catch (err) {
      console.error('❌ Failed to generate image:', err);
      throw err;
    }
  }, [selectedModel, dalleOptions, stylePreset, aspectRatio, onImageGenerated]);

  // Prompt enhancement functions
  const enhancePrompt = useCallback(async (prompt: string): Promise<string> => {
    // For now, return the prompt as-is. Could integrate with AI enhancement API
    return prompt;
  }, []);

  const generateDescription = useCallback(async (tokens: Record<string, string>): Promise<string> => {
    try {
      setIsGeneratingDescription(true);
      console.log('🖋️ Generating AI image description with tokens:', tokens);

      let description;
      try {
        description = await generateImageDescriptionWithAI(tokens);
        console.log('✅ Successfully generated image description');
      } catch (err) {
        console.warn('❌ Failed to generate description via API:', err);
        // Create fallback description
        description = `A professional marketing image${tokens['FIRSTNAME'] ? ` featuring ${tokens['FIRSTNAME']}` : ''}${
          tokens['COMPANY'] ? ` with ${tokens['COMPANY']} branding` : ''
        } with modern design elements and a striking visual composition.`;
      }

      return description;
    } catch (err) {
      console.error('❌ Failed to generate description:', err);
      throw err;
    } finally {
      setIsGeneratingDescription(false);
    }
  }, []);

  // Reference image functions
  const uploadReferenceImage = useCallback((file: File) => {
    setReferenceImages(prev => ({ ...prev, isUploading: true }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setReferenceImages(prev => ({
          ...prev,
          current: result,
          history: [result, ...prev.history.slice(0, 4)], // Keep last 5
          isUploading: false
        }));
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const clearReferenceImage = useCallback(() => {
    setReferenceImages(prev => ({ ...prev, current: null }));
  }, []);

  // Video generation
  const generateVideo = useCallback(async (imageUrl: string, prompt: string) => {
    setVideoGen(prev => ({ ...prev, isGenerating: true }));
    try {
      // This would integrate with video generation API
      console.log('🎬 Generating video from image:', { imageUrl, prompt });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Video generation completed');
    } catch (err) {
      console.error('❌ Video generation failed:', err);
      throw err;
    } finally {
      setVideoGen(prev => ({ ...prev, isGenerating: false }));
    }
  }, []);

  // Image editor functions
  const openImageEditor = useCallback((imageUrl: string) => {
    // This would open the enhanced image editor
    console.log('🎨 Opening image editor for:', imageUrl);
  }, []);

  // Token drag-drop (placeholder for now)
  const handleTokenDrop = useCallback((token: any, position: { x: number; y: number }) => {
    console.log('🎯 Token dropped:', { token, position });
    // Implementation would update token positions
  }, []);

  return {
    // AI Model Selection
    models: {
      available: ['openai', 'imagen', 'gemini', 'gemini2flash', 'gpt-image-1'] as AIModel[],
      selected: selectedModel,
      setSelected: setSelectedModel,
      getProviderName,
      dalleOptions,
      updateDalleOptions
    },

    // Streaming Generation
    streaming: {
      ...streaming,
      startStream: startStreamingGeneration,
      cancelStream: cancelStreaming
    },

    // AI Reasoning Panel
    reasoning: {
      ...reasoning,
      toggle: () => setReasoning(prev => ({ ...prev, isOpen: !prev.isOpen }))
    },

    // Prompt Enhancement
    promptEnhancement: {
      enhancePrompt,
      generateDescription,
      isGeneratingDescription
    },

    // Reference Images
    referenceImages: {
      ...referenceImages,
      upload: uploadReferenceImage,
      clear: clearReferenceImage
    },

    // Video Generation
    videoGeneration: {
      generate: generateVideo,
      isAvailable: true,
      cost: '$1 per download',
      isGenerating: videoGen.isGenerating
    },

    // Enhanced Image Editor
    imageEditor: {
      open: openImageEditor,
      classic: () => console.log('🎨 Opening classic editor'),
      ai: () => console.log('🤖 Opening AI editor')
    },

    // Token Drag-Drop
    tokenDragDrop: {
      isEnabled: true,
      handleDrop: handleTokenDrop,
      renderTokens: () => null // Placeholder
    },

    // Aspect Ratio Controls
    aspectRatios: {
      options: ['1:1', '4:3', '3:4', '16:9', '9:16'],
      selected: aspectRatio.selected,
      setSelected: (ratio: string) => setAspectRatio(prev => ({ ...prev, selected: ratio })),
      applyToPrompt: aspectRatio.applyToPrompt
    },

    // Style Presets
    stylePresets: {
      categories: ['photography', 'painting', 'digital-art', 'sketch', 'cartoon', 'anime', 'illustration'],
      selected: stylePreset,
      setSelected: setStylePreset,
      visualPicker: true
    }
  };
};