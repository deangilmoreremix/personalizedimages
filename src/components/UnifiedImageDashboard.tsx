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

import { generateImage, generateImageBatch, generateVariations } from '../utils/api/image/generation';
import { resolveTokens } from '../utils/tokenResolver';
import { quickEnhance, enhanceWithTokenPreservation, type GeneratorCategory } from '../utils/promptEnhancer';
import PromptEnhancementPanel from './PromptEnhancementPanel';
import { usePersonalization } from '../contexts/PersonalizationContext';
import { imageService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../utils/supabaseClient';
import { useAuth } from '../auth/AuthContext';

// UI Components
import { DESIGN_SYSTEM, getGridClasses, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';
import { useTheme } from './ui/ThemeProvider';
import { LazyImage } from './ui/LazyImage';
import { DroppableImage } from './ui/DroppableImage';
import TokenPanel from './TokenPanel';
import { useTokenApplication } from '../hooks/useTokenApplication';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FreepikResourceGallery from './FreepikResourceGallery';

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
  const { theme, setTheme, isDark } = useTheme();
  const { user } = useAuth();
  const { tokens, updateToken, updateTokens, resolvePrompt, isSaving } = usePersonalization();

  const {
    applyTokenToImage,
    removeTokenFromImage,
    getAppliedTokens,
    exportImageWithEffects
  } = useTokenApplication({
    onTokenApplied: (imageId, appliedToken) => {
      console.log(`Token applied to image ${imageId}:`, appliedToken);
    },
    onTokenRemoved: (imageId, tokenId) => {
      console.log(`Token ${tokenId} removed from image ${imageId}`);
    }
  });

  const [currentMode, setCurrentMode] = useState<string>('ai-image');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTokenPanel, setShowTokenPanel] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [promptText, setPromptText] = useState('');
  const [autoEnhance, setAutoEnhance] = useState(true);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [tokenWarnings, setTokenWarnings] = useState<string[]>([]);

  const [showPersonalization, setShowPersonalization] = useState(false);
  const [personalizationMode, setPersonalizationMode] = useState<'basic' | 'action-figure' | 'advanced'>('basic');

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
    },
    {
      id: 'stock',
      name: 'Asset Library',
      icon: ImageIcon,
      description: 'Browse Freepik stock images',
      category: 'image'
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

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const getContextualTokens = useCallback(() => {
    const baseTokens = {
      FIRSTNAME: tokens.FIRSTNAME,
      COMPANY: tokens.COMPANY,
      EMAIL: tokens.EMAIL
    };

    if (currentMode === 'action-figure' || personalizationMode === 'action-figure') {
      return {
        ...baseTokens,
        CHARACTER_NAME: tokens.CHARACTER_NAME,
        STYLE: tokens.STYLE,
        POSE: tokens.POSE,
        ENVIRONMENT: tokens.ENVIRONMENT
      };
    }

    return baseTokens;
  }, [currentMode, personalizationMode, tokens]);

  const buildEffectivePrompt = useCallback((rawPrompt: string): string => {
    let effectivePrompt = rawPrompt;

    if (showPersonalization && personalizationMode === 'action-figure') {
      const figureParts = [
        `Create an action figure of ${tokens.CHARACTER_NAME || 'a character'}`,
        `in a ${tokens.STYLE} style`,
        `striking a ${(tokens.POSE || '').replace('-', ' ')} pose`,
        `in a ${tokens.ENVIRONMENT} environment`,
      ];
      if (rawPrompt.trim()) {
        figureParts.push(`. Additional details: ${rawPrompt}`);
      }
      effectivePrompt = figureParts.join(', ');
    }

    if (showPersonalization) {
      const contextualTokens = getContextualTokens();
      const resolved = resolveTokens(effectivePrompt, contextualTokens);
      effectivePrompt = resolved.resolvedContent;
    }

    return effectivePrompt;
  }, [showPersonalization, personalizationMode, tokens, getContextualTokens]);

  const handleGenerate = useCallback(async (options: any = {}) => {
    const raw = promptText.trim();
    if (!raw && !(showPersonalization && personalizationMode === 'action-figure')) return;

    setIsGenerating(true);
    setTokenWarnings([]);

    try {
      let effectivePrompt: string;
      let resolvedTokenKeys: string[] = [];
      let warnings: string[] = [];

      if (showPersonalization && personalizationMode === 'action-figure') {
        const figureParts = [
          `Create an action figure of ${tokens.CHARACTER_NAME || 'a character'}`,
          `in a ${tokens.STYLE} style`,
          `striking a ${(tokens.POSE || '').replace('-', ' ')} pose`,
          `in a ${tokens.ENVIRONMENT} environment`,
        ];
        if (raw) figureParts.push(`. Additional details: ${raw}`);
        effectivePrompt = figureParts.join(', ');
        resolvedTokenKeys = ['CHARACTER_NAME', 'STYLE', 'POSE', 'ENVIRONMENT'];

        if (autoEnhance) {
          effectivePrompt = quickEnhance(effectivePrompt, currentMode as GeneratorCategory);
        }
      } else if (showPersonalization && autoEnhance) {
        const result = enhanceWithTokenPreservation(
          raw,
          currentMode as GeneratorCategory,
          getContextualTokens()
        );
        effectivePrompt = result.enhanced;
        resolvedTokenKeys = result.resolvedTokens;
        warnings = result.warnings;
      } else if (showPersonalization) {
        const resolved = resolveTokens(raw, getContextualTokens());
        effectivePrompt = resolved.resolvedContent;
        resolvedTokenKeys = resolved.resolvedTokens;
        warnings = resolved.warnings;
      } else if (autoEnhance) {
        effectivePrompt = quickEnhance(raw, currentMode as GeneratorCategory);
      } else {
        effectivePrompt = raw;
      }

      if (warnings.length > 0) {
        setTokenWarnings(warnings);
      }

      const appliedTokens = resolvedTokenKeys.map(key => ({
        key,
        value: tokens[key] || '',
        category: currentMode,
      }));

      const result = await generateImage(effectivePrompt, {
        provider: 'gemini',
        appliedTokens: appliedTokens.length > 0 ? appliedTokens : undefined,
        ...options
      });

      if (result.success && result.imageUrl) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: result.imageUrl,
          prompt: effectivePrompt,
          mode: currentMode,
          timestamp: new Date(),
          metadata: {
            provider: result.provider || 'unknown',
            generationTime: result.metadata?.generationTime || 0,
            cost: result.metadata?.cost
          }
        };

        setGeneratedImages(prev => [newImage, ...prev]);

        if (user?.id && isSupabaseConfigured()) {
          const tokensUsed = resolvedTokenKeys.length > 0
            ? Object.fromEntries(resolvedTokenKeys.map(k => [k, tokens[k] || '']))
            : undefined;

          imageService.saveGeneratedImage({
            user_id: user.id,
            prompt: effectivePrompt,
            image_url: result.imageUrl,
            provider: result.provider || 'gemini',
            model: result.metadata?.model,
            category: currentMode,
            tokens_used: tokensUsed,
          }).catch(err => console.error('Failed to persist image:', err));
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [promptText, currentMode, showPersonalization, personalizationMode, autoEnhance, tokens, getContextualTokens, user?.id]);

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

  // Handle personalization mode change
  const handlePersonalizationModeChange = useCallback((mode: 'basic' | 'action-figure' | 'advanced') => {
    setPersonalizationMode(mode);
    if (mode === 'action-figure' && currentMode !== 'action-figure') {
      setCurrentMode('action-figure');
    }
  }, [currentMode]);

  // Handle token drop on image
  const handleTokenDrop = useCallback(async (imageId: string, token: any, position?: { x: number; y: number }) => {
    try {
      await applyTokenToImage(imageId, token, position);
    } catch (error) {
      console.error('Failed to apply token:', error);
    }
  }, [applyTokenToImage]);

  // Handle token removal from image
  const handleTokenRemove = useCallback((imageId: string, tokenId: string) => {
    removeTokenFromImage(imageId, tokenId);
  }, [removeTokenFromImage]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen ${isDark ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
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
              className={`p-2 border rounded-lg transition-colors ${
                showPersonalization
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title={showPersonalization ? `Hide Personalization (${personalizationMode})` : 'Show Personalization'}
            >
              <div className="relative">
                <User className="w-4 h-4" />
                {showPersonalization && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}>
          {/* Generation Modes */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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

          {/* Token Panel */}
          {showTokenPanel && (
            <div className="flex-1 overflow-hidden">
              <TokenPanel
                tokens={tokens}
                onTokensChange={updateTokens}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </div>
          )}

          {/* Toggle Token Panel */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowTokenPanel(!showTokenPanel)}
              className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showTokenPanel
                  ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Palette className="w-4 h-4" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">
                  {showTokenPanel ? 'Hide Tokens' : 'Show Tokens'}
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Enhanced Personalization Panel - MOVED ABOVE GENERATION */}
          {showPersonalization && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Personalization Studio
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePersonalizationModeChange('basic')}
                        className={`px-3 py-1 text-xs rounded-full ${
                          personalizationMode === 'basic'
                            ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Basic
                      </button>
                      <button
                        onClick={() => handlePersonalizationModeChange('action-figure')}
                        className={`px-3 py-1 text-xs rounded-full ${
                          personalizationMode === 'action-figure'
                            ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Action Figure
                      </button>
                      <button
                        onClick={() => handlePersonalizationModeChange('advanced')}
                        className={`px-3 py-1 text-xs rounded-full ${
                          personalizationMode === 'advanced'
                            ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Advanced
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPersonalization(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {personalizationMode === 'action-figure' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Character Identity */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Character Identity
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Character Name
                            </label>
                            <input
                              type="text"
                              value={tokens.CHARACTER_NAME}
                              onChange={(e) => updateToken('CHARACTER_NAME', e.target.value)}
                              placeholder="e.g., Max Thunder, Luna Star"
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Hero/Villain Style
                            </label>
                            <select
                              value={tokens.STYLE}
                              onChange={(e) => updateToken('STYLE', e.target.value)}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="heroic">Heroic (Powerful, noble)</option>
                              <option value="mysterious">Mysterious (Enigmatic, stealthy)</option>
                              <option value="tech">Tech-Savvy (Gadgets, futuristic)</option>
                              <option value="brutal">Brutal (Tough, intimidating)</option>
                              <option value="agile">Agile (Fast, acrobatic)</option>
                              <option value="wise">Wise (Mentor, magical)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Action & Environment */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          Action & Environment
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Action Pose
                            </label>
                            <select
                              value={tokens.POSE}
                              onChange={(e) => updateToken('POSE', e.target.value)}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="power-pose">Power Pose (Confident stance)</option>
                              <option value="combat-ready">Combat Ready (Fighting position)</option>
                              <option value="flying">Flying (Dynamic motion)</option>
                              <option value="stealth">Stealth (Sneaking, hiding)</option>
                              <option value="victory">Victory (Celebrating win)</option>
                              <option value="intense">Intense Focus (Concentrating)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Environment
                            </label>
                            <select
                              value={tokens.ENVIRONMENT}
                              onChange={(e) => updateToken('ENVIRONMENT', e.target.value)}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="urban">Urban Cityscape</option>
                              <option value="sci-fi">Sci-Fi Space Station</option>
                              <option value="fantasy">Fantasy Landscape</option>
                              <option value="post-apocalyptic">Post-Apocalyptic Ruins</option>
                              <option value="underwater">Underwater Scene</option>
                              <option value="mountain">Mountain Peak</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visual Preview */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Live Prompt Preview</h4>
                      <div className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Create an action figure of <strong>{tokens.CHARACTER_NAME || 'Character'}</strong> in a{' '}
                          <strong>{tokens.STYLE}</strong> style, striking a{' '}
                          <strong>{(tokens.POSE || '').replace('-', ' ')}</strong> pose in a{' '}
                          <strong>{tokens.ENVIRONMENT}</strong> environment.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : personalizationMode === 'advanced' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(getContextualTokens()).map(([key, value]) => (
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Brand Color
                        </label>
                        <input
                          type="color"
                          value={tokens.BRAND_COLOR || '#3B82F6'}
                          onChange={(e) => updateToken('BRAND_COLOR', e.target.value)}
                          className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Font Style
                        </label>
                        <select
                          value={tokens.FONT_STYLE || 'modern'}
                          onChange={(e) => updateToken('FONT_STYLE', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="modern">Modern</option>
                          <option value="classic">Classic</option>
                          <option value="bold">Bold</option>
                          <option value="elegant">Elegant</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tone
                        </label>
                        <select
                          value={tokens.TONE || 'professional'}
                          onChange={(e) => updateToken('TONE', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="fun">Fun</option>
                          <option value="serious">Serious</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Basic Mode */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(getContextualTokens()).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {key.replace('_', ' ')}
                          </label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateToken(key, e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>How to use tokens:</strong> Use tokens like <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">{`{FIRSTNAME}`}</code> in your prompts.
                          They will be automatically replaced with your personalized values.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generation Panel */}
          {currentMode !== 'stock' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {generationModes.find(m => m.id === currentMode)?.name || 'AI Image'} Generator
                  {showPersonalization && (
                    <span className="ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                      Personalized
                    </span>
                  )}
                </h3>
              </div>
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
                  Prompt {showPersonalization && <span className="text-indigo-600 dark:text-indigo-400">(Personalized)</span>}
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={showPersonalization ? "Enter base prompt with tokens like {FIRSTNAME} - they'll be replaced automatically..." : "Describe the image you want to create..."}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isGenerating}
                />
              </div>

              {/* Prompt Enhancement Panel */}
              <PromptEnhancementPanel
                prompt={promptText}
                category={currentMode as GeneratorCategory}
                onApplyEnhanced={(enhanced) => setPromptText(enhanced)}
                onNegativePromptChange={setNegativePrompt}
                compact={false}
              />

              {/* Personalized Prompt Preview */}
              {showPersonalization && promptText.trim() && personalizationMode !== 'action-figure' && (
                <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Resolved Prompt Preview
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {buildEffectivePrompt(promptText.trim())}
                  </p>
                </div>
              )}
              {showPersonalization && personalizationMode === 'action-figure' && (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                      Personalized Action Figure Prompt
                    </span>
                  </div>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    {buildEffectivePrompt(promptText)}
                  </p>
                </div>
              )}

              {tokenWarnings.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Token Warnings
                      </span>
                      <ul className="mt-1 space-y-1">
                        {tokenWarnings.map((warning, idx) => (
                          <li key={idx} className="text-xs text-amber-700 dark:text-amber-300">
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {isSaving && (
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving tokens...</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating || (!promptText.trim() && !(showPersonalization && personalizationMode === 'action-figure'))}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate</span>
                  </button>

                  <button
                    onClick={() => setAutoEnhance(!autoEnhance)}
                    className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
                      autoEnhance
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Auto-Enhance {autoEnhance ? 'On' : 'Off'}</span>
                  </button>

                  <button
                    onClick={() => setShowPersonalization(!showPersonalization)}
                    className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
                      showPersonalization
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Shapes className="w-4 h-4" />
                    <span>{showPersonalization ? 'Hide' : 'Show'} Personalization</span>
                  </button>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Using Gemini AI • Free credits remaining: 50
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery */}
          {currentMode === 'stock' ? (
            <FreepikResourceGallery
              onResourceSelect={(resource) => {
                console.log('Selected Freepik resource:', resource);
                // Here you could add the resource to generated images or handle selection
              }}
              maxHeight="calc(100vh - 300px)"
              showFilters={true}
            />
          ) : (
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
                      <DroppableImage
                        key={image.id}
                        image={image}
                        isSelected={selectedImages.has(image.id)}
                        onSelect={toggleImageSelection}
                        onTokenDrop={handleTokenDrop}
                        appliedTokens={getAppliedTokens(image.id).map(applied => applied.token)}
                        onRemoveToken={handleTokenRemove}
                        onDownload={(img) => console.log('Download:', img.url)}
                        onShare={(img) => console.log('Share:', img.url)}
                        onEdit={(img) => console.log('Edit:', img.url)}
                        onView={(img) => console.log('View:', img.url)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      </div>
    </DndProvider>
  );
};

export default UnifiedImageDashboard;