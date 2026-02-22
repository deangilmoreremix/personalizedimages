import React, { useState, useCallback, useRef } from 'react';
import { Palette, Sparkles, Upload, RotateCcw } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { freepikAiService } from '../../services/freepikAiService';
import ImageDropZone from './shared/ImageDropZone';
import ProcessingOverlay from './shared/ProcessingOverlay';
import ResultDisplay from './shared/ResultDisplay';

const BUILT_IN_STYLES = [
  { id: 'anime', name: 'Anime', color: 'from-pink-400 to-rose-500' },
  { id: 'watercolor', name: 'Watercolor', color: 'from-sky-400 to-blue-500' },
  { id: 'oil-painting', name: 'Oil Painting', color: 'from-amber-400 to-orange-500' },
  { id: 'pencil-sketch', name: 'Pencil Sketch', color: 'from-gray-400 to-gray-600' },
  { id: 'pop-art', name: 'Pop Art', color: 'from-red-400 to-yellow-500' },
  { id: 'cyberpunk', name: 'Cyberpunk', color: 'from-cyan-400 to-teal-500' },
  { id: 'impressionist', name: 'Impressionist', color: 'from-green-400 to-emerald-500' },
  { id: 'pixel-art', name: 'Pixel Art', color: 'from-blue-400 to-sky-500' },
];

export default function StyleTransfer() {
  const { image, isDragging, uploadError, handleDrop, handleDragOver, handleDragLeave, handleFileSelect, clearImage } = useImageUpload();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [styleImageUrl, setStyleImageUrl] = useState<string | null>(null);
  const [stylePreview, setStylePreview] = useState<string | null>(null);
  const [strength, setStrength] = useState(75);
  const styleInputRef = useRef<HTMLInputElement>(null);

  const handleStyleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setStyleImageUrl(dataUrl);
      setStylePreview(URL.createObjectURL(file));
      setSelectedStyle(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleStyleSelect = useCallback((styleId: string) => {
    setSelectedStyle(styleId);
    setStyleImageUrl(null);
    if (stylePreview) {
      URL.revokeObjectURL(stylePreview);
      setStylePreview(null);
    }
  }, [stylePreview]);

  const handleTransfer = useCallback(async () => {
    if (!image || (!selectedStyle && !styleImageUrl)) return;
    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const result = await freepikAiService.styleTransfer(
        {
          imageUrl: image.dataUrl,
          styleName: selectedStyle || undefined,
          styleImageUrl: styleImageUrl || undefined,
          strength: strength / 100,
        },
        setProgress
      );

      if (result.status === 'COMPLETED' && result.resultUrl) {
        setResultUrl(result.resultUrl);
      } else {
        setError(result.error || 'Style transfer failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  }, [image, selectedStyle, styleImageUrl, strength]);

  const handleReset = useCallback(() => {
    clearImage();
    setResultUrl(null);
    setError(null);
    setProgress(0);
    setSelectedStyle(null);
    setStyleImageUrl(null);
    if (stylePreview) URL.revokeObjectURL(stylePreview);
    setStylePreview(null);
  }, [clearImage, stylePreview]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Style Transfer</h3>
            <p className="text-sm text-gray-500">Apply artistic styles to any image</p>
          </div>
        </div>
      </div>

      <div className="p-5 relative">
        {processing && <ProcessingOverlay progress={progress} label="Applying style..." />}

        {resultUrl ? (
          <ResultDisplay
            resultUrl={resultUrl}
            originalUrl={image?.previewUrl}
            onReset={handleReset}
            title="Styled Image"
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
              label="Drop the image to transform"
              uploadError={uploadError}
            />

            {image && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Choose a Style</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BUILT_IN_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => handleStyleSelect(style.id)}
                        className={`relative px-2 py-3 rounded-xl border text-xs font-medium transition-all text-center ${
                          selectedStyle === style.id
                            ? 'border-green-400 bg-green-50 text-green-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${style.color} mx-auto mb-1.5`} />
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div>
                  <button
                    onClick={() => styleInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full justify-center"
                  >
                    <Upload className="w-4 h-4" />
                    Upload a style reference image
                  </button>
                  <input
                    ref={styleInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleStyleImageSelect}
                    className="hidden"
                  />
                  {stylePreview && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={stylePreview} alt="Style reference" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                      <span className="text-xs text-gray-500">Custom style reference</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-600">Style Strength</label>
                    <span className="text-xs text-gray-400">{strength}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={strength}
                    onChange={(e) => setStrength(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

                <button
                  onClick={handleTransfer}
                  disabled={processing || (!selectedStyle && !styleImageUrl)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Apply Style
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={handleTransfer}
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
