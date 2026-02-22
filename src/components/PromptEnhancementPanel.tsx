import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Eye,
  Copy,
  RotateCcw,
  Sliders,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  enhancePrompt,
  getImageTypeOptions,
  type ImageType,
  type GeneratorCategory,
  type EnhancementResult,
} from '../utils/promptEnhancer';
import { validatePrompt, getScoreLabel } from '../prompts/core/PromptValidator';

interface PromptEnhancementPanelProps {
  prompt: string;
  category: GeneratorCategory;
  onApplyEnhanced: (enhanced: string) => void;
  onNegativePromptChange?: (negativePrompt: string) => void;
  compact?: boolean;
}

const PromptEnhancementPanel: React.FC<PromptEnhancementPanelProps> = ({
  prompt,
  category,
  onApplyEnhanced,
  onNegativePromptChange,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImageType, setSelectedImageType] = useState<ImageType | undefined>(undefined);
  const [qualityTier, setQualityTier] = useState<'standard' | 'high' | 'ultra'>('high');
  const [showSettings, setShowSettings] = useState(false);
  const [enhancementFlags, setEnhancementFlags] = useState({
    technicalSpecs: true,
    styleDescriptors: true,
    compositionGuidance: true,
    negativePrompt: true,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const validation = useMemo(() => {
    if (!prompt.trim()) return null;
    return validatePrompt(prompt);
  }, [prompt]);

  const enhancement = useMemo((): EnhancementResult | null => {
    if (!prompt.trim()) return null;
    return enhancePrompt(prompt, {
      category,
      imageType: selectedImageType,
      quality: qualityTier,
      ...enhancementFlags,
    });
  }, [prompt, category, selectedImageType, qualityTier, enhancementFlags]);

  const scoreInfo = useMemo(() => {
    if (!validation) return null;
    return getScoreLabel(validation.score);
  }, [validation]);

  const enhancedScoreInfo = useMemo(() => {
    if (!enhancement) return null;
    return getScoreLabel(enhancement.qualityScore);
  }, [enhancement]);

  const handleApply = useCallback(() => {
    if (!enhancement) return;
    onApplyEnhanced(enhancement.enhanced);
    if (onNegativePromptChange && enhancement.negativePrompt) {
      onNegativePromptChange(enhancement.negativePrompt);
    }
    setShowPreview(false);
  }, [enhancement, onApplyEnhanced, onNegativePromptChange]);

  const handleCopy = useCallback(async () => {
    if (!enhancement) return;
    try {
      await navigator.clipboard.writeText(enhancement.enhanced);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for clipboard failures
    }
  }, [enhancement]);

  const imageTypeOptions = useMemo(() => getImageTypeOptions(), []);

  if (!prompt.trim()) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {validation && (
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  validation.score >= 70
                    ? 'bg-emerald-500'
                    : validation.score >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${validation.score}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${scoreInfo?.color || 'text-gray-500'}`}>
              {validation.score}
            </span>
          </div>
        )}
        <button
          onClick={() => {
            if (enhancement) {
              onApplyEnhanced(enhancement.enhanced);
              if (onNegativePromptChange && enhancement.negativePrompt) {
                onNegativePromptChange(enhancement.negativePrompt);
              }
            }
          }}
          disabled={!enhancement || enhancement.keyImprovements.length === 0}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Auto-enhance prompt"
        >
          <Sparkles className="w-3 h-3" />
          Enhance
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Prompt Enhancement
          </span>

          {validation && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    validation.score >= 70
                      ? 'bg-emerald-500'
                      : validation.score >= 50
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${validation.score}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${scoreInfo?.color || ''}`}>
                {scoreInfo?.label} ({validation.score})
              </span>
            </div>
          )}

          {enhancement && enhancement.keyImprovements.length > 0 && (
            <span className="text-xs text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">
              {enhancement.keyImprovements.length} improvements available
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
          {/* Validation Breakdown */}
          {validation && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Prompt Analysis
                </h4>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Sliders className="w-3 h-3" />
                  Settings
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(validation.breakdown).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    hasSubject: 'Subject',
                    hasStyle: 'Style',
                    hasLighting: 'Lighting',
                    hasComposition: 'Composition',
                    hasQuality: 'Quality',
                    hasColor: 'Color',
                    hasMood: 'Mood',
                  };
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                        value
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {value ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      {labels[key] || key}
                    </div>
                  );
                })}
              </div>

              {validation.warnings.length > 0 && (
                <div className="space-y-1">
                  {validation.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {w}
                    </div>
                  ))}
                </div>
              )}

              {validation.suggestions.length > 0 && (
                <div className="space-y-1">
                  {validation.suggestions.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0 text-teal-500" />
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image Type
                  </label>
                  <select
                    value={selectedImageType || ''}
                    onChange={(e) => setSelectedImageType((e.target.value || undefined) as ImageType | undefined)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Auto-detect</option>
                    {imageTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quality Tier
                  </label>
                  <select
                    value={qualityTier}
                    onChange={(e) => setQualityTier(e.target.value as 'standard' | 'high' | 'ultra')}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(enhancementFlags).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    technicalSpecs: 'Technical Specs',
                    styleDescriptors: 'Style Descriptors',
                    compositionGuidance: 'Composition',
                    negativePrompt: 'Negative Prompt',
                  };
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setEnhancementFlags((prev) => ({
                          ...prev,
                          [key]: !prev[key as keyof typeof prev],
                        }))
                      }
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        value
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      {labels[key]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enhancement Result */}
          {enhancement && enhancement.keyImprovements.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Enhanced Prompt
                  {enhancedScoreInfo && (
                    <span className={`text-xs ${enhancedScoreInfo.color}`}>
                      ({enhancement.qualityScore})
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    {showPreview ? 'Hide' : 'Preview'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Improvements List */}
              <div className="flex flex-wrap gap-1.5">
                {enhancement.keyImprovements.map((imp, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full"
                  >
                    <CheckCircle className="w-2.5 h-2.5" />
                    {imp}
                  </span>
                ))}
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      {enhancement.enhanced}
                    </p>
                  </div>

                  {enhancement.negativePrompt && enhancementFlags.negativePrompt && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">
                        Negative Prompt
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        {enhancement.negativePrompt}
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-teal-50 dark:bg-teal-900/10 rounded-lg border border-teal-200 dark:border-teal-800">
                    <p className="text-xs font-medium text-teal-800 dark:text-teal-200 mb-1">
                      Expected Result
                    </p>
                    <p className="text-xs text-teal-700 dark:text-teal-300">
                      {enhancement.expectedResult}
                    </p>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {enhancement.warnings.length > 0 && (
                <div className="space-y-1">
                  {enhancement.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {w}
                    </div>
                  ))}
                </div>
              )}

              {/* Apply Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApply}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Apply Enhanced Prompt
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Detected type: {enhancement.detectedImageType.replace('-', ' ')}
                </span>
              </div>
            </div>
          )}

          {enhancement && enhancement.keyImprovements.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle className="w-4 h-4" />
              Prompt already includes all recommended elements
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptEnhancementPanel;
