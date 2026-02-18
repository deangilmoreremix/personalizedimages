import React, { useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle, Layers, Sliders } from 'lucide-react';
import { StockImagePicker } from './shared/StockImagePicker';
import { StockResource } from '../services/stockImageService';
import { FreepikCompliance } from '../utils/freepikCompliance';
import { FreepikAttribution } from './shared/FreepikAttribution';

interface ProcessingOptions {
  addWatermark: boolean;
  watermarkText: string;
  resize: boolean;
  width: number;
  height: number;
  addFilter: boolean;
  filterType: 'grayscale' | 'sepia' | 'brightness' | 'contrast' | 'saturate';
  filterValue: number;
  addBranding: boolean;
  brandingText: string;
  brandingPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface ProcessedImage {
  original: StockResource;
  processed: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export function BatchFreepikProcessor() {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState<StockResource[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [options, setOptions] = useState<ProcessingOptions>({
    addWatermark: false,
    watermarkText: '',
    resize: false,
    width: 1920,
    height: 1080,
    addFilter: false,
    filterType: 'brightness',
    filterValue: 110,
    addBranding: false,
    brandingText: '',
    brandingPosition: 'bottom-right'
  });

  const handleSelectImages = (resources: StockResource[]) => {
    setSelectedImages(resources);
    resources.forEach(resource => {
      FreepikCompliance.trackFreepikUsage(resource.id, 'batch-processor', 'derivative');
    });
    setShowPicker(false);
  };

  const processImage = async (resource: StockResource): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');

        const targetWidth = options.resize ? options.width : img.width;
        const targetHeight = options.resize ? options.height : img.height;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        if (options.addFilter) {
          const filterValue = options.filterValue;
          switch (options.filterType) {
            case 'grayscale':
              ctx.filter = `grayscale(${filterValue}%)`;
              break;
            case 'sepia':
              ctx.filter = `sepia(${filterValue}%)`;
              break;
            case 'brightness':
              ctx.filter = `brightness(${filterValue}%)`;
              break;
            case 'contrast':
              ctx.filter = `contrast(${filterValue}%)`;
              break;
            case 'saturate':
              ctx.filter = `saturate(${filterValue}%)`;
              break;
          }
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = 'none';
        }

        if (options.addWatermark && options.watermarkText) {
          ctx.font = 'bold 20px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 2;

          const text = options.watermarkText;
          const textWidth = ctx.measureText(text).width;
          const x = (targetWidth - textWidth) / 2;
          const y = targetHeight - 30;

          ctx.strokeText(text, x, y);
          ctx.fillText(text, x, y);
        }

        if (options.addBranding && options.brandingText) {
          ctx.font = 'bold 16px Arial';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';

          const padding = 10;
          const text = options.brandingText;
          const textWidth = ctx.measureText(text).width;
          const textHeight = 20;

          let x = padding;
          let y = padding + textHeight;

          switch (options.brandingPosition) {
            case 'top-right':
              x = targetWidth - textWidth - padding;
              break;
            case 'bottom-left':
              y = targetHeight - padding;
              break;
            case 'bottom-right':
              x = targetWidth - textWidth - padding;
              y = targetHeight - padding;
              break;
          }

          ctx.fillRect(x - 5, y - textHeight, textWidth + 10, textHeight + 5);
          ctx.fillStyle = 'white';
          ctx.fillText(text, x, y);
        }

        const attribution = FreepikCompliance.getAttributionText(resource, false);
        if (attribution) {
          ctx.font = '10px Arial';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          const attrX = 5;
          const attrY = targetHeight - 5;
          ctx.fillText(attribution, attrX, attrY);
        }

        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = resource.previewUrl || resource.thumbnailUrl || '';
    });
  };

  const handleProcessAll = async () => {
    if (selectedImages.length === 0) return;

    setIsProcessing(true);
    const processed: ProcessedImage[] = selectedImages.map(img => ({
      original: img,
      processed: '',
      status: 'pending' as const
    }));

    setProcessedImages(processed);

    for (let i = 0; i < selectedImages.length; i++) {
      setProcessedImages(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'processing' };
        return updated;
      });

      try {
        const processedUrl = await processImage(selectedImages[i]);
        setProcessedImages(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], processed: processedUrl, status: 'success' };
          return updated;
        });
      } catch (error) {
        setProcessedImages(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: 'error',
            error: error instanceof Error ? error.message : 'Processing failed'
          };
          return updated;
        });
      }
    }

    setIsProcessing(false);
  };

  const handleDownloadAll = () => {
    processedImages.forEach((img, index) => {
      if (img.status === 'success' && img.processed) {
        const link = document.createElement('a');
        link.href = img.processed;
        link.download = `processed-${index + 1}-${img.original.filename || 'image'}.png`;
        link.click();
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Batch Freepik Processor</h2>
            <p className="text-gray-600 mt-1">Process multiple Freepik images with filters, branding, and effects</p>
          </div>
          <Layers className="w-8 h-8 text-blue-500" />
        </div>

        <div className="space-y-6">
          <div>
            <button
              onClick={() => setShowPicker(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Layers className="w-5 h-5" />
              {selectedImages.length > 0 ? `Selected ${selectedImages.length} images` : 'Select Images from Freepik'}
            </button>
          </div>

          {selectedImages.length > 0 && (
            <>
              <div className="border rounded-lg p-4 bg-gray-50">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Processing Options</span>
                  </div>
                  <span className="text-sm text-gray-500">{showOptions ? 'Hide' : 'Show'}</span>
                </button>

                {showOptions && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="resize"
                        checked={options.resize}
                        onChange={(e) => setOptions({ ...options, resize: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="resize" className="text-sm font-medium">Resize Images</label>
                      {options.resize && (
                        <div className="flex gap-2 ml-auto">
                          <input
                            type="number"
                            value={options.width}
                            onChange={(e) => setOptions({ ...options, width: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            placeholder="Width"
                          />
                          <input
                            type="number"
                            value={options.height}
                            onChange={(e) => setOptions({ ...options, height: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            placeholder="Height"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="filter"
                        checked={options.addFilter}
                        onChange={(e) => setOptions({ ...options, addFilter: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="filter" className="text-sm font-medium">Apply Filter</label>
                      {options.addFilter && (
                        <div className="flex gap-2 ml-auto">
                          <select
                            value={options.filterType}
                            onChange={(e) => setOptions({ ...options, filterType: e.target.value as any })}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="brightness">Brightness</option>
                            <option value="contrast">Contrast</option>
                            <option value="saturate">Saturate</option>
                            <option value="grayscale">Grayscale</option>
                            <option value="sepia">Sepia</option>
                          </select>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={options.filterValue}
                            onChange={(e) => setOptions({ ...options, filterValue: parseInt(e.target.value) })}
                            className="w-24"
                          />
                          <span className="text-sm text-gray-600 w-12">{options.filterValue}%</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="branding"
                        checked={options.addBranding}
                        onChange={(e) => setOptions({ ...options, addBranding: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="branding" className="text-sm font-medium">Add Branding</label>
                      {options.addBranding && (
                        <div className="flex gap-2 ml-auto">
                          <input
                            type="text"
                            value={options.brandingText}
                            onChange={(e) => setOptions({ ...options, brandingText: e.target.value })}
                            placeholder="Brand text"
                            className="px-3 py-1 border rounded text-sm"
                          />
                          <select
                            value={options.brandingPosition}
                            onChange={(e) => setOptions({ ...options, brandingPosition: e.target.value as any })}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleProcessAll}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Layers className="w-5 h-5" />
                      Process All Images
                    </>
                  )}
                </button>

                {processedImages.length > 0 && !isProcessing && (
                  <button
                    onClick={handleDownloadAll}
                    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download All
                  </button>
                )}
              </div>

              <FreepikAttribution
                resources={selectedImages}
                isPremiumUser={false}
                showComplianceInfo={true}
                variant="footer"
              />
            </>
          )}

          {processedImages.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Processing Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {processedImages.map((img, index) => (
                  <div key={index} className="relative border rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-100">
                      {img.status === 'success' && img.processed ? (
                        <img src={img.processed} alt={img.original.title} className="w-full h-full object-cover" />
                      ) : (
                        <img src={img.original.thumbnailUrl || ''} alt={img.original.title} className="w-full h-full object-cover opacity-50" />
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      {img.status === 'processing' && (
                        <div className="bg-blue-500 text-white p-1 rounded-full">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                      {img.status === 'success' && (
                        <div className="bg-green-500 text-white p-1 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="bg-red-500 text-white p-1 rounded-full">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <StockImagePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={() => {}}
        multiSelect={true}
        onMultiSelect={handleSelectImages}
      />
    </div>
  );
}

export default BatchFreepikProcessor;
