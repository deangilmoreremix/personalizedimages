import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Wand2, Sun, Eye, Palette, Menu, Download,
  RefreshCw, Zap, ChevronDown, Loader2
} from 'lucide-react';
import PromptWorkspace from './PromptWorkspace';
import ImageCanvas from './ImageCanvas';
import GenerationControls from './GenerationControls';

interface CenterCanvasProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  tokens: Record<string, string>;
  currentImage: string | null;
  isGenerating: boolean;
  workflowStage: 'prompt' | 'generating' | 'result';
  selectedModel: string;
  onImageGenerated: (imageUrl: string) => void;
  onStartGeneration: () => void;
  onGenerationComplete: () => void;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
}

const CenterCanvas: React.FC<CenterCanvasProps> = ({
  prompt,
  onPromptChange,
  tokens,
  currentImage,
  isGenerating,
  workflowStage,
  selectedModel,
  onImageGenerated,
  onStartGeneration,
  onGenerationComplete,
  onToggleLeftSidebar,
  onToggleRightSidebar
}) => {
  const [showEnhancementBar, setShowEnhancementBar] = useState(true);
  const [qualityScore, setQualityScore] = useState(0);

  // Calculate quality score based on prompt
  useEffect(() => {
    if (!prompt) {
      setQualityScore(0);
      return;
    }

    let score = 0;
    const wordCount = prompt.split(/\s+/).length;

    // Length score (max 30)
    if (wordCount >= 20) score += 30;
    else score += (wordCount / 20) * 30;

    // Detail score (max 25)
    const detailWords = ['detailed', 'professional', 'high quality', '8k', '4k', 'hd'];
    detailWords.forEach(word => {
      if (prompt.toLowerCase().includes(word)) score += 5;
    });

    // Style score (max 20)
    const styleWords = ['style', 'aesthetic', 'cinematic', 'artistic'];
    styleWords.forEach(word => {
      if (prompt.toLowerCase().includes(word)) score += 5;
    });

    // Lighting score (max 15)
    const lightingWords = ['lighting', 'light', 'illuminated', 'bright', 'dark', 'shadow'];
    lightingWords.forEach(word => {
      if (prompt.toLowerCase().includes(word)) score += 5;
    });

    // Token usage (max 10)
    const tokenMatches = prompt.match(/\[([A-Z]+)\]/g);
    if (tokenMatches && tokenMatches.length > 0) score += 10;

    setQualityScore(Math.min(Math.round(score), 100));
  }, [prompt]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-orange-100';
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLeftSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Image Generator</h1>
            <p className="text-sm text-gray-500">Create personalized images with AI</p>
          </div>
        </div>

        {prompt && (
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">Prompt Quality</div>
            <div className={`px-3 py-1.5 rounded-full font-semibold text-sm ${getScoreBg(qualityScore)} ${getScoreColor(qualityScore)}`}>
              {qualityScore}%
            </div>
          </div>
        )}
      </div>

      {/* Prompt Workspace */}
      <div className="px-6 pt-4">
        <PromptWorkspace
          prompt={prompt}
          onPromptChange={onPromptChange}
          tokens={tokens}
          qualityScore={qualityScore}
          showEnhancementBar={showEnhancementBar}
          onToggleEnhancementBar={() => setShowEnhancementBar(!showEnhancementBar)}
        />
      </div>

      {/* Image Canvas */}
      <div className="flex-1 px-6 py-4 overflow-hidden">
        <ImageCanvas
          currentImage={currentImage}
          isGenerating={isGenerating}
          workflowStage={workflowStage}
          prompt={prompt}
        />
      </div>

      {/* Generation Controls */}
      <div className="px-6 pb-6">
        <GenerationControls
          prompt={prompt}
          selectedModel={selectedModel}
          isGenerating={isGenerating}
          workflowStage={workflowStage}
          onGenerate={onStartGeneration}
          onImageGenerated={onImageGenerated}
          onGenerationComplete={onGenerationComplete}
          tokens={tokens}
        />
      </div>
    </div>
  );
};

export default CenterCanvas;
