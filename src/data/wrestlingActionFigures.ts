// Wrestling Action Figures - Collection of wrestling legend archetypes

interface WrestlingActionFigurePrompt {
  archetype: string;
  basePrompt: string;
  additions: string[];
  removals: string[];
  poses: string[];
  packaging: string;
}

const wrestlingPrompts: WrestlingActionFigurePrompt[] = [
  {
    archetype: "Hulkamania Icon Figure",
    basePrompt: "Create a WrestleMania box for [NAME] from [COMPANY] as a larger-than-life wrestler in yellow tights and red bandana, posed mid-leg-drop with logo behind. Includes American flag cape and removable shirt-rip pose. Professional toy photography with wrestling arena lighting.",
    additions: ["Championship belt", "Microphone stand"],
    removals: ["Cape", "Bandana"],
    poses: ["Leg drop", "Ear cup pose", "Flexed yell"],
    packaging: "WrestleMania box with bold 80s font, fire sparks, and logo sticker"
  },
  {
    archetype: "Macho Madness Figure",
    basePrompt: "Create a zebra stripe box for [NAME] from [COMPANY] as a flamboyant wrestler with cowboy hat and fringe jacket, posed on a neon entrance ramp with motivational backdrop. Includes glitter glasses and title belt. Professional photography with arena lighting.",
    additions: ["Snack accessory", "Star shades"],
    removals: ["Hat", "Cape"],
    poses: ["Rope jump", "Point to sky", "Fist pump"],
    packaging: "Zebra stripe box with metallic stars and Madness logo burst"
  },
  {
    archetype: "Ultimate Energy Figure",
    basePrompt: "Create an exploding lightning clamshell for [NAME] from [COMPANY] as a wild warrior in face paint and arm tassels, posed sprinting down a ramp with muscle veins glowing. Includes title belt and full charge stand base. Professional photography with high-energy lighting.",
    additions: ["Championship belt", "Lightning fists"],
    removals: ["Face paint", "Arm tassels"],
    poses: ["Charge sprint", "Turnbuckle climb", "Power flex"],
    packaging: "Exploding lightning clamshell with neon tribal marks and rope effect"
  },
  {
    archetype: "Colossal Legend Figure",
    basePrompt: "Create an oversized box for [NAME] from [COMPANY] as a towering figure in black singlet and boots, posed arms crossed in the ring with mini-wrestlers around. Includes giant hand prop and arena backdrop. Professional photography with dramatic scale lighting.",
    additions: ["Trophy accessory", "Mini ring base"],
    removals: ["Singlet", "Boots"],
    poses: ["Lifted choke", "Crossed arms", "Gentle giant wave"],
    packaging: "Oversized box with crowd effect wrap and WrestleMania III banner"
  },
  {
    archetype: "Excellence Figure",
    basePrompt: "Create a heart-styled box for [NAME] from [COMPANY] as a technical wrestler in pink and black gear with shades, posed mid-sharpshooter with entrance ramp. Includes glasses, pink jacket, and quote stand. Professional photography with technical wrestling lighting.",
    additions: ["Championship belt", "Calgary flag"],
    removals: ["Sunglasses", "Jacket"],
    poses: ["Sharpshooter lock", "Arms spread", "Corner lean"],
    packaging: "Heart-styled box with pink flame art and ring bell sound clip"
  },
  {
    archetype: "Phenom of Darkness Figure",
    basePrompt: "Create a gravestone box for [NAME] from [COMPANY] as a shadowy wrestler in black trench coat and wide-brimmed hat, standing in front of an eerie smoke-filled graveyard stage. Includes casket accessory and urn. Professional photography with gothic lighting.",
    additions: ["Ministry robe", "Rest in Peace tombstone"],
    removals: ["Hat", "Coat"],
    poses: ["Eyes rolled back", "Choke slam", "Kneeling lightning call"],
    packaging: "Gravestone box with rising fog FX and bell toll button"
  },
  {
    archetype: "Heartbreak Kid Figure",
    basePrompt: "Create a mirror box for [NAME] from [COMPANY] as a charismatic showman in zebra pants and glitter vest, striking a pose on entrance ramp with pyrotechnic arches. Includes mirror backdrop and entrance gear. Professional photography with showman lighting.",
    additions: ["Heart sunglasses", "Heartbreak pose stand"],
    removals: ["Vest", "Bandana"],
    poses: ["Sweet Chin Music", "Flexed prayer", "Mic serenade"],
    packaging: "Mirror box with glitter cutout and heartbreak arrow slash"
  },
  {
    archetype: "Rattlesnake Figure",
    basePrompt: "Create a glass break clamshell for [NAME] from [COMPANY] as a bald brawler in black trunks and vest with beverage cans, posed in mid-stunner position. Includes shattered glass backdrop and belt. Professional photography with attitude era lighting.",
    additions: ["Broken beverage can prop", "Steel chair"],
    removals: ["Vest", "Kneepads"],
    poses: ["Stunner pose", "Middle finger", "Turnbuckle salute"],
    packaging: "Glass break clamshell with Attitude Era logo and sound FX button"
  },
  {
    archetype: "People's Champion Figure",
    basePrompt: "Create a titantron frame for [NAME] from [COMPANY] as a confident icon in designer shirt and sunglasses with eyebrow raised. Stands on titantron base with motivational voice chip. Professional photography with championship lighting.",
    additions: ["Lapel mic", "Championship title"],
    removals: ["Shades", "Shirt"],
    poses: ["Elbow drop", "Mic raise", "Eyebrow raise"],
    packaging: "Titantron frame with bull emboss and voice sample button"
  },
  {
    archetype: "Stylin' & Profilin' Figure",
    basePrompt: "Create a velvet robe box for [NAME] from [COMPANY] as a flamboyant veteran in rhinestone robe and flowing hair, posed mid-celebration in front of mirror lights. Includes feather boa and walk-and-strut FX. Professional photography with luxury lighting.",
    additions: ["Championship belt", "Champagne flute"],
    removals: ["Robe", "Boots"],
    poses: ["Wooo pose", "Finger wag", "Strut entrance"],
    packaging: "Velvet robe box with spotlight halo and classic emblems"
  },
  {
    archetype: "Big Red Machine Figure",
    basePrompt: "Create a hellfire blister pack for [NAME] from [COMPANY] as a masked monster in black and red flame suit with metal chains, posed with flaming turnbuckle and dark arena backdrop. Includes voice chip growl. Professional photography with inferno lighting.",
    additions: ["Chain gauntlet", "Inferno FX base"],
    removals: ["Mask", "Belt"],
    poses: ["Choke slam", "Fire raise", "Roar and flex"],
    packaging: "Hellfire blister pack with burnt steel rim and fire crackle sound"
  },
  {
    archetype: "Hardcore Icon Figure",
    basePrompt: "Create a torn padding clamshell for [NAME] from [COMPANY] as a wild-eyed figure in brown mask, white shirt, and tie, holding sock puppet and steel chair. Includes boiler room base and tooth prop. Professional photography with hardcore lighting.",
    additions: ["Socko stand", "Broken table"],
    removals: ["Tie", "Chair"],
    poses: ["Socko attack", "Falling bump", "Leaned scream"],
    packaging: "Torn padding clamshell with hardcore insert and brick wall wrap"
  },
  {
    archetype: "Latino Heat Figure",
    basePrompt: "Create a lowrider bumper box for [NAME] from [COMPANY] as a slick figure with mullet and smug grin, holding lowrider door in one hand and championship belt in the other. Includes show base. Professional photography with lowrider aesthetic lighting.",
    additions: ["Frog splash platform", "Rose prop"],
    removals: ["Shirt", "Belt"],
    poses: ["Frog splash", "Lowrider lean", "Lying cheat grin"],
    packaging: "Lowrider bumper box with glitter trim and heat sticker"
  },
  {
    archetype: "Diva of Domination Figure",
    basePrompt: "Create a pink-gloss box for [NAME] from [COMPANY] as a fitness icon and trailblazer with trench coat and cowboy hat, standing with mic and belt over shoulder. Includes ring mat base with spotlight shine. Professional photography with diva lighting.",
    additions: ["Yoga pose stand", "Diva title"],
    removals: ["Hat", "Jacket"],
    poses: ["Kick pose", "Flex and smirk", "Champion raise"],
    packaging: "Pink-gloss box with spotlight shimmer and signature autograph"
  },
  {
    archetype: "Never Give Up Figure",
    basePrompt: "Create a red/white/blue themed box for [NAME] from [COMPANY] as a powerhouse figure with cap and dog tags, mid-attitude adjustment on clear backdrop. Includes motivational stand and salute FX. Professional photography with patriotic lighting.",
    additions: ["Spinner belt", "Microphone"],
    removals: ["Cap", "Dog tags"],
    poses: ["Attitude adjustment", "Salute", "Can't see me hand wave"],
    packaging: "Box with spinner sticker, red/white/blue theme, and invisible clear plastic"
  },
  {
    archetype: "Luchador Master Figure",
    basePrompt: "Create a Mexican-inspired box for [NAME] from [COMPANY] as a masked high-flyer in colorful lucha libre attire with matching boots, posed on top turnbuckle with backdrop. Includes removable mask collection and spring-loaded legs. Professional photography with lucha lighting.",
    additions: ["Mini wrestling ring", "Championship belt"],
    removals: ["Mask", "Shirt"],
    poses: ["619 pose", "Flying leap", "Top rope stance"],
    packaging: "Mexican-inspired box with luchador art and mask display window"
  },
  {
    archetype: "Hardcore Legend Figure",
    basePrompt: "Create a hardcore-themed torn cardboard for [NAME] from [COMPANY] as a hardcore legend figure with interchangeable heads (leather mask/wild hair), flannel shirt and barbed wire bat. Includes thumbtacks accessory and cell backdrop. Professional photography with hardcore lighting.",
    additions: ["Mr. Socko", "Folding chair"],
    removals: ["Mask", "Bat"],
    poses: ["Mandible claw", "Fall off cage", "Bang bang guns"],
    packaging: "Hardcore-themed torn cardboard with cell structure overlay"
  },
  {
    archetype: "Hot Rod Figure",
    basePrompt: "Create a tartan-trimmed box for [NAME] from [COMPANY] as a Scottish brawler in kilt and leather jacket with bagpipes accessory, posed ready to fight on interview set. Includes coconut prop and interview backdrop. Professional photography with Scottish lighting.",
    additions: ["Coconut", "Hot Rod sunglasses"],
    removals: ["Kilt", "Jacket"],
    poses: ["Sleeper hold", "Interview point", "Bagpipe play"],
    packaging: "Tartan-trimmed box with interview logo and tropical coconut accent"
  },
  {
    archetype: "Viper Strike Figure",
    basePrompt: "Create a snake-skin texture box for [NAME] from [COMPANY] as a calculated wrestler in minimal gear with tribal tattoos, posed in mid-RKO with snake-like stance. Includes pyro effects stand and slow-motion capture base. Professional photography with viper lighting.",
    additions: ["Snake accessory", "Legacy jacket"],
    removals: ["Wristbands", "Knee pads"],
    poses: ["RKO pose", "Viper stance", "Arms wide taunt"],
    packaging: "Snake-skin texture box with striking Viper logo and 'Outta Nowhere' backdrop"
  },
  {
    archetype: "Undefeated Streak Figure",
    basePrompt: "Create a black and gold box for [NAME] from [COMPANY] as a bald powerhouse with tribal tattoo and black tights, posed mid-spear with smoke effects and cracked ring mat. Includes streak counter accessory. Professional photography with powerhouse lighting.",
    additions: ["Barbed wire jacket", "Championship belt"],
    removals: ["Gloves", "Entrance smoke"],
    poses: ["Spear pose", "Jackhammer ready", "Intense stare"],
    packaging: "Black and gold box with streak numbers and explosive entrance effects"
  }
];

export default wrestlingPrompts;