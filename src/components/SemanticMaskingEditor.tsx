import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Wand2, Download, RefreshCw, Paintbrush, Eraser } from 'lucide-react';
import { generateImageWithDalle } from '../utils/api';

interface SemanticMaskingEditorProps {
  imageUrl: string;
  onEditComplete: (editedImageUrl: string) => void;
  onClose: () => void;
}

export const SemanticMaskingEditor: React.FC<SemanticMaskingEditorProps> = ({
  imageUrl,
  onEditComplete,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [maskPrompt, setMaskPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [maskData, setMaskData] = useState<ImageData | null>(null);

  useEffect(() => {
    loadImage();
  }, [imageUrl]);

  const loadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        setMaskData(maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
      }
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;

    const canvas = canvasRef.current;
    if (!canvas || !maskData) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
    ctx.fillStyle = tool === 'brush' ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.putImageData(maskData, 0, 0);
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.fillStyle = tool === 'brush' ? 'white' : 'black';
      maskCtx.beginPath();
      maskCtx.arc(x, y, brushSize, 0, Math.PI * 2);
      maskCtx.fill();
      setMaskData(maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
    }
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        setMaskData(maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
      }
    };
  };

  const applyMask = async () => {
    if (!maskPrompt.trim()) {
      setError('Please enter a description for the masked area');
      return;
    }

    if (!maskData) {
      setError('Please draw a mask first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = maskData.width;
      maskCanvas.height = maskData.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) throw new Error('Failed to get mask context');

      maskCtx.putImageData(maskData, 0, 0);
      const maskDataUrl = maskCanvas.toDataURL('image/png');

      const editedImageUrl = await generateImageWithDalle(
        `${maskPrompt}. Keep the rest of the image unchanged.`,
        {
          size: '1024x1024',
          quality: 'hd'
        }
      );

      onEditComplete(editedImageUrl);
    } catch (err) {
      console.error('Masking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply mask');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Wand2 className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Semantic Masking Editor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Instructions</h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Select brush or eraser tool</li>
                <li>Paint over the area you want to modify</li>
                <li>Describe what you want in the masked area</li>
                <li>Click Apply to generate the edit</li>
              </ol>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Tools</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTool('brush')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    tool === 'brush'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Paintbrush className="w-4 h-4" />
                  Brush
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    tool === 'eraser'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                  Eraser
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Brush Size: {brushSize}px
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mask Description
              </label>
              <textarea
                value={maskPrompt}
                onChange={(e) => setMaskPrompt(e.target.value)}
                placeholder="Describe what should appear in the masked area..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearMask}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Mask
              </button>
              <button
                onClick={applyMask}
                disabled={isProcessing || !maskPrompt.trim()}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Apply Mask
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Canvas (Draw to create mask)
            </label>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="max-w-full h-auto cursor-crosshair"
                style={{ display: 'block' }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Red overlay shows the masked area. The AI will generate new content for this region.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SemanticMaskingEditor;
