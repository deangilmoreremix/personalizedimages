import React, { useState, useRef, useEffect } from 'react';
import { Brush, Eraser, Undo, Redo, Download, Wand2, RefreshCw, Save, X } from 'lucide-react';
import { maskAndEditImage } from '../utils/geminiNanoApi';

interface SemanticMaskingEditorProps {
  imageUrl: string;
  onEditComplete: (editedImageUrl: string) => void;
  onClose: () => void;
}

const SemanticMaskingEditor: React.FC<SemanticMaskingEditorProps> = ({
  imageUrl,
  onEditComplete,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [maskMode, setMaskMode] = useState<'brush' | 'eraser'>('brush');
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // Load image on mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw transparent canvas for mask
          ctx.fillStyle = 'rgba(0, 0, 0, 1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Save initial state
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setHistory([imageData]);
          setHistoryIndex(0);
        }
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, 2 * Math.PI);

    if (maskMode === 'brush') {
      // White for areas to edit
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    } else {
      // Black for areas to preserve
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    }

    ctx.fill();
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && history[historyIndex - 1]) {
          ctx.putImageData(history[historyIndex - 1], 0, 0);
        }
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && history[historyIndex + 1]) {
          ctx.putImageData(history[historyIndex + 1], 0, 0);
        }
      }
    }
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const handleApplyEdit = async () => {
    if (!editPrompt.trim()) {
      setError('Please enter a description of what you want to edit');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Convert canvas to base64
      const maskDataUrl = canvas.toDataURL('image/png');
      const maskBase64 = maskDataUrl.split(',')[1];

      // Apply semantic masking
      const editedImageUrl = await maskAndEditImage({
        imageUrl,
        maskData: maskBase64,
        editPrompt,
        preserveUnmasked: true
      });

      onEditComplete(editedImageUrl);
    } catch (err) {
      console.error('Error applying edit:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply edit');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Semantic Masking Editor</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Canvas Area */}
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                {image && (
                  <img
                    src={imageUrl}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                )}
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="relative cursor-crosshair mix-blend-multiply"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>

              {/* Drawing Tools */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setMaskMode('brush')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    maskMode === 'brush'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Brush className="w-4 h-4" />
                  Brush
                </button>
                <button
                  onClick={() => setMaskMode('eraser')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    maskMode === 'eraser'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                  Eraser
                </button>

                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brush Size: {brushSize}px
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-lg"
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-lg"
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
                <button
                  onClick={clearMask}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                  title="Clear Mask"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Edit Controls */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <p className="text-gray-600 text-sm mb-4">
                  1. Use the brush to paint over areas you want to edit (shown in white)
                  <br />
                  2. Use the eraser to exclude areas (shown in black)
                  <br />
                  3. Describe what you want to change in the masked region
                  <br />
                  4. Click "Apply Edit" to generate the edited image
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edit Description
                </label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Describe what you want to change in the masked area (e.g., 'change the sky to sunset colors', 'add a mountain in the background')"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleApplyEdit}
                  disabled={isProcessing || !editPrompt.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Apply Edit
                    </>
                  )}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Be specific in your edit description</li>
                  <li>• Mask larger areas for better results</li>
                  <li>• Use the eraser to refine your selection</li>
                  <li>• Try multiple variations if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemanticMaskingEditor;
