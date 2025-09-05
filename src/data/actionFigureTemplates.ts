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
    prompt: "Create an image of an action figure toy – [NAME] from [COMPANY] in an unopened blister pack. The figure is wearing a professional suit with company-branded accessories including a laptop, smartphone, and briefcase. The packaging should be [COMPANY] brand colors, styled like a retro blister pack with bold typography and a clear window displaying the figure and accessories. Professional product photography with studio lighting.",
    packaging: "Blister Pack",
    accessories: ["Laptop", "Smartphone", "Briefcase"],
    style: "classic",
    preview: "https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "deluxe-boxed",
    name: "Deluxe Boxed Edition",
    description: "Premium window box packaging with special features and multiple accessories.",
    prompt: "Create an image of a deluxe boxed action figure – [NAME] from [COMPANY] in premium window box packaging. The figure is posed heroically and comes with multiple accessories: a company logo shield, industry-specific tools, and a display stand. Box has specialty printing with foil accents in [COMPANY] colors, product features listed on the side panel, and 'COLLECTOR EDITION' seal. Professional product photography with dramatic lighting on a store shelf.",
    packaging: "Deluxe Box",
    accessories: ["Company Logo Shield", "Industry Tools", "Display Stand"],
    style: "premium",
    preview: "https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "vintage-cardback",
    name: "Vintage Cardback",
    description: "Retro-style packaging with nostalgic design elements from the 80s-90s.",
    prompt: "Create an image of a vintage-style action figure – [NAME] from [COMPANY] on a cardback. The figure is wearing business attire customized with action features. Accessories include a briefcase that opens, a tiny laptop, and industry-specific gadgets. The cardback is in [COMPANY] colors with a retro 80s grid background, product lineup shown on the back, and an 'ACTION FEATURE' callout. Styled like a toy from the 1980s with slightly worn packaging edges for authenticity. Professional product photography.",
    packaging: "Cardback",
    accessories: ["Opening Briefcase", "Tiny Laptop", "Industry Gadgets"],
    style: "retro",
    preview: "https://images.pexels.com/photos/8345972/pexels-photo-8345972.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "collectors-display",
    name: "Collector's Display Case",
    description: "Premium display case packaging for serious collectors.",
    prompt: "Create an image of a high-end collector's edition action figure – [NAME] from [COMPANY] in a premium display case packaging. The highly-detailed figure wears tailored business attire with fabric textures and has 30+ points of articulation. The display case has a clear acrylic window, die-cast metal base with engraved nameplate, LED lighting effects, and reflective backdrop with [COMPANY] logo. Accessories include interchangeable hands, industry tools, and a scale replica of company products. Professional product photography with museum-quality display lighting.",
    packaging: "Display Case",
    accessories: ["Interchangeable Hands", "Industry Tools", "Company Product Replicas"],
    style: "collector",
    preview: "https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "trading-card",
    name: "Collectible Card",
    description: "Trading card style with character stats and special abilities.",
    prompt: "Create an image of a collectible trading card featuring [NAME] from [COMPANY]. The card has a holographic foil border in [COMPANY] colors, portrait-style artwork of the character in professional pose, and stat blocks showing 'Leadership,' 'Innovation,' and 'Expertise' ratings. The card includes special ability text related to their role at [COMPANY] and a unique collector's number. The design mimics premium trading card games with foil stamping, textured printing effects, and slight light refraction. Professional product photography on dark surface with subtle lighting to show holographic elements.",
    packaging: "Trading Card",
    accessories: [],
    style: "card",
    preview: "https://images.pexels.com/photos/7241628/pexels-photo-7241628.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "2pack-battle",
    name: "2-Pack Battle Set",
    description: "Double figure set showing characters in action.",
    prompt: "Create an image of a 2-pack action figure battle set featuring [NAME] and a teammate from [COMPANY]. Both figures are in dynamic poses wearing styled business attire with action features. The packaging is a wide window box in [COMPANY] colors with 'TEAMWORK EDITION' banner and action scene backdrop. Accessories include office furniture pieces, tiny laptops, industry tools, and a display base with [COMPANY] logo. Side panel shows other figures in the collection. Professional product photography with dramatic lighting to emphasize the action poses.",
    packaging: "2-Pack Box",
    accessories: ["Office Furniture", "Laptops", "Industry Tools", "Display Base"],
    style: "action",
    preview: "https://images.pexels.com/photos/8346904/pexels-photo-8346904.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "bobblehead",
    name: "Desktop Bobblehead",
    description: "Fun office desk bobblehead with oversized head.",
    prompt: "Create an image of a desktop bobblehead figure of [NAME] from [COMPANY]. The figure has an oversized head with caricatured but recognizable features, standing on a branded base with the [COMPANY] logo. The figure is wearing business attire appropriate for their industry with exaggerated proportions. The packaging is an open window box designed to display the figure while still in package. The box has [COMPANY] colors and 'DESKTOP BUDDY SERIES' branding. Professional product photography showing slight motion blur on the bobbling head.",
    packaging: "Window Box",
    accessories: ["Branded Base"],
    style: "bobblehead",
    preview: "https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "vinyl-pop",
    name: "Vinyl Collectible",
    description: "Stylized vinyl figure with simplified features and oversized head.",
    prompt: "Create an image of a vinyl pop collectible figure of [NAME] from [COMPANY]. The figure has the iconic stylized design with oversized head, simplified body, and characteristic black round eyes. Wearing professional attire appropriate for [COMPANY] with one signature accessory related to their role. Packaged in a windowed square box with distinct [COMPANY] branding, figure number, and series information. The packaging matches Pop! figure style with character name prominently displayed. Professional product photography showing the figure both in box and with a closeup of the unboxed figure.",
    packaging: "Square Window Box",
    accessories: ["Role-Specific Accessory"],
    style: "vinyl-pop",
    preview: "https://images.pexels.com/photos/17023172/pexels-photo-17023172/free-photo-of-a-barbie-toy-on-a-sofa.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "buildable-set",
    name: "Buildable Mini Figure",
    description: "Brick-compatible mini figure with building blocks accessories.",
    prompt: "Create an image of a buildable mini figure set featuring [NAME] from [COMPANY]. The figure is in the style of popular brick building toys with modular parts and characteristic cylindrical head. The set includes the figure in business attire with [COMPANY] colors and micro-build office furniture pieces. Packaged in a small box with building instructions showing assembled figure and furniture. Box art features the [COMPANY] logo and indicates piece count. Professional product photography with macro lens focus on the small detailed pieces.",
    packaging: "Small Box",
    accessories: ["Office Furniture Set", "Building Instructions"],
    style: "building-block",
    preview: "https://images.pexels.com/photos/6601811/pexels-photo-6601811.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "action-roleplay",
    name: "Roleplaying Set",
    description: "Children's costume and roleplay accessories set.",
    prompt: "Create an image of a children's roleplay set based on [NAME] from [COMPANY]. The packaging shows a child wearing a costume version of professional attire with [COMPANY] colors and logo patches. The set includes a costume jacket/outfit, toy accessories specific to [NAME]'s role, and an ID badge with [COMPANY] branding. The packaging is a hanging blister card with try-me features and 'BE LIKE [NAME]!' text prominently displayed. Package back shows all included items and play possibilities. Professional product photography in toy store shelf setting.",
    packaging: "Hanging Blister Card",
    accessories: ["Costume Outfit", "Role Accessories", "ID Badge"],
    style: "costume",
    preview: "https://images.pexels.com/photos/6615294/pexels-photo-6615294.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "digital-avatar",
    name: "Digital Game Character",
    description: "Video game style character selection screen.",
    prompt: "Create an image of a video game character selection screen featuring [NAME] from [COMPANY] as a playable character. The character is rendered in a modern 3D game style, wearing stylized professional attire with [COMPANY] colors and exaggerated proportions. The interface shows character stats for 'Leadership,' 'Technical Skill,' and 'Teamwork.' The screen includes the game title '[COMPANY] CHAMPIONS' with options to select/customize the character. The character pose is dynamic with slight animation effect and dramatic lighting. Professional digital art in the style of modern fighting or adventure games.",
    packaging: "Digital",
    accessories: [],
    style: "digital",
    preview: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "chibi-style",
    name: "Chibi Art Style",
    description: "Cute Japanese chibi style with oversized head and tiny body.",
    prompt: "Create an image of a chibi-style figure of [NAME] from [COMPANY]. The figure has super-deformed proportions with oversized head (about 1/3 of total height), tiny body, and exaggerated cute features including large expressive eyes. Wearing professional attire appropriate for [COMPANY] but with adorable stylized details. The figure comes in a small window box with kawaii design elements, Japanese-inspired packaging text, and [COMPANY] branding adapted to match the cute aesthetic. Professional product photography with soft, colorful lighting to enhance the cute character design.",
    packaging: "Small Window Box",
    accessories: [],
    style: "chibi",
    preview: "https://images.pexels.com/photos/1670044/pexels-photo-1670044.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "lego-minifig",
    name: "Building Block Minifigure",
    description: "LEGO-style minifigure with compatible pieces and accessories.",
    prompt: "Create an image of a building block minifigure of [NAME] from [COMPANY] in the style of LEGO. The figure has the classic minifigure proportions with cylindrical head, blocky body, and c-grip hands. Wearing printed professional attire in [COMPANY] colors with detailed face printing. The figure comes with tiny accessories related to their role mounted on a display base with [COMPANY] logo brick. Packaged in a small blister pack with building block aesthetics and 'COLLECTIBLE MINIFIGURE SERIES' branding. Professional product photography with macro lens detail of the figure's printed elements.",
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