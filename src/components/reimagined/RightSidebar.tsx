import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModelSelector from './ModelSelector';
import AdvancedSettings from './AdvancedSettings';
import PostGenerationTools from './PostGenerationTools';

interface RightSidebarProps {
  workflowStage: 'prompt' | 'generating' | 'result';
  selectedModel: string;
  onModelChange: (model: string) => void;
  currentImage: string | null;
  prompt: string;
  onImageUpdated: (imageUrl: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  workflowStage,
  selectedModel,
  onModelChange,
  currentImage,
  prompt,
  onImageUpdated
}) => {
  const [expandedSection, setExpandedSection] = useState<string>('models');

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <h2 className="text-lg font-semibold text-gray-900">
          {workflowStage === 'result' ? 'Edit & Enhance' : 'Generation Settings'}
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          {workflowStage === 'result'
            ? 'Tools to refine your generated image'
            : 'Choose your AI model and settings'}
        </p>
      </div>

      {/* Content - Changes based on workflow stage */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">
          {workflowStage === 'result' && currentImage ? (
            <motion.div
              key="post-generation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PostGenerationTools
                imageUrl={currentImage}
                prompt={prompt}
                onImageUpdated={onImageUpdated}
              />
            </motion.div>
          ) : (
            <motion.div
              key="pre-generation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={onModelChange}
              />

              <AdvancedSettings selectedModel={selectedModel} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RightSidebar;
