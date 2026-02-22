import React, { useState, useCallback } from 'react';
import { Maximize2, Sparkles, Zap, Eye, RotateCcw } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { freepikAiService } from '../../services/freepikAiService';
import ImageDropZone from './shared/ImageDropZone';
import ProcessingOverlay from './shared/ProcessingOverlay';
import ResultDisplay from './shared/ResultDisplay';

type UpscaleMode = 'creative' | 'precision';

export default function ImageUpscaler() {
  const { image, isDragging, uploadError, handleDrop, handleDragOver, handleDragLeave, handleFileSelect, clearImage } = useImageUpload();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<UpscaleMode>('precision');
  const [scaleFactor, setScaleFactor] = useState<2 | 4>(2);
  const [creativity, setCreativity] = useState(50);
  const [resemblance, setResemblance] = useState(70);

  const handleUpscale = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const result = await freepikAiService.upscaleImage(
        {
          imageUrl: image.dataUrl,
          scaleFactor,
          mode,
          creativity: mode === 'creative' ? creativity / 100 : undefined,
          resemblance: mode === 'creative' ? resemblance / 100 : undefined,
        },
        setProgress
      );

      if (result.status === 'COMPLETED' && result.resultUrl) {
        setResultUrl(result.resultUrl);
      } else {
        setError(result.error || 'Upscale failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  }, [image, scaleFactor, mode, creativity, resemblance]);

  const handleReset = useCallback(() => {
    clearImage();
    setResultUrl(null);
    setError(null);
    setProgress(0);
  }, [clearImage]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Maximize2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Image Upscaler</h3>
            <p className="text-sm text-gray-500">Enhance resolution with Magnific AI</p>
          </div>
        </div>
      </div>

      <div className="p-5 relative">
        {processing && <ProcessingOverlay progress={progress} label="Upscaling image..." />}

        {resultUrl ? (
          <ResultDisplay
            resultUrl={resultUrl}
            originalUrl={image?.previewUrl}
            onReset={handleReset}
            title="Upscaled Image"
            showComparison
          />
        ) : (
          <div className="space-y-4">
            <ImageDropZone
              image={image}
              isDragging={isDragging}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onFileSelect={handleFileSelect}
              onClear={clearImage}
              label="Drop an image to upscale"
              uploadError={uploadError}
            />

            {image && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMode('precision')}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        mode === 'precision'
                          ? 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      Precision
                    </button>
                    <button
                      onClick={() => setMode('creative')}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        mode === 'creative'
                          ? 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Creative
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Scale Factor</label>
                  <div className="flex gap-2">
                    {([2, 4] as const).map((factor) => (
                      <button
                        key={factor}
                        onClick={() => setScaleFactor(factor)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          scaleFactor === factor
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-150'
                        }`}
                      >
                        {factor}x
                      </button>
                    ))}
                  </div>
                </div>

                {mode === 'creative' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-gray-600">Creativity</label>
                        <span className="text-xs text-gray-400">{creativity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={creativity}
                        onChange={(e) => setCreativity(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-gray-600">Resemblance</label>
                        <span className="text-xs text-gray-400">{resemblance}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={resemblance}
                        onChange={(e) => setResemblance(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUpscale}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  Upscale {scaleFactor}x
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={handleUpscale}
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
