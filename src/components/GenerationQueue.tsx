import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListOrdered,
  Play,
  Pause,
  X,
  RotateCcw,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Zap
} from 'lucide-react';
import { useGenerationQueue } from '../hooks/useGenerationQueue';
import { GenerationQueueItem } from '../services/cloudGalleryService';

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Pending' },
  processing: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Processing' },
  completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Failed' },
  cancelled: { icon: X, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Cancelled' },
};

function QueueItemCard({ item, onCancel, onRequeue }: {
  item: GenerationQueueItem;
  onCancel: (id: string) => void;
  onRequeue: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[item.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`${config.bg} border ${config.border} rounded-xl p-4 transition-all`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${config.color}`}>
          <StatusIcon className={`w-5 h-5 ${item.status === 'processing' ? 'animate-spin' : ''}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.prompt.length > 80 ? item.prompt.substring(0, 80) + '...' : item.prompt}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.color} border ${config.border}`}>
                {config.label}
              </span>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 hover:bg-white/50 rounded"
              >
                {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {item.model}
            </span>
            {item.priority > 0 && (
              <span className="text-xs text-amber-600 font-medium">Priority: {item.priority}</span>
            )}
            {item.attempts > 0 && item.status !== 'completed' && (
              <span className="text-xs text-gray-500">
                Attempt {item.attempts}/{item.max_attempts}
              </span>
            )}
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-2">
                  <p className="text-xs text-gray-600">{item.prompt}</p>

                  {Object.keys(item.tokens || {}).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(item.tokens).map(([key, val]) => (
                        <span key={key} className="text-xs px-2 py-0.5 bg-white rounded border border-gray-200">
                          [{key}]: {val}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.error_message && (
                    <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{item.error_message}</p>
                  )}

                  {item.metadata?.imageUrl && (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-3 h-3 text-emerald-600" />
                      <a
                        href={item.metadata.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View generated image
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    {(item.status === 'pending' || item.status === 'processing') && (
                      <button
                        onClick={() => onCancel(item.id)}
                        className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    )}
                    {(item.status === 'failed' || item.status === 'cancelled') && (
                      <button
                        onClick={() => onRequeue(item.id)}
                        className="text-xs px-2 py-1 bg-white border border-blue-300 rounded hover:bg-blue-50 text-blue-700 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Retry
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

interface GenerationQueueProps {
  tokens?: Record<string, string>;
}

const GenerationQueue: React.FC<GenerationQueueProps> = ({ tokens = {} }) => {
  const {
    queueItems,
    processing,
    paused,
    stats,
    addToQueue,
    cancelItem,
    removeCompleted,
    requeue,
    setPaused,
  } = useGenerationQueue();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newModel, setNewModel] = useState('openai');
  const [newPriority, setNewPriority] = useState(0);

  const handleAdd = async () => {
    if (!newPrompt.trim()) return;
    await addToQueue(newPrompt, tokens, newModel, {}, newPriority);
    setNewPrompt('');
    setNewPriority(0);
    setShowAddForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-blue-600" />
            Generation Queue
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Queue and track multiple image generations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              paused
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {paused ? 'Resume' : 'Pause'}
          </button>

          {stats.completed > 0 && (
            <button
              onClick={removeCompleted}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Done
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
          { label: 'Processing', value: stats.processing, color: 'text-blue-600' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-600' },
          { label: 'Failed', value: stats.failed, color: 'text-red-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
            {stats.completed > 0 && (
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              />
            )}
            {stats.processing > 0 && (
              <div
                className="h-full bg-blue-500 animate-pulse transition-all duration-500"
                style={{ width: `${(stats.processing / stats.total) * 100}%` }}
              />
            )}
            {stats.failed > 0 && (
              <div
                className="h-full bg-red-400 transition-all duration-500"
                style={{ width: `${(stats.failed / stats.total) * 100}%` }}
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {stats.completed} of {stats.total} completed
            {paused && <span className="text-amber-600 font-medium ml-2">-- PAUSED</span>}
          </p>
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="Enter your image prompt... Use [TOKEN] placeholders for personalization"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
                  <select
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="openai">OpenAI (DALL-E 3)</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="imagen">Google Imagen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value={0}>Normal</option>
                    <option value={1}>High</option>
                    <option value={2}>Urgent</option>
                  </select>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={!newPrompt.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add to Queue
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Items */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {queueItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-xl border border-gray-200"
            >
              <ListOrdered className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Queue is Empty</h3>
              <p className="text-sm text-gray-500 mb-4">Add prompts to start batch processing</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Add First Item
              </button>
            </motion.div>
          ) : (
            queueItems.map(item => (
              <QueueItemCard
                key={item.id}
                item={item}
                onCancel={cancelItem}
                onRequeue={requeue}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GenerationQueue;
