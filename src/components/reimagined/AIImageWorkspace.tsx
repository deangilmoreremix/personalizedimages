import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LeftSidebar from './LeftSidebar';
import CenterCanvas from './CenterCanvas';
import RightSidebar from './RightSidebar';
import TimelineStrip from './TimelineStrip';

interface AIImageWorkspaceProps {
  tokens: Record<string, string>;
  onTokensUpdate: (tokens: Record<string, string>) => void;
}

const AIImageWorkspace: React.FC<AIImageWorkspaceProps> = ({
  tokens,
  onTokensUpdate
}) => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [activePrompt, setActivePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowStage, setWorkflowStage] = useState<'prompt' | 'generating' | 'result'>('prompt');

  const handleImageGenerated = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setGenerationHistory(prev => [imageUrl, ...prev]);
    setWorkflowStage('result');
  };

  const handleStartGeneration = () => {
    setIsGenerating(true);
    setWorkflowStage('generating');
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <AnimatePresence initial={false}>
          {leftSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="border-r border-gray-200 bg-white shadow-sm"
            >
              <LeftSidebar
                tokens={tokens}
                onTokensUpdate={onTokensUpdate}
                onPromptSelect={setActivePrompt}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Left Sidebar */}
        {!leftSidebarOpen && (
          <button
            onClick={() => setLeftSidebarOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-r-lg p-2 shadow-md hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CenterCanvas
            prompt={activePrompt}
            onPromptChange={setActivePrompt}
            tokens={tokens}
            currentImage={currentImage}
            isGenerating={isGenerating}
            workflowStage={workflowStage}
            selectedModel={selectedModel}
            onImageGenerated={handleImageGenerated}
            onStartGeneration={handleStartGeneration}
            onGenerationComplete={handleGenerationComplete}
            onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
            onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
          />
        </div>

        {/* Right Sidebar */}
        <AnimatePresence initial={false}>
          {rightSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="border-l border-gray-200 bg-white shadow-sm"
            >
              <RightSidebar
                workflowStage={workflowStage}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                currentImage={currentImage}
                prompt={activePrompt}
                onImageUpdated={setCurrentImage}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Right Sidebar */}
        {!rightSidebarOpen && (
          <button
            onClick={() => setRightSidebarOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-l-lg p-2 shadow-md hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Timeline Strip */}
      <TimelineStrip
        images={generationHistory}
        onSelectImage={setCurrentImage}
        currentImage={currentImage}
      />
    </div>
  );
};

export default AIImageWorkspace;
