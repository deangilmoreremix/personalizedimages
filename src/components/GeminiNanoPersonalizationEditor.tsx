import React, { useState, useRef } from 'react';
import { Wand2, Image as ImageIcon, Download, Sparkles, Zap, Save, Upload, Layers, Settings, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { generateImageWithGeminiNano, editImageWithGeminiNano } from '../utils/geminiNanoApi';
import { PERSONALIZATION_TOKENS, createDefaultTokenValues } from '../types/personalization';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';

interface GeminiNanoPersonalizationEditorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const GeminiNanoPersonalizationEditor: React.FC<GeminiNanoPersonalizationEditorProps> = ({ tokens, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Advanced options
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageStyle, setImageStyle] = useState<string>('photorealistic');
  const [quality, setQuality] = useState<'standard' | 'high'>('high');
  const [negativePrompt, setNegativePrompt] = useState('');

  // Editor state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showTokenPanel, setShowTokenPanel] = useState(true);
  const [editMode, setEditMode] = useState<'enhance' | 'colorize' | 'stylize' | 'custom'>('enhance');
  const [editIntensity, setEditIntensity] = useState(1);

  // Generation history
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // UI state
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleDrop = (item: TokenDragItem, value: string) => {
    const currentValue = prompt;
    const newValue = currentValue + (currentValue ? ' ' : '') + `[${item.token}]`;
    setPrompt(newValue);
  };

  const replaceTokensInPrompt = (promptText: string): string => {
    let result = promptText;
    Object.entries(tokens).forEach(([key, value]) => {
      const tokenPattern = new RegExp(`\\[${key}\\]`, 'g');
      result = result.replace(tokenPattern, value || `[${key}]`);
    });
    return result;
  };

  const generatePersonalizedPrompt = (): string => {
    let enhancedPrompt = prompt;

    // Replace personalization tokens
    enhancedPrompt = replaceTokensInPrompt(enhancedPrompt);

    // Add style if not already mentioned
    if (imageStyle && !enhancedPrompt.toLowerCase().includes(imageStyle.toLowerCase())) {
      enhancedPrompt = `${enhancedPrompt}, ${imageStyle} style`;
    }

    return enhancedPrompt;
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const personalizedPrompt = generatePersonalizedPrompt();
      console.log('🎨 Generating with Gemini Nano:', personalizedPrompt);

      const imageUrl = await generateImageWithGeminiNano(
        personalizedPrompt,
        {
          aspectRatio,
          style: imageStyle,
          quality,
          negativePrompt: negativePrompt || undefined
        }
      );

      setGeneratedImage(imageUrl);

      // Add to history
      const newHistory = [...generationHistory.slice(0, currentHistoryIndex + 1), imageUrl];
      setGenerationHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);

      onImageGenerated(imageUrl);

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImage = async () => {
    if (!generatedImage) {
      setError('No image to edit');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const editedImageUrl = await editImageWithGeminiNano(
        generatedImage,
        {
          mode: editMode,
          intensity: editIntensity,
          style: imageStyle,
          customPrompt: editMode === 'custom' ? prompt : undefined
        }
      );

      setGeneratedImage(editedImageUrl);

      // Add to history
      const newHistory = [...generationHistory.slice(0, currentHistoryIndex + 1), editedImageUrl];
      setGenerationHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);

      onImageGenerated(editedImageUrl);

    } catch (err) {
      console.error('Edit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to edit image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `personalized-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setGeneratedImage(generationHistory[currentHistoryIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < generationHistory.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setGeneratedImage(generationHistory[currentHistoryIndex + 1]);
    }
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(generatePersonalizedPrompt());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const implementedTokens = PERSONALIZATION_TOKENS.filter(t => t.isImplemented);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              Gemini Nano Personalization Editor
            </h2>
            <p className="text-gray-600 mt-2">Create personalized images with AI-powered generation and editing</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTokenPanel(!showTokenPanel)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              {showTokenPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showTokenPanel ? 'Hide' : 'Show'} Tokens
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt
              </label>
              <DroppableTextArea
                value={prompt}
                onChange={setPrompt}
                onDrop={handleDrop}
                placeholder="Describe your image... Drag tokens here or type [FIRSTNAME] to personalize"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <button
                onClick={copyPromptToClipboard}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedPrompt ? 'Copied!' : 'Copy processed prompt'}
              </button>
            </div>

            {/* Style Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="photorealistic">Photorealistic</option>
                <option value="digital-art">Digital Art</option>
                <option value="illustration">Illustration</option>
                <option value="cartoon">Cartoon</option>
                <option value="anime">Anime</option>
                <option value="watercolor">Watercolor</option>
                <option value="oil-painting">Oil Painting</option>
                <option value="sketch">Sketch</option>
                <option value="3d-render">3D Render</option>
              </select>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['1:1', '16:9', '9:16', '4:3', '3:4'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setQuality('standard')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    quality === 'standard'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setQuality('high')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    quality === 'high'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Settings className="w-4 h-4" />
                {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
              </button>

              {showAdvancedOptions && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Negative Prompt (what to avoid)
                    </label>
                    <textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="blurry, low quality, distorted..."
                      className="w-full h-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateImage}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>

            {/* Edit Controls */}
            {generatedImage && (
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Edit Image
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edit Mode
                  </label>
                  <select
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="enhance">Enhance Quality</option>
                    <option value="colorize">Add Colors</option>
                    <option value="stylize">Apply Style</option>
                    <option value="custom">Custom Edit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensity: {Math.round(editIntensity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editIntensity}
                    onChange={(e) => setEditIntensity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={handleEditImage}
                  disabled={isGenerating}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  Apply Edit
                </button>
              </div>
            )}
          </div>

          {/* Center Panel - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Preview</h3>
                {generatedImage && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUndo}
                      disabled={currentHistoryIndex <= 0}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Undo"
                    >
                      <RefreshCw className="w-4 h-4 transform rotate-180" />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={currentHistoryIndex >= generationHistory.length - 1}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Redo"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center">
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="max-w-full max-h-full rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                    <p>Your generated image will appear here</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Tokens */}
          {showTokenPanel && (
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Personalization Tokens</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag tokens to your prompt or click to insert
                </p>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {implementedTokens.map((token) => (
                    <button
                      key={token.key}
                      onClick={() => setPrompt(prompt + ` [${token.key}]`)}
                      className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-indigo-600">
                            [{token.key}]
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {token.description}
                          </div>
                          {tokens[token.key] && (
                            <div className="text-xs text-indigo-600 mt-1 font-medium">
                              Current: {tokens[token.key]}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiNanoPersonalizationEditor;
