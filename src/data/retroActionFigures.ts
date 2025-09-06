export interface RetroActionFigurePrompt {
  title: string;
  basePrompt: string;
  additions: string[];
  removals: string[];
  poses: string[];
  packaging: string;
}

export const retroActionFigurePrompts: RetroActionFigurePrompt[] = [
  {
    title: "Tech Commando Figure",
    basePrompt: "A high-tech commando in advanced tactical armor, helmet with targeting visor, and energy weapons, posed in combat-ready stance on a futuristic battlefield with laser grids and holographic displays. The figure features glowing cybernetic implants and modular weapon systems, photographed with neon lighting and digital artifacts for cutting-edge military aesthetic.",
    additions: ["Energy rifle", "Holographic display"],
    removals: ["Helmet", "Tactical armor"],
    poses: ["Combat stance", "Weapon ready", "Tactical advance"],
    packaging: "Military green box with tech patterns, weapon graphics, and tactical typography"
  },
  {
    title: "Sewer Ninja Figure",
    basePrompt: "A stealthy ninja warrior in dark tactical suit, face mask, and throwing stars, posed in sewer environment with dripping pipes and urban decay. The figure has glowing eyes and ninja tools, photographed with moody lighting and water reflections for mysterious urban warrior aesthetic.",
    additions: ["Throwing stars", "Ninja tools"],
    removals: ["Face mask", "Tactical suit"],
    poses: ["Stealth crouch", "Weapon throw", "Wall climb"],
    packaging: "Dark blue box with sewer patterns, ninja graphics, and stealth typography"
  },
  {
    title: "Cosmic Barbarian Hero Figure",
    basePrompt: "A mighty barbarian warrior in fur armor, horned helmet, and battle axe, posed on alien planet with strange rock formations and cosmic phenomena. The figure has glowing runes and cosmic energy effects, photographed with epic lighting and alien atmosphere for space barbarian aesthetic.",
    additions: ["Battle axe", "Cosmic runes"],
    removals: ["Horned helmet", "Fur armor"],
    poses: ["Battle roar", "Axe swing", "Defensive stance"],
    packaging: "Space purple box with barbarian patterns, cosmic graphics, and heroic typography"
  },
  {
    title: "Cartoon Detective Figure",
    basePrompt: "A classic cartoon detective in trench coat, fedora, and magnifying glass, posed in noir cityscape with exaggerated shadows and cartoon effects. The figure has cartoonish features and detective gadgets, photographed with dramatic lighting and cartoon styling for retro detective aesthetic.",
    additions: ["Magnifying glass", "Detective gadgets"],
    removals: ["Fedora", "Trench coat"],
    poses: ["Investigation pose", "Clue examination", "Chase stance"],
    packaging: "Noir black box with cartoon patterns, detective graphics, and retro typography"
  },
  {
    title: "Robot Guardian Figure",
    basePrompt: "A powerful robot guardian in armored chassis, glowing eyes, and mechanical arms, posed in futuristic city with flying cars and energy fields. The figure has mechanical details and guardian protocols, photographed with metallic lighting and digital effects for robotic protector aesthetic.",
    additions: ["Mechanical arms", "Guardian protocols"],
    removals: ["Armored chassis", "Glowing eyes"],
    poses: ["Defensive stance", "Energy blast", "Guardian pose"],
    packaging: "Metallic silver box with robot patterns, guardian graphics, and mechanical typography"
  },
  {
    title: "Jungle Explorer Figure",
    basePrompt: "An adventurous jungle explorer in safari gear, backpack, and machete, posed in dense jungle with exotic plants and ancient ruins. The figure has exploration tools and survival gear, photographed with natural lighting and jungle atmosphere for adventurous explorer aesthetic.",
    additions: ["Machete", "Exploration tools"],
    removals: ["Safari gear", "Backpack"],
    poses: ["Trailblaze stance", "Ruins exploration", "Wildlife observation"],
    packaging: "Jungle green box with explorer patterns, adventure graphics, and exploration typography"
  },
  {
    title: "Space Pirate Figure",
    basePrompt: "A swashbuckling space pirate in armored spacesuit, eye patch, and laser cutlass, posed on spaceship deck with starfield views and pirate flags. The figure has cybernetic enhancements and pirate accessories, photographed with space lighting and pirate atmosphere for cosmic pirate aesthetic.",
    additions: ["Laser cutlass", "Pirate accessories"],
    removals: ["Armored spacesuit", "Eye patch"],
    poses: ["Boarding stance", "Cutlass swing", "Treasure hunt"],
    packaging: "Space black box with pirate patterns, cosmic graphics, and swashbuckling typography"
  },
  {
    title: "Time Traveler Figure",
    basePrompt: "A mysterious time traveler in period costume, time device, and enigmatic expression, posed in swirling time vortex with historical artifacts and temporal anomalies. The figure has temporal technology and historical accessories, photographed with ethereal lighting and time effects for temporal adventurer aesthetic.",
    additions: ["Time device", "Historical artifacts"],
    removals: ["Period costume", "Temporal anomalies"],
    poses: ["Time jump", "Artifact examination", "Temporal stance"],
    packaging: "Time silver box with vortex patterns, temporal graphics, and mysterious typography"
  },
  {
    title: "Superhero Sidekick Figure",
    basePrompt: "A young superhero sidekick in colorful costume, utility belt, and enthusiastic pose, posed in city skyline with heroic action and comic book effects. The figure has sidekick gadgets and heroic accessories, photographed with dynamic lighting and comic effects for young hero aesthetic.",
    additions: ["Utility belt", "Sidekick gadgets"],
    removals: ["Colorful costume", "Heroic accessories"],
    poses: ["Action pose", "Heroic stance", "Sidekick assistance"],
    packaging: "Heroic red box with comic patterns, sidekick graphics, and enthusiastic typography"
  },
  {
    title: "Mad Scientist Figure",
    basePrompt: "An eccentric mad scientist in lab coat, wild hair, and safety goggles, posed in laboratory with bubbling beakers and electrical equipment. The figure has scientific gadgets and experimental tools, photographed with laboratory lighting and scientific atmosphere for eccentric inventor aesthetic.",
    additions: ["Safety goggles", "Scientific gadgets"],
    removals: ["Lab coat", "Wild hair"],
    poses: ["Experiment pose", "Invention stance", "Discovery gesture"],
    packaging: "Lab white box with scientist patterns, experiment graphics, and eccentric typography"
  },
  {
    title: "Dinosaur Hunter Figure",
    basePrompt: "A brave dinosaur hunter in explorer gear, rifle, and adventurer hat, posed in prehistoric jungle with dinosaur footprints and fossil displays. The figure has hunting tools and prehistoric accessories, photographed with jungle lighting and prehistoric atmosphere for adventurous hunter aesthetic.",
    additions: ["Explorer hat", "Hunting tools"],
    removals: ["Explorer gear", "Rifle"],
    poses: ["Hunting stance", "Fossil examination", "Jungle exploration"],
    packaging: "Jungle brown box with dinosaur patterns, hunter graphics, and prehistoric typography"
  },
  {
    title: "Cyberpunk Hacker Figure",
    basePrompt: "A digital renegade hacker in neon jacket, data visor, and cybernetic implants, posed in neon city with holographic displays and digital grids. The figure has hacking tools and cyber accessories, photographed with neon lighting and digital effects for cyberpunk hacker aesthetic.",
    additions: ["Data visor", "Hacking tools"],
    removals: ["Neon jacket", "Cybernetic implants"],
    poses: ["Hacking pose", "Data access", "Cyber stance"],
    packaging: "Neon blue box with hacker patterns, digital graphics, and cyberpunk typography"
  },
  {
    title: "Mythical Creature Trainer Figure",
    basePrompt: "A magical creature trainer in mystical robes, staff, and enchanted accessories, posed in enchanted forest with mythical creatures and magical effects. The figure has training tools and magical accessories, photographed with mystical lighting and magical atmosphere for creature trainer aesthetic.",
    additions: ["Magical staff", "Training tools"],
    removals: ["Mystical robes", "Enchanted accessories"],
    poses: ["Training stance", "Creature command", "Magical gesture"],
    packaging: "Magical purple box with creature patterns, mystical graphics, and enchanted typography"
  },
  {
    title: "Underwater Adventurer Figure",
    basePrompt: "A daring underwater adventurer in diving suit, helmet, and exploration gear, posed in coral reef with marine life and sunken treasures. The figure has diving equipment and underwater tools, photographed with underwater lighting and marine atmosphere for aquatic explorer aesthetic.",
    additions: ["Diving helmet", "Underwater tools"],
    removals: ["Diving suit", "Exploration gear"],
    poses: ["Diving stance", "Treasure hunt", "Marine exploration"],
    packaging: "Ocean blue box with underwater patterns, marine graphics, and aquatic typography"
  },
  {
    title: "Wild West Gunslinger Figure",
    basePrompt: "A legendary Wild West gunslinger in cowboy hat, duster coat, and revolvers, posed in desert town with saloon and tumbleweeds. The figure has western accessories and cowboy gear, photographed with desert lighting and western atmosphere for classic gunslinger aesthetic.",
    additions: ["Cowboy hat", "Western accessories"],
    removals: ["Duster coat", "Revolvers"],
    poses: ["Draw stance", "Saloon entrance", "Desert patrol"],
    packaging: "Western brown box with gunslinger patterns, cowboy graphics, and legendary typography"
  },
  {
    title: "Alien Invader Figure",
    basePrompt: "A menacing alien invader in armored suit, antenna, and weapon, posed on alien landscape with strange vegetation and otherworldly structures. The figure has alien technology and invasion gear, photographed with alien lighting and extraterrestrial atmosphere for menacing invader aesthetic.",
    additions: ["Alien weapon", "Invasion gear"],
    removals: ["Armored suit", "Antenna"],
    poses: ["Invasion stance", "Weapon ready", "Alien command"],
    packaging: "Alien green box with invader patterns, extraterrestrial graphics, and menacing typography"
  },
  {
    title: "Medieval Knight Figure",
    basePrompt: "A noble medieval knight in shining armor, helmet, and sword, posed in castle courtyard with stone walls and heraldic banners. The figure has knightly accessories and medieval gear, photographed with medieval lighting and castle atmosphere for noble knight aesthetic.",
    additions: ["Knightly sword", "Medieval gear"],
    removals: ["Shining armor", "Helmet"],
    poses: ["Knightly stance", "Sword salute", "Castle defense"],
    packaging: "Medieval gold box with knight patterns, castle graphics, and noble typography"
  },
  {
    title: "Superhero Figure",
    basePrompt: "A powerful superhero in colorful costume, cape, and emblem, posed in city skyline with heroic action and comic book effects. The figure has superhero accessories and heroic gear, photographed with dynamic lighting and heroic atmosphere for classic superhero aesthetic.",
    additions: ["Heroic cape", "Superhero accessories"],
    removals: ["Colorful costume", "Emblem"],
    poses: ["Heroic pose", "Action stance", "City protection"],
    packaging: "Heroic red box with superhero patterns, action graphics, and powerful typography"
  },
  {
    title: "Pirate Captain Figure",
    basePrompt: "A swashbuckling pirate captain in tricorn hat, coat, and cutlass, posed on ship deck with ocean waves and pirate flags. The figure has pirate accessories and nautical gear, photographed with ocean lighting and pirate atmosphere for classic pirate aesthetic.",
    additions: ["Tricorn hat", "Pirate accessories"],
    removals: ["Pirate coat", "Cutlass"],
    poses: ["Captain stance", "Sword fight", "Treasure hunt"],
    packaging: "Pirate black box with captain patterns, nautical graphics, and swashbuckling typography"
  },
  {
    title: "Robot Warrior Figure",
    basePrompt: "A formidable robot warrior in armored chassis, weapons, and mechanical features, posed in battlefield with explosions and mechanical debris. The figure has robotic weapons and mechanical accessories, photographed with metallic lighting and battle atmosphere for powerful robot aesthetic.",
    additions: ["Robotic weapons", "Mechanical accessories"],
    removals: ["Armored chassis", "Weapons"],
    poses: ["Battle stance", "Weapon fire", "Mechanical advance"],
    packaging: "Robot silver box with warrior patterns, battle graphics, and mechanical typography"
  },
  {
    title: "Viking Warrior Figure",
    basePrompt: "A fierce Viking warrior in horned helmet, armor, and axe, posed on longship with ocean waves and Norse symbols. The figure has Viking accessories and battle gear, photographed with Norse lighting and Viking atmosphere for fierce warrior aesthetic.",
    additions: ["Horned helmet", "Viking accessories"],
    removals: ["Viking armor", "Battle axe"],
    poses: ["Warrior stance", "Axe swing", "Ship command"],
    packaging: "Viking blue box with warrior patterns, Norse graphics, and fierce typography"
  },
  {
    title: "Secret Agent Figure",
    basePrompt: "A stealthy secret agent in tuxedo, gadgets, and hidden weapons, posed in casino with spy elements and surveillance equipment. The figure has spy accessories and covert gear, photographed with casino lighting and spy atmosphere for mysterious agent aesthetic.",
    additions: ["Spy gadgets", "Covert gear"],
    removals: ["Tuxedo", "Hidden weapons"],
    poses: ["Spy stance", "Gadget use", "Covert operation"],
    packaging: "Spy black box with agent patterns, surveillance graphics, and mysterious typography"
  },
  {
    title: "Wizard Figure",
    basePrompt: "A mystical wizard in flowing robes, pointed hat, and staff, posed in magical tower with spellbooks and magical effects. The figure has magical accessories and wizard gear, photographed with mystical lighting and magical atmosphere for powerful wizard aesthetic.",
    additions: ["Magical staff", "Wizard accessories"],
    removals: ["Flowing robes", "Pointed hat"],
    poses: ["Spell casting", "Book consultation", "Magical stance"],
    packaging: "Wizard purple box with magical patterns, spell graphics, and mystical typography"
  },
  {
    title: "Cowboy Figure",
    basePrompt: "A rugged cowboy in hat, vest, and boots, posed on horse with desert landscape and cattle herd. The figure has cowboy accessories and western gear, photographed with desert lighting and western atmosphere for classic cowboy aesthetic.",
    additions: ["Cowboy hat", "Western accessories"],
    removals: ["Cowboy vest", "Boots"],
    poses: ["Horseback stance", "Rope swing", "Desert patrol"],
    packaging: "Western brown box with cowboy patterns, desert graphics, and rugged typography"
  },
  {
    title: "Samurai Warrior Figure",
    basePrompt: "An honorable samurai warrior in traditional armor, helmet, and katana, posed in Japanese garden with cherry blossoms and traditional architecture. The figure has samurai accessories and traditional gear, photographed with Japanese lighting and samurai atmosphere for honorable warrior aesthetic.",
    additions: ["Samurai helmet", "Traditional accessories"],
    removals: ["Traditional armor", "Katana"],
    poses: ["Warrior stance", "Sword draw", "Garden meditation"],
    packaging: "Samurai red box with warrior patterns, Japanese graphics, and honorable typography"
  },
  {
    title: "Monster Hunter Figure",
    basePrompt: "A brave monster hunter in leather armor, weapons, and protective gear, posed in monster lair with bones and mystical elements. The figure has hunting tools and monster gear, photographed with lair lighting and monster atmosphere for courageous hunter aesthetic.",
    additions: ["Hunting weapons", "Monster gear"],
    removals: ["Leather armor", "Protective gear"],
    poses: ["Hunt stance", "Weapon ready", "Monster confrontation"],
    packaging: "Hunter brown box with monster patterns, lair graphics, and courageous typography"
  },
  {
    title: "Astronaut Figure",
    basePrompt: "A pioneering astronaut in space suit, helmet, and exploration gear, posed on lunar surface with Earth view and space equipment. The figure has space accessories and exploration tools, photographed with space lighting and lunar atmosphere for pioneering astronaut aesthetic.",
    additions: ["Space helmet", "Exploration tools"],
    removals: ["Space suit", "Exploration gear"],
    poses: ["Lunar stance", "Earth view", "Space exploration"],
    packaging: "Space white box with astronaut patterns, lunar graphics, and pioneering typography"
  },
  {
    title: "Zombie Hunter Figure",
    basePrompt: "A determined zombie hunter in tactical gear, weapons, and protective equipment, posed in abandoned city with zombie hordes and apocalyptic elements. The figure has hunting weapons and survival gear, photographed with apocalyptic lighting and zombie atmosphere for determined hunter aesthetic.",
    additions: ["Hunting weapons", "Survival gear"],
    removals: ["Tactical gear", "Protective equipment"],
    poses: ["Hunt stance", "Weapon fire", "Zombie confrontation"],
    packaging: "Zombie green box with hunter patterns, apocalyptic graphics, and determined typography"
  },
  {
    title: "Super Villain Figure",
    basePrompt: "A menacing super villain in dark costume, cape, and evil gadgets, posed in villain lair with evil plans and villainous elements. The figure has villain accessories and evil gear, photographed with dark lighting and villain atmosphere for menacing villain aesthetic.",
    additions: ["Evil gadgets", "Villain accessories"],
    removals: ["Dark costume", "Cape"],
    poses: ["Villain pose", "Evil plan", "Menacing stance"],
    packaging: "Villain black box with evil patterns, lair graphics, and menacing typography"
  },
  {
    title: "Fantasy Elf Figure",
    basePrompt: "A graceful fantasy elf in elegant armor, pointed ears, and bow, posed in enchanted forest with magical creatures and ancient trees. The figure has elven accessories and fantasy gear, photographed with magical lighting and fantasy atmosphere for graceful elf aesthetic.",
    additions: ["Elven bow", "Fantasy accessories"],
    removals: ["Elegant armor", "Pointed ears"],
    poses: ["Elf stance", "Bow draw", "Forest patrol"],
    packaging: "Elf green box with fantasy patterns, magical graphics, and graceful typography"
  },
  {
    title: "Steampunk Inventor Figure",
    basePrompt: "An ingenious steampunk inventor in Victorian gear, goggles, and mechanical devices, posed in workshop with gears and steam engines. The figure has inventor tools and mechanical accessories, photographed with steam lighting and inventor atmosphere for ingenious inventor aesthetic.",
    additions: ["Inventor goggles", "Mechanical devices"],
    removals: ["Victorian gear", "Inventor tools"],
    poses: ["Invention pose", "Gear adjustment", "Workshop stance"],
    packaging: "Steampunk bronze box with inventor patterns, mechanical graphics, and ingenious typography"
  }
];