interface ActionFigureTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  packaging: string;
  accessories?: string[];
  preview?: string;
  style: string;
}

export const actionFigureTemplates: ActionFigureTemplate[] = [
  {
    id: "classic-blister",
    name: "Classic Blister Pack",
    description: "The classic action figure packaging with a clear plastic bubble and colorful cardboard backing.",
    prompt:
      "Create a studio packshot of a collectible action figure — [NAME] from [COMPANY] — sealed in an unopened retro blister pack. The figure wears a sharp professional suit with subtle [COMPANY]-colored accents and company-themed accessories including a laptop, smartphone, and briefcase arranged in molded plastic. Card back art features bold retro typography, ability callouts, stat bars, a miniature lineup grid, and a subtle faux-shelf-wear edge for authenticity. The clear blister should have soft reflections and realistic plastic thickness; include a hanging tab, barcode, safety icons, and a tiny 'Ages 14+ Collector Item' badge. Clean, photorealistic toy photography on a neutral gradient, balanced studio lighting, shallow depth of field, crisp edges, accurate shadows, high detail.",
    packaging: "Blister Pack",
    accessories: ["Laptop", "Smartphone", "Briefcase"],
    style: "classic",
    preview: "https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "deluxe-boxed",
    name: "Deluxe Boxed Edition",
    description: "Premium window box packaging with special features and multiple accessories.",
    prompt:
      "Create a premium window-box product photo of [NAME] from [COMPANY]. The figure is posed heroically with interchangeable hands and multiple accessories (brand-colored shield, role-specific tools, display stand) secured in a vac-tray. The box uses [COMPANY] palette with subtle metallic accents, side-panel feature callouts, icon badges for articulation points, and a 'Collector Edition' emblem. Add a diorama-style inner card with depth, a glossy PET window with realistic reflections, legal text, barcode, hanging tab notch, and a numbered series seal. Dramatic rim lighting and soft fill to reveal contours, photorealistic materials, gentle table reflection, shelf-ready composition, high detail.",
    packaging: "Deluxe Box",
    accessories: ["Company Logo Shield", "Industry Tools", "Display Stand"],
    style: "premium",
    preview: "https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "vintage-cardback",
    name: "Vintage Cardback",
    description: "Retro-style packaging with nostalgic design elements from the 80s-90s.",
    prompt:
      "Create a nostalgic carded figure of [NAME] from [COMPANY] mounted on a vintage cardback. The figure wears business attire with playful 'action' flourishes; accessories include an opening briefcase, miniature laptop, and role-specific gadgets arranged on the tray. The card design uses [COMPANY] colors, a retro grid with sunburst shapes, an 'ACTION FEATURE' burst star, a checklist of other figures on back, and faux offset-print dots for period charm. Add a peggable punch hole, barcode, safety seal, and a limited-series number. Photograph as a realistic packshot with neutral backdrop, soft highlights on the blister, and slightly worn edges for authenticity; high detail, crisp packaging edges.",
    packaging: "Cardback",
    accessories: ["Opening Briefcase", "Tiny Laptop", "Industry Gadgets"],
    style: "retro",
    preview: "https://images.pexels.com/photos/8345972/pexels-photo-8345972.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "collectors-display",
    name: "Collector's Display Case",
    description: "Premium display case packaging for serious collectors.",
    prompt:
      "Create a museum-grade display presentation of [NAME] from [COMPANY] housed in a clear acrylic-style case. The figure features fabric-textured tailoring, realistic stitching, polished shoes, and 30+ articulation points. The base is die-cast with an engraved nameplate; add a mirrored backdrop with a tasteful [COMPANY] motif, subtle LED-like rim glow, and a premium placard detailing features. Arrange accessories (interchangeable hands, specialty tools, miniature product replicas) on a velvet-like tray. Photorealistic glassy reflections, controlled studio lighting, clean tabletop reflection, calm luxury aesthetic, high detail.",
    packaging: "Display Case",
    accessories: ["Interchangeable Hands", "Industry Tools", "Company Product Replicas"],
    style: "collector",
    preview: "https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "trading-card",
    name: "Collectible Card",
    description: "Trading card style with character stats and special abilities.",
    prompt:
      "Create a premium foil trading card featuring [NAME] from [COMPANY]. The card shows a portrait pose, stat blocks for Leadership, Innovation, and Expertise, a special ability blurb tied to their role at [COMPANY], a collector number, and micro-text authenticity lines. The border is holographic in [COMPANY] colors with prismatic diffraction; include subtle emboss effects, a matte-vs-gloss interplay, and a faint texture in the print. Photograph the card at a slight angle on a dark surface to catch foil shimmer; include soft bokeh highlights, crisp typography, realistic corner radius, and tiny print details; high detail.",
    packaging: "Trading Card",
    accessories: [],
    style: "card",
    preview: "https://images.pexels.com/photos/7241628/pexels-photo-7241628.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "2pack-battle",
    name: "2-Pack Battle Set",
    description: "Double figure set showing characters in action.",
    prompt:
      "Create a wide window-box two-pack featuring [NAME] and a teammate from [COMPANY] posed in dynamic, complementary stances. The interior backdrop shows a dramatic action scene; accessories include micro office furniture, tiny laptops, role tools, and a shared display base with a subtle [COMPANY] insignia. The box uses [COMPANY] palette with a 'TEAMWORK EDITION' banner, side character bios, icon badges for accessories, and a numbered series seal. Photorealistic packaging with glossy window reflections, precise tray shaping, clean shelf presentation, dramatic yet balanced lighting, crisp detail.",
    packaging: "2-Pack Box",
    accessories: ["Office Furniture", "Laptops", "Industry Tools", "Display Base"],
    style: "action",
    preview: "https://images.pexels.com/photos/8346904/pexels-photo-8346904.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "bobblehead",
    name: "Desktop Bobblehead",
    description: "Fun office desk bobblehead with oversized head.",
    prompt:
      "Create a charming desktop bobblehead of [NAME] from [COMPANY] with an oversized head, simplified features, and a friendly expression. The figure stands on a branded base with a small [COMPANY] emblem and a subtle spring visible at the neck. Package it in an open window box designed for desk display with [COMPANY] color blocking and 'DESKTOP BUDDY SERIES' branding. Capture slight motion blur to imply bobble movement; add shelf-ready details like barcode, safety icons, and series number. Clean studio product shot, soft fill light, crisp edges, gentle shadow, high detail.",
    packaging: "Window Box",
    accessories: ["Branded Base"],
    style: "bobblehead",
    preview: "https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "vinyl-pop",
    name: "Vinyl Collectible",
    description: "Stylized vinyl figure with simplified features and oversized head.",
    prompt:
      "Create a stylized vinyl collectible of [NAME] from [COMPANY]: simplified body, oversized head, clean facial features, and one signature role accessory. Package it in a square window box with [COMPANY]-themed palette, a large character name panel, figure number, and series label. Show the boxed figure plus a closeup of the unboxed figure for clarity. Studio product photography with soft gradients, gentle reflections on the PET window, neat corner folds, and crisp print detail; high fidelity.",
    packaging: "Square Window Box",
    accessories: ["Role-Specific Accessory"],
    style: "vinyl-pop",
    preview: "https://images.pexels.com/photos/17023172/pexels-photo-17023172/free-photo-of-a-barbie-toy-on-a-sofa.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "buildable-set",
    name: "Buildable Mini Figure",
    description: "Brick-compatible mini figure with building blocks accessories.",
    prompt:
      "Create a buildable mini figure set featuring [NAME] from [COMPANY]. The character has modular parts and a cylindrical-head silhouette; attire is printed in [COMPANY] colors. Include micro-build office furniture pieces and a small display base. Package in a compact box with an exploded diagram, piece count, and simple step illustrations. Macro product photo with crisp focus on printed elements, precise plastic sheen, realistic carton texture, and a clean white sweep background; high detail.",
    packaging: "Small Box",
    accessories: ["Office Furniture Set", "Building Instructions"],
    style: "building-block",
    preview: "https://images.pexels.com/photos/6601811/pexels-photo-6601811.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "action-roleplay",
    name: "Roleplaying Set",
    description: "Children's costume and roleplay accessories set.",
    prompt:
      "Create a children's roleplay set themed around [NAME] from [COMPANY]. The hanging blister card shows a costume jacket/outfit in [COMPANY] colors, logo patches, toy role accessories, and an ID badge. Include try-me cutouts, safety icons, age grade, and a back-of-card layout showing included items and imaginative play scenes. Photograph on a realistic retail shelf with bright, family-friendly colors, neat shadows, and crisp plastic reflections; high detail.",
    packaging: "Hanging Blister Card",
    accessories: ["Costume Outfit", "Role Accessories", "ID Badge"],
    style: "costume",
    preview: "https://images.pexels.com/photos/6615294/pexels-photo-6615294.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "digital-avatar",
    name: "Digital Game Character",
    description: "Video game style character selection screen.",
    prompt:
      "Create a modern 3D character select screen featuring [NAME] from [COMPANY] as a playable character. Stylized proportions, professional attire tinted with [COMPANY] palette, dynamic idle animation posture. UI shows stats (Leadership, Technical Skill, Teamwork), a clean title header '[COMPANY] CHAMPIONS,' and a customization panel. Include soft volumetric lighting, subtle particle motes, and a glossy UI finish; sharp typography, crisp interface elements, high detail.",
    packaging: "Digital",
    accessories: [],
    style: "digital",
    preview: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "chibi-style",
    name: "Chibi Art Style",
    description: "Cute Japanese chibi style with oversized head and tiny body.",
    prompt:
      "Create a chibi-style collectible of [NAME] from [COMPANY] with a super-deformed body, oversized head (about one-third of total height), large expressive eyes, and adorable proportions. Outfit reflects [COMPANY] aesthetic with cute stitching and tiny details. Package in a small window box with kawaii patterns, pastel accents, and adapted [COMPANY] branding. Soft, colorful studio lighting, delicate shadows, and a clean background; photorealistic packaging and figure materials, high detail.",
    packaging: "Small Window Box",
    accessories: [],
    style: "chibi",
    preview: "https://images.pexels.com/photos/1670044/pexels-photo-1670044.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "lego-minifig",
    name: "Building Block Minifigure",
    description: "LEGO-style minifigure with compatible pieces and accessories.",
    prompt:
      "Create a building-block style minifigure of [NAME] from [COMPANY] with cylindrical head, blocky body, c-grip hands, and printed attire in [COMPANY] colors. Include tiny role-specific accessories mounted on a small display base with a subtle logo brick. Package in a small blister with block-inspired graphics and a 'Collectible Mini Figure Series' header. Macro packshot with precise plastic shine, sharp print alignment, realistic blister curvature, barcode and safety text; high detail.",
    packaging: "Blister Pack",
    accessories: ["Role-Specific Pieces", "Display Base"],
    style: "building-block",
    preview: "https://images.pexels.com/photos/6498998/pexels-photo-6498998.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
];

/**
 * Generate a personalized action figure prompt based on a template
 * @param templateId The ID of the template to use
 * @param personalizedData Object containing personalization tokens
 * @returns Personalized prompt string
 */
export function generateActionFigurePrompt(
  templateId: string,
  personalizedData: Record<string, string>
): string {
  // Find the template or use the first one as default
  const template = actionFigureTemplates.find(t => t.id === templateId) || actionFigureTemplates[0];
  
  // Create a copy of the template prompt
  let personalizedPrompt = template.prompt;
  
  // Replace tokens with actual values
  Object.entries(personalizedData).forEach(([key, value]) => {
    // If the value is empty, don't replace the token
    if (value) {
      const tokenRegex = new RegExp(`\\[${key}\\]`, 'gi');
      personalizedPrompt = personalizedPrompt.replace(tokenRegex, value);
    }
  });
  
  // Return the personalized prompt
  return personalizedPrompt;
}

/**
 * Get random accessory suggestions for an action figure
 * @returns Array of accessory strings
 */
export function getRandomAccessories(): string[] {
  const allAccessories = [
    // Generic business accessories
    "Laptop", "Smartphone", "Tablet", "Briefcase", "Coffee Mug", "ID Badge",
    "Business Cards", "Company Logo Shield", "Headset", "Pen Set",
    
    // Field-specific accessories
    "Medical Kit", "Laboratory Equipment", "Safety Helmet", "Tool Belt",
    "Camera", "Microphone", "Sales Charts", "Project Plan", "Circuit Board",
    "Architectural Plans", "Legal Documents", "Chef's Hat", "Teacher's Pointer",
    
    // Action-oriented accessories
    "Jetpack", "Hoverboard", "Laser Pointer", "Retractable Grappling Hook",
    "Holographic Projector", "Rocket Boots", "Power Gloves", "Smart Glasses",
    "Transforming Gadget", "Swiss Army Business Tool"
  ];
  
  // Get random 2-4 accessories
  const numAccessories = Math.floor(Math.random() * 3) + 2; // 2-4
  const selectedAccessories: string[] = [];
  
  for (let i = 0; i < numAccessories; i++) {
    const randomIndex = Math.floor(Math.random() * allAccessories.length);
    selectedAccessories.push(allAccessories[randomIndex]);
    // Remove the selected accessory to avoid duplicates
    allAccessories.splice(randomIndex, 1);
  }
  
  return selectedAccessories;
}

/**
 * Get random company colors for packaging
 * @param companyName Optional company name to generate consistent colors
 * @returns Color description string
 */
export function getCompanyColors(companyName?: string): string {
  // Company-based color generation (simplified)
  if (companyName) {
    // Generate a simple hash from the company name
    const hash = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the hash to select from predefined color schemes
    const colorSchemes = [
      "blue and white with silver accents",
      "red and black with gold detailing",
      "green and gray with bronze elements", 
      "purple and white with chrome details",
      "orange and blue with white highlights",
      "teal and silver with black accents",
      "navy blue and gold with red trim",
      "crimson and silver with black detailing",
      "forest green and gold with ivory accents",
      "maroon and silver with blue highlights"
    ];
    
    return colorSchemes[hash % colorSchemes.length];
  }
  
  // Random color schemes
  const primaryColors = ["red", "blue", "green", "purple", "orange", "teal", "navy", "crimson", "maroon"];
  const secondaryColors = ["white", "black", "silver", "gold", "gray"];
  const accentTypes = ["accents", "detailing", "trim", "highlights", "elements"];
  
  const primary = primaryColors[Math.floor(Math.random() * primaryColors.length)];
  const secondary = secondaryColors[Math.floor(Math.random() * secondaryColors.length)];
  const accent = secondaryColors.filter(c => c !== secondary)[Math.floor(Math.random() * (secondaryColors.length - 1))];
  const accentType = accentTypes[Math.floor(Math.random() * accentTypes.length)];
  
  return `${primary} and ${secondary} with ${accent} ${accentType}`;
}