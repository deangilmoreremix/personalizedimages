import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Wand2, Sun, Eye, Palette, Lightbulb, ChevronDown, Check
} from 'lucide-react';

interface PromptWorkspaceProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  tokens: Record<string, string>;
  qualityScore: number;
  showEnhancementBar: boolean;
  onToggleEnhancementBar: () => void;
}

const PromptWorkspace: React.FC<PromptWorkspaceProps> = ({
  prompt,
  onPromptChange,
  tokens,
  qualityScore,
  showEnhancementBar,
  onToggleEnhancementBar
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [caretPosition, setCaretPosition] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Listen for token click events
  useEffect(() => {
    const handleTokenClick = (event: any) => {
      const { key, display } = event.detail;
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const newPrompt = prompt.substring(0, start) + display + prompt.substring(end);
        onPromptChange(newPrompt);

        // Set cursor position after the inserted token
        setTimeout(() => {
          if (textareaRef.current) {
            const newPosition = start + display.length;
            textareaRef.current.selectionStart = newPosition;
            textareaRef.current.selectionEnd = newPosition;
            textareaRef.current.focus();
          }
        }, 0);
      }
    };

    window.addEventListener('tokenClicked', handleTokenClick);
    return () => window.removeEventListener('tokenClicked', handleTokenClick);
  }, [prompt, onPromptChange]);

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');

    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newPrompt = prompt.substring(0, start) + data + prompt.substring(end);
      onPromptChange(newPrompt);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  const handleEnhance = (type: string) => {
    let enhancement = '';

    switch (type) {
      case 'style':
        enhancement = ', professional photography style, high quality composition';
        break;
      case 'lighting':
        enhancement = ', natural lighting, soft shadows, golden hour ambiance';
        break;
      case 'composition':
        enhancement = ', rule of thirds composition, balanced framing, depth of field';
        break;
      case 'quality':
        enhancement = ', 8K resolution, highly detailed, professional quality, sharp focus';
        break;
    }

    onPromptChange(prompt + enhancement);
  };

  const displayPrompt = prompt.replace(/\[([A-Z]+)\]/g, (match, key) => {
    return tokens[key] || match;
  });

  return (
    <div className="space-y-3">
      {/* Enhancement Bar */}
      <AnimatePresence>
        {showEnhancementBar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 flex-wrap pb-2">
              <button
                onClick={() => handleEnhance('style')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm text-purple-700 hover:from-purple-100 hover:to-pink-100 transition-all"
              >
                <Palette className="w-3.5 h-3.5" />
                Add Style
              </button>
              <button
                onClick={() => handleEnhance('lighting')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 hover:from-yellow-100 hover:to-orange-100 transition-all"
              >
                <Sun className="w-3.5 h-3.5" />
                Lighting
              </button>
              <button
                onClick={() => handleEnhance('composition')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:from-blue-100 hover:to-cyan-100 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                Composition
              </button>
              <button
                onClick={() => handleEnhance('quality')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg text-sm text-green-700 hover:from-green-100 hover:to-teal-100 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Quality Boost
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Prompt Input */}
      <div className="relative">
        <div
          className={`relative rounded-xl border-2 transition-all ${
            isFocused
              ? 'border-blue-400 shadow-lg shadow-blue-100'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Token Preview Layer */}
          {prompt && (
            <div
              className="absolute inset-0 px-4 py-3 pointer-events-none text-gray-900 whitespace-pre-wrap break-words opacity-0"
              style={{ minHeight: '80px' }}
            >
              {displayPrompt}
            </div>
          )}

          {/* Actual Textarea */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            placeholder="Describe the image you want to create... Click tokens from the left or drag them here"
            className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-gray-900 placeholder-gray-400"
            style={{ minHeight: '80px', maxHeight: '240px' }}
            rows={3}
          />

          {/* Character Count */}
          <div className="absolute bottom-3 right-3 flex items-center gap-3">
            <div className="text-xs text-gray-400">
              {prompt.length} / 1000
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        {!prompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg"
          >
            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <span className="font-medium">Pro tip:</span> Click tokens from the left sidebar to personalize your prompt, or use the enhancement buttons above for better results.
            </div>
          </motion.div>
        )}

        {/* Quality Feedback */}
        {prompt && qualityScore < 60 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg"
          >
            <Wand2 className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <span className="font-medium">Suggestion:</span> Add more details about style, lighting, or composition to improve your results.
            </div>
          </motion.div>
        )}

        {prompt && qualityScore >= 80 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-start gap-2 p-3 bg-green-50 border border-green-100 rounded-lg"
          >
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-700">
              <span className="font-medium">Excellent prompt!</span> Your description has great detail and clarity.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PromptWorkspace;
