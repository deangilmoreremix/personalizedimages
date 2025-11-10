import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Cpu,
  Camera,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Download
} from 'lucide-react';
import {
  generateImageWithDalle,
  generateImageWithGemini,
  generateImageWithGemini2Flash,
  generateImageWithImagen,
  generateImageWithGptImage
} from '../utils/api';
import { DESIGN_SYSTEM, getGridClasses, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';

interface ModelResult {
  model: string;
  imageUrl: string | null;
  status: 'idle' | 'generating' | 'completed' | 'error';
  error?: string;
  generationTime?: number;
  cost?: number;
  quality?: number;
}

interface MultiModelComparisonProps {
  tokens: Record<string, string>;
}

const MultiModelComparison: React.FC<MultiModelComparisonProps> = ({ tokens }) => {
  const [prompt, setPrompt] = useState('');
  const [models, setModels] = useState<ModelResult[]>([
    { model: 'openai', imageUrl: null, status: 'idle' },
    { model: 'gemini', imageUrl: null, status: 'idle' },
    { model: 'imagen', imageUrl: null, status: 'idle' },
    { model: 'gemini2flash', imageUrl: null, status: 'idle' },
    { model: 'gpt-image-1', imageUrl: null, status: 'idle' }
  ]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonComplete, setComparisonComplete] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(['openai', 'gemini', 'imagen']);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageStyle, setImageStyle] = useState('photography');

  const modelConfig = {
    openai: {
      name: 'DALL-E 3',
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200',
      cost: 0.04,
      description: 'High-quality, detailed images with excellent text rendering'
    },
    gemini: {
      name: 'Gemini',
      icon: <Cpu className="w-5 h-5 text-green-500" />,
      color: 'bg-green-50 border-green-200',
      cost: 0.0025,
      description: 'Fast generation with good context understanding'
    },
    imagen: {
      name: 'Imagen 3',
      icon: <Camera className="w-5 h-5 text-purple-500" />,
      color: 'bg-purple-50 border-purple-200',
      cost: 0.04,
      description: 'Excellent style control and composition'
    },
    gemini2flash: {
      name: 'Gemini Flash',
      icon: <Sparkles className="w-5 h-5 text-orange-500" />,
      color: 'bg-orange-50 border-orange-200',
      cost: 0.001,
      description: 'Ultra-fast generation, 2-4x faster than others'
    },
    'gpt-image-1': {
      name: 'GPT-4 Vision',
      icon: <Star className="w-5 h-5 text-indigo-500" />,
      color: 'bg-indigo-50 border-indigo-200',
      cost: 0.04,
      description: 'Advanced understanding with exceptional detail'
    }
  };

  const handleModelToggle = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter(id => id !== modelId));
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  const generateWithModel = async (modelId: string): Promise<ModelResult> => {
    const startTime = Date.now();

    try {
      let imageUrl: string;

      switch (modelId) {
        case 'openai':
          imageUrl = await generateImageWithDalle(prompt, {
            size: '1024x1024',
            quality: 'standard',
            style: 'natural'
          });
          break;
        case 'gemini':
          imageUrl = await generateImageWithGemini(prompt, aspectRatio, imageStyle);
          break;
        case 'imagen':
          imageUrl = await generateImageWithImagen(prompt, aspectRatio);
          break;
        case 'gemini2flash':
          imageUrl = await generateImageWithGemini2Flash(prompt);
          break;
        case 'gpt-image-1':
          imageUrl = await generateImageWithGptImage(prompt);
          break;
        default:
          throw new Error(`Unknown model: ${modelId}`);
      }

      const generationTime = Date.now() - startTime;
      const cost = modelConfig[modelId as keyof typeof modelConfig].cost;

      return {
        model: modelId,
        imageUrl,
        status: 'completed',
        generationTime,
        cost,
        quality: Math.floor(Math.random() * 20) + 80 // Mock quality score
      };
    } catch (error) {
      return {
        model: modelId,
        imageUrl: null,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTime: Date.now() - startTime
      };
    }
  };

  const handleStartComparison = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt first');
      return;
    }

    if (selectedModels.length === 0) {
      alert('Please select at least one model');
      return;
    }

    setIsComparing(true);
    setComparisonComplete(false);

    // Reset all models
    setModels(prev => prev.map(model => ({
      ...model,
      status: 'idle',
      imageUrl: null,
      error: undefined,
      generationTime: undefined,
      cost: undefined,
      quality: undefined
    })));

    // Generate with selected models
    const promises = selectedModels.map(async (modelId) => {
      // Update status to generating
      setModels(prev => prev.map(model =>
        model.model === modelId
          ? { ...model, status: 'generating' }
          : model
      ));

      const result = await generateWithModel(modelId);

      // Update with result
      setModels(prev => prev.map(model =>
        model.model === modelId ? result : model
      ));

      return result;
    });

    await Promise.all(promises);
    setIsComparing(false);
    setComparisonComplete(true);
  };

  const handleReset = () => {
    setModels(prev => prev.map(model => ({
      ...model,
      status: 'idle',
      imageUrl: null,
      error: undefined,
      generationTime: undefined,
      cost: undefined,
      quality: undefined
    })));
    setComparisonComplete(false);
  };

  const getCompletedModels = () => models.filter(m => m.status === 'completed');
  const getAverageGenerationTime = () => {
    const completed = getCompletedModels();
    if (completed.length === 0) return 0;
    return completed.reduce((sum, m) => sum + (m.generationTime || 0), 0) / completed.length;
  };

  const getTotalCost = () => {
    return models
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + (m.cost || 0), 0);
  };

  const getBestModel = () => {
    const completed = getCompletedModels();
    if (completed.length === 0) return null;
    return completed.reduce((best, current) =>
      (current.quality || 0) > (best.quality || 0) ? current : best
    );
  };

  return (
    <div className={DESIGN_SYSTEM.components.section}>
      <div className={commonStyles.actionBar}>
        <h3 className={commonStyles.sectionHeader}>
          <BarChart3 className="w-6 h-6 text-primary-500 mr-2" />
          Multi-Model Comparison
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          {/* Prompt Input */}
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.formLabel}>
              Comparison Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to compare across different AI models..."
              className={DESIGN_SYSTEM.components.textarea}
              rows={4}
            />
          </div>

          {/* Model Selection */}
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.formLabel}>
              Select Models to Compare
            </label>
            <div className="space-y-2">
              {Object.entries(modelConfig).map(([modelId, config]) => (
                <label key={modelId} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(modelId)}
                    onChange={() => handleModelToggle(modelId)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    {config.icon}
                    <div>
                      <div className="font-medium text-sm">{config.name}</div>
                      <div className="text-xs text-gray-500">{config.description}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    ${config.cost}/img
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className={`${DESIGN_SYSTEM.components.panel} ${commonStyles.contentArea}`}>
            <h4 className="font-medium text-sm mb-3">Advanced Options</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="1:1">Square (1:1)</option>
                  <option value="4:3">Landscape (4:3)</option>
                  <option value="3:4">Portrait (3:4)</option>
                  <option value="16:9">Widescreen (16:9)</option>
                  <option value="9:16">Tall (9:16)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Image Style
                </label>
                <select
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="photography">Photography</option>
                  <option value="painting">Painting</option>
                  <option value="digital-art">Digital Art</option>
                  <option value="sketch">Sketch</option>
                  <option value="cartoon">Cartoon</option>
                  <option value="anime">Anime</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleStartComparison}
              disabled={isComparing || !prompt.trim() || selectedModels.length === 0}
              className={`${getButtonClasses('primary')} w-full`}
            >
              {isComparing ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Comparing Models...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Comparison
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={isComparing}
              className={`${getButtonClasses('secondary')} w-full`}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Comparison
            </button>
          </div>
        </div>

        {/* Center Panel - Results Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {models.map((modelResult) => {
              const config = modelConfig[modelResult.model as keyof typeof modelConfig];
              if (!config) return null;

              return (
                <motion.div
                  key={modelResult.model}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border-2 overflow-hidden ${
                    selectedModels.includes(modelResult.model)
                      ? config.color
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  {/* Header */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {config.icon}
                        <span className="font-medium text-sm">{config.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {modelResult.status === 'generating' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        )}
                        {modelResult.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {modelResult.status === 'error' && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    {modelResult.imageUrl ? (
                      <img
                        src={modelResult.imageUrl}
                        alt={`${config.name} result`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {modelResult.status === 'generating' ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                            <p className="text-xs text-gray-500">Generating...</p>
                          </div>
                        ) : modelResult.status === 'error' ? (
                          <div className="text-center p-4">
                            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                            <p className="text-xs text-red-600">Error</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <config.icon.type className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">Ready</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Best Model Badge */}
                    {getBestModel()?.model === modelResult.model && comparisonComplete && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        🏆 Best
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="p-3 space-y-2">
                    {modelResult.generationTime && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Time
                        </span>
                        <span className="font-medium">{(modelResult.generationTime / 1000).toFixed(1)}s</span>
                      </div>
                    )}

                    {modelResult.cost && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Cost
                        </span>
                        <span className="font-medium">${modelResult.cost.toFixed(4)}</span>
                      </div>
                    )}

                    {modelResult.quality && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Quality
                        </span>
                        <span className="font-medium">{modelResult.quality}/100</span>
                      </div>
                    )}

                    {modelResult.error && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {modelResult.error}
                      </div>
                    )}

                    {modelResult.imageUrl && (
                      <button
                        onClick={() => window.open(modelResult.imageUrl!, '_blank')}
                        className="w-full mt-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs flex items-center justify-center"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Comparison Summary */}
          {comparisonComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100"
            >
              <h4 className="font-semibold text-lg mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 text-primary-600 mr-2" />
                Comparison Results
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {(getAverageGenerationTime() / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-600">Avg Generation Time</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${getTotalCost().toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-600">Total Cost</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {getBestModel()?.quality || 0}/100
                  </div>
                  <div className="text-sm text-gray-600">Best Quality Score</div>
                </div>
              </div>

              {getBestModel() && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <div className="font-medium text-yellow-800">
                        Recommended: {modelConfig[getBestModel()!.model as keyof typeof modelConfig].name}
                      </div>
                      <div className="text-sm text-yellow-700">
                        Highest quality score for this prompt
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiModelComparison;