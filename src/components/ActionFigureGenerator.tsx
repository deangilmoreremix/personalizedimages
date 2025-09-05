import React, { useState, useEffect, useRef } from 'react';
import { Wand2, Image as ImageIcon, Download, RefreshCw, Zap, Camera, Layers, Sparkles, SlidersHorizontal, Lightbulb, Dices, Upload, Box, ChevronDown, ChevronUp, History } from 'lucide-react';
import { generateActionFigure } from '../utils/api';
import DroppableTextArea from './DroppableTextArea';
import { TokenDragItem } from '../types/DragTypes';
import ReferenceImageUploader from './ReferenceImageUploader';

interface ActionFigureGeneratorProps {
  tokens: Record<string, string>;
  onImageGenerated: (imageUrl: string) => void;
}

const ActionFigureGenerator: React.FC<ActionFigureGeneratorProps> = ({ tokens, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedFigure, setGeneratedFigure] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai');
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [figureStyle, setFigureStyle] = useState<string>('realistic');
  const [figureTheme, setFigureTheme] = useState<string>('superhero');
  const [figureAccessories, setFigureAccessories] = useState<string[]>([]);
  const [customName, setCustomName] = useState('');
  const [selectedStyleOption, setSelectedStyleOption] = useState(0); // Track selected style from dropdown
  const [showAllStyles, setShowAllStyles] = useState(false); // Control visibility of all styles
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Example predefined accessories
  const accessoryOptions = [
    'Sword', 'Shield', 'Helmet', 'Cape', 'Armor', 'Staff', 
    'Bow', 'Wand', 'Jetpack', 'Robot Arm', 'Laser Gun', 'Utility Belt'
  ];

  // Example predefined themes
  const themeOptions = [
    'Superhero', 'Fantasy', 'Sci-Fi', 'Post-Apocalyptic', 
    'Steampunk', 'Cyberpunk', 'Medieval', 'Space Explorer'
  ];

  // Full styles array (30 styles total)
  const styles = [
    {
      label: 'AI Collectible Card',
      prompt: `A trading card of a futuristic warrior character, holographic design, stats and abilities listed, glowing edges, inspired by Pokémon/Yu-Gi-Oh, centered with floating pose`,
    },
    {
      label: 'Boxed Toy Mockup',
      prompt: `Ultra-detailed action figure in plastic packaging with logo, price tag, and collector's label, 3D render, dramatic lighting, similar to Hot Toys or Marvel Legends`,
    },
    {
      label: '3D Turntable Character',
      prompt: `A full-body 3D rendered action figure on a spinning turntable base, glossy finish, white studio backdrop, toy store collectible display`,
    },
    {
      label: 'Game Character Selection Screen',
      prompt: `Fighting game character select screen, 6 stylized fighters with portraits, name, health bar, abilities, neon lighting, Mortal Kombat meets Fortnite aesthetic`,
    },
    {
      label: 'Stylized Vinyl Toy',
      prompt: `Cute vinyl figure with oversized head and tiny body, clean plastic style, standing on display base, inspired by Funko Pop and Kubrick toys, bright studio lighting`,
    },
    {
      label: 'Mecha Figure (Gundam Style)',
      prompt: `Robotic action figure with mechanical joints and weapons, painted armor, posed like a Gundam model kit, 3D render with dramatic shadows`,
    },
    {
      label: 'Fashion Figure Doll',
      prompt: `Barbie-style fashion doll in pastel packaging, sparkles and accessories, posed with stylish outfit and shoes, pink store shelf background`,
    },
    {
      label: 'Superhero Toy Series',
      prompt: `Superhero action figure posed inside a branded collector's box, dramatic comic book shading, cape and muscle suit, "Limited Edition" sticker included`,
    },
    {
      label: 'Fictional Brand Mascot',
      prompt: `Cartoon-style brand mascot character, oversized features, posed like a collectible figure, bright colors, inspired by Kool-Aid Man and Michelin Man`,
    },
    {
      label: 'Cereal Box Character Design',
      prompt: `Retro cereal box with cartoon mascot in front, name of cereal in bold letters, colorful sugary background, '90s kid marketing style`,
    },
    {
      label: 'Arcade Prize Wall Toy',
      prompt: `Plastic action figure hanging on arcade prize wall, neon lighting, other toys blurred in background, claw machine or ticket redemption booth setting`,
    },
    {
      label: 'Fake Retro Console Game Box',
      prompt: `Old-school video game box with pixel-style artwork, fake game title, Sega Genesis or SNES cartridge visible, '90s nostalgia aesthetic`,
    },
    {
      label: 'Villain Collectors Pack',
      prompt: `Evil villain action figure in sharp armor with red eyes, boxed packaging labeled "Nemesis Series," dark lighting with glowing elements`,
    },
    {
      label: 'Character Arcade Poster',
      prompt: `Arcade splash poster with fighting character in dynamic pose, "Insert Coin" text, neon FX, motion lines, vintage Street Fighter style`,
    },
    {
      label: 'Fantasy Miniature Box Set',
      prompt: `Dungeons & Dragons style miniatures posed inside boxed set, stone bases and fantasy weapons, branded as "Heroic Legends Collection"`,
    },
    {
      label: 'Mad Scientist Experiment',
      prompt: `Weird creature in glowing containment tube, mutant hybrid experiment, hazmat label, background: secret lab with test equipment`,
    },
    {
      label: 'Food-Themed Fighter',
      prompt: `Action figure designed like a food item with weapon and attitude, packaging styled like fast food branding, vibrant and absurd`,
    },
    {
      label: '8-Bit Pixel Action Sprite',
      prompt: `8-bit pixel character sprite standing on a CRT monitor screen, old-school arcade vibes`,
    },
    {
      label: 'Alien Species Exhibit',
      prompt: `Strange alien figure displayed in a museum-style glass case, label includes species name and danger level, sci-fi background like a spaceship`,
    },
    {
      label: 'Zombie Survival Kit',
      prompt: `Zombie apocalypse survivor action figure with backpack, weapons, and gear, dusty packaging marked "Doomsday Edition," post-apocalyptic backdrop`,
    },
    {
      label: 'Mythical Creatures Diorama',
      prompt: `Stylized mythological creature posed in a detailed mini-diorama (e.g. forest, cave), dragon or minotaur figure with nameplate`,
    },
    {
      label: 'Heaven vs Hell Series',
      prompt: `Two-pack of angelic and demonic action figures, metallic and red foil packaging, "The Eternal Battle Begins" tagline`,
    },
    {
      label: 'Time Traveler Pack',
      prompt: `Action figure with steampunk goggles, ancient scrolls, and futuristic weapons, packaging includes gears and time travel portal`,
    },
    {
      label: 'Magic School Starter Kit',
      prompt: `School of wizardry figure in student robe, wand and books included, boxed with spell cards and fake "Year 1" badge, Harry Potter parody style`,
    },
    {
      label: 'Fake Celebrity Action Figure',
      prompt: `Stylized action figure of a fictional pop star with glitter mic, shades, branded stage accessories, fan club badge included, viral pop culture look`,
    },
    {
      label: 'Monster Mashup Mutant',
      prompt: `Hybrid creature combining multiple animal features, glowing weapon accessories, packaged in radioactive-looking collector's box`,
    },
    {
      label: 'Wrestling Superstar Toy',
      prompt: `Wrestling action figure posed in a ring-style box, complete with entrance robe and title belt, background: cheering crowd, packaging says "WrestleMaster Champion Series"`,
    },
    {
      label: 'Haunted House Figurine',
      prompt: `Ghostly character figure with glow-in-the-dark effects, standing in front of a haunted mansion background, spooky packaging with cobwebs, Halloween-themed toy design`,
    },
    {
      label: 'Cyberpunk Hacker Kit',
      prompt: `Futuristic hacker action figure with glowing keyboard, visor, and USB gadgets, boxed in a neon-accented tech case, background: digital city skyline`,
    },
    {
      label: 'Kaiju Monster Battle Pack',
      prompt: `Giant Kaiju creature with destructive pose, broken buildings in packaging background, labeled "Monster Clash Edition," styled like Godzilla toys`,
    },
  ];

  // Example predefined styles (simplified list from the 30 styles)
  const styleOptions = [
    { value: 'realistic', label: 'Realistic' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'digital-art', label: '3D Render' },
    { value: 'sketch', label: 'Sketch' },
    { value: 'anime', label: 'Anime' },
    { value: 'illustration', label: 'Illustration' }
  ];

  useEffect(() => {
    // Initialize with first template
    if (styles.length > 0) {
      setSelectedStyleOption(0);
    }
  }, []);

  const toggleAccessory = (accessory: string) => {
    if (figureAccessories.includes(accessory)) {
      setFigureAccessories(figureAccessories.filter(item => item !== accessory));
    } else {
      setFigureAccessories([...figureAccessories, accessory]);
    }
  };

  const generatePrompt = () => {
    // Apply personalization from tokens
    const name = tokens['FIRSTNAME'] || customName || 'the character';
    
    let accessories = '';
    if (figureAccessories.length > 0) {
      accessories = ` with ${figureAccessories.join(', ')}`;
    }
    
    // If we're using a style from the dropdown, use that prompt
    if (selectedStyleOption !== null && styles[selectedStyleOption]) {
      const stylePrompt = styles[selectedStyleOption].prompt;
      const personalizedPrompt = `${stylePrompt.replace('character', name)}${accessories}, action figure, detailed, professional product shot, toy photography, 8k resolution, dramatic lighting, photorealistic rendering`;
      setPrompt(personalizedPrompt);
      return personalizedPrompt;
    } else {
      // Fallback to the original prompt construction
      const basePrompt = `A highly detailed ${figureStyle.toLowerCase()} style action figure of ${name} in a ${figureTheme.toLowerCase()} theme${accessories}. The figure should have realistic details, joints, packaging, and accessories like a real commercial toy product. Professional toy photography style, high resolution.`;
      setPrompt(basePrompt);
      return basePrompt;
    }
  };

  const generateRandomPrompt = () => {
    // Select a random style from the full styles array
    const randomStyleIndex = Math.floor(Math.random() * styles.length);
    setSelectedStyleOption(randomStyleIndex);
    
    // Select random accessories
    const randomAccessories = [];
    
    // Pick 1-3 random accessories
    const numAccessories = Math.floor(Math.random() * 3) + 1;
    const shuffledAccessories = [...accessoryOptions].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numAccessories; i++) {
      randomAccessories.push(shuffledAccessories[i]);
    }
    
    setFigureAccessories(randomAccessories);
    
    // Generate and set the prompt with the new random selections
    setTimeout(() => {
      const newPrompt = generatePrompt();
      setPrompt(newPrompt);
    }, 100);
  };

  const handleGenerateActionFigure = async () => {
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
      console.log(`🤖 Generating action figure with ${selectedProvider}:`, { 
        prompt: finalPrompt,
        hasReferenceImage: !!referenceImage
      });
      
      const imageUrl = await generateActionFigure(finalPrompt, selectedProvider, referenceImage || undefined);
      console.log('✅ Successfully generated action figure');
      
      setGeneratedFigure(imageUrl);
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }
    } catch (err) {
      console.error('❌ Failed to generate action figure:', err);
      setError(`Failed to generate action figure: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Fallback to a placeholder image for better UX
      const placeholderUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.substring(0, 30))}/800/800`;
      setGeneratedFigure(placeholderUrl);
      if (onImageGenerated) {
        onImageGenerated(placeholderUrl);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Create the prompt based on the selected options
  useEffect(() => {
    if (styles.length > 0 || (figureStyle && figureTheme)) {
      generatePrompt();
    }
  }, [selectedStyleOption, figureStyle, figureTheme, figureAccessories, tokens, customName]);
  
  // Handle token drop on the prompt textarea
  const handleTokenDrop = (item: TokenDragItem, position: number) => {
    const newText = prompt.substring(0, position) + 
                  item.tokenDisplay + 
                  prompt.substring(position);
    setPrompt(newText);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">AI Action Figure Generator</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Figure Description
            </label>
            <div className="relative">
              <DroppableTextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the action figure you want to create..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]"
                onDrop={handleTokenDrop}
              />
              <button
                onClick={generateRandomPrompt}
                className="absolute bottom-2 right-2 p-1 text-gray-500 hover:text-primary-600 bg-white rounded"
                title="Generate random action figure concept"
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
                className={`py-2 px-4 text-sm rounded ${selectedProvider === 'openai' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedProvider('openai')}
              >
                DALL-E 3
              </button>
              <button
                className={`py-2 px-4 text-sm rounded ${selectedProvider === 'gemini' 
                  ? 'bg-primary-600 text-white' 
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
              category="action-figure"
              showHistory={true}
            />
          </div>
          
          {showAdvancedOptions && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Character Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={tokens['FIRSTNAME'] || "Custom character name"}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use the first name from personalization tokens: {tokens['FIRSTNAME'] || "Not set"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style Type
                </label>
                <select
                  value={selectedStyleOption}
                  onChange={(e) => setSelectedStyleOption(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {/* Display either first 10 styles or all 30 based on showAllStyles state */}
                  {(showAllStyles ? styles : styles.slice(0, 10)).map((style, index) => (
                    <option key={index} value={index}>
                      {style.label}
                    </option>
                  ))}
                </select>

                {!showAllStyles && (
                  <button 
                    onClick={() => setShowAllStyles(true)}
                    className="mt-2 text-xs text-primary-600 hover:underline"
                  >
                    Show all 30 styles
                  </button>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Figure Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {styleOptions.map((style) => (
                    <button
                      key={style.value}
                      className={`py-2 px-3 text-xs rounded ${
                        figureStyle.toLowerCase() === style.value.toLowerCase()
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setFigureStyle(style.value)}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Figure Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {themeOptions.map((theme) => (
                    <button
                      key={theme}
                      className={`py-2 px-3 text-xs rounded ${
                        figureTheme.toLowerCase() === theme.toLowerCase()
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setFigureTheme(theme)}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accessories & Features
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {accessoryOptions.map((accessory) => (
                    <button
                      key={accessory}
                      className={`py-2 px-3 text-xs rounded ${
                        figureAccessories.includes(accessory)
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => toggleAccessory(accessory)}
                    >
                      {accessory}
                    </button>
                  ))}
                </div>
              </div>

              {referenceImage && (
                <div className="p-3 bg-green-50 rounded-lg text-xs text-green-700">
                  <p className="font-medium">Reference Image Active:</p>
                  <p>Your uploaded image will be used as inspiration when creating your action figure. The AI will incorporate elements from your reference.</p>
                </div>
              )}
              
              <div className="p-3 bg-yellow-50 rounded-lg text-xs text-yellow-800">
                <p className="font-medium">Tip:</p>
                <p>For best results, choose a style that complements your theme. For example, "3D Rendered" works well with "Sci-Fi" themes, while "Vintage Action Figure" pairs nicely with "Superhero" themes.</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={handleGenerateActionFigure}
            disabled={isGenerating}
            className="btn btn-primary w-full flex justify-center items-center"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Action Figure...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Action Figure
              </>
            )}
          </button>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: "300px" }}>
            {generatedFigure ? (
              <img 
                src={generatedFigure} 
                alt="Generated Action Figure" 
                className="max-w-full max-h-[400px] object-contain" 
              />
            ) : (
              <div className="text-center p-6">
                <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your action figure will appear here</p>
              </div>
            )}
          </div>
          
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
                download="action-figure.png"
                className="btn btn-primary flex-1 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </div>
          )}
          
          {generatedFigure && (
            <div className="bg-primary-50 p-4 rounded-lg">
              <h4 className="font-medium text-primary-700 flex items-center mb-2">
                <Sparkles className="w-4 h-4 mr-1" />
                Personalization Features
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                This image has been personalized with:
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Character name: <span className="font-medium ml-1">{tokens['FIRSTNAME'] || customName || 'Custom'}</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Style: <span className="font-medium ml-1">{styles[selectedStyleOption]?.label || figureStyle}</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Theme: <span className="font-medium ml-1">{figureTheme}</span>
                </li>
                {figureAccessories.length > 0 && (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 mt-1.5"></span>
                    <div>
                      Accessories: 
                      <span className="font-medium ml-1">{figureAccessories.join(', ')}</span>
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
                This action figure image is fully personalized and can be used in email campaigns, social media, or marketing materials.
              </p>
            </div>
          )}

          {/* Style Gallery Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700">Popular Style Previews</h4>
              <button
                onClick={() => setShowAllStyles(!showAllStyles)}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
              >
                {showAllStyles ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                {showAllStyles ? "Show Less" : "Show All 30"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(showAllStyles ? styles : styles.slice(0, 6)).map((style, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-lg cursor-pointer text-center ${
                    selectedStyleOption === index ? 'bg-primary-100 border border-primary-300' : 'bg-white border border-gray-200'
                  }`}
                  onClick={() => setSelectedStyleOption(index)}
                >
                  <div className="text-xs font-medium mb-1 truncate">{style.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg text-xs text-yellow-700">
            <p className="font-medium">Prompt Details:</p>
            <p className="mt-1 whitespace-pre-wrap">{prompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionFigureGenerator;