import React, { useState, useEffect } from 'react';
import { Wand2, Image as ImageIcon, Download, RefreshCw, Zap, Sparkles, SlidersHorizontal, Lightbulb, Dices } from 'lucide-react';
import { generateGhibliStyleImage } from '../utils/api';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';
import DroppableInput from './DroppableInput';
import ReferenceImageUploader from './ReferenceImageUploader';

interface GhibliImageGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const GhibliImageGenerator: React.FC<GhibliImageGeneratorProps> = ({ tokens, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('gemini');
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [sceneType, setSceneType] = useState<string>('nature');
  const [characterType, setCharacterType] = useState<string>('human');
  const [timeOfDay, setTimeOfDay] = useState<string>('day');
  const [weatherEffect, setWeatherEffect] = useState<string>('clear');
  const [includePersonalization, setIncludePersonalization] = useState(true);
  const [customCharacterName, setCustomCharacterName] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Scene type options
  const sceneOptions = [
    'Nature Landscape', 'Small Town', 'Magical Forest', 
    'Ocean View', 'Floating Castle', 'Mountain Village', 
    'Train Journey', 'Countryside', 'Ancient Temple'
  ];

  // Character type options
  const characterOptions = [
    'Human Child', 'Human Adult', 'Magical Creature', 
    'Spirit', 'Animal Companion', 'Transformed Being',
    'Forest Spirit', 'Witch/Wizard', 'None'
  ];

  // Time of day options
  const timeOptions = [
    'Dawn', 'Day', 'Sunset', 'Night', 'Magical Hour'
  ];

  // Weather effect options
  const weatherOptions = [
    'Clear Sky', 'Gentle Rain', 'Heavy Storm', 
    'Falling Leaves', 'Cherry Blossoms', 'Snow', 
    'Magical Particles', 'Foggy'
  ];

  // Ghibli elements that can be added to images
  const ghibliElementsOptions = [
    { name: 'Magic Dust', icon: <Sparkles className="w-3 h-3" /> },
    { name: 'Wind Swirls', icon: <Wind className="w-3 h-3" /> },
    { name: 'Floating Islands', icon: <Cloud className="w-3 h-3" /> },
    { name: 'Gentle Creatures', icon: <Leaf className="w-3 h-3" /> },
    { name: 'Mysterious Shadows', icon: <Droplets className="w-3 h-3" /> },
    { name: 'Glowing Plants', icon: <Sun className="w-3 h-3" /> },
    { name: 'Ancient Ruins', icon: <Mountain className="w-3 h-3" /> },
    { name: 'Lanterns', icon: <Lightbulb className="w-3 h-3" /> },
  ];
  
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
    
    // Create scene description
    let sceneDescription = sceneType.toLowerCase();
    
    // Add weather and time of day
    sceneDescription += ` during ${timeOfDay.toLowerCase()}`;
    if (weatherEffect.toLowerCase() !== 'clear sky') {
      sceneDescription += ` with ${weatherEffect.toLowerCase()}`;
    }
    
    // Add character if not "None"
    let characterDescription = '';
    if (characterType.toLowerCase() !== 'none') {
      characterDescription = characterName 
        ? `featuring ${characterName} as a ${characterType.toLowerCase()}`
        : `featuring a ${characterType.toLowerCase()}`;
    }
    
    // Add Ghibli elements
    let elementsDescription = '';
    if (selectedGhibliElements.length > 0) {
      elementsDescription = ` with ${selectedGhibliElements.join(', ')}`;
    }
    
    // Build final prompt
    const basePrompt = `A Studio Ghibli style illustration of a ${sceneDescription}${
      characterDescription ? ', ' + characterDescription : ''
    }${elementsDescription}. The image should capture the whimsical, magical atmosphere characteristic of Hayao Miyazaki's films, with soft colors, detailed backgrounds, and a sense of wonder.`;
    
    setPrompt(basePrompt);
    return basePrompt;
  };

  const generateRandomPrompt = () => {
    // Randomly select options
    const randomScene = sceneOptions[Math.floor(Math.random() * sceneOptions.length)];
    const randomCharacter = characterOptions[Math.floor(Math.random() * characterOptions.length)];
    const randomTime = timeOptions[Math.floor(Math.random() * timeOptions.length)];
    const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    
    // Randomly select 1-3 Ghibli elements
    const numElements = Math.floor(Math.random() * 3) + 1;
    const shuffledElements = [...ghibliElementsOptions]
      .map(item => item.name)
      .sort(() => 0.5 - Math.random());
    const selectedElements = shuffledElements.slice(0, numElements);
    
    // Update state
    setSceneType(randomScene);
    setCharacterType(randomCharacter);
    setTimeOfDay(randomTime);
    setWeatherEffect(randomWeather);
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

  // Example Ghibli-style prompts for inspiration
  const examplePrompts = [
    "A young girl standing on a grassy hill overlooking a small town, with a gentle wind blowing her hair and magical dust particles floating in the air",
    "A magical forest with glowing plants, strange forest spirits, and a mysterious abandoned shrine",
    "A seaside town with boats bobbing in the harbor, laundry hanging between buildings, and a flying castle in the distance",
    "A steam-powered flying machine soaring through clouds during sunset, with a young adventurer at the controls",
    "A child and a large, furry forest spirit sleeping under a massive tree with stars twinkling above"
  ];

  const getStyleTip = () => {
    switch(selectedProvider) {
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
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Studio Ghibli Style Image Generator</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Description
            </label>
            <div className="relative">
              <DroppableTextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the Ghibli-style scene you want to create..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]"
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
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                AI Model
              </label>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-xs text-gray-600 hover:text-primary-600 flex items-center"
              >
                <SlidersHorizontal className="w-3 h-3 mr-1" />
                {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                className={`py-2 px-4 text-sm rounded ${selectedProvider === 'gemini' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('gemini')}
              >
                Gemini AI
              </button>
              <button
                className={`py-2 px-4 text-sm rounded ${selectedProvider === 'openai' 
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
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
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Ghibli Inspiration</h4>
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
            className="btn btn-primary w-full flex justify-center items-center"
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
            <div className="flex gap-2">
              <button
                onClick={() => window.open(generatedImage)}
                className="btn btn-outline flex-1 flex items-center justify-center"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                View Full Size
              </button>
              
              <a
                href={generatedImage}
                download="ghibli-image.png"
                className="btn btn-primary flex-1 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
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
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 flex items-center mb-2">
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
    </div>
  );
};

export default GhibliImageGenerator;
export { GhibliImageGenerator };

// Dummy Wind Component for ghibliElementsOptions
const Wind = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>;

// Dummy Cloud Component for ghibliElementsOptions
const Cloud = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>;

// Dummy Leaf Component for ghibliElementsOptions
const Leaf = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;

// Dummy Droplets Component for ghibliElementsOptions
const Droplets = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M7 16.3c2.2 0 4-1.8 4-4a4 4 0 0 0-4-4c-2.3 0-4 1.8-4 4a4 4 0 0 0 4 4Z"/><path d="M7 16.3c-1.3 0-2.4-.5-3-1.3"/><path d="M17 11.8c1.3 0 2.4-.5 3-1.2"/><path d="M17 11.8c-2.2 0-4-1.8-4-4a4 4 0 0 1 4-4c2.2 0 4 1.8 4 4a4 4 0 0 1-4 4Z"/></svg>;

// Dummy Sun Component for ghibliElementsOptions
const Sun = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;

// Dummy Mountain Component for ghibliElementsOptions
const Mountain = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>;