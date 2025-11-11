import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, X, Brain, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface GenerationControlPanelProps {
  isGenerating: boolean;
  generationProgress: number;
  generationStatus: string;
  onGenerate: () => void;
  onCancel: () => void;
  disabled?: boolean;
  showAIReasoning?: boolean;
  aiReasoningText?: string;
  className?: string;
}

export const GenerationControlPanel: React.FC<GenerationControlPanelProps> = ({
  isGenerating,
  generationProgress,
  generationStatus,
  onGenerate,
  onCancel,
  disabled = false,
  showAIReasoning = false,
  aiReasoningText = '',
  className = ''
}) => {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Generate Button */}
      <button
        onClick={isGenerating ? onCancel : onGenerate}
        disabled={disabled && !isGenerating}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
          isGenerating
            ? 'bg-red-600 hover:bg-red-700'
            : disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {isGenerating ? (
          <>
            <X className="w-5 h-5" />
            Cancel Generation
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Image
          </>
        )}
      </button>

      {/* Progress Bar and Status */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
        >
          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${generationProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Status Text */}
          <div className="flex items-center justify-between">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{generationStatus || 'Generating...'}</span>
            </motion.div>
            <span className="text-sm font-medium text-gray-600">
              {generationProgress}%
            </span>
          </div>
        </motion.div>
      )}

      {/* AI Reasoning Panel */}
      {showAIReasoning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200"
        >
          <button
            onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
            className="w-full p-3 flex items-center justify-between hover:bg-purple-100/50 transition-colors rounded-t-lg"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-900">AI Reasoning</span>
              {isGenerating && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                />
              )}
            </div>
            {isReasoningExpanded ? (
              <ChevronUp className="w-4 h-4 text-purple-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-600" />
            )}
          </button>

          <AnimatePresence>
            {isReasoningExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 max-h-[200px] overflow-y-auto">
                  {aiReasoningText ? (
                    <p className="text-sm text-purple-800 whitespace-pre-line">
                      {aiReasoningText}
                    </p>
                  ) : isGenerating ? (
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Waiting for AI reasoning...</span>
                    </div>
                  ) : (
                    <p className="text-sm text-purple-600">
                      Generate an image to see the AI's reasoning process in real-time.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Quick Tips */}
      <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Pro Tip:</p>
            <p>Use reference images and personalization tokens for more targeted results.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationControlPanel;
