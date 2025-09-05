import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { getPromptRecommendations } from '../utils/api';

interface PromptHelperProps {
  basePrompt: string;
  onPromptSelect: (prompt: string) => void;
  tokens: Record<string, string>;
  provider: 'openai' | 'gemini' | 'imagen';
}

const PromptHelper: React.FC<PromptHelperProps> = ({ basePrompt, onPromptSelect, tokens, provider }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && basePrompt && basePrompt.length > 3) {
      generateRecommendations();
    }
  }, [isOpen, provider]);

  const generateRecommendations = async () => {
    if (!basePrompt || basePrompt.length < 3) {
      setError('Please enter a more detailed base prompt');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const providerName = provider === 'openai' ? 'DALL-E' : provider === 'imagen' ? 'Imagen' : 'Gemini';
      const suggestions = await getPromptRecommendations(basePrompt, tokens, providerName);
      setRecommendations(suggestions);
    } catch (err) {
      setError('Failed to generate recommendations');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!basePrompt || basePrompt.length < 3) {
    return null;
  }

  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
      <div 
        className="p-3 bg-gray-50 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
          <h4 className="text-sm font-medium">Prompt Recommendations</h4>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>

      {isOpen && (
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 text-primary-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm py-2">{error}</div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-gray-700 text-sm">{rec}</p>
                    <button
                      className="text-primary-600 hover:text-primary-700 text-xs py-1 px-2 border border-primary-200 rounded-md bg-primary-50 flex-shrink-0"
                      onClick={() => onPromptSelect(rec)}
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-2">No recommendations yet. Try updating your prompt.</p>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={generateRecommendations}
              disabled={isLoading}
              className="text-primary-600 hover:text-primary-700 text-xs flex items-center"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptHelper;