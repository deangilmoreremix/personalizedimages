import React, { useState } from 'react';
import { Wand2, Edit3, Sparkles, RefreshCw, Download, Layers, Palette, Zap } from 'lucide-react';
import { editImageWithGeminiNano, generateVariationsWithGeminiNano } from '../utils/geminiNanoApi';

interface EnhancedImageEditorWithChoiceProps {
  imageUrl: string;
  onImageUpdated: (newImageUrl: string) => void;
  tokens?: Record<string, string>;
}

type EditorMode = 'gemini-nano' | 'classic';
type EditMode = 'enhance' | 'colorize' | 'stylize' | 'remove_background' | 'blur_background' | 'restore' | 'custom';

const EnhancedImageEditorWithChoice: React.FC<EnhancedImageEditorWithChoiceProps> = ({
  imageUrl,
  onImageUpdated,
  tokens = {}
}) => {
  const [editorMode, setEditorMode] = useState<EditorMode>('gemini-nano');
  const [editMode, setEditMode] = useState<EditMode>('enhance');
  const [customPrompt, setCustomPrompt] = useState('');
  const [intensity, setIntensity] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editHistory, setEditHistory] = useState<string[]>([imageUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Classic editor state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);

  const handleGeminiNanoEdit = async () => {
    try {
      setIsEditing(true);
      setError(null);

      const currentImage = editHistory[historyIndex];
      const editedImageUrl = await editImageWithGeminiNano(
        currentImage,
        {
          mode: editMode,
          intensity,
          customPrompt: editMode === 'custom' ? customPrompt : undefined
        }
      );

      // Add to history
      const newHistory = [...editHistory.slice(0, historyIndex + 1), editedImageUrl];
      setEditHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      onImageUpdated(editedImageUrl);
    } catch (err) {
      console.error('Edit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to edit image');
    } finally {
      setIsEditing(false);
    }
  };

  const handleGenerateVariations = async () => {
    try {
      setIsEditing(true);
      setError(null);

      const currentImage = editHistory[historyIndex];
      const variations = await generateVariationsWithGeminiNano(currentImage, 3);

      if (variations.length > 0) {
        // Use the first variation
        const newHistory = [...editHistory.slice(0, historyIndex + 1), variations[0]];
        setEditHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        onImageUpdated(variations[0]);
      }
    } catch (err) {
      console.error('Variation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate variations');
    } finally {
      setIsEditing(false);
    }
  };

  const handleClassicEdit = () => {
    // Apply CSS filters (this is a client-side preview)
    // In production, you'd want to actually process the image
    const filters = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      `blur(${blur}px)`,
      `rotate(${rotation}deg)`
    ].join(' ');

    // This is a simplified version - in production, you'd use canvas to apply these
    console.log('Applied filters:', filters);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onImageUpdated(editHistory[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onImageUpdated(editHistory[newIndex]);
    }
  };

  const handleDownload = () => {
    const currentImage = editHistory[historyIndex];
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `edited-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCurrentImage = () => editHistory[historyIndex];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Editor Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Image Editor</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setEditorMode('gemini-nano')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              editorMode === 'gemini-nano'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Editor
          </button>
          <button
            onClick={() => setEditorMode('classic')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              editorMode === 'classic'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Classic Editor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          {editorMode === 'gemini-nano' ? (
            <>
              {/* Gemini Nano Controls */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edit Mode
                </label>
                <select
                  value={editMode}
                  onChange={(e) => setEditMode(e.target.value as EditMode)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="enhance">✨ Enhance Quality</option>
                  <option value="colorize">🎨 Add Colors</option>
                  <option value="stylize">🖌️ Apply Style</option>
                  <option value="remove_background">🔲 Remove Background</option>
                  <option value="blur_background">📷 Blur Background</option>
                  <option value="restore">🔧 Restore/Improve</option>
                  <option value="custom">⚙️ Custom Edit</option>
                </select>
              </div>

              {editMode === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Edit Instructions
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe how you want to edit the image..."
                    className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensity: {Math.round(intensity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={handleGeminiNanoEdit}
                disabled={isEditing || (editMode === 'custom' && !customPrompt.trim())}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isEditing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Editing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Apply AI Edit
                  </>
                )}
              </button>

              <button
                onClick={handleGenerateVariations}
                disabled={isEditing}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Layers className="w-5 h-5" />
                Generate Variations
              </button>
            </>
          ) : (
            <>
              {/* Classic Editor Controls */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brightness: {brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contrast: {contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saturation: {saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blur: {blur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blur}
                  onChange={(e) => setBlur(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rotation: {rotation}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <button
                onClick={handleClassicEdit}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Palette className="w-5 h-5" />
                Apply Filters
              </button>
            </>
          )}

          {/* Common Controls */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex === editHistory.length - 1}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Redo →
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="w-full bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div>
          <div className="bg-gray-50 rounded-xl p-6 min-h-[500px] flex items-center justify-center">
            <img
              src={getCurrentImage()}
              alt="Editing"
              className="max-w-full max-h-[500px] rounded-lg shadow-lg"
              style={
                editorMode === 'classic'
                  ? {
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`,
                      transform: `rotate(${rotation}deg)`
                    }
                  : undefined
              }
            />
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600 text-center">
            History: {historyIndex + 1} / {editHistory.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedImageEditorWithChoice;
