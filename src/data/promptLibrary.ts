/**
 * User-Fillable Prompt Library
 * Interactive prompt templates that users can customize with placeholders
 */

import { PromptTemplate, createPromptTemplate } from '../utils/promptBuilder';
import { PERSONALIZATION_TOKENS } from '../types/personalization';

// Action Figure Templates
export const actionFigureTemplates: PromptTemplate[] = [
  {
    id: "classic-blister",
    category: "actionFigure",
    name: "Classic Blister Pack",
    basePrompt: "Create a studio packshot of a collectible action figure styled as [NAME] from [COMPANY], sealed in an unopened retro blister pack. The figure wears a sharp professional suit with subtle [COMPANY]-colored accents and company-themed accessories including a laptop, smartphone, and briefcase arranged in molded plastic. Card back art features bold retro typography, ability callouts, stat bars, a miniature lineup grid, and a subtle faux-shelf-wear edge for authenticity. The clear blister should have soft reflections and realistic plastic thickness; include a hanging tab, barcode, safety icons, and a tiny 'Ages 14+ Collector Item' badge. Clean, photorealistic toy photography on a neutral gradient, balanced studio lighting, shallow depth of field, crisp edges, accurate shadows, high detail.",
    tokens: ["NAME", "COMPANY"],
    enhancements: ["professional toy photography", "retro blister packaging", "collectible authenticity"]
  },
  {
    id: "deluxe-boxed",
    category: "actionFigure",
    name: "Deluxe Boxed Edition",
    basePrompt: "Create a premium window-box product photo of [NAME] from [COMPANY]. The figure is posed heroically with interchangeable hands and multiple accessories ([ACCESSORIES]) secured in a vac-tray. The box uses [COMPANY] palette with subtle metallic accents, side-panel feature callouts, icon badges for articulation points, and a 'Collector Edition' emblem. Add a diorama-style inner card with depth, a glossy PET window with realistic reflections, legal text, barcode, hanging tab notch, and a numbered series seal. Dramatic rim lighting and soft fill to reveal contours, photorealistic materials, gentle table reflection, shelf-ready composition, high detail.",
    tokens: ["NAME", "COMPANY", "ACCESSORIES"],
    enhancements: ["premium packaging design", "collector edition features", "professional product photography"]
  },
  {
    id: "vintage-cardback",
    category: "actionFigure",
    name: "Vintage Cardback",
    basePrompt: "Create a vintage-style action figure of [NAME] from [COMPANY] on a retro cardback. The figure is posed dynamically with [ACCESSORIES] arranged around it. The card features classic 80s/90s design with bold colors, character artwork, ability icons, stat bars, and a miniature figure lineup. Include retro typography, safety warnings, and collector information. Photographed with warm, nostalgic lighting to evoke classic toy store appeal, high detail, accurate shadows, photorealistic materials.",
    tokens: ["NAME", "COMPANY", "ACCESSORIES"],
    enhancements: ["vintage cardback design", "retro aesthetic", "nostalgic appeal"]
  },
  {
    id: "collector-display-case",
    category: "actionFigure",
    name: "Collector's Display Case",
    basePrompt: "Create a premium display case presentation of [NAME] from [COMPANY] action figure. The figure is showcased in a clear acrylic case with LED lighting, posed heroically with [ACCESSORIES] arranged artistically. Include a certificate of authenticity, collector's plaque, and museum-quality presentation. The case has a sleek black base with metallic accents and soft internal lighting. Professional photography with dramatic lighting, high detail, photorealistic materials, and collector-grade presentation.",
    tokens: ["NAME", "COMPANY", "ACCESSORIES"],
    enhancements: ["museum-quality presentation", "LED lighting effects", "collector authenticity"]
  },
  {
    id: "trading-card",
    category: "actionFigure",
    name: "Trading Card",
    basePrompt: "Create a trading card featuring [NAME] from [COMPANY] as an action figure character. The card shows the figure in dynamic pose with [ACCESSORIES], holographic foil effects, and collectible artwork. Include character stats, ability descriptions, and collector information on the back. The card has rounded corners, glossy finish, and premium cardstock feel. Professional trading card photography with clean composition, vibrant colors, and high detail.",
    tokens: ["NAME", "COMPANY", "ACCESSORIES"],
    enhancements: ["trading card format", "holographic effects", "collectible artwork"]
  },
  {
    id: "2-pack-battle-set",
    category: "actionFigure",
    name: "2-Pack Battle Set",
    basePrompt: "Create a 2-pack battle set featuring [NAME1] and [NAME2] from [COMPANY] in combat poses. Both figures are posed dynamically with weapons and accessories, ready for action. The packaging is a clamshell case with battle-themed artwork, character bios, and action scene illustrations. Include a diorama base for display. Professional toy photography with dramatic lighting, high detail, and battle-ready presentation.",
    tokens: ["NAME1", "NAME2", "COMPANY"],
    enhancements: ["battle set packaging", "dynamic combat poses", "diorama base"]
  },
  {
    id: "desktop-bobblehead",
    category: "actionFigure",
    name: "Desktop Bobblehead",
    basePrompt: "Create a desktop bobblehead figure of [NAME] from [COMPANY] with oversized head on a spring neck. The figure is styled in professional attire with [COMPANY] branding, posed confidently with a spring-loaded bobble mechanism. The base is weighted and branded with company logo. Desktop photography with clean background, professional lighting, and fun bobble action visible.",
    tokens: ["NAME", "COMPANY"],
    enhancements: ["bobblehead mechanism", "desktop display", "spring-loaded action"]
  },
  {
    id: "vinyl-collectible",
    category: "actionFigure",
    name: "Vinyl Collectible",
    basePrompt: "Create a vinyl collectible figure of [NAME] from [COMPANY] in retro vinyl style. The figure has soft vinyl material with painted details, posed dynamically with [ACCESSORIES]. The design features classic vinyl toy aesthetics with bright colors and simple but expressive features. Photographed on a neutral background with soft lighting to highlight the vinyl material and collectible appeal.",
    tokens: ["NAME", "COMPANY", "ACCESSORIES"],
    enhancements: ["vinyl material texture", "retro collectible style", "painted details"]
  },
  {
    id: "buildable-mini-figure",
    category: "actionFigure",
    name: "Buildable Mini Figure",
    basePrompt: "Create a buildable mini figure kit of [NAME] from [COMPANY]. The figure comes in parts that snap together, featuring articulated joints and interchangeable pieces. Include building instructions and [ACCESSORIES] that also assemble. The packaging shows the completed figure and part layouts. Educational photography with clear part visibility and assembly demonstration.",
    tokens: ["NAME", "COMPANY", "ACCESSORIES"],
    enhancements: ["snap-together construction", "interchangeable parts", "educational packaging"]
  },
  {
    id: "roleplaying-set",
    category: "actionFigure",
    name: "Roleplaying Set",
    basePrompt: "Create a roleplaying set featuring [NAME] from [COMPANY] as a detailed action figure with extensive accessories for imaginative play. The figure includes [ACCESSORIES], costume pieces, and props for storytelling. The packaging is a large box with illustrated scenes and character backgrounds. Creative photography showing the figure in various roleplaying scenarios with soft, imaginative lighting.",
    tokens: ["NAME", "COMPANY", "ACCESSORIES"],
    enhancements: ["extensive accessory set", "roleplaying focus", "imaginative scenarios"]
  },
  {
    id: "digital-game-character",
    category: "actionFigure",
    name: "Digital Game Character",
    basePrompt: "Create an action figure based on [NAME] from [COMPANY]'s digital game universe. The figure features glowing effects, digital patterns, and game-inspired accessories. Include LED elements and digital display features. The design captures the essence of the digital character with pixelated accents and futuristic styling. Gaming photography with neon lighting and digital effects.",
    tokens: ["NAME", "COMPANY"],
    enhancements: ["digital game aesthetics", "LED lighting effects", "futuristic styling"]
  },
  {
    id: "chibi-art-style",
    category: "actionFigure",
    name: "Chibi Art Style",
    basePrompt: "Create a chibi-style action figure of [NAME] from [COMPANY] with oversized head, big eyes, and cute proportions. The figure is posed cutely with [ACCESSORIES] that match the chibi aesthetic. The design features soft, rounded features and adorable expressions. Kawaii photography with bright, cheerful lighting and cute presentation.",
    tokens: ["NAME", "COMPANY", "ACCESSORIES"],
    enhancements: ["chibi proportions", "cute aesthetic", "oversized features"]
  }
];

// Meme Templates
export const memeTemplates: PromptTemplate[] = [
  {
    id: "distracted-boyfriend",
    category: "meme",
    name: "Distracted Boyfriend",
    basePrompt: "Create a viral meme image showing the distracted boyfriend stock photo format: a man (labeled '[TOP_TEXT]') walking with his girlfriend but looking back at another woman (labeled '[BOTTOM_TEXT]'), with the girlfriend looking disapproving. Use the classic stock photo style with clean composition, bright lighting, and high contrast for text readability. Include the text '[TOP_TEXT]' above the boyfriend and '[BOTTOM_TEXT]' above the other woman. High contrast colors, bold readable typography, viral social media aesthetic.",
    tokens: ["TOP_TEXT", "BOTTOM_TEXT"],
    enhancements: ["viral meme format", "high contrast typography", "social media optimization"]
  },
  {
    id: "success-kid",
    category: "meme",
    name: "Success Kid",
    basePrompt: "Create a Success Kid meme with the baby fist-pumping enthusiastically on the beach, labeled '[TOP_TEXT]' above and '[BOTTOM_TEXT]' below. The baby has a determined expression with clenched fist raised high. Bright beach lighting, sandy background, classic meme typography with high contrast and bold fonts for maximum readability and shareability.",
    tokens: ["TOP_TEXT", "BOTTOM_TEXT"],
    enhancements: ["classic meme character", "motivational expression", "beach setting"]
  },
  {
    id: "two-buttons",
    category: "meme",
    name: "Two Buttons",
    basePrompt: "Create a Two Buttons meme showing a person at a control panel with two buttons labeled '[LEFT_BUTTON]' and '[RIGHT_BUTTON]'. The person looks confused or thoughtful about which button to press. Clean interface design, professional button styling, high contrast text, viral meme composition with clear choice dilemma.",
    tokens: ["LEFT_BUTTON", "RIGHT_BUTTON"],
    enhancements: ["decision dilemma format", "control panel interface", "thoughtful expression"]
  },
  {
    id: "drake",
    category: "meme",
    name: "Drake Hotline Bling",
    basePrompt: "Create a Drake Hotline Bling meme with Drake rejecting something in the top panel (labeled '[TOP_TEXT]') and approving something in the bottom panel (labeled '[BOTTOM_TEXT]'). Drake has his signature disinterested expression in the top and approving nod in the bottom. Clean composition, high contrast text, viral social media formatting.",
    tokens: ["TOP_TEXT", "BOTTOM_TEXT"],
    enhancements: ["approval/rejection format", "Drake expressions", "dual panel layout"]
  },
  {
    id: "change-my-mind",
    category: "meme",
    name: "Change My Mind",
    basePrompt: "Create a Change My Mind meme with the guy at a table with a sign that says '[MAIN_TEXT]' and then 'Change My Mind' written below. The guy has a smug, challenging expression. Clean table setting, professional sign design, high contrast typography, persuasive meme format.",
    tokens: ["MAIN_TEXT"],
    enhancements: ["persuasive sign format", "challenging expression", "table setting"]
  },
  {
    id: "expanding-brain",
    category: "meme",
    name: "Expanding Brain",
    basePrompt: "Create an Expanding Brain meme showing four panels of brains getting progressively larger, with text '[LEVEL1]' on smallest brain, '[LEVEL2]' on medium brain, '[LEVEL3]' on large brain, and '[LEVEL4]' on galaxy brain. Progressive brain sizes, scientific illustration style, high contrast text, intellectual progression format.",
    tokens: ["LEVEL1", "LEVEL2", "LEVEL3", "LEVEL4"],
    enhancements: ["progressive brain sizes", "intellectual hierarchy", "scientific illustration"]
  },
  {
    id: "surprised-pikachu",
    category: "meme",
    name: "Surprised Pikachu",
    basePrompt: "Create a Surprised Pikachu meme with Pikachu face looking shocked, labeled '[TOP_TEXT]' above and '[BOTTOM_TEXT]' below. Pikachu has wide eyes and open mouth in surprise. Clean background, high contrast text, shocked Pokemon expression, viral reaction format.",
    tokens: ["TOP_TEXT", "BOTTOM_TEXT"],
    enhancements: ["shocked reaction format", "Pikachu expression", "surprise emphasis"]
  },
  {
    id: "woman-yelling-cat",
    category: "meme",
    name: "Woman Yelling At Cat",
    basePrompt: "Create a Woman Yelling At Cat meme with a woman yelling dramatically on the left (labeled '[LEFT_TEXT]') and a smug cat looking judgmental on the right (labeled '[RIGHT_TEXT]'). Split panel composition, exaggerated expressions, high contrast text, reaction comparison format.",
    tokens: ["LEFT_TEXT", "RIGHT_TEXT"],
    enhancements: ["split panel reaction", "exaggerated expressions", "judgmental contrast"]
  },
  {
    id: "one-does-not-simply",
    category: "meme",
    name: "One Does Not Simply",
    basePrompt: "Create a One Does Not Simply meme with Boromir from Lord of the Rings saying 'One does not simply [ACTION]' with dramatic expression. Medieval fantasy setting, determined warrior pose, high contrast text, epic declaration format.",
    tokens: ["ACTION"],
    enhancements: ["epic declaration format", "fantasy warrior", "dramatic expression"]
  },
  {
    id: "doge",
    category: "meme",
    name: "Doge Buff vs Cheems",
    basePrompt: "Create a Doge meme comparing Buff Doge (muscular, confident) labeled '[BUFF_TEXT]' and Cheems (sad, weak) labeled '[CHEEMS_TEXT]'. Split panel with muscular doge on left and skinny cheems on right. Doge expressions, high contrast text, comparison format.",
    tokens: ["BUFF_TEXT", "CHEEMS_TEXT"],
    enhancements: ["comparison format", "doge expressions", "muscle vs weakness contrast"]
  },
  {
    id: "epic-handshake",
    category: "meme",
    name: "Epic Handshake",
    basePrompt: "Create an Epic Handshake meme with two figures shaking hands dramatically, labeled '[LEFT_TEXT]' on the left figure and '[RIGHT_TEXT]' on the right figure. Powerful handshake pose, determined expressions, high contrast text, alliance or agreement format.",
    tokens: ["LEFT_TEXT", "RIGHT_TEXT"],
    enhancements: ["alliance formation", "dramatic handshake", "powerful expressions"]
  },
  {
    id: "always-has-been",
    category: "meme",
    name: "Always Has Been",
    basePrompt: "Create an Always Has Been meme with Wayne from Letterkenny saying '[MAIN_TEXT]' and then 'Always has been' below. Wayne has his signature skeptical expression. Clean background, high contrast text, Canadian humor format.",
    tokens: ["MAIN_TEXT"],
    enhancements: ["skeptical expression", "Canadian humor", "timeless statement"]
  },
  {
    id: "mocking-spongebob",
    category: "meme",
    name: "Mocking SpongeBob",
    basePrompt: "Create a Mocking SpongeBob meme with SpongeBob's face in mocking font text that says '[MOCK_TEXT]' with alternating uppercase/lowercase letters. SpongeBob has mocking expression with raised eyebrows. Bright colors, mocking typography, sarcastic reaction format.",
    tokens: ["MOCK_TEXT"],
    enhancements: ["mocking typography", "sarcastic expression", "SpongeBob face"]
  },
  {
    id: "this-is-fine",
    category: "meme",
    name: "This Is Fine",
    basePrompt: "Create a This Is Fine meme with the dog sitting in a burning room saying '[DOG_TEXT]' while everything is on fire around him. Dog has calm expression despite chaos. Burning room setting, calm dog demeanor, ironic contrast format.",
    tokens: ["DOG_TEXT"],
    enhancements: ["ironic calm", "burning chaos", "situational contrast"]
  },
  {
    id: "stonks",
    category: "meme",
    name: "Stonks",
    basePrompt: "Create a Stonks meme with the guy pointing at a chart going up labeled '[UP_TEXT]' and down labeled '[DOWN_TEXT]'. Guy has confident expression. Chart graphics, investment theme, high contrast text, financial humor format.",
    tokens: ["UP_TEXT", "DOWN_TEXT"],
    enhancements: ["financial humor", "chart graphics", "investment theme"]
  },
  {
    id: "loss",
    category: "meme",
    name: "Loss.jpg",
    basePrompt: "Create a Loss.jpg meme with the guy looking defeated, labeled '[LOSS_TEXT]' with sad trombone sound effect. Guy has disappointed expression, empty background. Sad music notes, defeat expression, failure acknowledgment format.",
    tokens: ["LOSS_TEXT"],
    enhancements: ["defeat expression", "sad trombone", "failure acknowledgment"]
  },
  {
    id: "giga-chad",
    category: "meme",
    name: "Giga Chad",
    basePrompt: "Create a Giga Chad meme comparing regular guy (labeled '[NORMAL_TEXT]') and Giga Chad (labeled '[CHAD_TEXT]') with extreme muscular differences. Side-by-side comparison, exaggerated muscles, high contrast text, superiority format.",
    tokens: ["NORMAL_TEXT", "CHAD_TEXT"],
    enhancements: ["muscle comparison", "exaggerated physique", "superiority contrast"]
  }
];

// Cartoon Templates
export const cartoonTemplates: PromptTemplate[] = [
  {
    id: "felt-puppet",
    category: "cartoon",
    name: "Felt Puppet Style",
    basePrompt: "Turn [SUBJECT] into a fuzzy, colorful puppet character with felt texture, button eyes, a wide mouth, and playful accessories. Background: bright curtain stage. Clean line art with consistent stroke width, vibrant cartoon colors, exaggerated features and expressions, simplified anatomy and proportions, animated character design principles.",
    tokens: ["SUBJECT"],
    enhancements: ["felt texture details", "puppet character design", "stage background"]
  },
  {
    id: "retro-cartoon",
    category: "cartoon",
    name: "Retro Mystery Toon",
    basePrompt: "Convert [SUBJECT] into a retro animated detective — bright outfits, clean outlines, exaggerated expressions, mystery house in the background, and expressive cartoon features. Classic cartoon styling with bold colors, dynamic poses, clear focal points, and nostalgic animation aesthetic.",
    tokens: ["SUBJECT"],
    enhancements: ["retro animation style", "mystery theme", "exaggerated expressions"]
  },
  {
    id: "rubber-hose-cartoon",
    category: "cartoon",
    name: "Rubber Hose Cartoon",
    basePrompt: "Transform [SUBJECT] into a vintage rubber hose cartoon style from the 1930s — bendy limbs, exaggerated expressions, grainy textures, and big gloves. Classic animation aesthetic with flexible joints, expressive faces, and period-appropriate styling.",
    tokens: ["SUBJECT"],
    enhancements: ["vintage 1930s style", "flexible rubber hose limbs", "grainy textures"]
  },
  {
    id: "yellow-toon-style",
    category: "cartoon",
    name: "Yellow Toon Style",
    basePrompt: "Convert [SUBJECT] into a classic yellow-skinned cartoon with bugged-out eyes, overbites, and a suburban neighborhood or TV couch setting. Traditional cartoon character design with exaggerated features and everyday scenarios.",
    tokens: ["SUBJECT"],
    enhancements: ["yellow skin tone", "bugged-out eyes", "suburban setting"]
  },
  {
    id: "multiverse-portal",
    category: "cartoon",
    name: "Multiverse Portal Style",
    basePrompt: "Turn [SUBJECT] into a sci-fi cartoon character with wild hair, chaotic background portals, and expressive animation features in a dimensional space. Multiverse-themed cartoon with portal effects and dimensional chaos.",
    tokens: ["SUBJECT"],
    enhancements: ["multiverse portals", "dimensional chaos", "sci-fi cartoon elements"]
  },
  {
    id: "paper-cut-cartoon",
    category: "cartoon",
    name: "Paper-Cut Cartoon",
    basePrompt: "Reimagine [SUBJECT] as a paper-cutout style cartoon with blocky shapes, large eyes, and a flat snowy mountain town background. Paper craft aesthetic with layered cutouts and simplified forms.",
    tokens: ["SUBJECT"],
    enhancements: ["paper-cutout technique", "blocky shapes", "layered composition"]
  },
  {
    id: "pixar-3d-style",
    category: "cartoon",
    name: "Glossy 3D Pixar-Inspired",
    basePrompt: "Transform [SUBJECT] into a glossy, shiny-eyed 3D animation style character — soft gradients, round features, and friendly emotion. Pixar-inspired 3D rendering with realistic lighting and emotional expressions.",
    tokens: ["SUBJECT"],
    enhancements: ["3D Pixar style", "soft gradients", "realistic lighting"]
  },
  {
    id: "stone-age-toon",
    category: "cartoon",
    name: "Stone Age Toon",
    basePrompt: "Change [SUBJECT] into a prehistoric cartoon version — caveman outfit, stone textures, dinosaur in background, and slapstick expressions. Prehistoric cartoon with stone age technology and dinosaur companions.",
    tokens: ["SUBJECT"],
    enhancements: ["prehistoric setting", "stone age technology", "dinosaur background"]
  },
  {
    id: "sky-city-cartoon",
    category: "cartoon",
    name: "Sky City Cartoon",
    basePrompt: "Turn [SUBJECT] into a floating-future cartoon character — metallic suits, bubble helmets, bright skies, and neon hovercars in the background. Futuristic sky city setting with advanced technology and aerial vehicles.",
    tokens: ["SUBJECT"],
    enhancements: ["futuristic sky city", "metallic suits", "hovercar technology"]
  },
  {
    id: "comic-strip",
    category: "cartoon",
    name: "Simple Comic Strip",
    basePrompt: "Convert [SUBJECT] to a soft-lined comic strip look — big round head, thin limbs, expressive eyes, fall trees or school background. Classic comic strip art with panel borders and speech bubbles.",
    tokens: ["SUBJECT"],
    enhancements: ["comic strip format", "panel borders", "speech bubbles"]
  },
  {
    id: "fantasy-sketch",
    category: "cartoon",
    name: "Adventure Fantasy Sketch",
    basePrompt: "Cartoonify [SUBJECT] into a noodle-limbed fantasy explorer in a whimsical pastel-colored land with clouds, creatures, and mountains. Fantasy adventure cartoon with elongated limbs and magical creatures.",
    tokens: ["SUBJECT"],
    enhancements: ["noodle-limbed design", "fantasy creatures", "pastel colors"]
  },
  {
    id: "modern-tv-cartoon",
    category: "cartoon",
    name: "Modern Toon Style",
    basePrompt: "Redesign [SUBJECT] into a clean-line modern TV cartoon — stylized eyes, oversized heads, city sidewalk or couch interior scene. Contemporary cartoon style with clean lines and modern settings.",
    tokens: ["SUBJECT"],
    enhancements: ["modern TV aesthetic", "clean line art", "contemporary settings"]
  },
  {
    id: "undersea-cartoon",
    category: "cartoon",
    name: "Undersea Toon Look",
    basePrompt: "Create a cartoon version of [SUBJECT] as a sea creature in an underwater town — pastel colors, coral architecture, and expressive faces. Underwater cartoon world with coral buildings and sea creature characters.",
    tokens: ["SUBJECT"],
    enhancements: ["underwater setting", "coral architecture", "sea creature features"]
  },
  {
    id: "vintage-rubber-hose",
    category: "cartoon",
    name: "Rubber Hose Vintage",
    basePrompt: "Black and white grainy vintage cartoon with rubber arms, giant shoes, and 1930s dance poses in a stage backdrop. Classic black and white animation with rubber hose flexibility and vintage charm.",
    tokens: [],
    enhancements: ["black and white animation", "rubber hose limbs", "1930s dance poses"]
  },
  {
    id: "hyper-toon",
    category: "cartoon",
    name: "Hyper Toon Lookbook",
    basePrompt: "Zany cartoon transformation with abstract expressions, stretched limbs, exaggerated eyes, set against a studio animation lot. Abstract and zany cartoon style with exaggerated proportions and studio setting.",
    tokens: [],
    enhancements: ["abstract expressions", "stretched limbs", "studio animation lot"]
  },
  {
    id: "anime-hero",
    category: "cartoon",
    name: "Anime Hero Tribute",
    basePrompt: "Anime-style makeover with spiky hair, motion trails, glowing eyes, and stylized energy effects in a battle background. Anime hero design with dynamic poses and energy effects.",
    tokens: [],
    enhancements: ["anime hero design", "motion trails", "energy effects"]
  },
  {
    id: "hand-painted-fantasy",
    category: "cartoon",
    name: "Hand-Painted Fantasy Style",
    basePrompt: "Soft, painterly animation look with natural lighting, peaceful landscape, oversized eyes, and dreamy fantasy feel. Hand-painted cartoon aesthetic with brush strokes and natural lighting.",
    tokens: [],
    enhancements: ["hand-painted technique", "brush stroke texture", "peaceful landscape"]
  },
  {
    id: "cartoon-critter-family",
    category: "cartoon",
    name: "Cartoon Critter Family",
    basePrompt: "Turn [SUBJECT] into a clean-line animal family cartoon — round heads, pastel colors, soft home background and matching shirts. Anthropomorphic animal family in cartoon style.",
    tokens: ["SUBJECT"],
    enhancements: ["anthropomorphic animals", "family grouping", "pastel colors"]
  },
  {
    id: "plastic-block-character",
    category: "cartoon",
    name: "Plastic Block Character",
    basePrompt: "Convert [SUBJECT] into a toy-like plastic figure with simple expressions, block limbs, and colorful accessories in a toy city background. Plastic toy aesthetic with blocky shapes and bright colors.",
    tokens: ["SUBJECT"],
    enhancements: ["plastic toy material", "blocky shapes", "toy city background"]
  },
  {
    id: "comic-panel-toon",
    category: "cartoon",
    name: "Comic Panel Toon",
    basePrompt: "Newspaper-style cartoon version with sharp lines, sarcastic captions, and box-panel layout — often with pet sidekick. Classic newspaper comic strip format with panels and captions.",
    tokens: [],
    enhancements: ["newspaper comic style", "panel layout", "sarcastic captions"]
  }
];

// Ghibli Style Templates
export const ghibliTemplates: PromptTemplate[] = [
  {
    id: "enchanted-forest",
    category: "ghibli",
    name: "Enchanted Forest Scene",
    basePrompt: "A Studio Ghibli style enchanted forest scene featuring [CHARACTER] with towering ancient trees, glowing magical plants, soft moss-covered ground, and shafts of golden sunlight filtering through the canopy. Soft watercolor painting technique, hand-drawn animation aesthetic, whimsical atmosphere, detailed background elements, emotional character expressions, peaceful landscape and character harmony, oversized eyes with emotional depth, dreamy fantasy atmosphere.",
    tokens: ["CHARACTER"],
    enhancements: ["magical forest elements", "peaceful atmosphere", "detailed backgrounds"]
  },
  {
    id: "floating-castle",
    category: "ghibli",
    name: "Floating Castle",
    basePrompt: "A Studio Ghibli style floating castle scene with [CHARACTER] featuring intricate architecture, floating islands, gentle waterfalls cascading into mist, and a sense of peaceful isolation. Soft, painterly animation look, natural lighting with magical elements, oversized eyes with emotional depth, dreamy fantasy atmosphere.",
    tokens: ["CHARACTER"],
    enhancements: ["floating architecture", "magical atmosphere", "peaceful isolation"]
  },
  {
    id: "coastal-village",
    category: "ghibli",
    name: "Coastal Village",
    basePrompt: "A Studio Ghibli style coastal village with [CHARACTER] featuring colorful thatched-roof houses, fishing boats bobbing in the harbor, winding cobblestone streets, and a lighthouse on the cliff. Soft watercolor painting technique, hand-drawn animation aesthetic, peaceful seaside atmosphere.",
    tokens: ["CHARACTER"],
    enhancements: ["coastal village setting", "fishing boat details", "seaside atmosphere"]
  },
  {
    id: "mountain-valley",
    category: "ghibli",
    name: "Mountain Valley",
    basePrompt: "A Studio Ghibli style mountain valley with [CHARACTER] featuring terraced rice fields, a crystal-clear river winding through, distant snow-capped peaks, and traditional village houses. Soft watercolor painting technique, peaceful valley atmosphere, traditional architecture.",
    tokens: ["CHARACTER"],
    enhancements: ["mountain valley landscape", "rice field terraces", "traditional village houses"]
  },
  {
    id: "bamboo-grove",
    category: "ghibli",
    name: "Bamboo Grove",
    basePrompt: "A Studio Ghibli style bamboo grove with [CHARACTER] featuring tall swaying stalks, filtered sunlight creating dancing shadows, a gentle breeze rustling the leaves, and a sense of tranquility. Soft watercolor painting technique, peaceful bamboo forest atmosphere.",
    tokens: ["CHARACTER"],
    enhancements: ["bamboo forest setting", "dancing sunlight shadows", "tranquil atmosphere"]
  },
  {
    id: "ancient-temple",
    category: "ghibli",
    name: "Ancient Temple",
    basePrompt: "A Studio Ghibli style ancient temple with [CHARACTER] featuring weathered stone architecture, cherry blossom trees in full bloom, stone lanterns, and a peaceful courtyard with koi pond. Soft watercolor painting technique, spiritual temple atmosphere.",
    tokens: ["CHARACTER"],
    enhancements: ["ancient stone architecture", "cherry blossom trees", "peaceful courtyard"]
  },
  {
    id: "hot-air-balloon",
    category: "ghibli",
    name: "Hot Air Balloon Journey",
    basePrompt: "A Studio Ghibli style hot air balloon journey with [CHARACTER] featuring rolling green hills below, patchwork farmland, fluffy white clouds, and a sense of gentle adventure. Soft watercolor painting technique, adventurous balloon atmosphere.",
    tokens: ["CHARACTER"],
    enhancements: ["hot air balloon travel", "rolling hill landscapes", "gentle adventure"]
  },
  {
    id: "suburban-neighborhood",
    category: "ghibli",
    name: "Suburban Neighborhood",
    basePrompt: "A Studio Ghibli style suburban neighborhood with [CHARACTER] featuring well-kept gardens, bicycles leaning against fences, laundry hanging to dry, and children playing in the streets. Soft watercolor painting technique, peaceful neighborhood atmosphere.",
    tokens: ["CHARACTER"],
    enhancements: ["suburban garden setting", "everyday neighborhood life", "peaceful community"]
  },
  {
    id: "underground-world",
    category: "ghibli",
    name: "Underground World",
    basePrompt: "A Studio Ghibli style underground world with [CHARACTER] featuring glowing crystal formations, bioluminescent plants, underground lakes, and a sense of hidden wonder and mystery. Soft watercolor painting technique, mysterious underground atmosphere.",
    tokens: ["CHARACTER"],
    enhancements: ["glowing crystal formations", "bioluminescent plants", "hidden wonder"]
  },
  {
    id: "young-adventurer",
    category: "ghibli",
    name: "Young Adventurer Character",
    basePrompt: "A Studio Ghibli style young adventurer with large expressive eyes, tousled hair, wearing simple practical clothing, carrying a small backpack, with an expression of wonder and determination. Soft watercolor painting technique, curious and brave character design.",
    tokens: [],
    enhancements: ["large expressive eyes", "wonder and determination", "practical adventurer clothing"]
  },
  {
    id: "forest-spirit",
    category: "ghibli",
    name: "Forest Spirit Character",
    basePrompt: "A Studio Ghibli style forest spirit with flowing green hair resembling leaves, delicate features, wearing clothing made of natural materials, with a gentle and wise expression. Soft watercolor painting technique, mystical nature guardian design.",
    tokens: [],
    enhancements: ["flowing leaf-like hair", "gentle and wise expression", "natural material clothing"]
  },
  {
    id: "witch-apprentice",
    category: "ghibli",
    name: "Witch Apprentice Character",
    basePrompt: "A Studio Ghibli style witch apprentice with a conical hat, flowing robes, carrying a broomstick, with an expression of concentration and magical potential. Soft watercolor painting technique, magical young witch design.",
    tokens: [],
    enhancements: ["conical witch hat", "flowing magical robes", "concentration expression"]
  },
  {
    id: "talking-animal",
    category: "ghibli",
    name: "Talking Animal Character",
    basePrompt: "A Studio Ghibli style talking animal with expressive human-like eyes, detailed fur or feathers, wearing simple accessories, with a personality that shines through. Soft watercolor painting technique, anthropomorphic animal design.",
    tokens: [],
    enhancements: ["expressive human-like eyes", "detailed fur/feathers", "anthropomorphic personality"]
  },
  {
    id: "elderly-craftsman",
    category: "ghibli",
    name: "Elderly Craftsman Character",
    basePrompt: "A Studio Ghibli style elderly craftsman with weathered but gentle features, wearing work clothes, holding tools, with an expression of quiet wisdom and skill. Soft watercolor painting technique, wise artisan character design.",
    tokens: [],
    enhancements: ["weathered gentle features", "work clothing and tools", "quiet wisdom expression"]
  },
  {
    id: "magical-creature",
    category: "ghibli",
    name: "Magical Creature Character",
    basePrompt: "A Studio Ghibli style magical creature with ethereal features, glowing elements, delicate wings or appendages, with a mysterious and enchanting presence. Soft watercolor painting technique, fantastical being design.",
    tokens: [],
    enhancements: ["ethereal glowing features", "delicate wings/appendages", "mysterious enchantment"]
  },
  {
    id: "young-inventor",
    category: "ghibli",
    name: "Young Inventor Character",
    basePrompt: "A Studio Ghibli style young inventor with messy hair, wearing overalls with many pockets, carrying small gadgets and tools, with an expression of clever curiosity. Soft watercolor painting technique, inventive young character design.",
    tokens: [],
    enhancements: ["messy inventive hair", "overalls with pockets", "clever curiosity expression"]
  },
  {
    id: "nature-guardian",
    category: "ghibli",
    name: "Nature Guardian Character",
    basePrompt: "A Studio Ghibli style nature guardian with features resembling natural elements, wearing earth-toned clothing, with an expression of quiet strength and protection. Soft watercolor painting technique, elemental protector design.",
    tokens: [],
    enhancements: ["natural element features", "earth-toned clothing", "quiet strength expression"]
  },
  {
    id: "golden-hour-lighting",
    category: "ghibli",
    name: "Golden Hour Time of Day",
    basePrompt: "During golden hour with warm orange and pink light casting long shadows, creating a magical and peaceful atmosphere. Soft watercolor painting technique, Studio Ghibli lighting style.",
    tokens: [],
    enhancements: ["warm orange/pink lighting", "long shadow casting", "magical peaceful atmosphere"]
  },
  {
    id: "blue-hour-lighting",
    category: "ghibli",
    name: "Blue Hour Time of Day",
    basePrompt: "During blue hour with cool blue tones and soft diffused light, creating a mysterious and tranquil atmosphere. Soft watercolor painting technique, Studio Ghibli lighting style.",
    tokens: [],
    enhancements: ["cool blue tone lighting", "soft diffused light", "mysterious tranquil atmosphere"]
  },
  {
    id: "floating-lanterns",
    category: "ghibli",
    name: "Floating Lanterns Element",
    basePrompt: "Surrounded by floating paper lanterns casting warm, magical light. Soft watercolor painting technique, Studio Ghibli magical elements.",
    tokens: [],
    enhancements: ["floating paper lanterns", "warm magical light", "traditional lantern design"]
  },
  {
    id: "glowing-mushrooms",
    category: "ghibli",
    name: "Glowing Mushrooms Element",
    basePrompt: "With glowing mushrooms scattered around emitting soft magical light. Soft watercolor painting technique, Studio Ghibli magical elements.",
    tokens: [],
    enhancements: ["glowing mushroom clusters", "soft magical light emission", "forest floor scattering"]
  }
];

// Music Star Templates
export const musicStarTemplates: PromptTemplate[] = [
  {
    id: "rock-legend",
    category: "musicStar",
    name: "Rock Legend",
    basePrompt: "A legendary rock guitarist [NAME] in torn jeans, leather vest, and scuffed boots, posed mid-solo with flying hair and intense expression. The figure holds a battered electric guitar with peeling stickers and worn strings. The backdrop depicts a smoky stage with Marshall amp stacks and colored stage lights. Accessories include a leather belt with metal studs and a cigarette prop. Dramatic concert lighting and motion blur effects for high-energy rock performance feel. Stage presence and performance energy, musical instrument integration, vibrant performance lighting, entertainment industry professionalism.",
    tokens: ["NAME"],
    enhancements: ["rock concert atmosphere", "high-energy performance", "authentic rock styling"]
  },
  {
    id: "disco-diva",
    category: "musicStar",
    name: "Disco Diva",
    basePrompt: "A glamorous disco-era performer [NAME] in a sequined jumpsuit with plunging neckline and platform heels, captured mid-dance with flowing hair and sparkling jewelry. The figure holds a vintage microphone with coiled cord. The backdrop shows a grand theater with velvet curtains and crystal chandeliers. Accessories include a crown prop and sheet music stand. Photographed with warm stage lighting and soft shadows for sophisticated soul music elegance. Stage presence and performance energy, crowd interaction and showmanship, vibrant performance lighting.",
    tokens: ["NAME"],
    enhancements: ["disco era styling", "theatrical performance", "glamorous presentation"]
  },
  {
    id: "hip-hop-icon",
    category: "musicStar",
    name: "Hip-Hop Icon",
    basePrompt: "A street-styled urban performer [NAME] in oversized hoodie, baggy jeans, and chunky sneakers, posed mid-rap with one hand holding a vintage microphone. The backdrop shows graffiti-covered brick walls, chain-link fences, and golden-hour urban lighting. Accessories include gold chains, a boombox base, and removable baseball cap. The figure features detailed tattoos and expressive facial sculpting, photographed with hard shadows and warm street lighting for authentic hip-hop authenticity. Stage presence and performance energy, urban street culture, authentic hip-hop styling.",
    tokens: ["NAME"],
    enhancements: ["urban street setting", "graffiti-covered walls", "authentic hip-hop culture"]
  },
  {
    id: "punk-rebel",
    category: "musicStar",
    name: "Punk Rebel",
    basePrompt: "A rebellious punk rocker [NAME] in ripped t-shirt, studded leather jacket, and combat boots, posed with aggressive stance and spiked hair. The figure holds a battered electric guitar with safety pins and band stickers. The backdrop shows a gritty club with broken beer bottles and graffiti-covered walls. Accessories include a mohawk comb and chain wallet. Photographed with harsh lighting and high contrast for raw, underground punk aesthetic. Stage presence and performance energy, rebellious punk attitude, underground music culture.",
    tokens: ["NAME"],
    enhancements: ["gritty club setting", "broken beer bottles", "raw punk aesthetic"]
  },
  {
    id: "reggae-mystic",
    category: "musicStar",
    name: "Reggae Mystic",
    basePrompt: "A laid-back reggae performer [NAME] in colorful knit hat, loose linen shirt, and cargo shorts, posed with acoustic guitar and relaxed island vibe. The backdrop features palm trees, ocean waves, and tropical sunset gradients. Accessories include beaded necklaces and a small drum prop. The figure has dreadlock hair sculpting and peaceful expression, photographed with warm golden lighting and soft focus for authentic island reggae atmosphere. Stage presence and performance energy, tropical island culture, laid-back reggae vibe.",
    tokens: ["NAME"],
    enhancements: ["tropical island setting", "palm trees and ocean", "authentic reggae culture"]
  },
  {
    id: "soul-diva",
    category: "musicStar",
    name: "Soul Diva",
    basePrompt: "An elegant soul singer [NAME] in flowing gown with fur stole and sparkling earrings, posed mid-performance with expressive hand gestures. The figure holds a vintage microphone with coiled cord. The backdrop shows a grand theater with velvet curtains and crystal chandeliers. Accessories include a crown prop and sheet music stand. Photographed with warm stage lighting and soft shadows for sophisticated soul music elegance. Stage presence and performance energy, elegant theater setting, sophisticated soul styling.",
    tokens: ["NAME"],
    enhancements: ["grand theater backdrop", "velvet curtains", "sophisticated soul elegance"]
  },
  {
    id: "metal-warrior",
    category: "musicStar",
    name: "Metal Warrior",
    basePrompt: "A heavy metal warrior [NAME] in black leather pants, studded belt, and sleeveless denim vest, posed with electric guitar raised high. The figure has long hair, tattoos, and intense facial expression. The backdrop depicts flames, skulls, and gothic architecture. Accessories include a pentagram pendant and leather wristbands. Photographed with dramatic red lighting and smoke effects for powerful metal concert atmosphere. Stage presence and performance energy, gothic metal aesthetic, powerful warrior presence.",
    tokens: ["NAME"],
    enhancements: ["flames and skulls", "gothic architecture", "powerful metal atmosphere"]
  },
  {
    id: "country-outlaw",
    category: "musicStar",
    name: "Country Outlaw",
    basePrompt: "A rugged country singer [NAME] in cowboy hat, plaid shirt, jeans, and cowboy boots, posed with acoustic guitar and confident stance. The backdrop shows a wooden stage, hay bales, and American flag. Accessories include a bandana and sheriff's badge. The figure has weathered facial sculpting and relaxed posture, photographed with warm barn lighting and dust particles for authentic country music feel. Stage presence and performance energy, rustic country setting, authentic outlaw styling.",
    tokens: ["NAME"],
    enhancements: ["wooden stage setting", "hay bales and flags", "authentic country culture"]
  },
  {
    id: "jazz-saxophonist",
    category: "musicStar",
    name: "Jazz Saxophonist",
    basePrompt: "A sophisticated jazz musician [NAME] in tuxedo with bowtie and fedora, posed playing saxophone with eyes closed in musical ecstasy. The backdrop features a smoky jazz club with piano and cocktail glasses. Accessories include a cigarette holder and martini glass. The figure has detailed facial expression and relaxed posture, photographed with warm amber lighting and soft focus for intimate jazz club atmosphere. Stage presence and performance energy, smoky jazz club, sophisticated jazz styling.",
    tokens: ["NAME"],
    enhancements: ["smoky jazz club", "cocktail lounge atmosphere", "intimate jazz performance"]
  },
  {
    id: "funk-groove-master",
    category: "musicStar",
    name: "Funk Groove Master",
    basePrompt: "A funky performer [NAME] in bright patterned shirt, bell-bottoms, and platform shoes, posed with electric bass and dynamic dance move. The backdrop shows colorful geometric patterns and disco ball reflections. Accessories include a wide-brimmed hat and gold chains. The figure has animated expression and energetic posture, photographed with vibrant colors and motion blur for infectious funk energy. Stage presence and performance energy, colorful funk aesthetic, energetic groove performance.",
    tokens: ["NAME"],
    enhancements: ["colorful geometric patterns", "disco ball reflections", "infectious funk energy"]
  },
  {
    id: "blues-guitar-hero",
    category: "musicStar",
    name: "Blues Guitar Hero",
    basePrompt: "A weathered blues guitarist [NAME] in worn suit, fedora, and scuffed shoes, posed with electric guitar and soulful expression showing detailed facial features and emotional depth. The backdrop depicts a dimly lit stage with whiskey bottles and cigarette smoke creating atmospheric depth. Accessories include a harmonica holder and bottle prop. The figure has detailed age lines and expressive face with textured skin details, photographed with moody lighting, grain effects, and warm amber tones for authentic blues club atmosphere. Stage presence and performance energy, dimly lit blues club, soulful blues expression.",
    tokens: ["NAME"],
    enhancements: ["whiskey bottles and smoke", "moody blues atmosphere", "authentic blues club"]
  },
  {
    id: "electronic-synth-master",
    category: "musicStar",
    name: "Electronic Synth Master",
    basePrompt: "A futuristic electronic musician [NAME] in metallic jacket, neon visor, and fingerless gloves, posed at a glowing synthesizer keyboard. The backdrop features digital grids, neon lights, and holographic effects. Accessories include detachable headphones and data cables. The figure has cybernetic details and intense focus, photographed with blue LED lighting and digital artifacts for cutting-edge electronic music aesthetic. Stage presence and performance energy, futuristic electronic setting, cybernetic electronic styling.",
    tokens: ["NAME"],
    enhancements: ["digital grids and holograms", "neon lighting effects", "cutting-edge electronic aesthetic"]
  },
  {
    id: "folk-troubadour",
    category: "musicStar",
    name: "Folk Troubadour",
    basePrompt: "A wandering folk musician [NAME] in patchwork vest, jeans, and hiking boots, posed with acoustic guitar and peaceful expression showing gentle smile and relaxed posture. The backdrop shows forest paths, campfires with warm glowing light, and starry night skies with twinkling details. Accessories include a harmonica and backpack. The figure has weathered features with detailed skin texture and relaxed posture, photographed with natural lighting, soft focus effects, and warm campfire glow for intimate folk music storytelling atmosphere. Stage presence and performance energy, forest campfire setting, intimate folk storytelling.",
    tokens: ["NAME"],
    enhancements: ["forest paths and campfires", "starry night skies", "intimate folk atmosphere"]
  },
  {
    id: "gospel-choir-director",
    category: "musicStar",
    name: "Gospel Choir Director",
    basePrompt: "An inspirational gospel leader [NAME] in flowing robe, choir stole, and expressive pose with raised hands. The figure holds a conductor's baton and has animated facial expression. The backdrop features stained glass windows and choir robes. Accessories include a cross pendant and sheet music. Photographed with warm, uplifting lighting and soft glows for spiritual gospel atmosphere. Stage presence and performance energy, stained glass setting, spiritual gospel styling.",
    tokens: ["NAME"],
    enhancements: ["stained glass windows", "choir robe backdrop", "spiritual gospel atmosphere"]
  },
  {
    id: "latin-rhythm-master",
    category: "musicStar",
    name: "Latin Rhythm Master",
    basePrompt: "A passionate Latin performer [NAME] in vibrant shirt, tight pants, and dance shoes, posed with maracas and energetic expression. The backdrop shows tropical colors, maracas, and dance floor patterns. Accessories include a sombrero and guitarron. The figure has animated dance posture, photographed with warm tropical lighting and vibrant colors for lively Latin music energy. Stage presence and performance energy, tropical dance setting, passionate Latin styling.",
    tokens: ["NAME"],
    enhancements: ["tropical color patterns", "maracas and dance floors", "lively Latin energy"]
  },
  {
    id: "opera-diva",
    category: "musicStar",
    name: "Opera Diva",
    basePrompt: "A dramatic opera singer [NAME] in elaborate gown, jewels, and powdered wig, posed mid-aria with outstretched arms. The figure holds a decorative fan and has intense expression. The backdrop features grand theater curtains and crystal chandeliers. Accessories include opera glasses and rose prop. Photographed with theatrical lighting and dramatic shadows for classical opera grandeur. Stage presence and performance energy, grand theater setting, dramatic opera styling.",
    tokens: ["NAME"],
    enhancements: ["grand theater curtains", "crystal chandeliers", "classical opera grandeur"]
  },
  {
    id: "rap-battle-champion",
    category: "musicStar",
    name: "Rap Battle Champion",
    basePrompt: "A competitive rapper [NAME] in tracksuit, sneakers, and gold chains, posed mid-lyric delivery with intense expression. The figure holds a microphone with coiled cord. The backdrop shows urban graffiti and stage lights. Accessories include a grill and backpack. Photographed with dramatic spotlights and motion effects for high-energy rap battle atmosphere. Stage presence and performance energy, urban graffiti setting, competitive rap styling.",
    tokens: ["NAME"],
    enhancements: ["urban graffiti backdrop", "stage lighting effects", "high-energy rap atmosphere"]
  },
  {
    id: "bluegrass-fiddler",
    category: "musicStar",
    name: "Bluegrass Fiddler",
    basePrompt: "A spirited bluegrass musician [NAME] in overalls, work boots, and straw hat, posed playing fiddle with animated expression. The backdrop shows barn wood, hay bales, and string instruments. Accessories include a bow and banjo. The figure has energetic posture and detailed facial animation, photographed with warm barn lighting for authentic bluegrass jam session feel. Stage presence and performance energy, rustic barn setting, spirited bluegrass styling.",
    tokens: ["NAME"],
    enhancements: ["barn wood and hay bales", "string instrument backdrop", "authentic bluegrass jam"]
  },
  {
    id: "techno-dj",
    category: "musicStar",
    name: "Techno DJ",
    basePrompt: "A futuristic DJ [NAME] in glowing visor, cybernetic jacket, and fingerless gloves, posed at turntables with animated mixing gestures. The backdrop features digital waveforms, LED lights, and holographic effects. Accessories include detachable headphones and vinyl records. Photographed with neon lighting and digital glitches for cutting-edge techno club atmosphere. Stage presence and performance energy, digital waveform setting, futuristic techno styling.",
    tokens: ["NAME"],
    enhancements: ["digital waveforms", "LED light effects", "cutting-edge techno atmosphere"]
  },
  {
    id: "celtic-harpist",
    category: "musicStar",
    name: "Celtic Harpist",
    basePrompt: "An ethereal Celtic musician [NAME] in flowing gown and braided hair, posed playing harp with serene expression. The backdrop shows ancient stone circles, misty landscapes, and Celtic knotwork. Accessories include a torc necklace and Celtic knot brooch. Photographed with mystical lighting and soft focus for enchanting Celtic music atmosphere. Stage presence and performance energy, ancient stone setting, ethereal Celtic styling.",
    tokens: ["NAME"],
    enhancements: ["ancient stone circles", "misty landscapes", "enchanting Celtic atmosphere"]
  },
  {
    id: "samba-drummer",
    category: "musicStar",
    name: "Samba Drummer",
    basePrompt: "An energetic samba performer [NAME] in colorful costume, feathered headdress, and bare feet, posed with surdo drum and joyful expression. The backdrop features carnival colors, confetti, and dance crowds. Accessories include maracas and feathered accessories. Photographed with vibrant tropical lighting for festive samba parade atmosphere. Stage presence and performance energy, carnival color setting, festive samba styling.",
    tokens: ["NAME"],
    enhancements: ["carnival colors and confetti", "dance crowd backdrop", "festive samba atmosphere"]
  },
  {
    id: "doo-wop-singer",
    category: "musicStar",
    name: "Doo-Wop Vocal Harmony",
    basePrompt: "A doo-wop style harmony singer [NAME] in leather jacket, pompadour hair, and microphone, posed mid-harmony with animated expression showing wide smile and energetic posture. The backdrop shows 50s diner with checkered floor patterns, jukebox with glowing lights, and classic cars with chrome details. Accessories include a comb and leather wallet. Photographed with warm nostalgic lighting, soft focus effects, and vibrant color tones for classic vocal group aesthetic. Stage presence and performance energy, 50s diner setting, nostalgic doo-wop styling.",
    tokens: ["NAME"],
    enhancements: ["50s diner atmosphere", "jukebox and classic cars", "nostalgic vocal group"]
  },
  {
    id: "industrial-noise-artist",
    category: "musicStar",
    name: "Industrial Noise Artist",
    basePrompt: "An experimental noise musician [NAME] in distressed clothing, safety pins, and welding mask, posed with modified guitar and intense expression. The backdrop features factory machinery, sparks, and urban decay. Accessories include circuit boards and metal scraps. Photographed with harsh industrial lighting for experimental noise music aesthetic. Stage presence and performance energy, factory machinery setting, experimental noise styling.",
    tokens: ["NAME"],
    enhancements: ["factory machinery backdrop", "sparks and urban decay", "experimental noise aesthetic"]
  },
  {
    id: "world-fusion-musician",
    category: "musicStar",
    name: "World Fusion Musician",
    basePrompt: "A global fusion artist [NAME] in eclectic clothing mixing traditional and modern elements, posed with world instruments and peaceful expression. The backdrop shows world map patterns and cultural symbols. Accessories include prayer beads and world instrument props. Photographed with warm global lighting for multicultural music fusion atmosphere. Stage presence and performance energy, world map setting, multicultural fusion styling.",
    tokens: ["NAME"],
    enhancements: ["world map patterns", "cultural symbol backdrop", "multicultural fusion atmosphere"]
  },
  {
    id: "baroque-composer",
    category: "musicStar",
    name: "Baroque Composer",
    basePrompt: "An elegant baroque musician [NAME] in powdered wig, velvet coat, and lace cuffs, posed conducting with ornate baton. The backdrop features classical architecture and orchestral instruments. Accessories include a quill pen and sheet music. Photographed with dramatic classical lighting for historical baroque music atmosphere. Stage presence and performance energy, classical architecture setting, elegant baroque styling.",
    tokens: ["NAME"],
    enhancements: ["classical architecture", "orchestral instrument backdrop", "historical baroque atmosphere"]
  },
  {
    id: "afrobeat-revolutionary",
    category: "musicStar",
    name: "Afrobeat Revolutionary",
    basePrompt: "A charismatic afrobeat musician [NAME] in colorful dashiki, bell necklace, and energetic pose with saxophone. The backdrop shows African patterns, liberation symbols, and vibrant colors. Accessories include cowrie shells and African beads. Photographed with warm African lighting for revolutionary afrobeat energy. Stage presence and performance energy, African pattern setting, revolutionary afrobeat styling.",
    tokens: ["NAME"],
    enhancements: ["African patterns and symbols", "liberation color scheme", "revolutionary afrobeat energy"]
  },
  {
    id: "chamber-pop-songwriter",
    category: "musicStar",
    name: "Chamber Pop Songwriter",
    basePrompt: "An introspective chamber pop musician [NAME] in cardigan sweater and glasses, posed with acoustic guitar and thoughtful expression. The backdrop features cozy studio, vintage microphones, and sheet music. Accessories include reading glasses and notebook. Photographed with soft intimate lighting for delicate chamber pop atmosphere. Stage presence and performance energy, cozy studio setting, introspective chamber pop styling.",
    tokens: ["NAME"],
    enhancements: ["cozy studio atmosphere", "vintage microphone setup", "delicate chamber pop"]
  },
  {
    id: "tribal-drummer",
    category: "musicStar",
    name: "Tribal Drummer",
    basePrompt: "An ancient tribal drummer [NAME] in ceremonial attire and body paint, posed with tribal drum and spiritual expression. The backdrop shows tribal patterns, ceremonial fires, and ancestral spirits. Accessories include ceremonial mask and tribal jewelry. Photographed with mystical lighting for spiritual tribal music atmosphere. Stage presence and performance energy, tribal pattern setting, spiritual tribal styling.",
    tokens: ["NAME"],
    enhancements: ["tribal patterns and fires", "ceremonial ancestral spirits", "spiritual tribal atmosphere"]
  },
  {
    id: "lounge-crooner",
    category: "musicStar",
    name: "Lounge Crooner",
    basePrompt: "A sophisticated lounge singer [NAME] in tuxedo and fedora, posed with cocktail microphone and smooth expression. The backdrop features cocktail lounge, piano, and martini glasses. Accessories include cigarette holder and bowtie. Photographed with warm amber lighting for classic lounge music elegance. Stage presence and performance energy, cocktail lounge setting, sophisticated lounge styling.",
    tokens: ["NAME"],
    enhancements: ["cocktail lounge atmosphere", "piano and martini backdrop", "classic lounge elegance"]
  },
  {
    id: "psychedelic-rock",
    category: "musicStar",
    name: "Psychedelic Rock",
    basePrompt: "A psychedelic rock musician [NAME] in tie-dye shirt, bell-bottoms, and headband, posed with electric guitar and trippy expression. The backdrop features swirling colors, peace signs, and psychedelic patterns. Accessories include love beads and incense holder. Photographed with vibrant psychedelic lighting for mind-bending rock atmosphere. Stage presence and performance energy, psychedelic pattern setting, mind-bending rock styling.",
    tokens: ["NAME"],
    enhancements: ["swirling psychedelic colors", "peace signs and patterns", "mind-bending rock atmosphere"]
  },
  {
    id: "marching-band-leader",
    category: "musicStar",
    name: "Marching Band Leader",
    basePrompt: "An enthusiastic marching band director [NAME] in uniform and hat, posed conducting with baton and animated expression. The backdrop shows football field, cheerleaders, and band formation. Accessories include whistle and megaphone. Photographed with bright stadium lighting for energetic marching band atmosphere. Stage presence and performance energy, football field setting, enthusiastic marching band styling.",
    tokens: ["NAME"],
    enhancements: ["football field backdrop", "cheerleaders and band formation", "energetic marching atmosphere"]
  },
  {
    id: "sea-shanty-singer",
    category: "musicStar",
    name: "Sea Shanty Singer",
    basePrompt: "A rugged sea shanty singer [NAME] in sailor's uniform and tricorn hat, posed with accordion and hearty expression. The backdrop features ship deck, ocean waves, and pirate flags. Accessories include spyglass and rope. Photographed with salty sea lighting for adventurous maritime music atmosphere. Stage presence and performance energy, ship deck setting, adventurous maritime styling.",
    tokens: ["NAME"],
    enhancements: ["ship deck and ocean waves", "pirate flag backdrop", "adventurous maritime atmosphere"]
  }
];

// Retro Action Figure Templates
export const retroActionFigureTemplates: PromptTemplate[] = [
  {
    id: "tech-commando",
    category: "retro",
    name: "Tech Commando",
    basePrompt: "A high-tech commando [NAME] in advanced tactical armor, helmet with targeting visor, and energy weapons, posed in combat-ready stance on a futuristic battlefield with laser grids and holographic displays. The figure features glowing cybernetic implants and modular weapon systems, photographed with neon lighting and digital artifacts for cutting-edge military aesthetic. Period-appropriate technology and styling, nostalgic color palettes and materials, era-specific cultural references.",
    tokens: ["NAME"],
    enhancements: ["futuristic technology", "military aesthetic", "cybernetic details"]
  },
  {
    id: "jungle-explorer",
    category: "retro",
    name: "Jungle Explorer",
    basePrompt: "An adventurous jungle explorer [NAME] in safari gear, backpack, and machete, posed in dense jungle with exotic plants and ancient ruins. The figure has exploration tools and survival gear, photographed with natural lighting and jungle atmosphere for adventurous explorer aesthetic. Period-appropriate technology and styling, classic design elements and motifs, authentic retro atmosphere.",
    tokens: ["NAME"],
    enhancements: ["jungle exploration", "adventure gear", "natural environment"]
  }
];

// TV Show Character Templates
export const tvShowTemplates: PromptTemplate[] = [
  {
    id: "high-school-heartthrob",
    category: "tvShow",
    name: "High School Heartthrob",
    basePrompt: "A charismatic teen idol [NAME] in letterman jacket, jeans, and sneakers, posed with confident smile and perfect hair styling. The figure stands in a high school hallway backdrop with lockers, posters, and trophy cases. Accessories include a backpack and sports trophy. The design emphasizes clean, youthful features and approachable charm, photographed with bright, natural lighting that captures the essence of teenage popularity and school spirit. Character-driven emotional storytelling, professional acting and expression, narrative composition and framing.",
    tokens: ["NAME"],
    enhancements: ["teen idol charm", "high school setting", "youthful energy"]
  },
  {
    id: "paranormal-agent",
    category: "tvShow",
    name: "Paranormal Agent",
    basePrompt: "A mysterious supernatural investigator [NAME] in trench coat, fedora, and dark sunglasses, posed with determined expression and mystical amulet. The backdrop features foggy streets, gothic architecture, and subtle supernatural effects. Accessories include a flashlight and ancient tome. The figure has weathered features and intense gaze, photographed with moody lighting and atmospheric shadows for a mysterious, otherworldly presence. Character-driven emotional storytelling, production design authenticity, genre-specific visual language.",
    tokens: ["NAME"],
    enhancements: ["supernatural mystery", "gothic atmosphere", "investigative presence"]
  }
];

// Wrestling Character Templates
export const wrestlingTemplates: PromptTemplate[] = [
  {
    id: "showman-champion",
    category: "wrestling",
    name: "Showman Champion",
    basePrompt: "A charismatic wrestling champion [NAME] in elaborate entrance robe, championship belt, and signature pose, standing on a wrestling ring with spotlights and crowd reactions. The backdrop features arena crowds, championship banners, and pyrotechnic effects. Accessories include a championship belt and microphone. The figure has flamboyant features and championship presence, photographed with dramatic arena lighting that emphasizes showmanship and wrestling entertainment. High-intensity athletic performance, arena atmosphere and crowd energy, dramatic lighting and special effects.",
    tokens: ["NAME"],
    enhancements: ["championship presence", "arena atmosphere", "showman charisma"]
  },
  {
    id: "masked-high-flyer",
    category: "wrestling",
    name: "Masked High-Flyer",
    basePrompt: "A mysterious masked wrestler [NAME] in colorful mask, athletic gear, and acrobatic stance, posed on the top rope with aerial readiness. The backdrop features wrestling rings, turnbuckles, and crowd anticipation. Accessories include a colorful mask and protective gear. The figure has athletic features and aerial presence, photographed with dynamic lighting that emphasizes high-flying action and masked mystery. High-intensity athletic performance, dramatic lighting and special effects, powerful physical presence and poses.",
    tokens: ["NAME"],
    enhancements: ["aerial athleticism", "masked mystery", "high-flying action"]
  }
];

// Helper functions
export function getAllTemplates(): PromptTemplate[] {
  return [
    ...actionFigureTemplates,
    ...memeTemplates,
    ...cartoonTemplates,
    ...ghibliTemplates,
    ...musicStarTemplates,
    ...retroActionFigureTemplates,
    ...tvShowTemplates,
    ...wrestlingTemplates
  ];
}

export function getTemplatesByCategory(category: string): PromptTemplate[] {
  const allTemplates = getAllTemplates();
  return allTemplates.filter(template => template.category === category);
}

export function getTemplateById(id: string): PromptTemplate | undefined {
  const allTemplates = getAllTemplates();
  return allTemplates.find(template => template.id === id);
}

export function searchTemplates(query: string): PromptTemplate[] {
  const allTemplates = getAllTemplates();
  const lowerQuery = query.toLowerCase();

  return allTemplates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.category.toLowerCase().includes(lowerQuery) ||
    template.basePrompt.toLowerCase().includes(lowerQuery)
  );
}

// Category metadata
export const categoryMetadata = {
  actionFigure: {
    name: "Action Figures",
    description: "Collectible toy figures with professional packaging",
    icon: "🤖",
    color: "blue"
  },
  meme: {
    name: "Memes",
    description: "Viral social media images with text overlays",
    icon: "😂",
    color: "purple"
  },
  cartoon: {
    name: "Cartoons",
    description: "Animated and cartoon-style characters",
    icon: "🎨",
    color: "green"
  },
  ghibli: {
    name: "Ghibli Style",
    description: "Studio Ghibli inspired watercolor animation",
    icon: "🌟",
    color: "pink"
  },
  musicStar: {
    name: "Music Stars",
    description: "Musical performers and entertainment figures",
    icon: "🎤",
    color: "red"
  },
  retro: {
    name: "Retro",
    description: "Classic and nostalgic character designs",
    icon: "🕰️",
    color: "orange"
  },
  tvShow: {
    name: "TV Shows",
    description: "Television and film character depictions",
    icon: "📺",
    color: "teal"
  },
  wrestling: {
    name: "Wrestling",
    description: "Professional wrestling character figures",
    icon: "💪",
    color: "yellow"
  }
];

// MARKETING & BRANDING TEMPLATES
export const marketingTemplates: PromptTemplate[] = [
  {
    id: "product-launch-banner",
    category: "marketing",
    name: "Product Launch Banner",
    basePrompt: "Create an eye-catching product launch banner for [PRODUCT_NAME] by [COMPANY]. The banner features [NAME] as the spokesperson, with bold typography announcing 'Coming Soon' or 'Now Available'. Include [COMPANY] branding colors ([BRAND_COLOR]), professional lighting, and a clean, modern design that conveys innovation and excitement. High-resolution banner suitable for digital marketing, social media, and website headers.",
    tokens: ["PRODUCT_NAME", "COMPANY", "NAME", "BRAND_COLOR"],
    enhancements: ["bold typography", "brand consistency", "digital marketing ready"]
  },
  {
    id: "brand-identity-packshot",
    category: "marketing",
    name: "Brand Identity Packshot",
    basePrompt: "Create a professional product packshot featuring [NAME] from [COMPANY] with [PRODUCT_NAME]. The composition showcases the product in a lifestyle setting with [COMPANY] branding elements prominently displayed. Use [BRAND_COLOR] as the primary color scheme, include company logo placement, and maintain brand consistency throughout. Clean, commercial photography style with perfect lighting and professional composition.",
    tokens: ["NAME", "COMPANY", "PRODUCT_NAME", "BRAND_COLOR"],
    enhancements: ["brand consistency", "professional packshot", "lifestyle integration"]
  },
  {
    id: "corporate-headshot-suite",
    category: "marketing",
    name: "Corporate Headshot Suite",
    basePrompt: "Create a professional corporate headshot of [NAME], [TITLE] at [COMPANY]. The portrait shows [NAME] in business professional attire with [COMPANY] branding elements subtly incorporated. Clean background, professional lighting, approachable expression, and high-quality commercial photography suitable for LinkedIn, company website, and business cards.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["corporate professionalism", "brand integration", "business portraiture"]
  },
  {
    id: "social-media-post",
    category: "marketing",
    name: "Social Media Post",
    basePrompt: "Design an engaging social media post featuring [NAME] from [COMPANY] promoting [PRODUCT_NAME]. The image includes eye-catching text overlay '[POST_TEXT]', uses [BRAND_COLOR] branding, and is optimized for Instagram/LinkedIn format. Include relevant hashtags, call-to-action, and professional composition suitable for social media engagement.",
    tokens: ["NAME", "COMPANY", "PRODUCT_NAME", "POST_TEXT", "BRAND_COLOR"],
    enhancements: ["social media optimization", "engagement focused", "brand messaging"]
  },
  {
    id: "email-header-banner",
    category: "marketing",
    name: "Email Header Banner",
    basePrompt: "Create an email header banner featuring [NAME] from [COMPANY] with the subject '[EMAIL_SUBJECT]'. The banner uses [BRAND_COLOR] branding, includes company logo, and has a professional design suitable for email marketing campaigns. Clean typography, high contrast for readability, and optimized dimensions for email clients.",
    tokens: ["NAME", "COMPANY", "EMAIL_SUBJECT", "BRAND_COLOR"],
    enhancements: ["email marketing optimized", "professional branding", "high readability"]
  },
  {
    id: "trade-show-booth",
    category: "marketing",
    name: "Trade Show Booth",
    basePrompt: "Design a trade show booth backdrop featuring [NAME] from [COMPANY] showcasing [PRODUCT_NAME]. The booth design incorporates [BRAND_COLOR] branding, company logo, product displays, and professional lighting. Large format suitable for trade show environments with high visibility and brand impact.",
    tokens: ["NAME", "COMPANY", "PRODUCT_NAME", "BRAND_COLOR"],
    enhancements: ["large format design", "trade show optimized", "brand visibility"]
  },
  {
    id: "advertisement-billboard",
    category: "marketing",
    name: "Advertisement Billboard",
    basePrompt: "Create a striking billboard advertisement featuring [NAME] from [COMPANY] with the tagline '[TAGLINE]'. The design uses bold typography, [BRAND_COLOR] branding, and is optimized for high-visibility outdoor advertising. Simple, impactful composition with strong visual hierarchy and brand recognition.",
    tokens: ["NAME", "COMPANY", "TAGLINE", "BRAND_COLOR"],
    enhancements: ["outdoor advertising", "high visibility", "bold impact"]
  },
  {
    id: "brand-merchandise",
    category: "marketing",
    name: "Brand Merchandise",
    basePrompt: "Design branded merchandise featuring [NAME] from [COMPANY] on [PRODUCT_TYPE] (t-shirt, mug, etc.). The design incorporates company logo, [BRAND_COLOR] branding, and professional artwork suitable for commercial printing. Clean, scalable design with proper spacing and brand consistency.",
    tokens: ["NAME", "COMPANY", "PRODUCT_TYPE", "BRAND_COLOR"],
    enhancements: ["commercial printing", "brand merchandise", "scalable design"]
  },
  {
    id: "press-release-image",
    category: "marketing",
    name: "Press Release Image",
    basePrompt: "Create a professional press release image featuring [NAME], [TITLE] from [COMPANY] announcing '[ANNOUNCEMENT]'. The image includes company logo, professional headshot, and clean typography suitable for media distribution. High-quality composition for print and digital press materials.",
    tokens: ["NAME", "TITLE", "COMPANY", "ANNOUNCEMENT"],
    enhancements: ["press release quality", "media distribution", "professional presentation"]
  },
  {
    id: "brand-guidelines-cover",
    category: "marketing",
    name: "Brand Guidelines Cover",
    basePrompt: "Design a brand guidelines cover page featuring [NAME] from [COMPANY] with the title 'Brand Guidelines [YEAR]'. The design showcases brand colors ([BRAND_COLOR]), typography, and visual elements in a professional layout suitable for internal brand documentation.",
    tokens: ["NAME", "COMPANY", "YEAR", "BRAND_COLOR"],
    enhancements: ["brand documentation", "professional layout", "internal guidelines"]
  },
  {
    id: "conference-speaker",
    category: "marketing",
    name: "Conference Speaker",
    basePrompt: "Create a conference speaker introduction slide featuring [NAME], [TITLE] from [COMPANY] speaking on '[TOPIC]'. The design includes professional headshot, company branding, and clean typography suitable for presentation slides and conference materials.",
    tokens: ["NAME", "TITLE", "COMPANY", "TOPIC"],
    enhancements: ["presentation ready", "conference materials", "speaker introduction"]
  },
  {
    id: "partnership-announcement",
    category: "marketing",
    name: "Partnership Announcement",
    basePrompt: "Design a partnership announcement graphic featuring representatives from [COMPANY] and [PARTNER_COMPANY], with [NAME] as the key contact. The image shows handshake or collaboration theme with both company logos and professional branding.",
    tokens: ["COMPANY", "PARTNER_COMPANY", "NAME"],
    enhancements: ["partnership branding", "collaboration theme", "dual branding"]
  },
  {
    id: "awards-recognition",
    category: "marketing",
    name: "Awards Recognition",
    basePrompt: "Create an awards recognition image featuring [NAME] from [COMPANY] receiving the '[AWARD_NAME]' award. The design includes trophy imagery, company branding, and celebratory elements suitable for social media and internal communications.",
    tokens: ["NAME", "COMPANY", "AWARD_NAME"],
    enhancements: ["awards celebration", "recognition design", "achievement branding"]
  },
  {
    id: "seasonal-campaign",
    category: "marketing",
    name: "Seasonal Campaign",
    basePrompt: "Design a seasonal marketing campaign image for [SEASON] featuring [NAME] from [COMPANY] with [PRODUCT_NAME]. Incorporate seasonal elements, [BRAND_COLOR] branding, and festive messaging suitable for holiday or seasonal marketing.",
    tokens: ["SEASON", "NAME", "COMPANY", "PRODUCT_NAME", "BRAND_COLOR"],
    enhancements: ["seasonal marketing", "festive branding", "campaign design"]
  },
  {
    id: "customer-testimonial",
    category: "marketing",
    name: "Customer Testimonial",
    basePrompt: "Create a customer testimonial image featuring [CUSTOMER_NAME] with quote '[TESTIMONIAL]' about [COMPANY]'s [PRODUCT_NAME]. Include professional headshot, company logo, and clean typography suitable for website testimonials and case studies.",
    tokens: ["CUSTOMER_NAME", "TESTIMONIAL", "COMPANY", "PRODUCT_NAME"],
    enhancements: ["testimonial design", "customer success", "social proof"]
  }
];

// E-COMMERCE TEMPLATES
export const ecommerceTemplates: PromptTemplate[] = [
  {
    id: "product-lifestyle-shot",
    category: "ecommerce",
    name: "Product Lifestyle Shot",
    basePrompt: "Create a lifestyle product photograph featuring [PRODUCT_NAME] by [COMPANY] being used by [NAME] in a realistic setting. The image shows the product in context with natural usage, professional lighting, and clean composition suitable for e-commerce product pages and marketing materials.",
    tokens: ["PRODUCT_NAME", "COMPANY", "NAME"],
    enhancements: ["lifestyle photography", "product in use", "e-commerce optimized"]
  },
  {
    id: "product-hero-banner",
    category: "ecommerce",
    name: "Product Hero Banner",
    basePrompt: "Design a hero banner for [PRODUCT_NAME] by [COMPANY], featuring [NAME] as the model. The banner includes compelling product imagery, clear call-to-action text '[CTA_TEXT]', and professional composition optimized for e-commerce website headers and landing pages.",
    tokens: ["PRODUCT_NAME", "COMPANY", "NAME", "CTA_TEXT"],
    enhancements: ["hero banner design", "call-to-action", "e-commerce conversion"]
  },
  {
    id: "product-comparison",
    category: "ecommerce",
    name: "Product Comparison",
    basePrompt: "Create a product comparison image showing [PRODUCT_NAME] by [COMPANY] alongside [COMPETITOR_PRODUCT] from [COMPETITOR_COMPANY]. The layout clearly highlights advantages with [NAME] demonstrating the product, using professional photography and clear visual comparison.",
    tokens: ["PRODUCT_NAME", "COMPANY", "COMPETITOR_PRODUCT", "COMPETITOR_COMPANY", "NAME"],
    enhancements: ["product comparison", "competitive analysis", "feature highlighting"]
  },
  {
    id: "before-after-results",
    category: "ecommerce",
    name: "Before/After Results",
    basePrompt: "Design a before/after results image showing the transformation achieved with [PRODUCT_NAME] by [COMPANY]. Feature [CUSTOMER_NAME] with clear visual results, professional photography, and compelling presentation suitable for conversion-optimized e-commerce pages.",
    tokens: ["PRODUCT_NAME", "COMPANY", "CUSTOMER_NAME"],
    enhancements: ["results demonstration", "before/after format", "conversion optimization"]
  },
  {
    id: "product-bundle-pack",
    category: "ecommerce",
    name: "Product Bundle Pack",
    basePrompt: "Create a product bundle packshot featuring [PRODUCT_NAME] bundled with [BUNDLE_ITEMS] by [COMPANY]. The composition shows all items arranged attractively with pricing information '[PRICE]' and savings messaging, optimized for e-commerce bundle sales.",
    tokens: ["PRODUCT_NAME", "BUNDLE_ITEMS", "COMPANY", "PRICE"],
    enhancements: ["bundle packaging", "value proposition", "e-commerce bundling"]
  },
  {
    id: "size-comparison-guide",
    category: "ecommerce",
    name: "Size Comparison Guide",
    basePrompt: "Design a size comparison guide for [PRODUCT_NAME] by [COMPANY], showing different size options with [NAME] demonstrating proper fit. Include clear size labels, professional photography, and helpful reference objects for accurate size selection.",
    tokens: ["PRODUCT_NAME", "COMPANY", "NAME"],
    enhancements: ["size guidance", "fit demonstration", "customer decision support"]
  },
  {
    id: "product-features-showcase",
    category: "ecommerce",
    name: "Product Features Showcase",
    basePrompt: "Create a product features showcase highlighting key features of [PRODUCT_NAME] by [COMPANY]. Feature [NAME] demonstrating '[FEATURE_NAME]' with clear visual explanation, professional lighting, and educational presentation for informed purchasing decisions.",
    tokens: ["PRODUCT_NAME", "COMPANY", "NAME", "FEATURE_NAME"],
    enhancements: ["feature demonstration", "educational content", "product education"]
  },
  {
    id: "customer-reviews-showcase",
    category: "ecommerce",
    name: "Customer Reviews Showcase",
    basePrompt: "Design a customer reviews showcase featuring [CUSTOMER_NAME]'s review of [PRODUCT_NAME] by [COMPANY]. Include customer photo, star rating, and quote '[REVIEW_TEXT]' in an attractive layout suitable for building trust and social proof on e-commerce sites.",
    tokens: ["CUSTOMER_NAME", "PRODUCT_NAME", "COMPANY", "REVIEW_TEXT"],
    enhancements: ["social proof", "customer reviews", "trust building"]
  },
  {
    id: "limited-time-offer",
    category: "ecommerce",
    name: "Limited Time Offer",
    basePrompt: "Create an urgent limited-time offer banner for [PRODUCT_NAME] by [COMPANY] with '[OFFER_TEXT]' messaging. Feature countdown timer styling, [NAME] as the model, and compelling urgency elements to drive immediate e-commerce conversions.",
    tokens: ["PRODUCT_NAME", "COMPANY", "OFFER_TEXT", "NAME"],
    enhancements: ["urgency marketing", "limited time offers", "conversion optimization"]
  },
  {
    id: "product-video-thumbnail",
    category: "ecommerce",
    name: "Product Video Thumbnail",
    basePrompt: "Design an engaging video thumbnail for [PRODUCT_NAME] by [COMPANY] featuring [NAME] with compelling text overlay '[THUMBNAIL_TEXT]'. The thumbnail uses high-contrast colors, professional composition, and click-worthy design to maximize video engagement on e-commerce platforms.",
    tokens: ["PRODUCT_NAME", "COMPANY", "NAME", "THUMBNAIL_TEXT"],
    enhancements: ["video marketing", "thumbnail optimization", "engagement driven"]
  },
  {
    id: "shipping-packaging",
    category: "ecommerce",
    name: "Shipping & Packaging",
    basePrompt: "Create a shipping and packaging presentation for [PRODUCT_NAME] by [COMPANY], showing the product safely packaged in [COMPANY] branded materials. Include unboxing experience visualization, professional packaging photography, and quality assurance messaging.",
    tokens: ["PRODUCT_NAME", "COMPANY"],
    enhancements: ["packaging presentation", "shipping experience", "quality assurance"]
  },
  {
    id: "product-care-instructions",
    category: "ecommerce",
    name: "Product Care Instructions",
    basePrompt: "Design product care instructions for [PRODUCT_NAME] by [COMPANY], featuring [NAME] demonstrating proper care with step-by-step visual guide. Include clear icons, professional photography, and easy-to-follow instructions for optimal product maintenance.",
    tokens: ["PRODUCT_NAME", "COMPANY", "NAME"],
    enhancements: ["care instructions", "product maintenance", "customer support"]
  },
  {
    id: "subscription-service",
    category: "ecommerce",
    name: "Subscription Service",
    basePrompt: "Create a subscription service presentation for [PRODUCT_NAME] by [COMPANY], showing [NAME] with subscription box contents and '[SUBSCRIPTION_BENEFITS]' messaging. Highlight recurring delivery value, professional packaging, and subscription program benefits.",
    tokens: ["PRODUCT_NAME", "COMPANY", "NAME", "SUBSCRIPTION_BENEFITS"],
    enhancements: ["subscription marketing", "recurring revenue", "value demonstration"]
  },
  {
    id: "gift-packaging",
    category: "ecommerce",
    name: "Gift Packaging",
    basePrompt: "Design gift packaging presentation for [PRODUCT_NAME] by [COMPANY], wrapped beautifully with [NAME] as the gift recipient. Include ribbon, card, and premium presentation suitable for gifting occasions and special purchases.",
    tokens: ["PRODUCT_NAME", "COMPANY", "NAME"],
    enhancements: ["gift presentation", "premium packaging", "special occasions"]
  },
  {
    id: "product-customization",
    category: "ecommerce",
    name: "Product Customization",
    basePrompt: "Create a product customization showcase for [PRODUCT_NAME] by [COMPANY], featuring [CUSTOMER_NAME] with their customized '[CUSTOMIZATION_DETAILS]' version. Demonstrate personalization options, professional photography, and unique value proposition.",
    tokens: ["PRODUCT_NAME", "COMPANY", "CUSTOMER_NAME", "CUSTOMIZATION_DETAILS"],
    enhancements: ["product personalization", "customization options", "unique value"]
  }
];

// PROFESSIONAL HEADSHOTS
export const professionalHeadshotTemplates: PromptTemplate[] = [
  {
    id: "corporate-executive",
    category: "professional",
    name: "Corporate Executive",
    basePrompt: "Create a professional corporate headshot of [NAME], [TITLE] at [COMPANY]. The portrait shows [NAME] in business professional attire against a clean background, with confident expression and professional lighting suitable for corporate websites, LinkedIn, and business communications.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["corporate professionalism", "executive presence", "business communications"]
  },
  {
    id: "creative-professional",
    category: "professional",
    name: "Creative Professional",
    basePrompt: "Create a creative professional headshot of [NAME], [TITLE] at [COMPANY]. The portrait has an artistic touch with subtle styling, creative background elements, and approachable expression suitable for creative industries and modern businesses.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["creative styling", "artistic composition", "modern professional"]
  },
  {
    id: "medical-professional",
    category: "professional",
    name: "Medical Professional",
    basePrompt: "Create a professional medical headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys trust and competence with clean white coat, stethoscope, and professional medical setting suitable for healthcare organizations and medical directories.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["medical professionalism", "trust building", "healthcare industry"]
  },
  {
    id: "legal-professional",
    category: "professional",
    name: "Legal Professional",
    basePrompt: "Create a professional legal headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys authority and trustworthiness with formal business attire, law library background, and professional composition suitable for legal directories and firm websites.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["legal authority", "professional trust", "law firm branding"]
  },
  {
    id: "tech-professional",
    category: "professional",
    name: "Tech Professional",
    basePrompt: "Create a modern tech professional headshot of [NAME], [TITLE] at [COMPANY]. The portrait includes subtle tech elements, clean modern styling, and innovative composition suitable for technology companies and startup environments.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["tech innovation", "modern styling", "startup culture"]
  },
  {
    id: "education-professional",
    category: "professional",
    name: "Education Professional",
    basePrompt: "Create a professional education headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys approachability and expertise with academic setting, professional attire, and warm expression suitable for educational institutions and academic directories.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["educational expertise", "approachable demeanor", "academic setting"]
  },
  {
    id: "finance-professional",
    category: "professional",
    name: "Finance Professional",
    basePrompt: "Create a professional finance headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys competence and stability with formal business attire, financial district background, and confident expression suitable for banking and financial services.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["financial competence", "stability messaging", "corporate finance"]
  },
  {
    id: "real-estate-professional",
    category: "professional",
    name: "Real Estate Professional",
    basePrompt: "Create a professional real estate headshot of [NAME], [TITLE] at [COMPANY]. The portrait includes property background, professional attire, and trustworthy expression suitable for real estate listings and agent directories.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["real estate expertise", "property integration", "local market focus"]
  },
  {
    id: "consulting-professional",
    category: "professional",
    name: "Consulting Professional",
    basePrompt: "Create a professional consulting headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys expertise and approachability with modern office setting, professional attire, and thoughtful expression suitable for consulting firms and professional services.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["consulting expertise", "professional services", "thought leadership"]
  },
  {
    id: "nonprofit-professional",
    category: "professional",
    name: "Nonprofit Professional",
    basePrompt: "Create a professional nonprofit headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys passion and dedication with warm expression, organizational branding, and community-focused composition suitable for nonprofit organizations and charitable causes.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["nonprofit passion", "community focus", "social impact"]
  },
  {
    id: "retail-professional",
    category: "professional",
    name: "Retail Professional",
    basePrompt: "Create a professional retail headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys customer service excellence with store setting, professional attire, and friendly expression suitable for retail organizations and customer-facing roles.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["customer service", "retail expertise", "friendly professionalism"]
  },
  {
    id: "hospitality-professional",
    category: "professional",
    name: "Hospitality Professional",
    basePrompt: "Create a professional hospitality headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys warmth and service excellence with hospitality setting, professional attire, and welcoming expression suitable for hotels, restaurants, and tourism organizations.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["hospitality excellence", "service orientation", "welcoming demeanor"]
  },
  {
    id: "construction-professional",
    category: "professional",
    name: "Construction Professional",
    basePrompt: "Create a professional construction headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys expertise and safety with construction site background, professional attire, and confident expression suitable for construction companies and building professionals.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["construction expertise", "safety focus", "industry credibility"]
  },
  {
    id: "manufacturing-professional",
    category: "professional",
    name: "Manufacturing Professional",
    basePrompt: "Create a professional manufacturing headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys precision and quality with industrial setting, professional attire, and focused expression suitable for manufacturing companies and production environments.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["manufacturing precision", "quality focus", "industrial expertise"]
  },
  {
    id: "government-professional",
    category: "professional",
    name: "Government Professional",
    basePrompt: "Create a professional government headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys public service dedication with official setting, professional attire, and trustworthy expression suitable for government agencies and public officials.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["public service", "official credibility", "government professionalism"]
  },
  {
    id: "freelance-professional",
    category: "professional",
    name: "Freelance Professional",
    basePrompt: "Create a professional freelance headshot of [NAME], [TITLE] specializing in [SPECIALTY]. The portrait conveys independence and expertise with home office setting, professional attire, and confident expression suitable for freelance portfolios and independent professionals.",
    tokens: ["NAME", "TITLE", "SPECIALTY"],
    enhancements: ["freelance independence", "portfolio presentation", "specialized expertise"]
  },
  {
    id: "startup-founder",
    category: "professional",
    name: "Startup Founder",
    basePrompt: "Create a professional startup founder headshot of [NAME], Founder of [COMPANY]. The portrait conveys innovation and vision with modern office setting, casual professional attire, and energetic expression suitable for startup companies and entrepreneurial ventures.",
    tokens: ["NAME", "COMPANY"],
    enhancements: ["startup innovation", "entrepreneurial spirit", "visionary leadership"]
  },
  {
    id: "board-member",
    category: "professional",
    name: "Board Member",
    basePrompt: "Create a professional board member headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys leadership and experience with formal boardroom setting, professional attire, and authoritative expression suitable for corporate governance and executive leadership.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["board leadership", "executive authority", "corporate governance"]
  },
  {
    id: "academic-researcher",
    category: "professional",
    name: "Academic Researcher",
    basePrompt: "Create a professional academic researcher headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys intellectual curiosity with academic setting, professional attire, and thoughtful expression suitable for research institutions and academic publications.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["academic excellence", "research focus", "intellectual curiosity"]
  },
  {
    id: "sales-professional",
    category: "professional",
    name: "Sales Professional",
    basePrompt: "Create a professional sales headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys approachability and confidence with professional setting, business attire, and engaging expression suitable for sales teams and business development.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["sales confidence", "customer engagement", "business development"]
  },
  {
    id: "hr-professional",
    category: "professional",
    name: "HR Professional",
    basePrompt: "Create a professional HR headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys empathy and professionalism with office setting, business attire, and warm expression suitable for human resources and talent management.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["HR professionalism", "employee relations", "talent management"]
  },
  {
    id: "marketing-professional",
    category: "professional",
    name: "Marketing Professional",
    basePrompt: "Create a professional marketing headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys creativity and strategic thinking with modern office setting, professional attire, and innovative expression suitable for marketing teams and brand management.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["marketing creativity", "brand strategy", "innovative thinking"]
  },
  {
    id: "it-professional",
    category: "professional",
    name: "IT Professional",
    basePrompt: "Create a professional IT headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys technical expertise with subtle tech elements, professional attire, and focused expression suitable for IT departments and technology companies.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["technical expertise", "IT professionalism", "technology focus"]
  },
  {
    id: "customer-service",
    category: "professional",
    name: "Customer Service Professional",
    basePrompt: "Create a professional customer service headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys helpfulness and approachability with friendly expression, professional attire, and welcoming composition suitable for customer-facing roles and support teams.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["customer service", "helpful demeanor", "support excellence"]
  },
  {
    id: "project-manager",
    category: "professional",
    name: "Project Manager",
    basePrompt: "Create a professional project manager headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys organization and leadership with office setting, business attire, and confident expression suitable for project management and team leadership roles.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["project leadership", "organizational skills", "team management"]
  },
  {
    id: "data-analyst",
    category: "professional",
    name: "Data Analyst",
    basePrompt: "Create a professional data analyst headshot of [NAME], [TITLE] at [COMPANY]. The portrait conveys analytical thinking with subtle data visualization elements, professional attire, and focused expression suitable for analytics teams and data-driven organizations.",
    tokens: ["NAME", "TITLE", "COMPANY"],
    enhancements: ["analytical expertise", "data focus", "technical analysis"]
  }
];

// EVENT MATERIALS
export const eventTemplates: PromptTemplate[] = [
  {
    id: "conference-banner",
    category: "event",
    name: "Conference Banner",
    basePrompt: "Create a conference banner for '[EVENT_NAME]' hosted by [COMPANY], featuring [SPEAKER_NAME] as keynote speaker. The banner includes event dates '[EVENT_DATES]', location, and professional design with [COMPANY] branding suitable for conference venues and promotional materials.",
    tokens: ["EVENT_NAME", "COMPANY", "SPEAKER_NAME", "EVENT_DATES"],
    enhancements: ["conference branding", "event promotion", "professional presentation"]
  },
  {
    id: "webinar-presentation",
    category: "event",
    name: "Webinar Presentation",
    basePrompt: "Design a webinar presentation slide featuring [SPEAKER_NAME] from [COMPANY] presenting on '[TOPIC]'. Include professional headshot, company branding, topic highlights, and clean layout suitable for virtual event presentations and marketing materials.",
    tokens: ["SPEAKER_NAME", "COMPANY", "TOPIC"],
    enhancements: ["virtual events", "presentation design", "webinar marketing"]
  },
  {
    id: "workshop-materials",
    category: "event",
    name: "Workshop Materials",
    basePrompt: "Create workshop materials for '[WORKSHOP_NAME]' by [COMPANY], featuring [INSTRUCTOR_NAME] as the lead instructor. The design includes learning objectives, schedule, and professional layout suitable for workshop handouts and promotional materials.",
    tokens: ["WORKSHOP_NAME", "COMPANY", "INSTRUCTOR_NAME"],
    enhancements: ["educational content", "workshop promotion", "learning materials"]
  },
  {
    id: "product-launch-event",
    category: "event",
    name: "Product Launch Event",
    basePrompt: "Design a product launch event banner for [PRODUCT_NAME] by [COMPANY], featuring [EXECUTIVE_NAME] as the presenter. Include launch date '[LAUNCH_DATE]', venue information, and exciting promotional design suitable for product launch events.",
    tokens: ["PRODUCT_NAME", "COMPANY", "EXECUTIVE_NAME", "LAUNCH_DATE"],
    enhancements: ["product launch", "event excitement", "launch promotion"]
  },
  {
    id: "networking-event",
    category: "event",
    name: "Networking Event",
    basePrompt: "Create a networking event invitation for '[EVENT_NAME]' hosted by [COMPANY], featuring [HOST_NAME] as the event host. Include event details, networking focus, and professional design suitable for business networking and professional development events.",
    tokens: ["EVENT_NAME", "COMPANY", "HOST_NAME"],
    enhancements: ["networking focus", "professional development", "business events"]
  },
  {
    id: "award-ceremony",
    category: "event",
    name: "Award Ceremony",
    basePrompt: "Design an award ceremony announcement for '[AWARD_NAME]' presented by [COMPANY], featuring [PRESENTER_NAME] as the award presenter. Include ceremony details, prestigious design, and formal layout suitable for award presentations and recognition events.",
    tokens: ["AWARD_NAME", "COMPANY", "PRESENTER_NAME"],
    enhancements: ["award recognition", "ceremony prestige", "formal events"]
  },
  {
    id: "team-building-event",
    category: "event",
    name: "Team Building Event",
    basePrompt: "Create a team building event poster for '[EVENT_NAME]' organized by [COMPANY], featuring team activities and [ORGANIZER_NAME] as the event coordinator. Include fun design elements, activity highlights, and engaging layout suitable for corporate team building.",
    tokens: ["EVENT_NAME", "COMPANY", "ORGANIZER_NAME"],
    enhancements: ["team building", "corporate fun", "employee engagement"]
  },
  {
    id: "charity-event",
    category: "event",
    name: "Charity Event",
    basePrompt: "Design a charity event poster for '[EVENT_NAME]' supporting [CHARITY_CAUSE], hosted by [COMPANY] with [HOST_NAME] as the event chair. Include cause details, donation information, and compassionate design suitable for charitable fundraising events.",
    tokens: ["EVENT_NAME", "CHARITY_CAUSE", "COMPANY", "HOST_NAME"],
    enhancements: ["charitable causes", "fundraising events", "community support"]
  },
  {
    id: "training-seminar",
    category: "event",
    name: "Training Seminar",
    basePrompt: "Create a training seminar announcement for '[SEMINAR_NAME]' by [COMPANY], featuring [INSTRUCTOR_NAME] as the lead trainer. Include learning outcomes, certification details, and professional educational design suitable for professional development seminars.",
    tokens: ["SEMINAR_NAME", "COMPANY", "INSTRUCTOR_NAME"],
    enhancements: ["professional training", "skill development", "certification programs"]
  },
  {
    id: "corporate-retreat",
    category: "event",
    name: "Corporate Retreat",
    basePrompt: "Design a corporate retreat invitation for '[RETREAT_NAME]' organized by [COMPANY], featuring scenic location and [LEADER_NAME] as the retreat leader. Include agenda highlights, team building focus, and inspiring design suitable for corporate offsite events.",
    tokens: ["RETREAT_NAME", "COMPANY", "LEADER_NAME"],
    enhancements: ["corporate retreats", "team development", "strategic planning"]
  },
  {
    id: "industry-conference",
    category: "event",
    name: "Industry Conference",
    basePrompt: "Create an industry conference banner for '[CONFERENCE_NAME]' presented by [COMPANY], featuring [KEYNOTE_SPEAKER] as the keynote speaker. Include industry focus, networking opportunities, and professional design suitable for industry-specific conferences.",
    tokens: ["CONFERENCE_NAME", "COMPANY", "KEYNOTE_SPEAKER"],
    enhancements: ["industry networking", "professional conferences", "industry expertise"]
  },
  {
    id: "customer-appreciation",
    category: "event",
    name: "Customer Appreciation Event",
    basePrompt: "Design a customer appreciation event invitation for [COMPANY]'s '[EVENT_NAME]', featuring [HOST_NAME] as the event host. Include customer recognition, special offers, and grateful design suitable for customer loyalty and appreciation events.",
    tokens: ["COMPANY", "EVENT_NAME", "HOST_NAME"],
    enhancements: ["customer loyalty", "appreciation events", "relationship building"]
  },
  {
    id: "product-demonstration",
    category: "event",
    name: "Product Demonstration",
    basePrompt: "Create a product demonstration event poster for [PRODUCT_NAME] by [COMPANY], featuring [DEMONSTRATOR_NAME] as the product expert. Include demonstration schedule, feature highlights, and engaging design suitable for product showcase events.",
    tokens: ["PRODUCT_NAME", "COMPANY", "DEMONSTRATOR_NAME"],
    enhancements: ["product demonstrations", "feature showcases", "customer education"]
  },
  {
    id: "alumni-reunion",
    category: "event",
    name: "Alumni Reunion",
    basePrompt: "Design an alumni reunion invitation for [COMPANY]'s '[REUNION_NAME]', featuring [ORGANIZER_NAME] as the event coordinator. Include reunion details, nostalgia elements, and warm design suitable for alumni networking and reconnection events.",
    tokens: ["COMPANY", "REUNION_NAME", "ORGANIZER_NAME"],
    enhancements: ["alumni networking", "reconnection events", "community building"]
  },
  {
    id: "open-house-event",
    category: "event",
    name: "Open House Event",
    basePrompt: "Create an open house event banner for [COMPANY]'s '[EVENT_NAME]', featuring [HOST_NAME] as the welcoming host. Include event schedule, facility highlights, and inviting design suitable for community open house and facility showcase events.",
    tokens: ["COMPANY", "EVENT_NAME", "HOST_NAME"],
    enhancements: ["community events", "facility showcases", "public engagement"]
  },
  {
    id: "holiday-party",
    category: "event",
    name: "Holiday Party",
    basePrompt: "Design a holiday party invitation for [COMPANY]'s '[PARTY_NAME]', featuring festive elements and [ORGANIZER_NAME] as the party coordinator. Include holiday theme, celebration details, and joyful design suitable for corporate holiday celebrations.",
    tokens: ["COMPANY", "PARTY_NAME", "ORGANIZER_NAME"],
    enhancements: ["holiday celebrations", "corporate parties", "employee morale"]
  }
];

// SOCIAL MEDIA TEMPLATES
export const socialMediaTemplates: PromptTemplate[] = [
  {
    id: "linkedin-post",
    category: "social",
    name: "LinkedIn Professional Post",
    basePrompt: "Create a professional LinkedIn post featuring [NAME] from [COMPANY] sharing '[POST_CONTENT]'. Include company branding, professional headshot, and clean typography suitable for B2B social media engagement and professional networking.",
    tokens: ["NAME", "COMPANY", "POST_CONTENT"],
    enhancements: ["professional networking", "B2B engagement", "thought leadership"]
  },
  {
    id: "instagram-story",
    category: "social",
    name: "Instagram Story",
    basePrompt: "Design an Instagram story featuring [NAME] from [COMPANY] with '[STORY_TEXT]' overlay. Include engaging visuals, brand colors, and vertical format suitable for mobile-first social media storytelling and quick brand engagement.",
    tokens: ["NAME", "COMPANY", "STORY_TEXT"],
    enhancements: ["mobile optimization", "storytelling format", "quick engagement"]
  },
  {
    id: "twitter-thread",
    category: "social",
    name: "Twitter Thread Graphic",
    basePrompt: "Create a Twitter thread graphic featuring [NAME] from [COMPANY] with the hook '[THREAD_HOOK]'. Include thread numbering, professional design, and concise messaging suitable for Twitter's character limits and thread engagement.",
    tokens: ["NAME", "COMPANY", "THREAD_HOOK"],
    enhancements: ["thread optimization", "concise messaging", "social discussion"]
  },
  {
    id: "facebook-cover",
    category: "social",
    name: "Facebook Cover Photo",
    basePrompt: "Design a Facebook cover photo for [COMPANY] featuring [NAME] with '[COVER_TEXT]' messaging. Include brand elements, professional composition, and wide format suitable for Facebook page branding and community engagement.",
    tokens: ["COMPANY", "NAME", "COVER_TEXT"],
    enhancements: ["page branding", "community focus", "wide format design"]
  },
  {
    id: "pinterest-pin",
    category: "social",
    name: "Pinterest Pin",
    basePrompt: "Create a Pinterest-optimized pin featuring [PRODUCT_NAME] by [COMPANY] with [NAME] as the model. Include vertical format, compelling text overlay '[PIN_TEXT]', and aspirational design suitable for Pinterest's visual discovery and inspiration-driven platform.",
    tokens: ["PRODUCT_NAME", "COMPANY", "NAME", "PIN_TEXT"],
    enhancements: ["visual discovery", "aspirational content", "vertical optimization"]
  },
  {
    id: "tiktok-thumbnail",
    category: "social",
    name: "TikTok Thumbnail",
    basePrompt: "Design an engaging TikTok thumbnail featuring [NAME] from [COMPANY] with bold text '[THUMBNAIL_TEXT]'. Include high-contrast colors, expressive facial expression, and square format suitable for TikTok's fast-paced, mobile-first video platform.",
    tokens: ["NAME", "COMPANY", "THUMBNAIL_TEXT"],
    enhancements: ["video engagement", "mobile optimization", "fast-paced content"]
  },
  {
    id: "youtube-thumbnail",
    category: "social",
    name: "YouTube Thumbnail",
    basePrompt: "Create a click-worthy YouTube thumbnail featuring [NAME] from [COMPANY] with '[THUMBNAIL_TEXT]' overlay. Include high-contrast elements, emotional expression, and landscape format suitable for YouTube's video discovery and engagement optimization.",
    tokens: ["NAME", "COMPANY", "THUMBNAIL_TEXT"],
    enhancements: ["video discovery", "engagement optimization", "landscape format"]
  },
  {
    id: "snapchat-filter",
    category: "social",
    name: "Snapchat Filter Design",
    basePrompt: "Design a fun Snapchat filter featuring [COMPANY] branding with [NAME] as the face template. Include playful elements, brand colors, and interactive design suitable for Snapchat's casual, youth-oriented social platform.",
    tokens: ["COMPANY", "NAME"],
    enhancements: ["casual engagement", "youth marketing", "interactive filters"]
  },
  {
    id: "reddit-post",
    category: "social",
    name: "Reddit Community Post",
    basePrompt: "Create a Reddit-optimized post featuring [NAME] from [COMPANY] with '[POST_TITLE]' as the headline. Include community-relevant content, professional presentation, and discussion-worthy design suitable for Reddit's community-driven discussion platform.",
    tokens: ["NAME", "COMPANY", "POST_TITLE"],
    enhancements: ["community engagement", "discussion focus", "platform optimization"]
  },
  {
    id: "discord-banner",
    category: "social",
    name: "Discord Server Banner",
    basePrompt: "Design a Discord server banner for [COMPANY]'s community featuring [NAME] with '[BANNER_TEXT]' messaging. Include gaming/tech aesthetic, community focus, and wide format suitable for Discord's community server branding.",
    tokens: ["COMPANY", "NAME", "BANNER_TEXT"],
    enhancements: ["community branding", "gaming culture", "server engagement"]
  },
  {
    id: "twitch-stream-overlay",
    category: "social",
    name: "Twitch Stream Overlay",
    basePrompt: "Create a Twitch stream overlay for [STREAMER_NAME] from [COMPANY] featuring '[OVERLAY_TEXT]' branding. Include streaming elements, brand integration, and transparent design suitable for live streaming and gaming content.",
    tokens: ["STREAMER_NAME", "COMPANY", "OVERLAY_TEXT"],
    enhancements: ["live streaming", "gaming community", "brand integration"]
  },
  {
    id: "clubhouse-room",
    category: "social",
    name: "Clubhouse Room Graphic",
    basePrompt: "Design a Clubhouse room graphic for '[ROOM_TOPIC]' hosted by [HOST_NAME] from [COMPANY]. Include audio-focused design, professional headshots, and engaging layout suitable for Clubhouse's audio-based social platform.",
    tokens: ["ROOM_TOPIC", "HOST_NAME", "COMPANY"],
    enhancements: ["audio content", "professional networking", "discussion focus"]
  },
  {
    id: "behance-portfolio",
    category: "social",
    name: "Behance Portfolio Cover",
    basePrompt: "Create a Behance portfolio cover for [CREATOR_NAME]'s work at [COMPANY], featuring '[PROJECT_TITLE]' as the main project. Include creative design, professional presentation, and artistic composition suitable for creative portfolio and design community showcase.",
    tokens: ["CREATOR_NAME", "COMPANY", "PROJECT_TITLE"],
    enhancements: ["creative showcase", "portfolio presentation", "design community"]
  },
  {
    id: "medium-article",
    category: "social",
    name: "Medium Article Header",
    basePrompt: "Design a Medium article header for '[ARTICLE_TITLE]' by [AUTHOR_NAME] from [COMPANY]. Include engaging visuals, professional typography, and wide format suitable for Medium's long-form content and thought leadership platform.",
    tokens: ["ARTICLE_TITLE", "AUTHOR_NAME", "COMPANY"],
    enhancements: ["thought leadership", "long-form content", "professional publishing"]
  },
  {
    id: "slack-emoji",
    category: "social",
    name: "Slack Custom Emoji",
    basePrompt: "Create a custom Slack emoji featuring [COMPANY] branding with [NAME] as the character. Include simple design, brand colors, and square format suitable for Slack's workplace communication and team collaboration.",
    tokens: ["COMPANY", "NAME"],
    enhancements: ["workplace communication", "team collaboration", "brand personality"]
  },
  {
    id: "github-profile",
    category: "social",
    name: "GitHub Profile Banner",
    basePrompt: "Design a GitHub profile banner for [DEVELOPER_NAME] from [COMPANY], showcasing '[TECH_STACK]' expertise. Include developer aesthetic, code elements, and professional presentation suitable for GitHub's developer community and technical portfolio.",
    tokens: ["DEVELOPER_NAME", "COMPANY", "TECH_STACK"],
    enhancements: ["developer branding", "technical expertise", "open source community"]
  },
  {
    id: "stackoverflow-flair",
    category: "social",
    name: "Stack Overflow Flair",
    basePrompt: "Create a Stack Overflow flair badge for [EXPERT_NAME] from [COMPANY] highlighting '[EXPERTISE_AREA]' skills. Include technical design, reputation indicators, and professional presentation suitable for Stack Overflow's technical Q&A community.",
    tokens: ["EXPERT_NAME", "COMPANY", "EXPERTISE_AREA"],
    enhancements: ["technical expertise", "community recognition", "professional credibility"]
  },
  {
    id: "dribbble-shot",
    category: "social",
    name: "Dribbble Shot",
    basePrompt: "Design a Dribbble shot showcasing [DESIGNER_NAME]'s work for [COMPANY] with '[PROJECT_NAME]' as the featured project. Include clean design, professional presentation, and creative composition suitable for Dribbble's design community and creative portfolio.",
    tokens: ["DESIGNER_NAME", "COMPANY", "PROJECT_NAME"],
    enhancements: ["design showcase", "creative community", "portfolio excellence"]
  },
  {
    id: "vimeo-thumbnail",
    category: "social",
    name: "Vimeo Thumbnail",
    basePrompt: "Create a Vimeo thumbnail for '[VIDEO_TITLE]' by [CREATOR_NAME] from [COMPANY]. Include artistic composition, professional quality, and engaging visuals suitable for Vimeo's creative video platform and artistic community.",
    tokens: ["VIDEO_TITLE", "CREATOR_NAME", "COMPANY"],
    enhancements: ["creative video", "artistic presentation", "professional quality"]
  },
  {
    id: "spotify-playlist",
    category: "social",
    name: "Spotify Playlist Cover",
    basePrompt: "Design a Spotify playlist cover for '[PLAYLIST_NAME]' curated by [CURATOR_NAME] from [COMPANY]. Include musical elements, brand colors, and square format suitable for Spotify's music streaming and playlist discovery.",
    tokens: ["PLAYLIST_NAME", "CURATOR_NAME", "COMPANY"],
    enhancements: ["music curation", "brand personality", "streaming platform"]
  }
];

export default {
  actionFigureTemplates,
  memeTemplates,
  cartoonTemplates,
  ghibliTemplates,
  musicStarTemplates,
  retroActionFigureTemplates,
  tvShowTemplates,
  wrestlingTemplates,
  marketingTemplates,
  ecommerceTemplates,
  professionalTemplates: professionalHeadshotTemplates,
  eventTemplates,
  socialMediaTemplates,
  getAllTemplates,
  getTemplatesByCategory,
  getTemplateById,
  searchTemplates,
  categoryMetadata
};