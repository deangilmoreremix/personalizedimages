import React, { useState } from 'react';
import { Send, Sparkles, History, X, Image as ImageIcon, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { refineImageConversationally, RefinementStep } from '../utils/geminiNanoApi';

interface ConversationalRefinementPanelProps {
  initialImageUrl: string;
  onImageUpdated: (imageUrl: string) => void;
  onClose: () => void;
}

const ConversationalRefinementPanel: React.FC<ConversationalRefinementPanelProps> = ({
  initialImageUrl,
  onImageUpdated,
  onClose
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(initialImageUrl);
  const [refinementHistory, setRefinementHistory] = useState<RefinementStep[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const quickActions = [
    { label: 'Brighten', prompt: 'Make the image brighter and more vibrant' },
    { label: 'Add warmth', prompt: 'Add warm tones and a golden hour feel' },
    { label: 'More detail', prompt: 'Enhance the details and sharpness' },
    { label: 'Soften', prompt: 'Soften the image with a dreamy, ethereal quality' },
    { label: 'High contrast', prompt: 'Increase the contrast for a more dramatic look' },
    { label: 'Cool tones', prompt: 'Add cool blue tones for a calming atmosphere' }
  ];

  const handleRefine = async (prompt: string) => {
    if (!prompt.trim()) {
      setError('Please enter a refinement request');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const refinedImageUrl = await refineImageConversationally({
        currentImageUrl,
        refinementPrompt: prompt,
        history: refinementHistory
      });

      // Add to history
      const newStep: RefinementStep = {
        userPrompt: prompt,
        imageUrl: refinedImageUrl,
        timestamp: Date.now()
      };

      const newHistory = [...refinementHistory.slice(0, currentHistoryIndex + 1), newStep];
      setRefinementHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);

      setCurrentImageUrl(refinedImageUrl);
      onImageUpdated(refinedImageUrl);
      setUserInput('');
    } catch (err) {
      console.error('Error refining image:', err);
      setError(err instanceof Error ? err.message : 'Failed to refine image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleRefine(prompt);
  };

  const navigateHistory = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setCurrentImageUrl(refinementHistory[newIndex].imageUrl);
      onImageUpdated(refinementHistory[newIndex].imageUrl);
    } else if (direction === 'next' && currentHistoryIndex < refinementHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setCurrentImageUrl(refinementHistory[newIndex].imageUrl);
      onImageUpdated(refinementHistory[newIndex].imageUrl);
    }
  };

  const goToHistoryStep = (index: number) => {
    setCurrentHistoryIndex(index);
    setCurrentImageUrl(refinementHistory[index].imageUrl);
    onImageUpdated(refinementHistory[index].imageUrl);
    setShowHistory(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Conversational Refinement
        </h3>
        <div className="flex items-center gap-2">
          {refinementHistory.length > 0 && (
            <>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="View History"
              >
                <History className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-sm">
                <button
                  onClick={() => navigateHistory('prev')}
                  disabled={currentHistoryIndex <= 0}
                  className="p-1 hover:bg-gray-200 disabled:opacity-30 rounded"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="font-medium">
                  {currentHistoryIndex + 1} / {refinementHistory.length}
                </span>
                <button
                  onClick={() => navigateHistory('next')}
                  disabled={currentHistoryIndex >= refinementHistory.length - 1}
                  className="p-1 hover:bg-gray-200 disabled:opacity-30 rounded"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Current Image Preview */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ maxHeight: '300px' }}>
        <img
          src={currentImageUrl}
          alt="Current refinement"
          className="w-full h-full object-contain"
        />
        {refinementHistory.length === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <p className="text-white text-center px-4">
              Start refining this image by describing what you'd like to change
            </p>
          </div>
        )}
      </div>

      {/* History Panel */}
      {showHistory && refinementHistory.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Refinement History</h4>
          <div className="space-y-2">
            {refinementHistory.map((step, index) => (
              <button
                key={index}
                onClick={() => goToHistoryStep(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  index === currentHistoryIndex
                    ? 'bg-purple-100 border-2 border-purple-400'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <ImageIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Step {index + 1}</p>
                    <p className="text-xs text-gray-600 truncate">{step.userPrompt}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.prompt)}
              disabled={isProcessing}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors text-left"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Describe how you want to refine the image
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleRefine(userInput)}
            placeholder="e.g., 'make it more colorful', 'add a sunset', 'increase saturation'"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <button
            onClick={() => handleRefine(userInput)}
            disabled={isProcessing || !userInput.trim()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Refining...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Refine
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-900 mb-2 text-sm">How it works:</h4>
        <ul className="text-xs text-purple-800 space-y-1">
          <li>• Describe changes in natural language</li>
          <li>• Each refinement builds on previous changes</li>
          <li>• Navigate history to compare versions</li>
          <li>• Use quick actions for common adjustments</li>
        </ul>
      </div>
    </div>
  );
};

export default ConversationalRefinementPanel;
