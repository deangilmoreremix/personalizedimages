import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Camera, Cpu, Sparkles, Eye } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  {
    id: 'openai',
    name: 'DALL-E 3',
    icon: Sparkles,
    description: 'Premium Quality',
    features: ['Multiple sizes', 'HD quality', 'Natural & Vivid styles'],
    speed: 'Medium',
    cost: '$0.04',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    recommended: true
  },
  {
    id: 'imagen',
    name: 'Imagen 3',
    icon: Camera,
    description: 'Photo-Realistic',
    features: ['Photorealism', 'Style control', 'Detail-rich'],
    speed: 'Medium',
    cost: '$0.02',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'gemini2flash',
    name: 'Gemini Flash',
    icon: Zap,
    description: 'Ultra-Fast',
    features: ['2-4x faster', 'Real-time', 'Efficient'],
    speed: 'Very Fast',
    cost: '$0.01',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: Cpu,
    description: 'Balanced',
    features: ['Natural look', 'Good detail', 'Reliable'],
    speed: 'Fast',
    cost: '$0.02',
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'gpt-image-1',
    name: 'GPT-4 Vision',
    icon: Eye,
    description: 'Advanced AI',
    features: ['Complex prompts', 'Exceptional detail', 'Latest tech'],
    speed: 'Medium',
    cost: '$0.05',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  }
];

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        AI Model
      </h3>

      <div className="space-y-2">
        {models.map((model) => {
          const isSelected = selectedModel === model.id;
          const Icon = model.icon;

          return (
            <motion.button
              key={model.id}
              onClick={() => onModelChange(model.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left rounded-xl border-2 transition-all ${
                isSelected
                  ? `${model.borderColor} ${model.bgColor} shadow-md`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="p-3 space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${model.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {model.name}
                        </span>
                        {model.recommended && (
                          <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">{model.description}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-1 bg-blue-600 rounded-full"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {model.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">
                      Speed: <span className="font-medium text-gray-900">{model.speed}</span>
                    </span>
                    <span className="text-gray-600">
                      Cost: <span className="font-medium text-gray-900">{model.cost}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Model Comparison Link */}
      <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium text-center py-2">
        Compare all models →
      </button>
    </div>
  );
};

export default ModelSelector;
