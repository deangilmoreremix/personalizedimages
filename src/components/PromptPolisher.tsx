import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { GPT_MODELS, GPTModel } from '../../lib/openai';
import { polishImagePrompt } from '../utils/gptApi';

interface PromptPolisherProps {
  currentPrompt: string;
  onPromptUpdate: (newPrompt: string) => void;
  disabled?: boolean;
}

const PromptPolisher: React.FC<PromptPolisherProps> = ({
  currentPrompt,
  onPromptUpdate,
  disabled = false,
}) => {
  const [selectedModel, setSelectedModel] = useState<GPTModel>('gpt-4o');
  const [isPolishing, setIsPolishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePolishPrompt = async () => {
    if (!currentPrompt.trim()) {
      setError('Please enter a prompt first');
      return;
    }

    try {
      setIsPolishing(true);
      setError(null);

      const polishedPrompt = await polishImagePrompt(currentPrompt, selectedModel);
      onPromptUpdate(polishedPrompt);
    } catch (err: any) {
      setError(err.message || 'Failed to polish prompt');
    } finally {
      setIsPolishing(false);
    }
  };

  if (disabled) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
          <h4 className="text-sm font-medium text-purple-800">AI Prompt Polisher</h4>
        </div>
        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
          Powered by GPT
        </span>
      </div>

      <p className="text-xs text-purple-700 mb-3">
        Enhance your image prompts with AI for better DALL-E 3 results
      </p>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-purple-700 mb-1">
            GPT Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as GPTModel)}
            className="w-full px-3 py-2 text-sm border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            disabled={isPolishing}
          >
            {GPT_MODELS.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handlePolishPrompt}
            disabled={isPolishing || !currentPrompt.trim()}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isPolishing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Polishing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Polish Prompt
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="text-xs text-purple-600 mt-2">
        💡 Tip: GPT will enhance your prompt with professional terminology, lighting details, and artistic elements for better image generation.
      </div>
    </div>
  );
};

export default PromptPolisher;