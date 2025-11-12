import React from 'react';
import { Cpu, Zap, Camera, Sparkles, Brain } from 'lucide-react';

export type AIModel = 'openai' | 'imagen' | 'gemini' | 'gemini2flash' | 'gpt-image-1';

interface AIModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AI_MODELS = [
  {
    id: 'openai' as AIModel,
    name: 'DALL-E 3',
    icon: Sparkles,
    description: 'Best for detailed images with text',
    color: 'indigo'
  },
  {
    id: 'imagen' as AIModel,
    name: 'Imagen 3',
    icon: Camera,
    description: 'Excellent photorealism',
    color: 'blue'
  },
  {
    id: 'gemini' as AIModel,
    name: 'Gemini',
    icon: Cpu,
    description: 'Great for complex scenes',
    color: 'purple'
  },
  {
    id: 'gemini2flash' as AIModel,
    name: 'Gemini Flash',
    icon: Zap,
    description: 'Ultra-fast generation',
    color: 'yellow'
  },
  {
    id: 'gpt-image-1' as AIModel,
    name: 'GPT-4 Vision',
    icon: Brain,
    description: 'Advanced understanding',
    color: 'green'
  }
];

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-2',
    md: 'text-sm py-2 px-3',
    lg: 'text-base py-3 px-4'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        AI Model
      </label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {AI_MODELS.map((model) => {
          const Icon = model.icon;
          const isSelected = selectedModel === model.id;

          return (
            <button
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className={`${sizeClasses[size]} rounded-lg font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                isSelected
                  ? `bg-${model.color}-600 text-white shadow-md ring-2 ring-${model.color}-300`
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
              title={model.description}
            >
              <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <span className="whitespace-nowrap">{model.name}</span>
            </button>
          );
        })}
      </div>

      {/* Model description */}
      <p className="text-xs text-gray-500 mt-1">
        {AI_MODELS.find(m => m.id === selectedModel)?.description}
      </p>
    </div>
  );
};

export default AIModelSelector;
