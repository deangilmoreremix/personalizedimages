import React, { useState, useCallback } from 'react';
import { Scissors, Sparkles, RotateCcw } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { freepikAiService } from '../../services/freepikAiService';
import ImageDropZone from './shared/ImageDropZone';
import ProcessingOverlay from './shared/ProcessingOverlay';
import ResultDisplay from './shared/ResultDisplay';

export default function BackgroundRemover() {
  const { image, isDragging, uploadError, handleDrop, handleDragOver, handleDragLeave, handleFileSelect, clearImage } = useImageUpload();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'png' | 'webp'>('png');

  const handleRemoveBackground = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const result = await freepikAiService.removeBackground(
        { imageUrl: image.dataUrl, outputFormat },
        setProgress
      );

      if (result.status === 'COMPLETED' && result.resultUrl) {
        setResultUrl(result.resultUrl);
      } else {
        setError(result.error || 'Background removal failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  }, [image, outputFormat]);

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Background Remover</h3>
            <p className="text-sm text-gray-500">Remove backgrounds with AI precision</p>
          </div>
        </div>
      </div>

      <div className="p-5 relative">
        {processing && <ProcessingOverlay progress={progress} label="Removing background..." />}

        {resultUrl ? (
          <ResultDisplay
            resultUrl={resultUrl}
            originalUrl={image?.previewUrl}
            onReset={handleReset}
            title="Background Removed"
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
              label="Drop an image to remove its background"
              uploadError={uploadError}
            />

            {image && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-600">Output Format</label>
                  <div className="flex gap-2">
                    {(['png', 'webp'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setOutputFormat(fmt)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                          outputFormat === fmt
                            ? 'bg-teal-100 text-teal-700 border border-teal-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-150'
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRemoveBackground}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Remove Background
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={handleRemoveBackground}
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
