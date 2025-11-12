import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AdvancedSettingsProps {
  selectedModel: string;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ selectedModel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [style, setStyle] = useState<'natural' | 'vivid'>('natural');

  const aspectRatios = [
    { value: '1:1', label: 'Square', icon: '□' },
    { value: '16:9', label: 'Landscape', icon: '▭' },
    { value: '9:16', label: 'Portrait', icon: '▯' }
  ];

  return (
    <div className="space-y-3">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Advanced Settings
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      aspectRatio === ratio.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">{ratio.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{ratio.label}</div>
                    <div className="text-xs text-gray-500">{ratio.value}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* DALL-E Specific Options */}
            {selectedModel === 'openai' && (
              <>
                {/* Quality */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quality</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setQuality('standard')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        quality === 'standard'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">Standard</div>
                      <div className="text-xs text-gray-500 mt-1">Faster</div>
                    </button>
                    <button
                      onClick={() => setQuality('hd')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        quality === 'hd'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">HD</div>
                      <div className="text-xs text-gray-500 mt-1">Higher detail</div>
                    </button>
                  </div>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setStyle('natural')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        style === 'natural'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">Natural</div>
                      <div className="text-xs text-gray-500 mt-1">Realistic</div>
                    </button>
                    <button
                      onClick={() => setStyle('vivid')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        style === 'vivid'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">Vivid</div>
                      <div className="text-xs text-gray-500 mt-1">Dramatic</div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Info Box */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Tip:</strong> Higher quality settings may increase generation time but produce better results.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSettings;
