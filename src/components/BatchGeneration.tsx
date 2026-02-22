import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Trash2,
  Plus,
  X,
  BarChart3,
  Clock,
  DollarSign,
  Zap,
  Users,
  Image as ImageIcon,
  FileSpreadsheet,
  Settings,
  RotateCcw,
  Layers
} from 'lucide-react';
import { generateImage, InsufficientCreditsError, GenerationError } from '../services/imageGenerationService';
import { DESIGN_SYSTEM, getGridClasses, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';

interface BatchItem {
  id: string;
  prompt: string;
  tokens: Record<string, string>;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
  generationTime?: number;
  cost?: number;
}

interface BatchGenerationProps {
  tokens: Record<string, string>;
}

const BatchGeneration: React.FC<BatchGenerationProps> = ({ tokens }) => {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(-1);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageStyle, setImageStyle] = useState('photography');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [concurrency, setConcurrency] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  const modelConfig = {
    openai: { name: 'DALL-E 3', cost: 0.04 }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          alert('CSV file must have at least a header row and one data row');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const newItems: BatchItem[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length === headers.length) {
            const itemTokens: Record<string, string> = {};

            headers.forEach((header, index) => {
              if (header.toLowerCase() !== 'prompt') {
                itemTokens[header] = values[index] || '';
              }
            });

            // Merge with global tokens
            const mergedTokens = { ...tokens, ...itemTokens };

            newItems.push({
              id: `batch-${Date.now()}-${i}`,
              prompt: values[headers.findIndex(h => h.toLowerCase() === 'prompt')] || '',
              tokens: mergedTokens,
              model: 'openai',
              status: 'pending'
            });
          }
        }

        setBatchItems(prev => [...prev, ...newItems]);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const addManualItem = () => {
    const newItem: BatchItem = {
      id: `manual-${Date.now()}`,
      prompt: '',
      tokens: { ...tokens },
      model: 'openai',
      status: 'pending'
    };
    setBatchItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<BatchItem>) => {
    setBatchItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  const generateImageForItem = async (item: BatchItem): Promise<BatchItem> => {
    const startTime = Date.now();

    try {
      let resolvedPrompt = item.prompt;
      Object.entries(item.tokens).forEach(([key, value]) => {
        resolvedPrompt = resolvedPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'gi'), value);
      });

      const sizeMap: Record<string, '1024x1024' | '1792x1024' | '1024x1792'> = {
        '1:1': '1024x1024',
        '16:9': '1792x1024',
        '4:3': '1792x1024',
        '9:16': '1024x1792',
        '3:4': '1024x1792'
      };

      const result = await generateImage(resolvedPrompt, {
        size: sizeMap[aspectRatio] || '1024x1024',
        style: imageStyle !== 'photography' ? imageStyle : undefined,
        category: 'batch'
      });

      return {
        ...item,
        status: 'completed',
        imageUrl: result.imageUrl,
        generationTime: Date.now() - startTime,
        cost: modelConfig.openai.cost
      };
    } catch (error) {
      let errorMsg = 'Generation failed';
      if (error instanceof InsufficientCreditsError) {
        errorMsg = 'Insufficient credits';
      } else if (error instanceof GenerationError) {
        errorMsg = error.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      return {
        ...item,
        status: 'failed',
        error: errorMsg,
        generationTime: Date.now() - startTime
      };
    }
  };

  const processBatch = async () => {
    if (batchItems.length === 0) return;

    setIsProcessing(true);
    setCurrentProcessingIndex(0);
    cancelledRef.current = false;

    const pending = batchItems.filter(item => item.status !== 'completed');
    let idx = 0;

    const processOne = async (): Promise<void> => {
      while (idx < pending.length && !cancelledRef.current) {
        const currentIdx = idx++;
        const item = pending[currentIdx];
        setCurrentProcessingIndex(currentIdx);

        updateItem(item.id, { status: 'processing' });
        const result = await generateImageForItem(item);
        updateItem(item.id, result);

        if (result.status === 'failed' && result.error === 'Insufficient credits') {
          cancelledRef.current = true;
          break;
        }

        if (!cancelledRef.current) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, pending.length) }, () => processOne());
    await Promise.all(workers);

    setIsProcessing(false);
    setCurrentProcessingIndex(-1);
  };

  const retryFailed = async () => {
    setBatchItems(prev => prev.map(item =>
      item.status === 'failed' ? { ...item, status: 'pending' as const, error: undefined } : item
    ));
  };

  const stopBatch = () => {
    cancelledRef.current = true;
    setIsProcessing(false);
    setCurrentProcessingIndex(-1);
  };

  const clearCompleted = () => {
    setBatchItems(prev => prev.filter(item => item.status !== 'completed'));
  };

  const downloadResults = () => {
    const completedItems = batchItems.filter(item => item.status === 'completed');
    const csvContent = [
      ['Prompt', 'Model', 'Image URL', 'Generation Time (ms)', 'Cost', 'Status'],
      ...completedItems.map(item => [
        item.prompt,
        item.model,
        item.imageUrl || '',
        item.generationTime?.toString() || '',
        item.cost?.toString() || '',
        item.status
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-results-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const total = batchItems.length;
    const completed = batchItems.filter(item => item.status === 'completed').length;
    const failed = batchItems.filter(item => item.status === 'failed').length;
    const processing = batchItems.filter(item => item.status === 'processing').length;
    const totalCost = batchItems
      .filter(item => item.status === 'completed')
      .reduce((sum, item) => sum + (item.cost || 0), 0);
    const avgTime = batchItems
      .filter(item => item.status === 'completed')
      .reduce((sum, item) => sum + (item.generationTime || 0), 0) / completed || 0;

    return { total, completed, failed, processing, totalCost, avgTime };
  };

  const stats = getStats();

  return (
    <div className={DESIGN_SYSTEM.components.section}>
      <div className={commonStyles.actionBar}>
        <h3 className={commonStyles.sectionHeader}>
          <BarChart3 className="w-6 h-6 text-primary-500 mr-2" />
          Batch Generation System
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          {/* Upload CSV */}
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.formLabel}>
              Upload CSV File
            </label>
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`${getButtonClasses('secondary')} w-full`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose CSV File
              </button>
              <p className="text-xs text-gray-500">
                CSV should have columns: Prompt, and token names (e.g., FIRSTNAME, COMPANY)
              </p>
            </div>
          </div>

          {/* Manual Addition */}
          <div className={commonStyles.formGroup}>
            <button
              onClick={addManualItem}
              className={`${getButtonClasses('secondary')} w-full`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Item
            </button>
          </div>

          {/* Model Settings */}
          <div className={`${DESIGN_SYSTEM.components.panel} ${commonStyles.contentArea}`}>
            <h4 className="font-medium text-sm mb-3">Generation Settings</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  AI Model
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
                  DALL-E 3 (${modelConfig.openai.cost}/img)
                </div>
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
              >
                <Settings className="w-3 h-3 mr-1" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3"
                  >
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
                        <option value="cartoon">Cartoon</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        <Layers className="w-3 h-3 inline mr-1" />
                        Parallel Workers
                      </label>
                      <select
                        value={concurrency}
                        onChange={(e) => setConcurrency(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        disabled={isProcessing}
                      >
                        <option value={1}>1 (Sequential)</option>
                        <option value={2}>2 (Parallel)</option>
                        <option value={3}>3 (Fast)</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">
                        Higher values process faster but use more API calls simultaneously
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={isProcessing ? stopBatch : processBatch}
              disabled={batchItems.length === 0}
              className={`${getButtonClasses('primary')} w-full`}
            >
              {isProcessing ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Processing
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Batch Generation
                </>
              )}
            </button>

            {stats.completed > 0 && (
              <button
                onClick={downloadResults}
                className={`${getButtonClasses('secondary')} w-full`}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Results CSV
              </button>
            )}

            {stats.failed > 0 && !isProcessing && (
              <button
                onClick={() => { retryFailed(); setTimeout(processBatch, 100); }}
                className="w-full px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retry {stats.failed} Failed
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Batch Items */}
        <div className="lg:col-span-3">
          {/* Stats Header */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 mb-6 border border-primary-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">${stats.totalCost.toFixed(4)}</div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
            </div>

            {stats.completed > 0 && (
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600">
                  Average generation time: {(stats.avgTime / 1000).toFixed(1)}s per image
                </div>
              </div>
            )}
          </div>

          {/* Batch Items List */}
          <div className="space-y-4">
            {batchItems.length === 0 ? (
              <div className="text-center py-12">
                <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No batch items yet</h3>
                <p className="text-gray-600 mb-4">
                  Upload a CSV file or add items manually to start batch generation
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={getButtonClasses('secondary')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </button>
                  <button
                    onClick={addManualItem}
                    className={getButtonClasses('primary')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Manual
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Bulk Actions */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {batchItems.length} item{batchItems.length !== 1 ? 's' : ''} in batch
                  </span>
                  <div className="flex gap-2">
                    {stats.completed > 0 && (
                      <button
                        onClick={clearCompleted}
                        className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Clear Completed
                      </button>
                    )}
                    <button
                      onClick={() => setBatchItems([])}
                      className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {batchItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border rounded-lg p-4 ${
                        item.status === 'completed' ? 'border-green-200 bg-green-50' :
                        item.status === 'failed' ? 'border-red-200 bg-red-50' :
                        item.status === 'processing' ? 'border-blue-200 bg-blue-50' :
                        'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {item.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {item.status === 'failed' && <XCircle className="w-4 h-4 text-red-600" />}
                            {item.status === 'processing' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                            {item.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}

                            <span className="text-sm font-medium text-gray-900">
                              Item {index + 1}
                            </span>

                            {currentProcessingIndex === index && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                Processing...
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                            {item.prompt || 'No prompt specified'}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{modelConfig[item.model as keyof typeof modelConfig].name}</span>
                            {item.generationTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {(item.generationTime / 1000).toFixed(1)}s
                              </span>
                            )}
                            {item.cost && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${item.cost.toFixed(4)}
                              </span>
                            )}
                          </div>

                          {item.error && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                              {item.error}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {item.imageUrl && (
                            <button
                              onClick={() => window.open(item.imageUrl, '_blank')}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="View image"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchGeneration;