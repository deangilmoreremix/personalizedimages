// Ghibli Style Image Generator Configuration
// Configuration for Studio Ghibli inspired image generation

interface GhibliScene {
  label: string;
  description: string;
  prompt: string;
}

interface GhibliCharacter {
  label: string;
  description: string;
  prompt: string;
}

interface GhibliTimeOfDay {
  label: string;
  description: string;
  prompt: string;
}

interface GhibliWeather {
  label: string;
  description: string;
  prompt: string;
}

interface GhibliElement {
  name: string;
  icon: string;
  description: string;
  prompt: string;
}

export interface GhibliConfig {
  scenes: GhibliScene[];
  characters: GhibliCharacter[];
  timesOfDay: GhibliTimeOfDay[];
  weatherEffects: GhibliWeather[];
  magicalElements: GhibliElement[];
  ui: {
    enableSceneGallery: boolean;
    enableCharacterGallery: boolean;
    enableTimeOfDayControls: boolean;
    enableWeatherControls: boolean;
    enableMagicalElements: boolean;
    enablePersonalization: boolean;
    enableReferenceUpload: boolean;
    maxScenesToShow: number;
    maxCharactersToShow: number;
  };
}

export const ghibliConfig: GhibliConfig = {
  scenes: [
    {
      label: "Enchanted Forest",
      description: "A mystical woodland with glowing plants and ancient trees",
      prompt: "A Studio Ghibli style enchanted forest with towering ancient trees, glowing magical plants, soft moss-covered ground, and shafts of golden sunlight filtering through the canopy"
    },
    {
      label: "Floating Castle",
      description: "A majestic castle suspended in the sky",
      prompt: "A Studio Ghibli style floating castle in the clouds, with intricate architecture, floating islands, gentle waterfalls cascading into mist, and a sense of peaceful isolation"
    },
    {
      label: "Coastal Village",
      description: "A quaint seaside town with thatched roofs and fishing boats",
      prompt: "A Studio Ghibli style coastal village with colorful thatched-roof houses, fishing boats bobbing in the harbor, winding cobblestone streets, and a lighthouse on the cliff"
    },
    {
      label: "Mountain Valley",
      description: "A serene valley nestled between towering mountains",
      prompt: "A Studio Ghibli style mountain valley with terraced rice fields, a crystal-clear river winding through, distant snow-capped peaks, and traditional village houses"
    },
    {
      label: "Bamboo Grove",
      description: "A peaceful bamboo forest with dappled sunlight",
      prompt: "A Studio Ghibli style bamboo grove with tall swaying stalks, filtered sunlight creating dancing shadows, a gentle breeze rustling the leaves, and a sense of tranquility"
    },
    {
      label: "Ancient Temple",
      description: "A weathered temple surrounded by cherry blossoms",
      prompt: "A Studio Ghibli style ancient temple with weathered stone architecture, cherry blossom trees in full bloom, stone lanterns, and a peaceful courtyard with koi pond"
    },
    {
      label: "Hot Air Balloon Journey",
      description: "A hot air balloon floating over rolling hills",
      prompt: "A Studio Ghibli style hot air balloon journey over rolling green hills, patchwork farmland below, fluffy white clouds, and a sense of gentle adventure"
    },
    {
      label: "Suburban Neighborhood",
      description: "A quiet residential area with gardens and bicycles",
      prompt: "A Studio Ghibli style suburban neighborhood with well-kept gardens, bicycles leaning against fences, laundry hanging to dry, and children playing in the streets"
    },
    {
      label: "Underground World",
      description: "A hidden world beneath the earth with glowing crystals",
      prompt: "A Studio Ghibli style underground world with glowing crystal formations, bioluminescent plants, underground lakes, and a sense of hidden wonder and mystery"
    }
  ],

  characters: [
    {
      label: "Young Adventurer",
      description: "A curious child with wide eyes and boundless imagination",
      prompt: "A Studio Ghibli style young adventurer with large expressive eyes, tousled hair, wearing simple practical clothing, carrying a small backpack, with an expression of wonder and determination"
    },
    {
      label: "Forest Spirit",
      description: "A gentle nature spirit with flowing hair and leaf motifs",
      prompt: "A Studio Ghibli style forest spirit with flowing green hair resembling leaves, delicate features, wearing clothing made of natural materials, with a gentle and wise expression"
    },
    {
      label: "Witch Apprentice",
      description: "A young witch learning her magical craft",
      prompt: "A Studio Ghibli style witch apprentice with a conical hat, flowing robes, carrying a broomstick, with an expression of concentration and magical potential"
    },
    {
      label: "Talking Animal",
      description: "An anthropomorphic animal with human-like expressions",
      prompt: "A Studio Ghibli style talking animal with expressive human-like eyes, detailed fur or feathers, wearing simple accessories, with a personality that shines through"
    },
    {
      label: "Elderly Craftsman",
      description: "A wise artisan with weathered hands and kind eyes",
      prompt: "A Studio Ghibli style elderly craftsman with weathered but gentle features, wearing work clothes, holding tools, with an expression of quiet wisdom and skill"
    },
    {
      label: "Magical Creature",
      description: "A fantastical being with otherworldly features",
      prompt: "A Studio Ghibli style magical creature with ethereal features, glowing elements, delicate wings or appendages, with a mysterious and enchanting presence"
    },
    {
      label: "Young Inventor",
      description: "A clever child with gadgets and inventions",
      prompt: "A Studio Ghibli style young inventor with messy hair, wearing overalls with many pockets, carrying small gadgets and tools, with an expression of clever curiosity"
    },
    {
      label: "Nature Guardian",
      description: "A protector of the natural world with elemental powers",
      prompt: "A Studio Ghibli style nature guardian with features resembling natural elements, wearing earth-toned clothing, with an expression of quiet strength and protection"
    }
  ],

  timesOfDay: [
    {
      label: "Golden Hour",
      description: "The magical time just after sunrise or before sunset",
      prompt: "during golden hour with warm orange and pink light casting long shadows, creating a magical and peaceful atmosphere"
    },
    {
      label: "Blue Hour",
      description: "The serene time just before dawn or after dusk",
      prompt: "during blue hour with cool blue tones and soft diffused light, creating a mysterious and tranquil atmosphere"
    },
    {
      label: "Midday Sunshine",
      description: "Bright daylight with clear blue skies",
      prompt: "in bright midday sunshine with clear blue skies, warm light, and a sense of energy and life"
    },
    {
      label: "Moonlit Night",
      description: "A peaceful night illuminated by moonlight",
      prompt: "under a full moon with silver moonlight casting gentle shadows, stars twinkling above, creating a magical and serene atmosphere"
    },
    {
      label: "Stormy Weather",
      description: "Dramatic weather with clouds and atmospheric effects",
      prompt: "during a dramatic storm with dark clouds, rain, and atmospheric lighting effects, creating tension and natural power"
    }
  ],

  weatherEffects: [
    {
      label: "Gentle Breeze",
      description: "A soft wind that moves leaves and creates atmosphere",
      prompt: "with a gentle breeze rustling leaves and creating soft movement in the scene"
    },
    {
      label: "Falling Petals",
      description: "Cherry blossoms or flower petals drifting in the air",
      prompt: "with delicate flower petals gently falling and drifting in the breeze"
    },
    {
      label: "Morning Mist",
      description: "Soft fog that creates mystery and depth",
      prompt: "with soft morning mist creating depth and mystery in the atmosphere"
    },
    {
      label: "Sparkling Light",
      description: "Magical particles that catch the light",
      prompt: "with sparkling magical particles floating in the air catching the light"
    },
    {
      label: "Dancing Shadows",
      description: "Playful shadows that move with the light",
      prompt: "with dancing shadows and light patterns creating visual interest"
    }
  ],

  magicalElements: [
    {
      name: "Floating Lanterns",
      icon: "🏮",
      description: "Paper lanterns that float gently in the air",
      prompt: "surrounded by floating paper lanterns casting warm, magical light"
    },
    {
      name: "Glowing Mushrooms",
      icon: "🍄",
      description: "Mushrooms that emit a soft, ethereal glow",
      prompt: "with glowing mushrooms scattered around emitting soft magical light"
    },
    {
      name: "Crystal Formations",
      icon: "💎",
      description: "Beautiful crystals that catch and reflect light",
      prompt: "featuring crystal formations that catch and reflect magical light"
    },
    {
      name: "Butterfly Swarm",
      icon: "🦋",
      description: "A gentle swarm of colorful butterflies",
      prompt: "with a gentle swarm of colorful butterflies adding life and magic"
    },
    {
      name: "Water Spirits",
      icon: "💧",
      description: "Small water elementals that dance in streams",
      prompt: "with small water spirits dancing in nearby streams and puddles"
    },
    {
      name: "Wind Whirls",
      icon: "🌪️",
      description: "Small whirlwinds that carry leaves and petals",
      prompt: "with small magical wind whirls carrying leaves and flower petals"
    },
    {
      name: "Fireflies",
      icon: "✨",
      description: "Glowing insects that create magical light",
      prompt: "illuminated by swarms of glowing fireflies creating magical light"
    },
    {
      name: "Ancient Runes",
      icon: "🔮",
      description: "Mysterious glowing symbols in the air",
      prompt: "with ancient glowing runes floating in the air adding mystery"
    }
  ],

  ui: {
    enableSceneGallery: true,
    enableCharacterGallery: true,
    enableTimeOfDayControls: true,
    enableWeatherControls: true,
    enableMagicalElements: true,
    enablePersonalization: true,
    enableReferenceUpload: true,
    maxScenesToShow: 6,
    maxCharactersToShow: 6
  }
};

export default ghibliConfig;

// Export simple array for easy usage
export const ghibliStyles = [
  { id: 'spirited-away', name: 'Spirited Away', description: 'Bathhouse spirits and Japanese folklore inspired' },
  { id: 'totoro', name: 'My Neighbor Totoro', description: 'Gentle forest spirits and rural countryside' },
  { id: 'howl', name: "Howl's Moving Castle", description: 'Magical machinery and steampunk fantasy' },
  { id: 'mononoke', name: 'Princess Mononoke', description: 'Epic nature spirits and ancient forests' },
  { id: 'kiki', name: "Kiki's Delivery Service", description: 'Charming European town and gentle magic' },
  { id: 'ponyo', name: 'Ponyo', description: 'Underwater magic and seaside adventures' }
];