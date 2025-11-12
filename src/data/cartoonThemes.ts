interface CartoonTheme {
  label: string;
  prompt: string;
  preview?: string;
}

interface CartoonThemesConfig {
  themes: CartoonTheme[];
  filters: Record<string, string[]>;
  ui: {
    enablePreviewPanel: boolean;
    enableSurpriseMeButton: boolean;
    groupCarousel: string[];
    enableImageToImageUpload: boolean;
  };
}

const cartoonThemesConfig: CartoonThemesConfig = {
  "themes": [
    {
      "label": "Felt Puppet Style",
      "prompt": "Turn a face into a fuzzy, colorful puppet character with felt texture, button eyes, a wide mouth, and playful accessories. Background: bright curtain stage.",
      "preview": "/previews/felt-puppet-style.png"
    },
    {
      "label": "Rubber Hose Cartoon",
      "prompt": "Convert a person into a vintage rubber hose cartoon style from the 1930s — bendy limbs, exaggerated expressions, grainy textures, and big gloves.",
      "preview": "/previews/rubber-hose-cartoon.png"
    },
    {
      "label": "Retro Mystery Toon",
      "prompt": "Transform a photo into a retro animated detective — bright outfits, clean outlines, mystery house in the background, and expressive cartoon features.",
      "preview": "/previews/retro-mystery-toon.png"
    },
    {
      "label": "Yellow Toon Style",
      "prompt": "Convert into a classic yellow-skinned cartoon with bugged-out eyes, overbites, and a suburban neighborhood or TV couch setting.",
      "preview": "/previews/yellow-toon-style.png"
    },
    {
      "label": "Multiverse Portal Style",
      "prompt": "Turn a face into a sci-fi cartoon character with wild hair, chaotic background portals, and expressive animation features in a dimensional space.",
      "preview": "/previews/multiverse-portal-style.png"
    },
    {
      "label": "Paper-Cut Cartoon",
      "prompt": "Reimagine someone as a paper-cutout style cartoon with blocky shapes, large eyes, and a flat snowy mountain town background.",
      "preview": "/previews/paper-cut-cartoon.png"
    },
    {
      "label": "Glossy 3D Pixar-Inspired",
      "prompt": "Transform a portrait into a glossy, shiny-eyed 3D animation style character — soft gradients, round features, and friendly emotion.",
      "preview": "/previews/glossy-3d-pixar-inspired.png"
    },
    {
      "label": "Stone Age Toon",
      "prompt": "Change someone into a prehistoric cartoon version — caveman outfit, stone textures, dinosaur in background, and slapstick expressions.",
      "preview": "/previews/stone-age-toon.png"
    },
    {
      "label": "Sky City Cartoon",
      "prompt": "Turn into a floating-future cartoon character — metallic suits, bubble helmets, bright skies, and neon hovercars in the background.",
      "preview": "/previews/sky-city-cartoon.png"
    },
    {
      "label": "Simple Comic Strip",
      "prompt": "Convert an image to a soft-lined comic strip look — big round head, thin limbs, expressive eyes, fall trees or school background.",
      "preview": "/previews/simple-comic-strip.png"
    },
    {
      "label": "Adventure Fantasy Sketch",
      "prompt": "Cartoonify a person into a noodle-limbed fantasy explorer in a whimsical pastel-colored land with clouds, creatures, and mountains.",
      "preview": "/previews/adventure-fantasy-sketch.png"
    },
    {
      "label": "Modern Toon Style",
      "prompt": "Redesign a portrait into a clean-line modern TV cartoon — stylized eyes, oversized heads, city sidewalk or couch interior scene.",
      "preview": "/previews/modern-toon-style.png"
    },
    {
      "label": "Undersea Toon Look",
      "prompt": "Create a cartoon version of a person as a sea creature in an underwater town — pastel colors, coral architecture, and expressive faces.",
      "preview": "/previews/undersea-toon-look.png"
    },
    {
      "label": "Rubber Hose Vintage",
      "prompt": "Black and white grainy vintage cartoon with rubber arms, giant shoes, and 1930s dance poses in a stage backdrop.",
      "preview": "/previews/rubber-hose-vintage.png"
    },
    {
      "label": "Hyper Toon Lookbook",
      "prompt": "Zany cartoon transformation with abstract expressions, stretched limbs, exaggerated eyes, set against a studio animation lot.",
      "preview": "/previews/hyper-toon-lookbook.png"
    },
    {
      "label": "Anime Hero Tribute",
      "prompt": "Anime-style makeover with spiky hair, motion trails, glowing eyes, and stylized energy effects in a battle background.",
      "preview": "/previews/anime-hero-tribute.png"
    },
    {
      "label": "Hand-Painted Fantasy Style",
      "prompt": "Soft, painterly animation look with natural lighting, peaceful landscape, oversized eyes, and dreamy fantasy feel.",
      "preview": "/previews/hand-painted-fantasy-style.png"
    },
    {
      "label": "Cartoon Critter Family",
      "prompt": "Turn family photo into a clean-line animal family cartoon — round heads, pastel colors, soft home background and matching shirts.",
      "preview": "/previews/cartoon-critter-family.png"
    },
    {
      "label": "Plastic Block Character",
      "prompt": "Convert into a toy-like plastic figure with simple expressions, block limbs, and colorful accessories in a toy city background.",
      "preview": "/previews/plastic-block-character.png"
    },
    {
      "label": "Comic Panel Toon",
      "prompt": "Newspaper-style cartoon version with sharp lines, sarcastic captions, and box-panel layout — often with pet sidekick.",
      "preview": "/previews/comic-panel-toon.png"
    }
  ],
  "filters": {
    "Cartoon Styles": [
      "Felt Puppet Style",
      "Rubber Hose Cartoon",
      "Retro Mystery Toon",
      "Yellow Toon Style",
      "Multiverse Portal Style",
      "Paper-Cut Cartoon",
      "Glossy 3D Pixar-Inspired",
      "Stone Age Toon",
      "Sky City Cartoon",
      "Simple Comic Strip",
      "Adventure Fantasy Sketch",
      "Modern Toon Style",
      "Undersea Toon Look",
      "Rubber Hose Vintage",
      "Hyper Toon Lookbook",
      "Anime Hero Tribute",
      "Hand-Painted Fantasy Style",
      "Cartoon Critter Family",
      "Plastic Block Character",
      "Comic Panel Toon"
    ]
  },
  "ui": {
    "enablePreviewPanel": true,
    "enableSurpriseMeButton": true,
    "groupCarousel": ["Cartoon Styles"],
    "enableImageToImageUpload": true
  }
};

export default cartoonThemesConfig;

// Export simple array for easy usage
export const cartoonThemes = [
  { id: 'disney', name: 'Disney Classic', description: 'Hand-drawn animation style with expressive characters and vibrant colors' },
  { id: 'pixar', name: 'Pixar 3D', description: 'Glossy 3D renders with rounded features and warm lighting' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation with large eyes and detailed expressions' },
  { id: 'cartoon-network', name: 'Cartoon Network', description: 'Modern TV cartoon with bold lines and simple shapes' },
  { id: 'comic-strip', name: 'Comic Strip', description: 'Classic newspaper comic style with clean linework' },
  { id: 'rubber-hose', name: 'Rubber Hose', description: '1930s animation with bendy limbs and simple designs' }
];