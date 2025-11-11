import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, Loader2 } from 'lucide-react';
import {
  generateImageWithDalle,
  generateImageWithGemini,
  generateImageWithGemini2Flash,
  generateImageWithImagen,
  generateImageWithGptImage
} from '../../utils/api';

interface GenerationControlsProps {
  prompt: string;
  selectedModel: string;
  isGenerating: boolean;
  workflowStage: 'prompt' | 'generating' | 'result';
  onGenerate: () => void;
  onImageGenerated: (imageUrl: string) => void;
  onGenerationComplete: () => void;
  tokens: Record<string, string>;
}

const GenerationControls: React.FC<GenerationControlsProps> = ({
  prompt,
  selectedModel,
  isGenerating,
  workflowStage,
  onGenerate,
  onImageGenerated,
  onGenerationComplete,
  tokens
}) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 10;
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    onGenerate();
    setIsProcessing(true);
    setProgress(0);
    setStatusMessage('Starting generation...');

    try {
      // Replace tokens in prompt
      let processedPrompt = prompt;
      Object.entries(tokens).forEach(([key, value]) => {
        processedPrompt = processedPrompt.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
      });

      setStatusMessage('Processing prompt...');
      setProgress(20);

      // Generate based on selected model
      let imageUrl: string;

      switch (selectedModel) {
        case 'gemini':
          setStatusMessage('Generating with Gemini...');
          imageUrl = await generateImageWithGemini(processedPrompt);
          break;
        case 'gemini2flash':
          setStatusMessage('Generating with Gemini Flash...');
          imageUrl = await generateImageWithGemini2Flash(processedPrompt);
          break;
        case 'imagen':
          setStatusMessage('Generating with Imagen 3...');
          imageUrl = await generateImageWithImagen(processedPrompt);
          break;
        case 'gpt-image-1':
          setStatusMessage('Generating with GPT-4 Vision...');
          imageUrl = await generateImageWithGptImage(processedPrompt);
          break;
        default:
          setStatusMessage('Generating with DALL-E 3...');
          imageUrl = await generateImageWithDalle(processedPrompt);
      }

      setProgress(100);
      setStatusMessage('Complete!');

      setTimeout(() => {
        onImageGenerated(imageUrl);
        onGenerationComplete();
        setIsProcessing(false);
      }, 500);

    } catch (error) {
      console.error('Generation error:', error);
      setStatusMessage('Generation failed. Please try again.');
      setIsProcessing(false);
      onGenerationComplete();
    }
  };

  const handleCancel = () => {
    setIsProcessing(false);
    onGenerationComplete();
    setProgress(0);
    setStatusMessage('');
  };

  const getButtonText = () => {
    if (workflowStage === 'result') return 'Regenerate Image';
    if (isGenerating) return 'Generating...';
    return 'Generate Image';
  };

  const isDisabled = !prompt.trim() || isProcessing;

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{statusMessage}</span>
            <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-500 to-teal-500"
            />
          </div>
        </motion.div>
      )}

      {/* Main Generate Button */}
      <motion.button
        onClick={isGenerating ? handleCancel : handleGenerate}
        disabled={isDisabled && !isGenerating}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        className={`w-full relative overflow-hidden rounded-xl font-semibold text-lg py-4 transition-all shadow-lg ${
          isGenerating
            ? 'bg-gray-600 hover:bg-gray-700 text-white'
            : isDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white'
        }`}
      >
        {/* Shimmer Effect */}
        {!isDisabled && !isGenerating && (
          <motion.div
            animate={{
              x: [-200, 800],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ width: '200px' }}
          />
        )}

        <span className="relative flex items-center justify-center gap-2">
          {isGenerating ? (
            <>
              <X className="w-5 h-5" />
              Cancel Generation
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {getButtonText()}
            </>
          )}
        </span>
      </motion.button>

      {/* Quick Stats */}
      {!isGenerating && prompt && (
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Ready to generate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{prompt.split(/\s+/).length} words</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>{(prompt.match(/\[([A-Z]+)\]/g) || []).length} tokens</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationControls;
