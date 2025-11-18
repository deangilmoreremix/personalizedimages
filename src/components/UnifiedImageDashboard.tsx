import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wand2,
  Image as ImageIcon,
  Settings,
  Moon,
  Sun,
  Grid,
  List,
  Search,
  Filter,
  Download,
  Share2,
  Heart,
  Star,
  Clock,
  User,
  Palette,
  Zap,
  Sparkles,
  Camera,
  Video,
  Type,
  Shapes,
  Layers,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit3,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';

// Core generation API
import { generateImage, generateImageBatch, generateVariations } from '../utils/api/image/generation';

// UI Components
import { DESIGN_SYSTEM, getGridClasses, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';
import { useTheme } from './ui/ThemeProvider';
import { LazyImage } from './ui/LazyImage';

// Types
interface GenerationMode {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  category: 'image' | 'video' | 'text';
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  mode: string;
  timestamp: Date;
  metadata: {
    provider: string;
    generationTime: number;
    cost?: number;
  };
}

interface PersonalizationToken {
  id: string;
  key: string;
  value: string;
  category: 'user' | 'brand' | 'dynamic';
  platform?: 'email' | 'social' | 'web';
}

const UnifiedImageDashboard: React.FC = () => {
  // Theme hook
  const { theme, setTheme, isDark } = useTheme();

  // Core state
  const [currentMode, setCurrentMode] = useState<string>('ai-image');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  // Personalization state
  const [tokens, setTokens] = useState<Record<string, string>>({
    FIRSTNAME: 'John',
    COMPANY: 'Acme Corp',
    EMAIL: 'john@acme.com'
  });
  const [showPersonalization, setShowPersonalization] = useState(false);

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Generation modes
  const generationModes: GenerationMode[] = useMemo(() => [
    {
      id: 'ai-image',
      name: 'AI Image',
      icon: Wand2,
      description: 'Generate images with AI prompts',
      category: 'image'
    },
    {
      id: 'ghibli',
      name: 'Studio Ghibli',
      icon: Sparkles,
      description: 'Whimsical animated style',
      category: 'image'
    },
    {
      id: 'cartoon',
      name: 'Cartoon Style',
      icon: Palette,
      description: 'Fun cartoon illustrations',
      category: 'image'
    },
    {
      id: 'meme',
      name: 'Meme Generator',
      icon: Type,
      description: 'Create viral memes',
      category: 'image'
    },
    {
      id: 'action-figure',
      name: 'Action Figures',
      icon: Shapes,
      description: 'Custom character figures',
      category: 'image'
    },
    {
      id: 'video',
      name: 'Image to Video',
      icon: Video,
      description: 'Animate static images',
      category: 'video'
    }
  ], []);

  // Filter images based on search and category
  const filteredImages = useMemo(() => {
    return generatedImages.filter(image => {
      const matchesSearch = searchQuery === '' ||
        image.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || image.mode === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [generatedImages, searchQuery, selectedCategory]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Handle image generation
  const handleGenerate = useCallback(async (prompt: string, options: any = {}) => {
    setIsGenerating(true);
    try {
      const result = await generateImage(prompt, {
        provider: 'gemini', // Default to Gemini for now
        ...options
      });

      if (result.success && result.imageUrl) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: result.imageUrl,
          prompt,
          mode: currentMode,
          timestamp: new Date(),
          metadata: {
            provider: result.provider || 'unknown',
            generationTime: result.metadata?.generationTime || 0,
            cost: result.metadata?.cost
          }
        };

        setGeneratedImages(prev => [newImage, ...prev]);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [currentMode]);

  // Handle image selection
  const toggleImageSelection = useCallback((imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  }, []);

  // Batch download selected images
  const handleBatchDownload = useCallback(() => {
    selectedImages.forEach(imageId => {
      const image = generatedImages.find(img => img.id === imageId);
      if (image) {
        // In a real app, this would trigger download
        console.log('Downloading:', image.url);
      }
    });
    setSelectedImages(new Set());
  }, [selectedImages, generatedImages]);

  // Update token
  const updateToken = useCallback((key: string, value: string) => {
    setTokens(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              AI Image Studio
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Unified Creative Platform
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Personalization Toggle */}
            <button
              onClick={() => setShowPersonalization(!showPersonalization)}
              className={`p-2 border rounded-lg ${
                showPersonalization
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-semibold text-gray-900 dark:text-white ${sidebarCollapsed ? 'hidden' : ''}`}>
                Generation Modes
              </h2>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ChevronDown className={`w-4 h-4 transform transition-transform ${sidebarCollapsed ? 'rotate-90' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              {generationModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setCurrentMode(mode.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                      currentMode === mode.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{mode.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {mode.description}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Generation Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {generationModes.find(m => m.id === currentMode)?.name || 'AI Image'} Generator
              </h3>
              {isGenerating && (
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating...</span>
                </div>
              )}
            </div>

            {/* Quick Generation Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prompt
                </label>
                <textarea
                  placeholder="Describe the image you want to create..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isGenerating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleGenerate('A beautiful landscape')}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate</span>
                  </button>

                  <button
                    onClick={() => setShowPersonalization(true)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Shapes className="w-4 h-4" />
                    <span>Personalize</span>
                  </button>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Using Gemini AI • Free credits remaining: 50
                </div>
              </div>
            </div>
          </div>

          {/* Personalization Panel */}
          {showPersonalization && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Personalization Tokens
                </h3>
                <button
                  onClick={() => setShowPersonalization(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(tokens).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateToken(key, e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Token Usage:</strong> Use tokens like {'{FIRSTNAME}'} in your prompts.
                    They will be automatically replaced with personalized values.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gallery */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Generated Images ({filteredImages.length})
                  </h3>

                  {selectedImages.size > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedImages.size} selected
                      </span>
                      <button
                        onClick={handleBatchDownload}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Types</option>
                    {generationModes.map(mode => (
                      <option key={mode.id} value={mode.id}>
                        {mode.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Image Grid/List */}
            <div className="p-4">
              {filteredImages.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No images yet
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Generate your first image to get started!
                  </p>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                    : 'space-y-4'
                }>
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.id)}
                          onChange={() => toggleImageSelection(image.id)}
                          className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </div>

                      {/* Image */}
                      <div className={`${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'}`}>
                        <LazyImage
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-full"
                        />
                      </div>

                      {/* Overlay */}
                      <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 ${
                        viewMode === 'list' ? 'flex items-center justify-center' : ''
                      }`}>
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-2 ${
                          viewMode === 'list' ? '' : 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                        }`}>
                          <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                            <Eye className="w-4 h-4 text-gray-900" />
                          </button>
                          <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                            <Download className="w-4 h-4 text-gray-900" />
                          </button>
                          <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                            <Share2 className="w-4 h-4 text-gray-900" />
                          </button>
                          <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                            <Edit3 className="w-4 h-4 text-gray-900" />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      {viewMode === 'list' && (
                        <div className="flex-1 p-4">
                          <p className="text-sm text-gray-900 dark:text-white font-medium mb-1 truncate">
                            {image.prompt}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{image.mode}</span>
                            <span>{image.metadata.provider}</span>
                            <span>{image.timestamp.toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UnifiedImageDashboard;