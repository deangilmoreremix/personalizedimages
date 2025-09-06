export interface TVShowActionFigurePrompt {
  title: string;
  basePrompt: string;
  additions: string[];
  removals: string[];
  poses: string[];
  packaging: string;
}

const tvShowActionFigurePrompts: TVShowActionFigurePrompt[] = [
  {
    title: "High School Heartthrob Figure",
    basePrompt: "A charismatic teen idol in letterman jacket, jeans, and sneakers, posed with confident smile and perfect hair styling. The figure stands in a high school hallway backdrop with lockers, posters, and trophy cases. Accessories include a backpack and sports trophy. The design emphasizes clean, youthful features and approachable charm, photographed with bright, natural lighting that captures the essence of teenage popularity and school spirit.",
    additions: ["Sports jersey", "Yearbook"],
    removals: ["Letterman jacket", "Sneakers"],
    poses: ["Confident wave", "Trophy hold", "Locker lean"],
    packaging: "School-themed window box with locker patterns, trophy displays, and teen magazine-style graphics"
  },
  {
    title: "Paranormal Agent Figure",
    basePrompt: "A mysterious supernatural investigator in trench coat, fedora, and dark sunglasses, posed with determined expression and mystical amulet. The backdrop features foggy streets, gothic architecture, and subtle supernatural effects. Accessories include a flashlight and ancient tome. The figure has weathered features and intense gaze, photographed with moody lighting and atmospheric shadows for a mysterious, otherworldly presence.",
    additions: ["Crystal pendant", "Silver cross"],
    removals: ["Trench coat", "Fedora"],
    poses: ["Investigative stance", "Amulet display", "Shadowy profile"],
    packaging: "Mysterious black box with fog effects, ancient runes, and supernatural glow graphics"
  },
  {
    title: "Sitcom Fashionista Figure",
    basePrompt: "A stylish urban professional in designer outfit, heels, and trendy accessories, posed with fashionable confidence and animated expression. The backdrop shows a modern apartment with fashion magazines and city skyline views. Accessories include a designer handbag and smartphone. The figure has glamorous makeup and perfect posture, photographed with warm, flattering lighting that highlights fashion-forward style and contemporary elegance.",
    additions: ["Designer sunglasses", "Fashion magazine"],
    removals: ["Designer outfit", "Heels"],
    poses: ["Fashion pose", "Phone gesture", "Confident strut"],
    packaging: "Chic pink box with fashion patterns, city skyline accents, and trendy typography"
  },
  {
    title: "Vampire Slayer Figure",
    basePrompt: "A fierce supernatural warrior in leather jacket, combat boots, and cross necklace, posed with stake raised and determined expression. The backdrop features gothic castle ruins, moonlight, and mystical symbols. Accessories include a wooden stake and silver dagger. The figure has intense eyes and battle-ready stance, photographed with dramatic lighting and atmospheric fog for a powerful, heroic vampire hunting aesthetic.",
    additions: ["Garlic wreath", "Holy water vial"],
    removals: ["Leather jacket", "Cross necklace"],
    poses: ["Stake thrust", "Defensive crouch", "Victory pose"],
    packaging: "Gothic black box with castle ruins, moonlight effects, and supernatural symbols"
  },
  {
    title: "Medical Drama Chief Figure",
    basePrompt: "A distinguished senior physician in white coat, stethoscope, and glasses, posed with authoritative presence and thoughtful expression. The backdrop shows a hospital corridor with medical equipment and patient charts. Accessories include a clipboard and medical bag. The figure has distinguished features and professional demeanor, photographed with clinical lighting that conveys medical authority and compassionate care.",
    additions: ["Medical pager", "Coffee mug"],
    removals: ["White coat", "Stethoscope"],
    poses: ["Authoritative stance", "Chart review", "Patient consultation"],
    packaging: "Clinical white box with medical cross patterns, hospital equipment graphics, and professional typography"
  },
  {
    title: "Legal Eagle Figure",
    basePrompt: "A sharp attorney in business suit, briefcase, and power tie, posed with confident courtroom presence and determined expression. The backdrop features a courtroom with judge's bench, jury box, and legal books. Accessories include a gavel and legal documents. The figure has professional poise and commanding presence, photographed with formal lighting that emphasizes legal authority and courtroom drama.",
    additions: ["Legal briefcase", "Courtroom sketch"],
    removals: ["Business suit", "Power tie"],
    poses: ["Courtroom objection", "Document presentation", "Victory gesture"],
    packaging: "Legal brown box with gavel patterns, courtroom sketches, and justice scale graphics"
  },
  {
    title: "Crime Scene Investigator Figure",
    basePrompt: "A meticulous forensic expert in lab coat, gloves, and protective gear, posed examining evidence with focused concentration. The backdrop shows a crime lab with microscopes, evidence boards, and forensic equipment. Accessories include magnifying glass and evidence kit. The figure has analytical expression and precise movements, photographed with sterile lighting that highlights scientific detail and investigative intensity.",
    additions: ["Fingerprint kit", "UV light"],
    removals: ["Lab coat", "Protective gear"],
    poses: ["Evidence examination", "Microscope analysis", "Scene investigation"],
    packaging: "Forensic blue box with evidence patterns, lab equipment graphics, and investigation typography"
  },
  {
    title: "News Anchor Figure",
    basePrompt: "A professional broadcast journalist in business attire, microphone headset, and professional makeup, posed with engaging presence and confident delivery. The backdrop features a news studio with cameras, teleprompter, and breaking news graphics. Accessories include a microphone and news script. The figure has polished appearance and authoritative demeanor, photographed with studio lighting that conveys broadcast professionalism and media presence.",
    additions: ["News script", "Breaking news graphic"],
    removals: ["Microphone headset", "Business attire"],
    poses: ["News delivery", "Camera engagement", "Breaking news announcement"],
    packaging: "Broadcast blue box with news patterns, camera graphics, and media typography"
  },
  {
    title: "Superhero Sidekick Figure",
    basePrompt: "A young heroic apprentice in colorful costume, utility belt, and cape, posed with enthusiastic energy and determined expression. The backdrop shows a city skyline with heroic action and comic book effects. Accessories include a utility belt and hero emblem. The figure has youthful features and eager posture, photographed with dynamic lighting that captures heroic spirit and adventurous energy.",
    additions: ["Hero emblem", "Utility gadgets"],
    removals: ["Cape", "Utility belt"],
    poses: ["Heroic stance", "Action pose", "Victory celebration"],
    packaging: "Heroic red box with city skyline, comic book effects, and action typography"
  },
  {
    title: "Reality TV Contestant Figure",
    basePrompt: "A competitive reality show participant in casual athletic wear, sneakers, and confident expression, posed with game show enthusiasm. The backdrop features a game show set with bright lights, buzzers, and contestant stands. Accessories include a game buzzer and prize envelope. The figure has animated features and competitive spirit, photographed with bright, energetic lighting that conveys excitement and competition.",
    additions: ["Prize envelope", "Contestant number"],
    removals: ["Athletic wear", "Sneakers"],
    poses: ["Buzzer press", "Celebration jump", "Competitive stance"],
    packaging: "Game show bright box with lights patterns, buzzer graphics, and competition typography"
  },
  {
    title: "Sci-Fi Captain Figure",
    basePrompt: "A commanding starship captain in uniform, insignia, and authoritative pose, standing on a futuristic bridge with control panels and starfield views. The backdrop features space scenes, control consoles, and alien landscapes. Accessories include a communicator and command insignia. The figure has leadership presence and commanding demeanor, photographed with sci-fi lighting that emphasizes futuristic technology and space exploration.",
    additions: ["Star map", "Command insignia"],
    removals: ["Uniform", "Communicator"],
    poses: ["Command stance", "Starfield gaze", "Bridge inspection"],
    packaging: "Sci-fi silver box with star patterns, control panel graphics, and space typography"
  },
  {
    title: "Mystery Detective Figure",
    basePrompt: "A classic private investigator in trench coat, fedora, and magnifying glass, posed with thoughtful expression and investigative stance. The backdrop shows a dimly lit office with filing cabinets, desk lamp, and mystery clues. Accessories include a pipe and detective badge. The figure has weathered features and analytical gaze, photographed with noir lighting that creates dramatic shadows and mysterious atmosphere.",
    additions: ["Detective badge", "Mystery clues"],
    removals: ["Trench coat", "Fedora"],
    poses: ["Clue examination", "Thoughtful contemplation", "Office investigation"],
    packaging: "Noir black box with mystery patterns, clue graphics, and detective typography"
  },
  {
    title: "Teen Drama Rebel Figure",
    basePrompt: "A rebellious teenager in edgy fashion, leather jacket, and attitude, posed with defiant expression and casual stance. The backdrop features urban streets, graffiti walls, and skate park elements. Accessories include a skateboard and boombox. The figure has youthful energy and rebellious spirit, photographed with urban lighting that captures street culture and teenage independence.",
    additions: ["Boombox", "Graffiti marker"],
    removals: ["Leather jacket", "Skateboard"],
    poses: ["Defiant stance", "Skate trick", "Street attitude"],
    packaging: "Urban street box with graffiti patterns, skate graphics, and rebel typography"
  },
  {
    title: "Historical Adventurer Figure",
    basePrompt: "An intrepid explorer in period costume, backpack, and adventurous gear, posed with map in hand and determined expression. The backdrop shows ancient ruins, jungles, and archaeological sites. Accessories include a compass and ancient artifact. The figure has rugged features and exploratory spirit, photographed with adventurous lighting that conveys discovery and historical intrigue.",
    additions: ["Ancient artifact", "Treasure map"],
    removals: ["Period costume", "Backpack"],
    poses: ["Map consultation", "Ruins exploration", "Discovery pose"],
    packaging: "Adventure brown box with ruins patterns, map graphics, and explorer typography"
  },
  {
    title: "Comedy Sketch Actor Figure",
    basePrompt: "A hilarious comedic performer in colorful outfit, exaggerated features, and animated expression, posed with slapstick energy. The backdrop features a comedy club stage with spotlights and laugh tracks. Accessories include a comedy prop and microphone. The figure has exaggerated features and comedic timing, photographed with bright, theatrical lighting that emphasizes humor and entertainment.",
    additions: ["Comedy prop", "Laugh track device"],
    removals: ["Colorful outfit", "Microphone"],
    poses: ["Slapstick fall", "Comedy gesture", "Audience engagement"],
    packaging: "Comedy bright box with laugh patterns, stage graphics, and humor typography"
  },
  {
    title: "Fantasy Quest Hero Figure",
    basePrompt: "A noble fantasy adventurer in armor, cape, and sword, posed with heroic stance and determined expression. The backdrop features medieval castles, enchanted forests, and mystical landscapes. Accessories include a shield and magical amulet. The figure has noble features and heroic presence, photographed with epic lighting that conveys fantasy adventure and legendary heroism.",
    additions: ["Magical amulet", "Quest scroll"],
    removals: ["Armor", "Cape"],
    poses: ["Heroic stance", "Sword raise", "Castle defense"],
    packaging: "Fantasy gold box with castle patterns, mystical graphics, and heroic typography"
  },
  {
    title: "Cooking Show Chef Figure",
    basePrompt: "A passionate culinary expert in chef's coat, apron, and toque, posed with cooking utensils and enthusiastic expression. The backdrop shows a professional kitchen with stoves, ingredients, and cooking shows. Accessories include a whisk and recipe book. The figure has skilled hands and passionate demeanor, photographed with warm kitchen lighting that highlights culinary expertise and cooking passion.",
    additions: ["Recipe book", "Ingredient basket"],
    removals: ["Chef's coat", "Toque"],
    poses: ["Cooking demonstration", "Ingredient preparation", "Recipe presentation"],
    packaging: "Kitchen white box with cooking patterns, ingredient graphics, and culinary typography"
  },
  {
    title: "Space Explorer Figure",
    basePrompt: "A brave space pioneer in futuristic suit, helmet, and exploration gear, posed with scientific instruments and adventurous spirit. The backdrop features alien planets, space stations, and cosmic phenomena. Accessories include a space helmet and data pad. The figure has determined features and exploratory presence, photographed with cosmic lighting that emphasizes space discovery and scientific adventure.",
    additions: ["Data pad", "Alien sample"],
    removals: ["Space suit", "Helmet"],
    poses: ["Planet exploration", "Data collection", "Space walk"],
    packaging: "Space blue box with planet patterns, cosmic graphics, and exploration typography"
  },
  {
    title: "Wildlife Photographer Figure",
    basePrompt: "An adventurous nature photographer in outdoor gear, camera, and binoculars, posed with wildlife observation and natural setting. The backdrop features jungles, savannas, and wildlife habitats. Accessories include a camera lens and field guide. The figure has observant features and naturalist spirit, photographed with natural lighting that conveys wildlife conservation and outdoor adventure.",
    additions: ["Field guide", "Wildlife call"],
    removals: ["Outdoor gear", "Camera"],
    poses: ["Wildlife observation", "Camera focus", "Habitat exploration"],
    packaging: "Nature green box with wildlife patterns, camera graphics, and conservation typography"
  },
  {
    title: "Time Traveler Figure",
    basePrompt: "A mysterious time traveler in period costume, time device, and enigmatic expression, posed with temporal technology and historical artifacts. The backdrop features swirling time vortexes, historical landmarks, and temporal anomalies. Accessories include a time device and historical artifact. The figure has mysterious features and temporal presence, photographed with ethereal lighting that emphasizes time manipulation and historical mystery.",
    additions: ["Historical artifact", "Time vortex model"],
    removals: ["Period costume", "Time device"],
    poses: ["Time device activation", "Historical observation", "Temporal jump"],
    packaging: "Time silver box with vortex patterns, historical graphics, and temporal typography"
  },
  {
    title: "Super Spy Figure",
    basePrompt: "A stealthy intelligence operative in tactical gear, gadgets, and covert expression, posed with spy equipment and mission readiness. The backdrop features urban shadows, surveillance equipment, and secret facilities. Accessories include a spy gadget and earpiece. The figure has tactical features and covert presence, photographed with shadowy lighting that conveys espionage and secret missions.",
    additions: ["Earpiece", "Spy gadget"],
    removals: ["Tactical gear", "Gadgets"],
    poses: ["Stealth approach", "Surveillance setup", "Mission briefing"],
    packaging: "Spy black box with shadow patterns, gadget graphics, and covert typography"
  },
  {
    title: "Music Video Star Figure",
    basePrompt: "A glamorous music video performer in stage costume, jewelry, and dynamic pose, standing on a concert stage with lights and effects. The backdrop features music videos, stage performances, and entertainment elements. Accessories include stage jewelry and microphone. The figure has glamorous features and performance presence, photographed with concert lighting that emphasizes entertainment and musical performance.",
    additions: ["Stage jewelry", "Music video prop"],
    removals: ["Stage costume", "Microphone"],
    poses: ["Performance dance", "Microphone hold", "Stage presence"],
    packaging: "Music gold box with stage patterns, performance graphics, and entertainment typography"
  },
  {
    title: "Survival Expert Figure",
    basePrompt: "A rugged survival specialist in outdoor gear, backpack, and survival tools, posed with wilderness expertise and prepared stance. The backdrop features forests, mountains, and survival scenarios. Accessories include a compass and survival knife. The figure has rugged features and wilderness presence, photographed with natural lighting that conveys outdoor survival and wilderness expertise.",
    additions: ["Survival knife", "First aid kit"],
    removals: ["Outdoor gear", "Backpack"],
    poses: ["Camp setup", "Trail navigation", "Survival demonstration"],
    packaging: "Survival green box with wilderness patterns, tool graphics, and outdoor typography"
  },
  {
    title: "Robot Companion Figure",
    basePrompt: "A helpful robotic assistant in metallic body, LED lights, and mechanical features, posed with technological assistance and friendly expression. The backdrop features futuristic labs, digital interfaces, and technological elements. Accessories include a data port and tool arm. The figure has mechanical features and helpful presence, photographed with technological lighting that emphasizes robotics and assistance.",
    additions: ["Tool arm", "Data interface"],
    removals: ["Metallic body", "LED lights"],
    poses: ["Assistance gesture", "Data processing", "Maintenance mode"],
    packaging: "Robot silver box with circuit patterns, tech graphics, and robotic typography"
  },
  {
    title: "Mythical Creature Trainer Figure",
    basePrompt: "A magical creature handler in mystical robes, staff, and enchanted accessories, posed with creature training and magical presence. The backdrop features enchanted forests, magical creatures, and mystical elements. Accessories include a magical staff and creature treat. The figure has mystical features and magical presence, photographed with enchanted lighting that conveys magic and creature handling.",
    additions: ["Creature treat", "Enchanted map"],
    removals: ["Mystical robes", "Magical staff"],
    poses: ["Creature training", "Spell casting", "Magical consultation"],
    packaging: "Magic purple box with creature patterns, mystical graphics, and magical typography"
  },
  {
    title: "Extreme Sports Figure",
    basePrompt: "An adrenaline-fueled extreme athlete in sports gear, protective equipment, and dynamic pose, standing on a mountain peak with extreme sports elements. The backdrop features mountains, ski slopes, and adventure sports. Accessories include protective gear and sports equipment. The figure has athletic features and adventurous presence, photographed with action lighting that emphasizes extreme sports and adventure.",
    additions: ["Sports equipment", "Adventure map"],
    removals: ["Sports gear", "Protective equipment"],
    poses: ["Extreme jump", "Sports action", "Victory celebration"],
    packaging: "Sports blue box with mountain patterns, action graphics, and extreme typography"
  },
  {
    title: "Alien Visitor Figure",
    basePrompt: "A mysterious extraterrestrial being in alien attire, technology, and otherworldly expression, posed with alien technology and cosmic presence. The backdrop features alien worlds, spacecraft, and cosmic elements. Accessories include alien technology and communication device. The figure has alien features and cosmic presence, photographed with otherworldly lighting that emphasizes extraterrestrial nature and cosmic mystery.",
    additions: ["Communication device", "Alien artifact"],
    removals: ["Alien attire", "Technology"],
    poses: ["Cosmic observation", "Technology demonstration", "Alien communication"],
    packaging: "Alien green box with cosmic patterns, technology graphics, and extraterrestrial typography"
  },
  {
    title: "Medieval Knight Figure",
    basePrompt: "A noble medieval warrior in armor, helmet, and sword, posed with knightly honor and battle readiness. The backdrop features castles, battlefields, and medieval elements. Accessories include a shield and helmet plume. The figure has noble features and knightly presence, photographed with medieval lighting that emphasizes chivalry and medieval warfare.",
    additions: ["Helmet plume", "Battle standard"],
    removals: ["Armor", "Helmet"],
    poses: ["Knightly salute", "Battle stance", "Castle defense"],
    packaging: "Medieval gold box with castle patterns, knight graphics, and chivalric typography"
  },
  {
    title: "Underwater Explorer Figure",
    basePrompt: "A daring ocean explorer in diving suit, helmet, and underwater gear, posed with marine exploration and aquatic presence. The backdrop features ocean depths, coral reefs, and underwater elements. Accessories include diving helmet and exploration tools. The figure has exploratory features and aquatic presence, photographed with underwater lighting that emphasizes marine exploration and ocean discovery.",
    additions: ["Exploration tools", "Marine sample"],
    removals: ["Diving suit", "Helmet"],
    poses: ["Coral exploration", "Deep dive", "Marine discovery"],
    packaging: "Ocean blue box with coral patterns, marine graphics, and underwater typography"
  },
  {
    title: "Cyberpunk Hacker Figure",
    basePrompt: "A digital renegade in cybernetic gear, neon accessories, and technological expression, posed with computer systems and digital presence. The backdrop features neon cities, digital interfaces, and cyber elements. Accessories include cybernetic implants and data device. The figure has technological features and digital presence, photographed with neon lighting that emphasizes cyberpunk culture and digital rebellion.",
    additions: ["Data device", "Cyber implant"],
    removals: ["Cybernetic gear", "Neon accessories"],
    poses: ["Data hacking", "System infiltration", "Digital rebellion"],
    packaging: "Cyberpunk neon box with digital patterns, hacker graphics, and technological typography"
  },
  {
    title: "Circus Performer Figure",
    basePrompt: "A dazzling circus entertainer in colorful costume, makeup, and acrobatic pose, standing on a circus stage with performance elements. The backdrop features big tops, trapezes, and circus elements. Accessories include performance props and costume accessories. The figure has entertaining features and circus presence, photographed with theatrical lighting that emphasizes circus performance and entertainment.",
    additions: ["Performance props", "Costume accessories"],
    removals: ["Colorful costume", "Makeup"],
    poses: ["Acrobatic pose", "Audience engagement", "Performance finale"],
    packaging: "Circus red box with big top patterns, performance graphics, and entertainment typography"
  },
  {
    title: "Post-Apocalyptic Survivor Figure",
    basePrompt: "A hardened wasteland survivor in rugged gear, weapons, and survival equipment, posed with survival readiness and determined expression. The backdrop features ruined cities, wastelands, and apocalyptic elements. Accessories include survival weapons and scavenging tools. The figure has rugged features and survival presence, photographed with harsh lighting that emphasizes post-apocalyptic survival and wasteland endurance.",
    additions: ["Scavenging tools", "Survival rations"],
    removals: ["Rugged gear", "Weapons"],
    poses: ["Survival stance", "Weapon ready", "Resource scavenging"],
    packaging: "Wasteland brown box with ruin patterns, survival graphics, and apocalyptic typography"
  }
];

export default tvShowActionFigurePrompts;