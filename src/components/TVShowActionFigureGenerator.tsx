import React, { useState, useEffect } from 'react';
import { Wand2, Image as ImageIcon, Download, RefreshCw, Zap, Camera, Layers, Sparkles, SlidersHorizontal, Lightbulb, Dices, Upload, Box, Tv, PaintBucket } from 'lucide-react';
import { generateActionFigure } from '../utils/api';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';
import tvPrompts from '../data/tvShowActionFigures';
import ReferenceImageUploader from './ReferenceImageUploader';
import EnhancedImageEditorWithChoice from './EnhancedImageEditorWithChoice';
import SemanticMaskingEditor from './SemanticMaskingEditor';
import ConversationalRefinementPanel from './ConversationalRefinementPanel';

interface TVShowActionFigureGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const TVShowActionFigureGenerator: React.FC<TVShowActionFigureGeneratorProps> = ({ tokens, onImageGenerated }) => {
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedFigure, setGeneratedFigure] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('gemini');
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedAdditions, setSelectedAdditions] = useState<string[]>([]);
  const [selectedRemovals, setSelectedRemovals] = useState<string[]>([]);
  const [selectedPose, setSelectedPose] = useState<string>('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [showAllCharacters, setShowAllCharacters] = useState(false);

  // Advanced editing panels
  const [showSemanticMasking, setShowSemanticMasking] = useState(false);
  const [showConversationalRefinement, setShowConversationalRefinement] = useState(false);

  // Initialize with first prompt
  useEffect(() => {
    if (tvPrompts.length > 0) {
      setSelectedPrompt(0);
      setSelectedPose(tvPrompts[0].poses[0] || '');
    }
  }, []);

  const getCurrentPrompt = () => {
    return tvPrompts[selectedPrompt] || tvPrompts[0];
  };

  const generateCompletePrompt = () => {
    const currentPrompt = getCurrentPrompt();
    
    // Start with the base prompt
    let finalPrompt = currentPrompt.basePrompt;
    
    // Add selected additions
    if (selectedAdditions.length > 0) {
      finalPrompt += ` Additional accessories include: ${selectedAdditions.join(', ')}.`;
    }
    
    // Add removals
    if (selectedRemovals.length > 0) {
      finalPrompt += ` Remove these elements: ${selectedRemovals.join(', ')}.`;
    }
    
    // Add selected pose
    if (selectedPose) {
      finalPrompt += ` The figure is posed in a ${selectedPose} position.`;
    }
    
    // Add packaging details
    finalPrompt += ` The packaging is ${currentPrompt.packaging}.`;
    
    // Add any custom prompt additions
    if (customPrompt) {
      finalPrompt += ` ${customPrompt}`;
    }
    
    // Add personalization if FIRSTNAME token is available
    if (tokens['FIRSTNAME']) {
      finalPrompt += ` The action figure has a personalized name tag for ${tokens['FIRSTNAME']}.`;
    }
    
    // Add professional quality instructions
    finalPrompt += " Create a professional product photo of this TV show action figure toy with studio lighting, high detail, and authentic toy packaging design.";
    
    return finalPrompt;
  };

  const handleRandomize = () => {
    // Select a random prompt
    const randomPromptIndex = Math.floor(Math.random() * tvPrompts.length);
    setSelectedPrompt(randomPromptIndex);
    
    const randomPrompt = tvPrompts[randomPromptIndex];
    
    // Select random additions (0-2)
    const numAdditions = Math.floor(Math.random() * 3);
    const randomAdditions = [...randomPrompt.additions]
      .sort(() => 0.5 - Math.random())
      .slice(0, numAdditions);
    setSelectedAdditions(randomAdditions);
    
    // Select random removals (0-1)
    const numRemovals = Math.floor(Math.random() * 2);
    const randomRemovals = [...randomPrompt.removals]
      .sort(() => 0.5 - Math.random())
      .slice(0, numRemovals);
    setSelectedRemovals(randomRemovals);
    
    // Select random pose
    const randomPose = randomPrompt.poses[Math.floor(Math.random() * randomPrompt.poses.length)];
    setSelectedPose(randomPose);
    
    // Clear custom prompt
    setCustomPrompt('');
  };

  const handleGenerateActionFigure = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Generate the full prompt
      const finalPrompt = generateCompletePrompt();
      
      console.log(`🤖 Generating TV show action figure with ${selectedProvider}:`, { 
        prompt: finalPrompt,
        hasReferenceImage: !!referenceImage
      });
      
      // Call the API to generate the figure
      const imageUrl = await generateActionFigure(finalPrompt, selectedProvider, referenceImage || undefined);
      
      console.log('✅ Successfully generated TV show action figure');
      setGeneratedFigure(imageUrl);
      
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }
    } catch (err) {
      console.error('❌ Failed to generate TV show action figure:', err);
      setError(`Failed to generate action figure: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Fallback to a placeholder image for better UX
      const placeholderUrl = `https://placehold.co/800/333/FFF?text=Generation+Failed`;
      setGeneratedFigure(placeholderUrl);
      
      if (onImageGenerated) {
        onImageGenerated(placeholderUrl);
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle token drop on the prompt textarea
  const handleTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = customPrompt.substring(0, position) + 
                  item.tokenDisplay + 
                  customPrompt.substring(position);
    setCustomPrompt(newText);
  };

  // Toggle an addition
  const toggleAddition = (addition: string) => {
    if (selectedAdditions.includes(addition)) {
      setSelectedAdditions(selectedAdditions.filter(item => item !== addition));
    } else {
      setSelectedAdditions([...selectedAdditions, addition]);
    }
  };

  // Toggle a removal
  const toggleRemoval = (removal: string) => {
    if (selectedRemovals.includes(removal)) {
      setSelectedRemovals(selectedRemovals.filter(item => item !== removal));
    } else {
      setSelectedRemovals([...selectedRemovals, removal]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <Tv className="h-6 w-6 text-blue-500 mr-2" />
          TV Show Action Figure Generator
        </h3>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {tvPrompts.length} TV Characters
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* TV Character Gallery */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                TV Show Character
              </label>
              <button 
                onClick={() => setShowAllCharacters(!showAllCharacters)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showAllCharacters ? "Show Less" : "Show All Characters"}
              </button>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
              {(showAllCharacters ? tvPrompts : tvPrompts.slice(0, 8)).map((prompt, index) => (
                <div
                  key={prompt.title}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPrompt === index 
                      ? 'ring-2 ring-blue-500 shadow-md' 
                      : 'border border-gray-200'
                  } rounded-lg overflow-hidden`}
                  onClick={() => {
                    setSelectedPrompt(index);
                    setSelectedPose(prompt.poses[0] || '');
                    setSelectedAdditions([]);
                    setSelectedRemovals([]);
                  }}
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {/* Placeholder for character image - in a real app, you'd have preview images */}
                    <div className={`w-full h-full flex items-center justify-center ${
                      selectedPrompt === index ? 'bg-blue-50' : 'bg-gray-50'
                    }`}>
                      <Tv className={`w-8 h-8 ${
                        selectedPrompt === index ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                  <div className="p-1 text-center">
                    <p className="text-xs font-medium truncate">{prompt.title.split(' ')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Custom Prompt Addition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Additions (Optional)
            </label>
            <DroppableTextArea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add custom details or modifications to the action figure..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onDrop={handleTokenDrop}
              rows={2}
            />
          </div>
          
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Model
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`py-2 px-4 text-sm rounded ${selectedProvider === 'openai' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('openai')}
              >
                DALL-E 3
              </button>
              <button
                className={`py-2 px-4 text-sm rounded ${selectedProvider === 'gemini' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('gemini')}
              >
                Gemini AI
              </button>
            </div>
          </div>
          
          {/* Reference Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Image (Optional)
            </label>
            <ReferenceImageUploader
              onImageSelected={(url) => setReferenceImage(url)}
              currentImage={referenceImage}
              onClearImage={() => setReferenceImage(null)}
              category="tv-figure"
              showHistory={true}
            />
          </div>
          
          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-xs text-gray-600 hover:text-blue-600 flex items-center"
            >
              <SlidersHorizontal className="w-3 h-3 mr-1" />
              {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
            </button>
            
            {showAdvancedOptions && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-4">
                {/* Accessories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Accessories
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {getCurrentPrompt().additions.map((addition) => (
                      <button
                        key={addition}
                        className={`py-1 px-2 text-xs rounded ${
                          selectedAdditions.includes(addition)
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                        onClick={() => toggleAddition(addition)}
                      >
                        {addition}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Removals */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remove Elements
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {getCurrentPrompt().removals.map((removal) => (
                      <button
                        key={removal}
                        className={`py-1 px-2 text-xs rounded ${
                          selectedRemovals.includes(removal)
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                        onClick={() => toggleRemoval(removal)}
                      >
                        {removal}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Pose Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Figure Pose
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {getCurrentPrompt().poses.map((pose) => (
                      <button
                        key={pose}
                        className={`py-1 px-2 text-xs rounded ${
                          selectedPose === pose
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                        onClick={() => setSelectedPose(pose)}
                      >
                        {pose}
                      </button>
                    ))}
                  </div>
                </div>
                
                {referenceImage && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">
                      <span className="font-medium">Reference Image Active:</span> Your uploaded image will be used as inspiration for the TV show action figure.
                    </p>
                  </div>
                )}
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">TV Show Figure Tip:</span> For best results, choose a character with distinctive features and iconic poses from classic TV shows. The AI will create a toy-like version with authentic packaging.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Show error messages */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleRandomize}
              className="btn btn-outline flex-1 flex items-center justify-center"
              disabled={isGenerating}
            >
              <Dices className="w-4 h-4 mr-2" />
              Randomize
            </button>
            
            <button
              onClick={handleGenerateActionFigure}
              disabled={isGenerating}
              className="btn btn-primary flex-1 flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Figure
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          {/* Preview Image Area */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: "300px" }}>
            {generatedFigure ? (
              <img 
                src={generatedFigure} 
                alt="Generated TV Show Action Figure" 
                className="max-w-full max-h-[400px] object-contain" 
              />
            ) : (
              <div className="text-center p-6">
                <Tv className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your TV show action figure will appear here</p>
              </div>
            )}
          </div>
          
          {/* Download Buttons */}
          {generatedFigure && (
            <div className="flex gap-2">
              <button
                onClick={() => window.open(generatedFigure)}
                className="btn btn-outline flex-1 flex items-center justify-center"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                View Full Size
              </button>

              <a
                href={generatedFigure}
                download="tv-show-action-figure.png"
                className="btn btn-primary flex-1 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </div>
          )}

          {/* Enhanced Image Editor with AI and Classic Options */}
          {generatedFigure && (
            <div className="mt-6 space-y-4">
              <EnhancedImageEditorWithChoice
                imageUrl={generatedFigure}
                onImageUpdated={(newImageUrl) => {
                  setGeneratedFigure(newImageUrl);
                  if (onImageGenerated) {
                    onImageGenerated(newImageUrl);
                  }
                }}
                tokens={tokens}
              />

              {/* Advanced Editing Options */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowSemanticMasking(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <PaintBucket className="w-4 h-4" />
                  Semantic Masking
                </button>
                <button
                  onClick={() => setShowConversationalRefinement(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Conversational Refinement
                </button>
              </div>
            </div>
          )}
          
          {/* Character Info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-2 flex items-center">
              <Box className="w-4 h-4 text-blue-600 mr-1" />
              Selected Character: {getCurrentPrompt().title}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {getCurrentPrompt().basePrompt}
            </p>
            
            <div className="text-xs text-gray-500">
              <p><strong>Packaging:</strong> {getCurrentPrompt().packaging}</p>
            </div>
          </div>
          
          {/* Generated Figure Details */}
          {generatedFigure && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-700 flex items-center mb-2">
                <Sparkles className="w-4 h-4 mr-1" />
                Figure Details
              </h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  TV Character: <span className="font-medium ml-1">{getCurrentPrompt().title}</span>
                </li>
                {selectedPose && (
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Pose: <span className="font-medium ml-1">{selectedPose}</span>
                  </li>
                )}
                {selectedAdditions.length > 0 && (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span>
                    <div>
                      Added accessories: 
                      <span className="font-medium ml-1">{selectedAdditions.join(', ')}</span>
                    </div>
                  </li>
                )}
                {selectedRemovals.length > 0 && (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span>
                    <div>
                      Removed elements: 
                      <span className="font-medium ml-1">{selectedRemovals.join(', ')}</span>
                    </div>
                  </li>
                )}
                {tokens['FIRSTNAME'] && (
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Personalized for: <span className="font-medium ml-1">{tokens['FIRSTNAME']}</span>
                  </li>
                )}
                {referenceImage && (
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Using reference image for inspiration
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* TV Show Nostalgia Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 flex items-center mb-2">
              <Lightbulb className="w-4 h-4 mr-1" />
              TV Show Action Figures
            </h4>
            <p className="text-sm text-blue-700">
              TV show action figures have been hugely popular collectibles since the 1980s, with iconic toy lines featuring stars from sitcoms, dramas, and animated series. These figures featured authentic outfits, signature props, and packaging that referenced the shows.
            </p>
          </div>
        </div>
      </div>

      {/* Semantic Masking Editor */}
      {showSemanticMasking && generatedFigure && (
        <SemanticMaskingEditor
          imageUrl={generatedFigure}
          onEditComplete={(editedUrl) => {
            setGeneratedFigure(editedUrl);
            if (onImageGenerated) {
              onImageGenerated(editedUrl);
            }
            setShowSemanticMasking(false);
          }}
          onClose={() => setShowSemanticMasking(false)}
        />
      )}

      {/* Conversational Refinement Panel */}
      {showConversationalRefinement && generatedFigure && (
        <div className="mt-6">
          <ConversationalRefinementPanel
            initialImageUrl={generatedFigure}
            onImageUpdated={(imageUrl) => {
              setGeneratedFigure(imageUrl);
              if (onImageGenerated) {
                onImageGenerated(imageUrl);
              }
            }}
            onClose={() => setShowConversationalRefinement(false)}
          />
        </div>
      )}
    </div>
  );
};

export default TVShowActionFigureGenerator;
export { TVShowActionFigureGenerator };