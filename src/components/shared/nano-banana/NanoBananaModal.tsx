import React, { useState, useRef, useCallback } from 'react';
import { X, Undo, Redo, Download, Upload, ZoomIn, ZoomOut, RotateCcw, Save, Scissors, Palette, Wand2, Type, Image as ImageIcon, Zap, Sparkles } from 'lucide-react';

export interface NanoBananaTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'edit' | 'enhance' | 'create' | 'export';
}

export interface NanoBananaEdit {
  id: string;
  timestamp: number;
  tool: string;
  description: string;
  data: any;
}

interface NanoBananaModalProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onClose: () => void;
  moduleType?: string;
  tokens?: Record<string, string>;
}

const NanoBananaModal: React.FC<NanoBananaModalProps> = ({
  imageUrl,
  onSave,
  onClose,
  moduleType = 'general',
  tokens = {}
}) => {
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [zoom, setZoom] = useState(100);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [editHistory, setEditHistory] = useState<NanoBananaEdit[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available editing tools
  const tools: NanoBananaTool[] = [
    // Edit Tools
    { id: 'inpaint', name: 'Remove Objects', icon: <Scissors className="w-4 h-4" />, description: 'Remove unwanted elements from the image', category: 'edit' },
    { id: 'outpaint', name: 'Extend Image', icon: <ZoomOut className="w-4 h-4" />, description: 'Extend the image canvas in any direction', category: 'edit' },
    { id: 'crop', name: 'Smart Crop', icon: <ImageIcon className="w-4 h-4" />, description: 'Automatically crop to optimal dimensions', category: 'edit' },

    // Enhance Tools
    { id: 'enhance', name: 'AI Enhance', icon: <Zap className="w-4 h-4" />, description: 'Improve image quality with AI', category: 'enhance' },
    { id: 'colorize', name: 'Color Adjust', icon: <Palette className="w-4 h-4" />, description: 'Professional color correction', category: 'enhance' },
    { id: 'sharpen', name: 'Sharpen', icon: <Wand2 className="w-4 h-4" />, description: 'Increase image sharpness and detail', category: 'enhance' },

    // Create Tools
    { id: 'text', name: 'Add Text', icon: <Type className="w-4 h-4" />, description: 'Add text overlays to the image', category: 'create' },
    { id: 'style-transfer', name: 'Style Transfer', icon: <Sparkles className="w-4 h-4" />, description: 'Apply artistic styles to the image', category: 'create' },
    { id: 'background-remove', name: 'Remove Background', icon: <ImageIcon className="w-4 h-4" />, description: 'Make background transparent', category: 'create' },
  ];

  const handleToolSelect = useCallback((toolId: string) => {
    setSelectedTool(toolId);
    // Here you would initialize the specific tool
    console.log(`Selected tool: ${toolId} for module: ${moduleType}`);
  }, [moduleType]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousEdit = editHistory[historyIndex - 1];
      // Revert to previous state
      console.log('Undoing:', previousEdit.description);
    }
  }, [historyIndex, editHistory]);

  const handleRedo = useCallback(() => {
    if (historyIndex < editHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextEdit = editHistory[historyIndex + 1];
      // Apply next edit
      console.log('Redoing:', nextEdit.description);
    }
  }, [historyIndex, editHistory]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev + 25 : prev - 25;
      return Math.max(25, Math.min(400, newZoom));
    });
  }, []);

  const handleSave = useCallback(() => {
    // In a real implementation, this would process the final image
    onSave(currentImage);
    onClose();
  }, [currentImage, onSave, onClose]);

  const handleExport = useCallback((format: 'png' | 'jpg' | 'webp') => {
    // Export functionality would be implemented here
    console.log(`Exporting as ${format}`);
  }, []);

  const addToHistory = useCallback((tool: string, description: string, data: any) => {
    const newEdit: NanoBananaEdit = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      tool,
      description,
      data
    };

    setEditHistory(prev => {
      // Remove any edits after current index (for new branch)
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newEdit);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const toolCategories = {
    edit: tools.filter(t => t.category === 'edit'),
    enhance: tools.filter(t => t.category === 'enhance'),
    create: tools.filter(t => t.category === 'create'),
    export: [] // Export handled separately
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Nano Banana Editor - {moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Mode
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Tools Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* History Controls */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">History</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="flex-1 p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Undo"
                  >
                    <Undo className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= editHistory.length - 1}
                    className="flex-1 p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Redo"
                  >
                    <Redo className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Edit Tools */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Edit</h3>
                <div className="grid grid-cols-2 gap-2">
                  {toolCategories.edit.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`p-3 rounded-lg border text-left hover:bg-blue-50 transition-colors ${
                        selectedTool === tool.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white'
                      }`}
                      title={tool.description}
                    >
                      {tool.icon}
                      <div className="text-xs font-medium mt-1">{tool.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhance Tools */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Enhance</h3>
                <div className="grid grid-cols-2 gap-2">
                  {toolCategories.enhance.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`p-3 rounded-lg border text-left hover:bg-green-50 transition-colors ${
                        selectedTool === tool.id
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white'
                      }`}
                      title={tool.description}
                    >
                      {tool.icon}
                      <div className="text-xs font-medium mt-1">{tool.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Create Tools */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Create</h3>
                <div className="grid grid-cols-2 gap-2">
                  {toolCategories.create.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`p-3 rounded-lg border text-left hover:bg-purple-50 transition-colors ${
                        selectedTool === tool.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 bg-white'
                      }`}
                      title={tool.description}
                    >
                      {tool.icon}
                      <div className="text-xs font-medium mt-1">{tool.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 bg-gray-100 p-4">
            <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
              {/* Canvas Controls */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleZoom('out')}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
                    <button
                      onClick={() => handleZoom('in')}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setZoom(100)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Fit
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isProcessing && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
                <div
                  className="relative border border-gray-300 rounded bg-white shadow-sm"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center'
                  }}
                >
                  <img
                    src={currentImage}
                    alt="Editing"
                    className="max-w-full max-h-full"
                    draggable={false}
                  />
                  {/* Tool overlays would go here */}
                  {selectedTool && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Tool-specific overlay UI */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Export Sidebar */}
          <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Export</h3>

              <div className="space-y-2">
                <button
                  onClick={() => handleExport('png')}
                  className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Download PNG
                </button>

                <button
                  onClick={() => handleExport('jpg')}
                  className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Download JPG
                </button>

                <button
                  onClick={() => handleExport('webp')}
                  className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Download WebP
                </button>
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={handleSave}
                  className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Save Changes
                </button>
              </div>

              {/* Edit History */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Edit History</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {editHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">No edits yet</p>
                  ) : (
                    editHistory.map((edit, index) => (
                      <div
                        key={edit.id}
                        className={`p-2 rounded text-xs ${
                          index === historyIndex
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {edit.description}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NanoBananaModal;