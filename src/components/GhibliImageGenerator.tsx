import React, { useState, useEffect } from 'react';
import { Wand2, Image as ImageIcon, Download, RefreshCw, Zap, Sparkles, SlidersHorizontal, Lightbulb, Dices, Shapes } from 'lucide-react';
import { generateGhibliStyleImage, generateImageWithGeminiNano } from '../utils/api';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';
import DroppableInput from './DroppableInput';
import ReferenceImageUploader from './ReferenceImageUploader';
import EnhancedImageEditorWithChoice from './EnhancedImageEditorWithChoice';
import UniversalPersonalizationPanel from './UniversalPersonalizationPanel';
import ghibliConfig from '../data/ghibliStyles';
import { DESIGN_SYSTEM, getGridClasses, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';

interface GhibliImageGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const GhibliImageGenerator: React.FC<GhibliImageGeneratorProps> = ({ tokens, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'gemini-nano'>('gemini-nano');
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [sceneType, setSceneType] = useState<string>('nature');
  const [characterType, setCharacterType] = useState<string>('human');
  const [timeOfDay, setTimeOfDay] = useState<string>('day');
  const [weatherEffect, setWeatherEffect] = useState<string>('clear');
  const [includePersonalization, setIncludePersonalization] = useState(true);
  const [customCharacterName, setCustomCharacterName] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Personalization panel state
  const [showPersonalizationPanel, setShowPersonalizationPanel] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState('');

  // Use configuration data
  const sceneOptions = ghibliConfig.scenes.map(scene => scene.label);
  const characterOptions = ghibliConfig.characters.map(char => char.label);
  const timeOptions = ghibliConfig.timesOfDay.map(time => time.label);
  const weatherOptions = ghibliConfig.weatherEffects.map(weather => weather.label);

  // Use magical elements from configuration
  const ghibliElementsOptions = ghibliConfig.magicalElements;
  
  const [selectedGhibliElements, setSelectedGhibliElements] = useState<string[]>([]);

  const toggleGhibliElement = (element: string) => {
    if (selectedGhibliElements.includes(element)) {
      setSelectedGhibliElements(selectedGhibliElements.filter(item => item !== element));
    } else {
      setSelectedGhibliElements([...selectedGhibliElements, element]);
    }
  };

  const generatePrompt = () => {
    // Get name for personalization
    let characterName = '';
    if (includePersonalization) {
      characterName = customCharacterName || tokens['FIRSTNAME'] || '';
    }

    // Get scene, character, time, and weather from config
    const sceneData = ghibliConfig.scenes.find(s => s.label === sceneType);
    const characterData = ghibliConfig.characters.find(c => c.label === characterType);
    const timeData = ghibliConfig.timesOfDay.find(t => t.label === timeOfDay);
    const weatherData = ghibliConfig.weatherEffects.find(w => w.label === weatherEffect);

    // Build scene description
    let sceneDescription = sceneData ? sceneData.prompt : sceneType.toLowerCase();

    // Add time of day
    if (timeData) {
      sceneDescription += ` ${timeData.prompt}`;
    }

    // Add character if not "None"
    let characterDescription = '';
    if (characterType.toLowerCase() !== 'none' && characterData) {
      characterDescription = characterName
        ? `, featuring ${characterName} as ${characterData.prompt.substring(characterData.prompt.indexOf('with') + 5)}`
        : `, ${characterData.prompt}`;
    }

    // Add Ghibli elements
    let elementsDescription = '';
    if (selectedGhibliElements.length > 0) {
      const elementPrompts = selectedGhibliElements.map(elementName => {
        const element = ghibliConfig.magicalElements.find(e => e.name === elementName);
        return element ? element.prompt : elementName;
      });
      elementsDescription = ` ${elementPrompts.join(', ')}`;
    }

    // Build final prompt
    const basePrompt = `A Studio Ghibli style illustration of ${sceneDescription}${characterDescription}${elementsDescription}. The image should capture the whimsical, magical atmosphere characteristic of Hayao Miyazaki's films, with soft colors, detailed backgrounds, and a sense of wonder.`;

    setPrompt(basePrompt);
    return basePrompt;
  };

  const generateRandomPrompt = () => {
    // Randomly select options from config
    const randomScene = ghibliConfig.scenes[Math.floor(Math.random() * ghibliConfig.scenes.length)];
    const randomCharacter = ghibliConfig.characters[Math.floor(Math.random() * ghibliConfig.characters.length)];
    const randomTime = ghibliConfig.timesOfDay[Math.floor(Math.random() * ghibliConfig.timesOfDay.length)];
    const randomWeather = ghibliConfig.weatherEffects[Math.floor(Math.random() * ghibliConfig.weatherEffects.length)];

    // Randomly select 1-3 Ghibli elements
    const numElements = Math.floor(Math.random() * 3) + 1;
    const shuffledElements = [...ghibliConfig.magicalElements]
      .sort(() => 0.5 - Math.random());
    const selectedElements = shuffledElements.slice(0, numElements).map(e => e.name);

    // Update state
    setSceneType(randomScene.label);
    setCharacterType(randomCharacter.label);
    setTimeOfDay(randomTime.label);
    setWeatherEffect(randomWeather.label);
    setSelectedGhibliElements(selectedElements);

    // Generate and set the prompt with the new random selections
    setTimeout(() => {
      const newPrompt = generatePrompt();
      setPrompt(newPrompt);
    }, 100);
  };

  const handleGenerateImage = async () => {
    if (!prompt) {
      const newPrompt = generatePrompt();
      if (!newPrompt) {
        setError('Please enter a prompt or generate one using the options below.');
        return;
      }
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      const finalPrompt = prompt || generatePrompt();
      console.log(`🌟 Generating Ghibli-style image with ${selectedProvider}:`, { 
        finalPrompt, 
        hasReferenceImage: !!referenceImage
      });
      
      const imageUrl = await generateGhibliStyleImage(finalPrompt, selectedProvider, referenceImage || undefined);
      console.log('✅ Successfully generated Ghibli-style image');
      
      setGeneratedImage(imageUrl);
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }
    } catch (err) {
      console.error('❌ Failed to generate Ghibli-style image:', err);
      let errorMessage = 'Failed to generate Ghibli-style image: ';
      
      if (err instanceof Error) {
        errorMessage += err.message;
      } else if (typeof err === 'string') {
        errorMessage += err;
      } else {
        errorMessage += 'Unknown error';
      }
      
      setError(errorMessage);
      
      // Provide a more helpful error message for common issues
      if (errorMessage.includes('400')) {
        setError(`${errorMessage}. This may be due to an invalid API key or a problem with the prompt content.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Create the prompt based on the selected options
  useEffect(() => {
    if (sceneType && characterType) {
      generatePrompt();
    }
  }, [sceneType, characterType, timeOfDay, weatherEffect, selectedGhibliElements, includePersonalization, customCharacterName, tokens]);

  // Example Ghibli-style prompts from configuration
  const examplePrompts = ghibliConfig.scenes.slice(0, 5).map(scene =>
    `A Studio Ghibli style ${scene.prompt.toLowerCase()}`
  );

  const getStyleTip = () => {
    switch(selectedProvider) {
      case 'gemini-nano':
        return "Gemini Nano is optimized for speed and efficiency while maintaining excellent Ghibli-style quality.";
      case 'gemini':
        return "Gemini AI is excellent at capturing the painterly quality and detailed backgrounds of Ghibli films.";
      case 'openai':
        return "DALL-E 3 can create excellent Ghibli-inspired scenes with detailed instructions.";
      default:
        return "Each model has different strengths for Ghibli-style imagery.";
    }
  };
  
  // Handle token drop on the prompt textarea
  const handleTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = prompt.substring(0, position) + 
                  item.tokenDisplay + 
                  prompt.substring(position);
    setPrompt(newText);
  };

  return (
    <div className={DESIGN_SYSTEM.components.section}>
      <h3 className={commonStyles.sectionHeader}>Studio Ghibli Style Image Generator</h3>

      <div className={getGridClasses(2)}>
        <div className="space-y-4">
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.formLabel}>
              Image Description
            </label>
            <div className="relative">
              <DroppableTextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the Ghibli-style scene you want to create..."
                className={DESIGN_SYSTEM.components.textarea}
                onDrop={handleTokenDrop}
              />
              <button
                onClick={generateRandomPrompt}
                className="absolute bottom-2 right-2 p-1 text-gray-500 hover:text-primary-600 bg-white rounded"
                title="Generate random Ghibli scene"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className={commonStyles.formGroup}>
            <div className={commonStyles.actionBar}>
              <label className={commonStyles.formLabel}>
                AI Model
              </label>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPersonalizationPanel(!showPersonalizationPanel)}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center"
                >
                  <Shapes className="w-3 h-3 mr-1" />
                  {showPersonalizationPanel ? "Hide" : "Show"} Personalization
                </button>
                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-xs text-gray-600 hover:text-primary-600 flex items-center"
                >
                  <SlidersHorizontal className="w-3 h-3 mr-1" />
                  {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                className={`py-2 px-3 text-xs rounded ${selectedProvider === 'gemini-nano'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('gemini-nano')}
              >
                Gemini Nano
              </button>
              <button
                className={`py-2 px-3 text-xs rounded ${selectedProvider === 'gemini'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('gemini')}
              >
                Gemini AI
              </button>
              <button
                className={`py-2 px-3 text-xs rounded ${selectedProvider === 'openai'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('openai')}
              >
                DALL-E 3
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{getStyleTip()}</p>
          </div>

          {/* Reference Image Upload */}
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.formLabel}>
              Reference Image (Optional)
            </label>
            <ReferenceImageUploader
              onImageSelected={(url) => setReferenceImage(url)}
              currentImage={referenceImage}
              onClearImage={() => setReferenceImage(null)}
              category="ghibli-style"
              showHistory={true}
            />
          </div>
          
          {showAdvancedOptions && (
            <div className={`${DESIGN_SYSTEM.components.panel} ${commonStyles.contentArea}`}>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="personalizeCheck"
                  checked={includePersonalization}
                  onChange={(e) => setIncludePersonalization(e.target.checked)}
                  className="rounded text-primary-600"
                />
                <label htmlFor="personalizeCheck" className="text-sm text-gray-700">
                  Include personalized character
                </label>
              </div>

              {includePersonalization && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Character Name
                  </label>
                  <DroppableInput
                    type="text"
                    value={customCharacterName}
                    onChange={(e) => setCustomCharacterName(e.target.value)}
                    placeholder={tokens['FIRSTNAME'] || "Custom character name"}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onDrop={(item, position) => {
                      const newText = customCharacterName.substring(0, position) + 
                                    item.tokenDisplay + 
                                    customCharacterName.substring(position);
                      setCustomCharacterName(newText);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use the first name from personalization tokens: {tokens['FIRSTNAME'] || "Not set"}
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scene Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {sceneOptions.map((scene) => (
                    <button
                      key={scene}
                      className={`py-2 px-3 text-xs rounded ${
                        sceneType === scene
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setSceneType(scene)}
                    >
                      {scene}
                    </button>
                  ))}
                </div>
              </div>
              
              {includePersonalization && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Character Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {characterOptions.map((character) => (
                      <button
                        key={character}
                        className={`py-2 px-3 text-xs rounded ${
                          characterType === character
                            ? 'bg-primary-100 text-primary-700 border border-primary-300'
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                        onClick={() => setCharacterType(character)}
                      >
                        {character}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time of Day
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {timeOptions.map((time) => (
                    <button
                      key={time}
                      className={`py-2 px-3 text-xs rounded ${
                        timeOfDay === time
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setTimeOfDay(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weather/Atmosphere
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {weatherOptions.map((weather) => (
                    <button
                      key={weather}
                      className={`py-2 px-3 text-xs rounded ${
                        weatherEffect === weather
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setWeatherEffect(weather)}
                    >
                      {weather}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghibli Elements
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ghibliElementsOptions.map((element) => (
                    <button
                      key={element.name}
                      className={`py-2 px-2 text-xs rounded flex items-center justify-center ${
                        selectedGhibliElements.includes(element.name)
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => toggleGhibliElement(element.name)}
                    >
                      {element.icon}
                      <span className="ml-1">{element.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {referenceImage && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs text-green-700">
                    <span className="font-medium">Reference Image Active:</span> Your uploaded image will influence the generated Ghibli-style illustration. The AI will incorporate elements and inspiration from your reference.
                  </p>
                </div>
              )}
              
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-700">
                  <span className="font-medium">Ghibli Style Tip:</span> Studio Ghibli is known for its attention to detail, magical realism, and vivid environments. Focus on creating whimsical scenes with rich backgrounds and emotional depth.
                </p>
              </div>
            </div>
          )}
          
          {error && (
            <div className={getAlertClasses('error')}>
              {error}
            </div>
          )}

          <div className={DESIGN_SYSTEM.components.panel}>
            <h4 className={DESIGN_SYSTEM.typography.h4}>Ghibli Inspiration</h4>
            <div className="space-y-2">
              {examplePrompts.map((example, index) => (
                <div key={index} className="text-xs p-2 bg-white rounded border border-gray-200 flex justify-between">
                  <p className="text-gray-600">{example}</p>
                  <button 
                    className="text-primary-600 hover:text-primary-800 ml-2 flex-shrink-0"
                    onClick={() => setPrompt(example)}
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className={getButtonClasses('primary')}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Creating Ghibli Magic...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Ghibli-Style Image
              </>
            )}
          </button>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: "300px" }}>
            {generatedImage ? (
              <img 
                src={generatedImage} 
                alt="Generated Ghibli-Style Image" 
                className="max-w-full max-h-[400px] object-contain" 
              />
            ) : (
              <div className="text-center p-6">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your Ghibli-inspired image will appear here</p>
              </div>
            )}
          </div>
          
          {generatedImage && (
            <div className={commonStyles.buttonGroup}>
              <button
                onClick={() => window.open(generatedImage)}
                className={getButtonClasses('secondary')}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                View Full Size
              </button>

              <a
                href={generatedImage}
                download="ghibli-image.png"
                className={getButtonClasses('primary')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </div>
          )}

          {/* Enhanced Image Editor with AI and Classic Options */}
          {generatedImage && (
            <div className="mt-6">
              <EnhancedImageEditorWithChoice
                imageUrl={generatedImage}
                onImageUpdated={(newImageUrl) => {
                  setGeneratedImage(newImageUrl);
                  if (onImageGenerated) {
                    onImageGenerated(newImageUrl);
                  }
                }}
                tokens={tokens}
              />
            </div>
          )}
          
          {generatedImage && (
            <div className="bg-primary-50 p-4 rounded-lg">
              <h4 className="font-medium text-primary-700 flex items-center mb-2">
                <Sparkles className="w-4 h-4 mr-1" />
                Ghibli Style Features
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                This image has been personalized with Ghibli-style elements:
              </p>
              <ul className="text-sm space-y-1">
                {includePersonalization && tokens['FIRSTNAME'] && (
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                    Character name: <span className="font-medium ml-1">{customCharacterName || tokens['FIRSTNAME']}</span>
                  </li>
                )}
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Scene: <span className="font-medium ml-1">{sceneType}</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Time: <span className="font-medium ml-1">{timeOfDay}</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Weather: <span className="font-medium ml-1">{weatherEffect}</span>
                </li>
                {selectedGhibliElements.length > 0 && (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 mt-1.5"></span>
                    <div>
                      Magical elements: 
                      <span className="font-medium ml-1">{selectedGhibliElements.join(', ')}</span>
                    </div>
                  </li>
                )}
                {referenceImage && (
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                    Custom reference image used
                  </li>
                )}
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                This Ghibli-style image is perfect for storytelling, marketing materials, or social media content with a touch of magic.
              </p>
            </div>
          )}
          
          <div className={`${DESIGN_SYSTEM.colors.info[50]} p-4 rounded-lg`}>
            <h4 className={`${DESIGN_SYSTEM.typography.h4} text-blue-700 flex items-center mb-2`}>
              <Lightbulb className="w-4 h-4 mr-1" />
              About Studio Ghibli Style
            </h4>
            <p className="text-sm text-blue-700">
              Studio Ghibli films are known for their distinctive visual style featuring:
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc pl-4">
              <li>Detailed, hand-painted backgrounds with rich textures</li>
              <li>Vibrant natural environments with meticulous attention to detail</li>
              <li>Whimsical characters with simplified facial features</li>
              <li>Magical elements blended seamlessly into ordinary settings</li>
              <li>Strong environmental themes and connection to nature</li>
              <li>Atmospheric lighting and weather effects</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Universal Personalization Panel */}
      {showPersonalizationPanel && (
        <div className="mt-6">
          <UniversalPersonalizationPanel
            initialContent={prompt || generatePrompt()}
            initialContentType="prompt-ai"
            onContentGenerated={(content, type) => {
              setPrompt(content);
              setPersonalizedContent(content);
              setShowPersonalizationPanel(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default GhibliImageGenerator;
export { GhibliImageGenerator };
