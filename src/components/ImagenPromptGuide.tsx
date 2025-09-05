import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Book, Sparkles, Camera, PenTool, Palette, Aperture, Compass, Film, Layers, Layout, Type, Grid, Lightbulb } from 'lucide-react';

interface ImagenPromptGuideProps {
  onPromptSelect: (prompt: string) => void;
}

interface PromptExample {
  title: string;
  text: string;
  description: string;
  imageUrl?: string;
}

interface PromptSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  examples: PromptExample[];
}

const ImagenPromptGuide: React.FC<ImagenPromptGuideProps> = ({ onPromptSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const promptSections: PromptSection[] = [
    {
      id: 'basics',
      title: 'Subject, Context, and Style',
      icon: <Book />,
      description: 'A good starting point can be to think of subject, context, and style for your prompt.',
      examples: [
        {
          title: 'Simple Prompt',
          text: 'A park in the spring next to a lake',
          description: 'Basic prompt with minimal details'
        },
        {
          title: 'Added Context',
          text: 'A park in the spring next to a lake, the sun sets across the lake, golden hour',
          description: 'Adds time of day and lighting conditions'
        },
        {
          title: 'Detailed Prompt',
          text: 'A park in the spring next to a lake, the sun sets across the lake, golden hour, red wildflowers',
          description: 'Adds specific visual elements'
        },
        {
          title: 'Short but Effective',
          text: 'close-up photo of a woman in her 20s, street photography, movie still, muted orange warm tones',
          description: 'Concise with specific style elements'
        },
        {
          title: 'Longer Detailed',
          text: 'captivating photo of a woman in her 20s utilizing a street photography style. The image should look like a movie still with muted orange warm tones.',
          description: 'Expanded with more specific instructions'
        }
      ]
    },
    {
      id: 'photography',
      title: 'Photography Modifiers',
      icon: <Camera />,
      description: 'Use photography-specific keywords to control image generation with precision.',
      examples: [
        {
          title: 'Camera Proximity',
          text: 'A close-up photo of coffee beans on a wooden surface',
          description: 'Uses "close-up" to control camera distance'
        },
        {
          title: 'Zoomed Out',
          text: 'A zoomed out photo of a small bag of coffee beans in a messy kitchen',
          description: 'Adds context with wider perspective'
        },
        {
          title: 'Aerial View',
          text: 'aerial photo of urban city with skyscrapers',
          description: 'Specifies camera position from above'
        },
        {
          title: 'View From Below',
          text: 'A photo of a forest canopy with blue skies from below',
          description: 'Specifies camera position from underneath'
        },
        {
          title: 'Lighting (Natural)',
          text: 'studio photo of a modern arm chair, natural lighting',
          description: 'Specifies a soft, natural lighting setup'
        },
        {
          title: 'Lighting (Dramatic)',
          text: 'studio photo of a modern arm chair, dramatic lighting',
          description: 'Creates contrast and mood with lighting'
        },
        {
          title: 'Motion Blur Effect',
          text: 'photo of a city with skyscrapers from the inside of a car with motion blur',
          description: 'Adds dynamic feeling with motion blur'
        },
        {
          title: 'Soft Focus Effect',
          text: 'soft focus photograph of a bridge in an urban city at night',
          description: 'Creates dreamy atmosphere with soft focus'
        },
        {
          title: 'Macro Photography',
          text: 'photo of a leaf, macro lens, 60mm',
          description: 'Extreme close-up with specific lens type'
        },
        {
          title: 'Fisheye Lens',
          text: 'street photography, new york city, fisheye lens',
          description: 'Creates distinctive wide-angle distortion'
        },
        {
          title: 'Polaroid Style',
          text: 'a polaroid portrait of a dog wearing sunglasses',
          description: 'Mimics the distinctive Polaroid look'
        },
        {
          title: 'Black and White',
          text: 'black and white photo of a dog wearing sunglasses',
          description: 'Classic monochrome photography style'
        }
      ]
    },
    {
      id: 'materials',
      title: 'Shapes and Materials',
      icon: <Layers />,
      description: 'Create unique visual concepts by specifying unusual materials and shapes.',
      examples: [
        {
          title: 'Unusual Material',
          text: 'a duffle bag made of cheese',
          description: 'Combines unexpected object and material'
        },
        {
          title: 'Creative Shape',
          text: 'neon tubes in the shape of a bird',
          description: 'Specifies luminous material in distinct shape'
        },
        {
          title: 'Artistic Material',
          text: 'an armchair made of paper, studio photo, origami style',
          description: 'Combines furniture with crafting technique'
        },
        {
          title: 'Liquid Form',
          text: 'a splash of water in the shape of a dancer',
          description: 'Combines fluid dynamics with human form'
        },
        {
          title: 'Natural Elements',
          text: 'a house made entirely of leaves and flowers',
          description: 'Architectural structure from natural materials'
        }
      ]
    },
    {
      id: 'artStyles',
      title: 'Historical Art References',
      icon: <PenTool />,
      description: 'Reference specific art movements to influence the aesthetic style.',
      examples: [
        {
          title: 'Impressionist Style',
          text: 'generate an image in the style of an impressionist painting: a wind farm',
          description: 'Adopts impressionistic brushwork and light'
        },
        {
          title: 'Renaissance Style',
          text: 'generate an image in the style of a renaissance painting: a wind farm',
          description: 'Classical composition with rich details'
        },
        {
          title: 'Pop Art Style',
          text: 'generate an image in the style of pop art: a wind farm',
          description: 'Bold colors and graphic treatment'
        },
        {
          title: 'Art Deco',
          text: 'an art deco poster of a modern electric car',
          description: 'Geometric forms and decorative elements'
        },
        {
          title: 'Cubism',
          text: 'a cubist interpretation of a city skyline',
          description: 'Multiple perspectives shown simultaneously'
        },
        {
          title: 'Surrealism',
          text: 'a surrealist landscape with floating clocks and melting trees',
          description: 'Dreamlike, impossible scenarios'
        },
        {
          title: 'Watercolor',
          text: 'a delicate watercolor painting of mountains at sunrise',
          description: 'Translucent, flowing paint technique'
        }
      ]
    },
    {
      id: 'quality',
      title: 'Image Quality Modifiers',
      icon: <Sparkles />,
      description: 'Add quality keywords to enhance output and signal professional results.',
      examples: [
        {
          title: 'Standard Photo',
          text: 'a photo of a corn stalk',
          description: 'Basic prompt without quality modifiers'
        },
        {
          title: 'Enhanced Photo',
          text: '4K HDR beautiful photo of a corn stalk taken by a professional photographer',
          description: 'Uses multiple quality modifiers'
        },
        {
          title: 'Studio Quality',
          text: 'studio quality portrait of a businessman, well-lit, professional headshot',
          description: 'Professional photography terminology'
        },
        {
          title: 'High Detail',
          text: 'highly detailed illustration of a fantasy castle, intricate details, professional artwork',
          description: 'Emphasizes fine details and craftsmanship'
        },
        {
          title: 'Cinematic',
          text: 'cinematic shot of a car driving through a desert, golden hour, film grain',
          description: 'Film-inspired quality modifiers'
        }
      ]
    },
    {
      id: 'aspectRatio',
      title: 'Aspect Ratios',
      icon: <Layout />,
      description: 'Control image dimensions with specified aspect ratios for different use cases.',
      examples: [
        {
          title: 'Square (1:1)',
          text: 'A professional studio photo of french fries for a high end restaurant, in the style of a food magazine (1:1 aspect ratio)',
          description: 'Perfect for social media posts and profile images'
        },
        {
          title: 'Fullscreen (4:3)',
          text: 'close up of a musician\'s fingers playing the piano, black and white film, vintage (4:3 aspect ratio)',
          description: 'Classic TV and medium format camera ratio'
        },
        {
          title: 'Portrait (3:4)',
          text: 'a woman hiking, close of her boots reflected in a puddle, large mountains in the background, in the style of an advertisement, dramatic angles (3:4 aspect ratio)',
          description: 'Vertical orientation, good for portraits'
        },
        {
          title: 'Widescreen (16:9)',
          text: 'a man wearing all white clothing sitting on the beach, close up, golden hour lighting (16:9 aspect ratio)',
          description: 'Modern widescreen format for video content'
        },
        {
          title: 'Portrait Video (9:16)',
          text: 'a digital render of a massive skyscraper, modern, grand, epic with a beautiful sunset in the background (9:16 aspect ratio)',
          description: 'Vertical format for stories and short-form video'
        }
      ]
    },
    {
      id: 'portraits',
      title: 'Photorealistic Portraits',
      icon: <Aperture />,
      description: 'Create lifelike portrait photography with specialized terminology.',
      examples: [
        {
          title: 'Basic Portrait',
          text: 'A woman, 35mm portrait, blue and grey duotones',
          description: 'Film format with color treatment'
        },
        {
          title: 'Film Noir',
          text: 'A woman, 35mm portrait, film noir',
          description: 'Dramatic shadows and contrast'
        },
        {
          title: 'Environmental Portrait',
          text: 'Portrait of a chef in a busy kitchen, 24mm lens, depth of field',
          description: 'Shows subject in their environment'
        },
        {
          title: 'Character Portrait',
          text: 'Portrait of an elderly fisherman, weathered face, dramatic lighting, 85mm prime lens',
          description: 'Emphasizes character through facial details'
        }
      ]
    },
    {
      id: 'objects',
      title: 'Photorealistic Objects',
      icon: <Grid />,
      description: 'Capture detailed still life and object photography.',
      examples: [
        {
          title: 'Macro Plant',
          text: 'leaf of a prayer plant, macro lens, 60mm',
          description: 'Close-up plant detail with specific lens'
        },
        {
          title: 'Food Photography',
          text: 'a plate of pasta, 100mm Macro lens',
          description: 'Food styling with shallow depth of field'
        },
        {
          title: 'Product Shot',
          text: 'a luxury watch on black velvet, studio lighting, macro lens, high detail',
          description: 'Commercial product photography'
        },
        {
          title: 'Texture Study',
          text: 'close-up of rusted metal surface, high detail, macro photography, controlled lighting',
          description: 'Abstract texture photograph'
        }
      ]
    },
    {
      id: 'motion',
      title: 'Dynamic Motion',
      icon: <Compass />,
      description: 'Capture moving subjects with specialized photography techniques.',
      examples: [
        {
          title: 'Sports Action',
          text: 'a winning touchdown, fast shutter speed, movement tracking',
          description: 'Freezes high-speed sports action'
        },
        {
          title: 'Wildlife Action',
          text: 'A deer running in the forest, fast shutter speed, movement tracking',
          description: 'Captures animal in motion'
        },
        {
          title: 'Urban Motion',
          text: 'busy street intersection at night, long exposure, light trails from cars',
          description: 'Creates streaking light effects'
        },
        {
          title: 'Water Movement',
          text: 'waterfall in a lush forest, slow shutter speed, silky water effect',
          description: 'Smooth flowing water effect'
        }
      ]
    },
    {
      id: 'wideangle',
      title: 'Wide-Angle Photography',
      icon: <Film />,
      description: 'Capture expansive scenes and dramatic perspectives.',
      examples: [
        {
          title: 'Landscape',
          text: 'an expansive mountain range, landscape wide angle 10mm',
          description: 'Captures vast natural scenery'
        },
        {
          title: 'Astrophotography',
          text: 'a photo of the moon, astro photography, wide angle 10mm',
          description: 'Night sky photography'
        },
        {
          title: 'Architecture',
          text: 'grand interior of a cathedral, wide angle 14mm, looking up at vaulted ceiling',
          description: 'Dramatic architectural perspective'
        },
        {
          title: 'Environmental',
          text: 'underwater coral reef scene, wide angle lens, sunbeams penetrating water surface',
          description: 'Immersive underwater environment'
        }
      ]
    },
    {
      id: 'text',
      title: 'Generating Text in Images',
      icon: <Type />,
      description: 'Create images with integrated text elements.',
      examples: [
        {
          title: 'Poster with Title',
          text: 'A poster with the text "Summerland" in bold font as a title, underneath this text is the slogan "Summer never felt so good"',
          description: 'Title and slogan with specific placement'
        },
        {
          title: 'Product Label',
          text: 'A minimalist coffee product label with the brand name "ELEVATION" in large serif font and "Premium Roast" in smaller text below',
          description: 'Hierarchy of text for product packaging'
        },
        {
          title: 'Magazine Cover',
          text: 'Fashion magazine cover with the masthead "STYLE" in large white letters against a vibrant photo of a model in a red dress',
          description: 'Publication layout with masthead'
        },
        {
          title: 'Inspirational Quote',
          text: 'A serene beach sunset with the quote "Find your peace" in elegant cursive font overlaid on the image',
          description: 'Text integrated with natural background'
        }
      ]
    },
    {
      id: 'parameterized',
      title: 'Prompt Parameterization',
      icon: <Lightbulb />,
      description: 'Create template-style prompts with variables for consistent results.',
      examples: [
        {
          title: 'Minimalist Logo',
          text: 'A minimalist logo for a health care company on a solid color background. Include the text Journey.',
          description: 'Simple, clean logo design with specified text'
        },
        {
          title: 'Modern Logo',
          text: 'A modern logo for a software company on a solid color background. Include the text Silo.',
          description: 'Contemporary design style with company name'
        },
        {
          title: 'Traditional Logo',
          text: 'A traditional logo for a baking company on a solid color background. Include the text Seed.',
          description: 'Classic, established design approach'
        },
        {
          title: 'Product Template',
          text: 'A professional product photo of a perfume bottle in elegant style on a marble surface with soft lighting',
          description: 'Standardized product photography format'
        }
      ]
    },
    {
      id: 'imagen3',
      title: 'Imagen 3 Specific',
      icon: <Sparkles />,
      description: 'Optimize your prompts for Imagen 3, Google\'s highest quality text-to-image model.',
      examples: [
        {
          title: 'Enhanced Detail',
          text: 'Ultra detailed photograph of a Robot holding a red skateboard, 8k resolution, professional lighting',
          description: 'Leverages Imagen 3\'s enhanced detail capabilities'
        },
        {
          title: 'Rich Lighting',
          text: 'Two fuzzy bunnies in the kitchen, cinematic lighting, golden hour, high-end photography',
          description: 'Takes advantage of Imagen 3\'s improved lighting rendering'
        },
        {
          title: 'Text Rendering',
          text: 'A vintage movie poster for "SPACE ADVENTURE" with clear bold text and a dramatic space scene',
          description: 'Uses Imagen 3\'s better text rendering capabilities'
        },
        {
          title: 'Natural Language',
          text: 'I want a cozy cabin in the woods with a light dusting of snow and smoke coming from the chimney',
          description: 'Shows Imagen 3\'s ability to understand natural language'
        }
      ]
    },
    {
      id: 'gemini2',
      title: 'Gemini 2.0 Flash Specific',
      icon: <Sparkles />,
      description: 'Create prompts tailored for Gemini 2.0 Flash\'s unique text and image generation capabilities.',
      examples: [
        {
          title: 'Recipe Illustration',
          text: 'Generate an illustrated recipe for a paella with step-by-step instructions and images',
          description: 'Combines text and images in a structured format'
        },
        {
          title: 'Design Variations',
          text: 'Show me different color options for a modern living room with a sectional couch',
          description: 'Requests multiple design variations'
        },
        {
          title: 'Image Editing',
          text: 'Edit this image to make it look like a cartoon with bright colors and bold outlines',
          description: 'Requests specific image editing techniques'
        },
        {
          title: 'Creative Combination',
          text: 'Create a cross stitch pattern of a cat sitting on a cushion',
          description: 'Transforms subjects into different creative formats'
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionId);
    }
  };

  const filteredSections = promptSections.filter(section => 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.examples.some(example => 
      example.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      example.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      example.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-bold">Imagen & Gemini Prompt Guide</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </div>

      {isOpen && (
        <div className="mt-4">
          <p className="text-gray-600 mb-4">
            Refine your prompts using Google's comprehensive Imagen and Gemini guidance to create stunning AI-generated images. 
            Use these examples as starting points and customize them for your needs.
          </p>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search for prompts, styles, or techniques..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {filteredSections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className={`flex items-center justify-between p-3 cursor-pointer ${
                    activeSection === section.id ? 'bg-primary-50' : 'bg-gray-50'
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 mr-2 text-primary-600">{section.icon}</div>
                    <h4 className="font-medium">{section.title}</h4>
                  </div>
                  {activeSection === section.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>

                {activeSection === section.id && (
                  <div className="p-4">
                    <p className="text-gray-600 mb-3">{section.description}</p>
                    <div className="space-y-3">
                      {section.examples.map((example, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-sm mb-1">{example.title}</p>
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-gray-700 text-sm">{example.text}</p>
                            <button
                              className="text-primary-600 hover:text-primary-700 text-xs py-1 px-2 border border-primary-200 rounded-md bg-primary-50 flex-shrink-0"
                              onClick={() => onPromptSelect(example.text)}
                            >
                              Use
                            </button>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">{example.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-700 mb-2">Pro Tips for AI Image Generation:</h4>
            <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
              <li>Use descriptive language with detailed adjectives and adverbs</li>
              <li>Provide context to help AI understand the complete scene</li>
              <li>Reference specific artists or styles for particular aesthetics</li>
              <li>For portraits, include terms like "35mm" or "film noir" for stylistic control</li>
              <li>Specify lens types for different effects (macro, wide-angle, telephoto)</li>
              <li>Keep text short (under 25 characters) for better text rendering</li>
              <li>Add aspect ratio specifications at the end of your prompt</li>
              <li>For Imagen 3, include quality terms like "4K" or "HDR" for better detail</li>
              <li>For Gemini 2.0 Flash, explicitly ask for images in your prompt when needed</li>
              <li>Try iterating prompts - refinement often leads to better results</li>
            </ul>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Model Comparison:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-white rounded shadow-sm">
                <h5 className="font-medium mb-2 text-primary-700">Imagen 3</h5>
                <p className="text-gray-600 mb-2">Best for high-quality standalone images</p>
                <ul className="list-disc pl-5 text-xs text-gray-700">
                  <li>Photorealistic quality</li>
                  <li>Precise artistic styles</li>
                  <li>Advanced text rendering</li>
                  <li>Multiple aspect ratios</li>
                </ul>
              </div>
              <div className="p-3 bg-white rounded shadow-sm">
                <h5 className="font-medium mb-2 text-secondary-700">Gemini 2.0 Flash</h5>
                <p className="text-gray-600 mb-2">Best for combined text+image outputs</p>
                <ul className="list-disc pl-5 text-xs text-gray-700">
                  <li>Text and image in same response</li>
                  <li>Image editing capabilities</li>
                  <li>Multi-turn image conversations</li>
                  <li>Creative formats like recipes and designs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagenPromptGuide;