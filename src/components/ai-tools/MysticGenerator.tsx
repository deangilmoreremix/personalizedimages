import React, { useState, useCallback } from 'react';
import { Wand2, Sparkles, Settings2, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { freepikAiService } from '../../services/freepikAiService';
import ProcessingOverlay from './shared/ProcessingOverlay';
import ResultDisplay from './shared/ResultDisplay';

const SIZES = [
  { label: '1:1', w: 1024, h: 1024 },
  { label: '16:9', w: 1344, h: 768 },
  { label: '9:16', w: 768, h: 1344 },
  { label: '4:3', w: 1152, h: 896 },
  { label: '3:4', w: 896, h: 1152 },
];

const STYLE_PRESETS = [
  { name: 'Photorealistic', color: 'realistic', lighting: 'studio', photography: 'DSLR' },
  { name: 'Cinematic', color: 'cinematic', lighting: 'dramatic', photography: 'cinematic' },
  { name: 'Vibrant', color: 'vibrant', lighting: 'natural', photography: 'professional' },
  { name: 'Moody', color: 'dark', lighting: 'low-key', photography: 'film' },
  { name: 'Minimalist', color: 'muted', lighting: 'soft', photography: 'clean' },
  { name: 'Fantasy', color: 'fantasy', lighting: 'magical', photography: 'concept art' },
];

export default function MysticGenerator() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState(0);
  const [numImages, setNumImages] = useState(1);
  const [guidanceScale, setGuidanceScale] = useState(7);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const [improving, setImproving] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    const size = SIZES[selectedSize];
    const style = selectedStyle !== null ? STYLE_PRESETS[selectedStyle] : undefined;

    try {
      const result = await freepikAiService.generateImage(
        {
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          width: size.w,
          height: size.h,
          numImages,
          guidanceScale,
          styling: style
            ? {
                color: style.color,
                lighting: style.lighting,
                photography: style.photography,
              }
            : undefined,
        },
        setProgress
      );

      if (result.status === 'COMPLETED') {
        setResultUrl(result.resultUrl || null);
        setResultUrls(result.resultUrls || []);
      } else {
        setError(result.error || 'Generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  }, [prompt, negativePrompt, selectedSize, numImages, guidanceScale, selectedStyle]);

  const handleImprovePrompt = useCallback(async () => {
    if (!prompt.trim()) return;
    setImproving(true);
    try {
      const result = await freepikAiService.improvePrompt(prompt.trim());
      setPrompt(result.improvedPrompt);
    } catch {
      // silently fail
    } finally {
      setImproving(false);
    }
  }, [prompt]);

  const handleReset = useCallback(() => {
    setResultUrl(null);
    setResultUrls([]);
    setError(null);
    setProgress(0);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Mystic AI Generator</h3>
            <p className="text-sm text-gray-500">Ultra-realistic images with Freepik Mystic</p>
          </div>
        </div>
      </div>

      <div className="p-5 relative">
        {processing && <ProcessingOverlay progress={progress} label="Generating with Mystic..." />}

        {resultUrl ? (
          <div className="space-y-4">
            <ResultDisplay
              resultUrl={resultUrl}
              onReset={handleReset}
              title="Generated Image"
            />
            {resultUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {resultUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setResultUrl(url)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      url === resultUrl ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={url} alt={`Variation ${i + 1}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                rows={3}
                className="w-full px-4 py-3 pr-24 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
              />
              <button
                onClick={handleImprovePrompt}
                disabled={improving || !prompt.trim()}
                className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3" />
                {improving ? 'Improving...' : 'Enhance'}
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Aspect Ratio</label>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map((size, i) => (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(i)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      selectedSize === i
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-150'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Style Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {STYLE_PRESETS.map((style, i) => (
                  <button
                    key={style.name}
                    onClick={() => setSelectedStyle(selectedStyle === i ? null : i)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      selectedStyle === i
                        ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Number of Images</label>
              <div className="flex gap-2">
                {[1, 2, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumImages(n)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      numImages === n
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Advanced Settings
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <div>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="Things to exclude from the image..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-600">Guidance Scale</label>
                    <span className="text-xs text-gray-400">{guidanceScale}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={guidanceScale}
                    onChange={(e) => setGuidanceScale(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={processing || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-amber-200/50"
            >
              <Wand2 className="w-4 h-4" />
              Generate with Mystic
            </button>

            {error && (
              <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
