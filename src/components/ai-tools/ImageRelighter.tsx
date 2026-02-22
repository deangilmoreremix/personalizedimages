import React, { useState, useCallback } from 'react';
import { Sun, Sparkles, RotateCcw } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { freepikAiService } from '../../services/freepikAiService';
import ImageDropZone from './shared/ImageDropZone';
import ProcessingOverlay from './shared/ProcessingOverlay';
import ResultDisplay from './shared/ResultDisplay';

const LIGHT_DIRECTIONS = [
  { id: 'top-left', label: 'Top Left', x: -1, y: -1 },
  { id: 'top', label: 'Top', x: 0, y: -1 },
  { id: 'top-right', label: 'Top Right', x: 1, y: -1 },
  { id: 'left', label: 'Left', x: -1, y: 0 },
  { id: 'center', label: 'Center', x: 0, y: 0 },
  { id: 'right', label: 'Right', x: 1, y: 0 },
  { id: 'bottom-left', label: 'Bottom Left', x: -1, y: 1 },
  { id: 'bottom', label: 'Bottom', x: 0, y: 1 },
  { id: 'bottom-right', label: 'Bottom Right', x: 1, y: 1 },
];

export default function ImageRelighter() {
  const { image, isDragging, uploadError, handleDrop, handleDragOver, handleDragLeave, handleFileSelect, clearImage } = useImageUpload();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState(4);
  const [lightIntensity, setLightIntensity] = useState(70);
  const [ambientLight, setAmbientLight] = useState(30);

  const handleRelight = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    const dir = LIGHT_DIRECTIONS[selectedDirection];

    try {
      const result = await freepikAiService.relightImage(
        {
          imageUrl: image.dataUrl,
          lightDirection: dir.id,
          lightIntensity: lightIntensity / 100,
          ambientLight: ambientLight / 100,
        },
        setProgress
      );

      if (result.status === 'COMPLETED' && result.resultUrl) {
        setResultUrl(result.resultUrl);
      } else {
        setError(result.error || 'Relight failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  }, [image, selectedDirection, lightIntensity, ambientLight]);

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Image Relighter</h3>
            <p className="text-sm text-gray-500">Change lighting direction and mood</p>
          </div>
        </div>
      </div>

      <div className="p-5 relative">
        {processing && <ProcessingOverlay progress={progress} label="Relighting image..." />}

        {resultUrl ? (
          <ResultDisplay
            resultUrl={resultUrl}
            originalUrl={image?.previewUrl}
            onReset={handleReset}
            title="Relit Image"
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
              label="Drop an image to change its lighting"
              uploadError={uploadError}
            />

            {image && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Light Direction</label>
                  <div className="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto">
                    {LIGHT_DIRECTIONS.map((dir, i) => (
                      <button
                        key={dir.id}
                        onClick={() => setSelectedDirection(i)}
                        className={`w-14 h-14 rounded-lg border flex items-center justify-center transition-all ${
                          selectedDirection === i
                            ? 'border-yellow-400 bg-yellow-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                        title={dir.label}
                      >
                        <div
                          className={`w-3 h-3 rounded-full transition-colors ${
                            selectedDirection === i ? 'bg-yellow-500' : 'bg-gray-300'
                          }`}
                          style={{
                            boxShadow: selectedDirection === i ? '0 0 8px rgba(234, 179, 8, 0.5)' : 'none',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-600">Light Intensity</label>
                    <span className="text-xs text-gray-400">{lightIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightIntensity}
                    onChange={(e) => setLightIntensity(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-600">Ambient Light</label>
                    <span className="text-xs text-gray-400">{ambientLight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ambientLight}
                    onChange={(e) => setAmbientLight(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>

                <button
                  onClick={handleRelight}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-medium rounded-xl hover:from-yellow-600 hover:to-amber-700 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Relight Image
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={handleRelight}
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
