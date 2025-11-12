import React, { useState, useEffect } from 'react';
import { Box, Sparkles, Dices, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AIModelSelector,
  AIModel,
  BaseGeneratorLayout,
  GenerationControlPanel,
  GeneratedImagePreview,
  ReferenceImageSection,
  TokenPersonalizationBar
} from './shared';
import DroppableTextArea from './DroppableTextArea';
import DroppableInput from './DroppableInput';
import { TokenDragItem } from '../types/DragTypes';
import { generateActionFigure } from '../utils/api';
import { streamImageGeneration, streamAIReasoning } from '../utils/streamingApi';
import templatesService, { ActionFigureTemplate } from '../services/templatesService';
import EnhancedImageEditorWithChoice from './EnhancedImageEditorWithChoice';
import SemanticMaskingEditor from './SemanticMaskingEditor';
import ConversationalRefinementPanel from './ConversationalRefinementPanel';

interface UnifiedActionFigureGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

type Category = 'general' | 'wrestling' | 'music' | 'tv_shows' | 'retro';

const CATEGORIES = [
  { id: 'general' as Category, label: 'General', icon: Box },
  { id: 'wrestling' as Category, label: 'Wrestling', icon: Box },
  { id: 'music' as Category, label: 'Music Stars', icon: Box },
  { id: 'tv_shows' as Category, label: 'TV Shows', icon: Box },
  { id: 'retro' as Category, label: 'Retro Toys', icon: Box }
];

export const UnifiedActionFigureGenerator: React.FC<UnifiedActionFigureGeneratorProps> = ({
  tokens,
  onImageGenerated
}) => {
  // Core state
  const [selectedModel, setSelectedModel] = useState<AIModel>('openai');
  const [selectedCategory, setSelectedCategory] = useState<Category>('general');
  const [templates, setTemplates] = useState<ActionFigureTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Generation state
  const [prompt, setPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  // AI reasoning
  const [showAIReasoning, setShowAIReasoning] = useState(false);
  const [reasoningText, setReasoningText] = useState('');

  // Personalization
  const [characterName, setCharacterName] = useState(tokens['FIRSTNAME'] || '');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Advanced options
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedPose, setSelectedPose] = useState('');

  // Editing panels
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showSemanticMasking, setShowSemanticMasking] = useState(false);
  const [showConversationalRefinement, setShowConversationalRefinement] = useState(false);

  // Load templates from Supabase
  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const data = await templatesService.getActionFigureTemplates(selectedCategory);
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(0);
        generatePromptFromTemplate(data[0]);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Failed to load templates from database');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Generate prompt from template
  const generatePromptFromTemplate = (template: ActionFigureTemplate) => {
    const personalizedPrompt = templatesService.generateActionFigurePrompt(template, {
      NAME: characterName || tokens['FIRSTNAME'] || 'the character',
      COMPANY: tokens['COMPANY'] || 'your company'
    });

    setPrompt(personalizedPrompt);
  };

  // Handle template selection
  const handleTemplateSelect = (index: number) => {
    setSelectedTemplate(index);
    if (templates[index]) {
      generatePromptFromTemplate(templates[index]);
    }
  };

  // Random selection
  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * templates.length);
    handleTemplateSelect(randomIndex);
  };

  // Generate image
  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please select a template or enter a prompt');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Initializing...');

    // Start AI reasoning stream if enabled
    if (showAIReasoning) {
      streamAIReasoning({
        prompt,
        onReasoningUpdate: (reasoning) => setReasoningText(reasoning),
        onComplete: (fullReasoning) => setReasoningText(fullReasoning)
      });
    }

    // Start generation stream
    streamImageGeneration({
      prompt: customPrompt ? `${prompt}. ${customPrompt}` : prompt,
      provider: selectedModel,
      onStatusUpdate: setGenerationStatus,
      onProgress: setGenerationProgress,
      onComplete: () => generateRealImage()
    });
  };

  const generateRealImage = async () => {
    try {
      setGenerationStatus('Finalizing image...');

      const finalPrompt = customPrompt ? `${prompt}. ${customPrompt}` : prompt;

      const imageUrl = await generateActionFigure(
        finalPrompt,
        selectedModel as 'openai' | 'gemini' | 'gemini-nano',
        referenceImage || undefined
      );

      setGeneratedImage(imageUrl);
      onImageGenerated(imageUrl);

      // Save to database
      const selectedTemplateData = templates[selectedTemplate];
      await templatesService.saveGeneratedImage({
        image_url: imageUrl,
        prompt: finalPrompt,
        template_type: 'action_figure',
        template_id: selectedTemplateData?.template_id,
        provider: selectedModel,
        metadata: {
          category: selectedCategory,
          hasReferenceImage: !!referenceImage,
          accessories: selectedAccessories
        }
      });
    } catch (err) {
      console.error('Failed to generate:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const cancelGeneration = () => {
    setIsGenerating(false);
    setGenerationStatus('Canceled');
  };

  // Handle token drops
  const handlePromptTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = customPrompt.substring(0, position) + item.tokenDisplay + customPrompt.substring(position);
    setCustomPrompt(newText);
  };

  const handleNameTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = characterName.substring(0, position) + item.tokenDisplay + characterName.substring(position);
    setCharacterName(newText);
  };

  // Left Panel Content
  const leftPanelContent = (
    <div className="space-y-6">
      {/* AI Model Selector */}
      <AIModelSelector
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {/* Category Tabs */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Gallery */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Templates</label>
          <button
            onClick={handleRandomize}
            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Dices className="w-3 h-3" />
            Random
          </button>
        </div>

        {isLoadingTemplates ? (
          <div className="text-center py-8 text-gray-500">Loading templates...</div>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
            {templates.map((template, index) => (
              <button
                key={template.template_id}
                onClick={() => handleTemplateSelect(index)}
                className={`p-2 rounded-lg text-left transition-all ${
                  selectedTemplate === index
                    ? 'bg-indigo-100 border-2 border-indigo-500'
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-medium truncate">{template.name}</div>
                <div className="text-xs text-gray-500 truncate">{template.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Character Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Character Name</label>
        <DroppableInput
          type="text"
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          placeholder={tokens['FIRSTNAME'] || 'Enter character name'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          onDrop={handleNameTokenDrop}
        />
      </div>

      {/* Custom Additions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Custom Additions (Optional)</label>
        <DroppableTextArea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Add custom details or modifications..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={3}
          onDrop={handlePromptTokenDrop}
        />
      </div>

      {/* Reference Image */}
      <ReferenceImageSection
        imageUrl={referenceImage}
        onImageSelected={setReferenceImage}
        onClearImage={() => setReferenceImage(null)}
      />

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <SlidersHorizontal className="w-4 h-4" />
        {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
      </button>

      {/* Advanced Options */}
      <AnimatePresence>
        {showAdvancedOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aiReasoning"
                  checked={showAIReasoning}
                  onChange={(e) => setShowAIReasoning(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="aiReasoning" className="text-sm text-gray-700">
                  Show AI Reasoning
                </label>
              </div>

              <div className="text-xs text-gray-500 bg-white p-3 rounded border border-gray-200">
                <p className="font-medium mb-1">Current Prompt:</p>
                <p className="whitespace-pre-wrap">{prompt}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Control */}
      <GenerationControlPanel
        isGenerating={isGenerating}
        generationProgress={generationProgress}
        generationStatus={generationStatus}
        onGenerate={handleGenerate}
        onCancel={cancelGeneration}
        disabled={!prompt}
        showAIReasoning={showAIReasoning}
        aiReasoningText={reasoningText}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );

  // Right Panel Content
  const rightPanelContent = (
    <div className="space-y-6">
      {/* Image Preview */}
      <GeneratedImagePreview
        imageUrl={generatedImage}
        isGenerating={isGenerating}
        onDownload={() => {
          if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = 'action-figure.png';
            link.click();
          }
        }}
        onEdit={() => setShowImageEditor(true)}
        onSemanticMask={() => setShowSemanticMasking(true)}
        onConversationalRefine={() => setShowConversationalRefinement(true)}
        onRegenerate={handleGenerate}
        generatorType="action figure"
      />

      {/* Token Personalization Bar */}
      <TokenPersonalizationBar tokens={tokens} />

      {/* Info Panel */}
      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
        <h4 className="font-medium text-indigo-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Action Figure Features
        </h4>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            Professional toy packaging design
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            Personalized character names and details
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            Multiple style categories and templates
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            Reference image support for custom figures
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <BaseGeneratorLayout
        title="Action Figure Generator"
        icon={Box}
        description="Create personalized action figure designs with AI"
        badge={`${templates.length} Templates`}
        leftPanel={leftPanelContent}
        rightPanel={rightPanelContent}
      />

      {/* Editing Modals */}
      {showImageEditor && generatedImage && (
        <div className="mt-6">
          <EnhancedImageEditorWithChoice
            imageUrl={generatedImage}
            onImageUpdated={(newUrl) => {
              setGeneratedImage(newUrl);
              onImageGenerated(newUrl);
            }}
            tokens={tokens}
          />
        </div>
      )}

      {showSemanticMasking && generatedImage && (
        <SemanticMaskingEditor
          imageUrl={generatedImage}
          onEditComplete={(newUrl) => {
            setGeneratedImage(newUrl);
            onImageGenerated(newUrl);
            setShowSemanticMasking(false);
          }}
          onClose={() => setShowSemanticMasking(false)}
        />
      )}

      {showConversationalRefinement && generatedImage && (
        <div className="mt-6">
          <ConversationalRefinementPanel
            initialImageUrl={generatedImage}
            onImageUpdated={(newUrl) => {
              setGeneratedImage(newUrl);
              onImageGenerated(newUrl);
            }}
            onClose={() => setShowConversationalRefinement(false)}
          />
        </div>
      )}
    </>
  );
};

export default UnifiedActionFigureGenerator;
