// Retro Action Figures - Collection of 30 nostalgic 80s/90s action figure archetypes

interface RetroActionFigurePrompt {
  archetype: string;
  basePrompt: string;
  additions: string[];
  removals: string[];
  poses: string[];
  packaging: string;
  preview?: string;
}

const retroPrompts: RetroActionFigurePrompt[] = [
  {
    archetype: "Tech Commando Figure",
    basePrompt: "Create a photorealistic boxed toy of a tech commando: [NAME] from [COMPANY] as a soldier figure in green camo and a red bandana with mirrored visor, posed inside a rugged window box labeled 'TACTICAL OPS EDITION'. Accessories and labels are neatly arranged in a molded tray; include a robotic canine companion display piece and cinematic explosion art on the inner card. Add mission patches, grit speckles on the package art, a series checklist on the back, barcode, and safety icons. Studio packshot with crisp reflections and high detail.",
    additions: ["Drone controller", "Sidearm holster"],
    removals: ["Robot dog"],
    poses: ["Kneeling aim", "Rope rappel", "Saluting"],
    packaging: "Gritty sandblast texture + mission patch cutout"
  },
  {
    archetype: "Treasure Hunter Figure",
    basePrompt: "Create a vintage explorer-themed toy box containing [NAME] from [COMPANY] as a cartoon-style treasure hunter with bomber jacket, boots, and goggles. The figure stands with one foot on a treasure chest amid jungle ruin art with scattered coins. Inner card shows sketched maps, rope borders, and stamp badges; the box has a glossy comic-strip frame and a large clear window. Add a series logo splash, barcode, safety icons, and a faux price tag corner; studio lighting, clean reflections.",
    additions: ["Map scroll", "Magnifying glass"],
    removals: ["Goggles", "Treasure chest"],
    poses: ["Swinging from a vine", "Holding torch"],
    packaging: "Glossy comic-strip frame with logo splash"
  },
  {
    archetype: "Cosmic Warrior Figure",
    basePrompt: "Create a retro power-fantasy boxed figure of [NAME] from [COMPANY] as a cosmic warrior: muscular build, glowing sword, fur-style loincloth, and futuristic boots. The packaging shows electric mountain peaks, lightning emblems, foil accents, and an explosive starburst backdrop. Include a collector sticker, side bio panel, and numbered series seal; photorealistic vac-tray, metallic inks, and a crisp PET window. Heroic stance, dramatic rim light, high detail.",
    additions: ["Battle axe", "Laser shield"],
    removals: ["Helmet"],
    poses: ["Arms raised", "Sword thrust"],
    packaging: "Exploding cosmic burst with embossed foil sticker"
  },
  {
    archetype: "Sewer Ninja Figure",
    basePrompt: "Create a classic blister-carded ninja-mutant hero: [NAME] from [COMPANY] as a muscular humanoid turtle figure, crouched in attack pose with dual katanas, over a stylized city sewer tunnel backdrop with neon graffiti scribbles. The card features bright spray-paint shapes, a sewer manhole motif, and a bold series banner. Include accessory callout bubbles, a checklist backer, barcode, and safety icons. Photorealistic blister curvature, studio lighting, crisp edges.",
    additions: ["Pizza slice", "Boombox"],
    removals: ["Weapons"],
    poses: ["Mid-kick", "Wall cling"],
    packaging: "Bright neon spray-paint layout"
  },
  {
    archetype: "Jungle Avenger Figure",
    basePrompt: "Create a foil-stamped window box for [NAME] from [COMPANY] as a feline jungle avenger with glowing blade, animal-inspired armor, and wild hair. The inner card shows a galactic storm sky; the package features metallic accents and midnight gradients. Add a collector crest, bio panel, and series icons. Product photography with controlled highlights on the window, deep shadows for drama, and crisp print details.",
    additions: ["Shield", "Alien creature sidekick"],
    removals: ["Helmet"],
    poses: ["Leaping claw swipe", "Standing heroically"],
    packaging: "Glossy midnight galaxy with metallic accents"
  },
  {
    archetype: "Mecha Morph Figure",
    basePrompt: "Create a transformation-themed box for [NAME] from [COMPANY] as a metallic humanoid mecha mid-morph: one arm a cannon, one leg partially wheeled. The packaging design has circuit board lines, a holographic data grid, and energy arcs; include transformation step icons on the side. Add a clear window with crisp reflections, vac-tray mounts, barcode, safety marks; studio product shot, high detail.",
    additions: ["Weapon arm swap", "Hover base"],
    removals: ["Cannon arm"],
    poses: ["Fist raised", "Transformation half-finished"],
    packaging: "Holographic data scan motif"
  },
  {
    archetype: "Detective Gadget Figure",
    basePrompt: "Create a comic-styled gadget deluxe box featuring [NAME] from [COMPANY] as a trench-coat detective with extendable arms, springy hat, and a multi-tool backpack, posed waving a magnifying glass. Include a small loyal companion insert. The package has speech bubbles, a 'Try Me' flap icon, and playful blueprint line art. Add prop callouts, barcode, safety icons, and window reflections; bright studio lighting, crisp details.",
    additions: ["Helicopter hat", "Spring shoes"],
    removals: ["Sidekick", "Extended arms"],
    poses: ["Tiptoe sneak", "Gadget inspection"],
    packaging: "Comic bubble design with 'Try Me' gadget flap"
  },
  {
    archetype: "Baby Felt Figure",
    basePrompt: "Create a pastel nursery-themed window cradle box for [NAME] from [COMPANY] as a plush-style baby puppet figure with button eyes and colorful overalls. The inner card shows plush toys and soft clouds; include fabric-like textures and gentle lighting. Add a nameplate ribbon, safety badge, and collector seal. Soft product photography with cozy shadows and realistic packaging materials.",
    additions: ["Toy rattle", "Nap blanket"],
    removals: ["Pacifier"],
    poses: ["Sitting", "Arms wide"],
    packaging: "Puffy cloud shapes and windowed cradle box"
  },
  {
    archetype: "Cloud Hugger Figure",
    basePrompt: "Create a transparent rainbow clamshell package for [NAME] from [COMPANY] as a pastel teddy with heart belly emblem, a star accessory, and a cloud base. Include sparkle stickers, rainbow arch display, and soft gradient inner card. Add a collector badge, barcode, and safety icons. Bright studio lighting for gentle highlights, clean reflections, high detail.",
    additions: ["Glitter wings", "Sparkle trail"],
    removals: ["Belly symbol"],
    poses: ["Floating pose", "Sleeping"],
    packaging: "Transparent rainbow clamshell"
  },
  {
    archetype: "Ecto-Blaster Figure",
    basePrompt: "Create a neon slime-splash box for [NAME] from [COMPANY] as a paranormal agent in jumpsuit, energy pack over shoulder, firing a glowing ecto-blast effect. The inner card shows eerie city silhouettes and vapor swirls; the window has goo drips printed at the edge. Include accessory callouts, barcode, safety marks; photorealistic glow and reflections, dramatic lighting.",
    additions: ["Trap", "Glowing ghost figure"],
    removals: ["Proton pack"],
    poses: ["Mid-blast", "Ghost capture stance"],
    packaging: "Glow-in-the-dark slime splatter print"
  },
  {
    archetype: "Shadow Figure",
    basePrompt: "Create a matte-noir rooftop box for [NAME] from [COMPANY] as a caped duck crime-fighter with a gas gadget, posed in a heroic stance under a moonlit inner card. Include a spotlight-shaped window cut, gold-embossed crest, and villain poster insert. Add barcode, safety icons, and series numbering. Studio packshot with controlled highlights and crisp shadows.",
    additions: ["Grappling hook", "Villain poster"],
    removals: ["Cape"],
    poses: ["Perch stance", "Leaping silhouette"],
    packaging: "Matte noir with gold-embossed logo"
  },
  {
    archetype: "Gadget Hacker Figure",
    basePrompt: "Create a micro-world blister pack containing [NAME] from [COMPANY] as a small inventor critter with toolbelt and goggles, posed on a battery-powered vehicle. The card art shows oversized everyday objects as terrain: pencil stairs, bottlecap wheels. Include witty callouts, barcode, and safety icons. Macro product shot, crisp blister, precise tiny details.",
    additions: ["Wrench", "Parachute leaf"],
    removals: ["Toolbelt"],
    poses: ["Fixing something", "Riding a paper airplane"],
    packaging: "Everyday objects made huge, like pencil stairs or bottlecap wheels"
  },
  {
    archetype: "Eco-Avenger Figure",
    basePrompt: "Create a recyclable eco-box for [NAME] from [COMPANY] as an elemental hero with wind, water, and fire effects swirling around. The package features cardboard earth motifs, eco badges, and plant-based inks. Include a globe cutout window, a cause badge, barcode, and safety icons. Photorealistic carton texture, soft lighting, and clean composition.",
    additions: ["Planeteer accessories", "Tree sapling"],
    removals: ["Elemental ring"],
    poses: ["One-arm raised", "Levitating above storm"],
    packaging: "Recyclable materials with glow-stamped ring graphics"
  },
  {
    archetype: "Power Burst Figure",
    basePrompt: "Create a flip-open comic panel box for [NAME] from [COMPANY] as a superhuman with glowing hand effects, silver suit, and a tattered cape, posed before collapsing industrial wall art. Inside flap shows a power stat chart; the back shows cover-style graphics. Include accessory badges, barcode, and safety marks; photo-real window reflections, high detail.",
    additions: ["Sentinel scrap", "Danger room background"],
    removals: ["Cape"],
    poses: ["Energy blast", "Shield block", "Mid-air"],
    packaging: "Flip-open comic panel with power stat chart"
  },
  {
    archetype: "Swing-Through Hero Figure",
    basePrompt: "Create a glossy night-city window box for [NAME] from [COMPANY] as a masked urban hero posed mid-swing on a web line, held by a clear aerial mount. The backdrop is a stylized skyline with glowing windows. Include dynamic motion streak graphics, accessory bubbles, barcode, and safety icons. Photorealistic window shine, dramatic highlights, crisp detail.",
    additions: ["Web glider", "Skyline base"],
    removals: ["Mask"],
    poses: ["Web-swing", "Crouch", "Wall cling"],
    packaging: "Glossy with cutout city buildings and glow windows"
  },
  {
    archetype: "Muscle Mode Figure",
    basePrompt: "Create a 50s-diner themed box for [NAME] from [COMPANY] as a tall toon with dark shades and towering pompadour, captured mid-flex. Include vanity mirror card insert, chrome trims, and gym accessory tray. Photorealistic PET window, barcode, safety icons, and series stamp; studio lighting with clean reflections.",
    additions: ["Dumbbell", "Hair gel bottle"],
    removals: ["Shades"],
    poses: ["Flex", "Mirror smolder", "Finger guns"],
    packaging: "50s diner pattern with vanity mirror card insert"
  },
  {
    archetype: "Lab Genius Figure",
    basePrompt: "Create a holographic science lab toy box for [NAME] from [COMPANY] as a kid genius with goggles, holding a test tube and remote. The front has a sliding-door motif and blueprint lines; include a gadget sound-FX pull tab icon. Add a mini lab table prop, barcode, safety icons; crisp reflections, macro-level detail.",
    additions: ["Robot arm", "Mini experiment table"],
    removals: ["Coat"],
    poses: ["Holding remote", "Shocked expression", "Levitating vial"],
    packaging: "Blueprint blue box with gadget sound FX pull tab"
  },
  {
    archetype: "Zany Triplet Set",
    basePrompt: "Create a water-tower-shaped tri-figure box containing [NAME] and teammates from [COMPANY] as three slapstick minis, with removable props (pie, mallet, microphone). The panel graphics show zany motion lines and a spin-mechanism pull-tab illustration. Include barcode, safety marks, and collector numbering. Bright, playful studio shot with crisp edges.",
    additions: ["Cartoon instruments", "Joke book"],
    removals: ["Props"],
    poses: ["Stacked pyramid", "Mid-chase", "Breakdance"],
    packaging: "Cartoon chaos splash with pull-tab to make them spin"
  },
  {
    archetype: "Academy Figure",
    basePrompt: "Create a spiral-notebook themed box for [NAME] from [COMPANY] as a bright toon student with textbook and springy feet, posed mid-jump in a classroom backdrop. Include sketch margins, sticker sheet callouts, barcode, and safety icons. Photorealistic packaging with clean reflections and high detail.",
    additions: ["Chalkboard stickers", "Bunny ears hat"],
    removals: ["Backpack"],
    poses: ["Pogo jump", "Holding giant pencil"],
    packaging: "Spiral notebook box with sketch margins"
  },
  {
    archetype: "Cyber Warrior Figure",
    basePrompt: "Create a transparent-grid tech box for [NAME] from [COMPANY] as a digital-era cyber hero with glowing armor and vector lines, standing on a base with binary rain and hovering cubes. Include an LED-effect sticker and code blade accessory. Barcode, safety icons, crisp window reflections, luminous accents; studio lighting.",
    additions: ["Code-blade", "Pop-out virus enemy"],
    removals: ["Visor"],
    poses: ["Floating charge-up", "Crouch", "Reboot stance"],
    packaging: "See-through grid with blinking LED effect sticker"
  },
  {
    archetype: "Vigilante Figure",
    basePrompt: "Create an art-deco stone-textured rooftop display box for [NAME] from [COMPANY] as a nocturnal caped vigilante with a grappling tool. The inner card shows a moody skyline with a spotlight cutout. Include accessory badges, barcode, and safety marks. Photorealistic materials, controlled highlights, crisp print.",
    additions: ["Vehicle accessory", "Detachable cowl"],
    removals: ["Belt"],
    poses: ["Gargoyle perch", "Rooftop glide"],
    packaging: "Art Deco stone texture with spotlight cutout"
  },
  {
    archetype: "Celestial Guardian Figure",
    basePrompt: "Create a star-pink heart-window box for [NAME] from [COMPANY] as a magical heroine with crescent wand and flowing ribbons, staged on a transparent glitter stand over a moonlight base. Include a spell quote ribbon, barcode, and safety icons. Soft sparkling lighting, delicate reflections, high detail.",
    additions: ["Cat companion", "Starburst background"],
    removals: ["Wand"],
    poses: ["Transformation twirl", "Moon tiara pose"],
    packaging: "Starry pink with heart-shaped window and spell quote"
  },
  {
    archetype: "Power Surge Figure",
    basePrompt: "Create a cracked-desert battlefield box for [NAME] from [COMPANY] as an anime-style warrior with spiky hair and blazing aura, with floating rocks printed on the backdrop. Include energy effect parts, fusion-pose arms, barcode, and safety icons. Dramatic lighting, glow effects balanced with realistic packaging reflections.",
    additions: ["Fusion pose arms", "Energy blast"],
    removals: ["Armor"],
    poses: ["Super scream", "Power crouch"],
    packaging: "Glow energy aura and breakaway cardboard rocks"
  },
  {
    archetype: "Team 3-Pack",
    basePrompt: "Create a tri-color curved-front cityscape box for [NAME] and teammates from [COMPANY] as three chibi flying heroines with heart-trail effects. Include pop-out sticker tabs, monster insert, and a mayor phone prop. Add barcode and safety marks; bright toy photography, glossy window, crisp detail.",
    additions: ["Monster villain", "Mayor phone"],
    removals: ["Trail stands"],
    poses: ["Team flyout", "Hands on hips"],
    packaging: "Tri-color cutout burst with pop-out sugar/sticker tab"
  },
  {
    archetype: "Stone Awakening Figure",
    basePrompt: "Create a cracked gothic box for [NAME] from [COMPANY] as a winged gargoyle perched on a cathedral ledge at sunset. Include folded-wings swap parts and a glowing-eyes variant. Inner card shows stained glass and stone textures; add 'Nightfall Unleashed' sticker, barcode, and safety icons. Moody studio lighting, crisp materials.",
    additions: ["Scroll", "Villain ghost"],
    removals: ["Wings"],
    poses: ["Roar", "Flight pose", "Crouch"],
    packaging: "Cracked gothic box with 'Nightfall Unleashed' sticker"
  },
  {
    archetype: "Goofy Pack Figure",
    basePrompt: "Create a pineapple-inspired window package for [NAME] from [COMPANY] as a cheerful sea-sponge figure with bubble wand and jellyfish net, set on a coral reef base with goofy alternate faces. Add transparent water-splash window element, barcode, and safety icons. Bright studio lighting, crisp edges, high detail.",
    additions: ["Jellyfish launcher", "Spatula"],
    removals: ["Net"],
    poses: ["Mid-jump", "Karate stance", "Laugh face"],
    packaging: "Pineapple packaging with transparent water splash"
  },
  {
    archetype: "Suburban Dreamer Figure",
    basePrompt: "Create a spiral sketchpad flip box for [NAME] from [COMPANY] as a thoughtful suburban teen with backpack and sketchbook, posed under a tree backdrop. Include journal sticker, doodle margins, barcode, and safety icons. Soft studio lighting, gentle shadow, crisp packaging.",
    additions: ["Dog figure", "Love letter"],
    removals: ["Backpack"],
    poses: ["Sitting cross-legged", "Looking up"],
    packaging: "Spiral sketchpad flip box"
  },
  {
    archetype: "Jungle Explorer Set",
    basePrompt: "Create a grass-texture blister card with mud-splatter effects for [NAME] from [COMPANY] as a toddler adventurer holding a toy compass and juice bottle, posed in a backyard jungle display. Include plant base, sticker sheet callouts, barcode, and safety icons. Photoreal blister, macro details, bright lighting.",
    additions: ["Blanket tent", "Mini map"],
    removals: ["Bottle"],
    poses: ["Crawling", "Yelling", "Pounce"],
    packaging: "Grass-texture blister with mud splatter FX"
  },
  {
    archetype: "Surreal Errand Pack",
    basePrompt: "Create a swirl-pattern cutout box for [NAME] from [COMPANY] as a frantic wallaby holding a grocery bag spilling surreal items, with a quirky vacuum and wavy sidewalk base insert. Add zig-zag energy borders, barcode, and safety marks. Clean reflections, cartoonish yet photoreal packaging.",
    additions: ["Cartoon phone", "Giant eyeball"],
    removals: ["Bag"],
    poses: ["Running", "Tripping", "Yelling"],
    packaging: "Swirl pattern cutout with zig-zag energy border"
  },
  {
    archetype: "Scam Pack",
    basePrompt: "Create a crayon-drawn cardboard-fort tri-figure box for [NAME] and teammates from [COMPANY] as three oddball schemers with jawbreakers, blueprints, and slapstick tools. Include duct-tape printed trims, a cart of schemes, and a catapult insert. Add barcode, safety icons; studio lighting with crisp window and playful textures.",
    additions: ["Cart of scams", "Catapult"],
    removals: ["Tools"],
    poses: ["Stacked", "Side-eye", "Grab-jawbreaker"],
    packaging: "Crayon-drawn cardboard and duct tape style"
  }
];

export default retroPrompts;