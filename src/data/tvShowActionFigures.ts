export interface TVShowActionFigurePrompt {
  title: string;
  archetype: string;
  basePrompt: string;
  additions: string[];
  removals: string[];
  poses: string[];
  packaging: string;
}

const tvPrompts: TVShowActionFigurePrompt[] = [
  {
    title: "Classic Sitcom Dad",
    archetype: "Family Man",
    basePrompt: "A retro 1980s style action figure of a classic sitcom father character wearing a cardigan sweater, casual slacks, and loafers. The figure has a friendly, approachable expression and comes with accessories like a coffee mug, newspaper, and briefcase.",
    additions: ["reading glasses", "tie", "work badge", "family photo", "remote control", "dad joke book"],
    removals: ["cardigan", "briefcase", "newspaper", "coffee mug"],
    poses: ["standing with arms crossed", "pointing upward", "holding coffee mug", "reading newspaper", "waving hello"],
    packaging: "bright family-friendly blister pack with living room background and 'CLASSIC DAD' branding"
  },
  {
    title: "Medical Drama Doctor",
    archetype: "Hero Doctor",
    basePrompt: "A detailed action figure of a television medical drama doctor character wearing scrubs, a white coat, and stethoscope. The figure has a determined, caring expression and includes medical accessories.",
    additions: ["surgical mask", "clipboard", "medical chart", "prescription pad", "coffee cup", "hospital badge"],
    removals: ["white coat", "stethoscope", "scrubs", "medical bag"],
    poses: ["examining patient", "running to emergency", "consulting with team", "looking at x-ray", "heroic stance"],
    packaging: "medical-themed packaging with hospital background and 'LIFESAVER' branding"
  },
  {
    title: "Detective Protagonist",
    archetype: "Crime Solver",
    basePrompt: "A retro action figure of a classic TV detective character wearing a trench coat, fedora hat, and carrying a magnifying glass. The figure has a mysterious, analytical expression.",
    additions: ["cigarette", "revolver", "badge", "handcuffs", "evidence bag", "notepad"],
    removals: ["trench coat", "fedora", "magnifying glass", "gun"],
    poses: ["investigating clues", "pointing accusingly", "tipping hat", "examining evidence", "dramatic reveal"],
    packaging: "noir-style packaging with city skyline and 'CASE CLOSED' branding"
  },
  {
    title: "Space Adventure Captain",
    archetype: "Space Hero",
    basePrompt: "A futuristic action figure of a space TV show captain character wearing a colorful uniform with insignia, utility belt, and communicator device. The figure has a commanding, heroic stance.",
    additions: ["phaser weapon", "tricorder", "communicator badge", "space helmet", "laser sword", "alien translator"],
    removals: ["utility belt", "uniform insignia", "communicator", "boots"],
    poses: ["commanding bridge", "firing phaser", "diplomatic gesture", "exploring planet", "heroic captain pose"],
    packaging: "sci-fi themed packaging with starship bridge background and 'TO BOLDLY GO' branding"
  },
  {
    title: "Western Sheriff",
    archetype: "Lawman",
    basePrompt: "A classic western TV show sheriff action figure wearing a cowboy hat, vest, chaps, and boots with spurs. The figure includes a sheriff's badge and holstered revolvers.",
    additions: ["lasso", "rifle", "wanted poster", "horse saddle", "deputy badge", "bandana"],
    removals: ["hat", "vest", "spurs", "holster"],
    poses: ["quick draw stance", "tipping hat", "on horseback", "arresting outlaw", "surveying frontier"],
    packaging: "western-themed packaging with saloon background and 'LAW & ORDER' branding"
  },
  {
    title: "Supernatural Investigator",
    archetype: "Paranormal Hunter",
    basePrompt: "A mysterious action figure of a supernatural TV show investigator character wearing a dark suit, carrying paranormal detection equipment and mystical accessories.",
    additions: ["EMF detector", "salt container", "wooden stake", "holy water", "ancient book", "flashlight"],
    removals: ["suit jacket", "tie", "equipment belt", "detection device"],
    poses: ["investigating haunting", "casting protection spell", "confronting monster", "examining evidence", "dramatic confrontation"],
    packaging: "spooky themed packaging with haunted house background and 'BEYOND BELIEF' branding"
  },
  {
    title: "Teen Drama Student",
    archetype: "High Schooler",
    basePrompt: "A young action figure of a teen drama TV show student character wearing trendy school clothes, backpack, and accessories popular with teenagers.",
    additions: ["smartphone", "laptop", "textbooks", "school ID", "headphones", "skateboard"],
    removals: ["backpack", "school uniform", "books", "phone"],
    poses: ["walking to class", "texting friends", "studying", "graduation ceremony", "prom dance"],
    packaging: "school-themed packaging with high school hallway background and 'CLASS ACT' branding"
  },
  {
    title: "Fantasy Warrior",
    archetype: "Medieval Hero",
    basePrompt: "An epic fantasy TV show warrior action figure wearing medieval armor, carrying a sword and shield, with mystical accessories and battle-worn appearance.",
    additions: ["magic amulet", "bow and arrows", "healing potion", "spell scroll", "dragon scale", "enchanted gem"],
    removals: ["armor pieces", "shield", "sword", "helmet"],
    poses: ["battle ready stance", "casting spell", "riding dragon", "victorious pose", "defending kingdom"],
    packaging: "fantasy-themed packaging with castle background and 'REALM DEFENDER' branding"
  },
  {
    title: "Comedy Show Comedian",
    archetype: "Funny Person",
    basePrompt: "A humorous action figure of a TV comedy show comedian character wearing casual, quirky clothing with exaggerated expressions and comedic accessories.",
    additions: ["microphone", "rubber chicken", "joke book", "silly hat", "whoopee cushion", "banana peel"],
    removals: ["stage outfit", "microphone", "props", "hat"],
    poses: ["telling joke", "slapstick fall", "surprised expression", "taking bow", "interacting with audience"],
    packaging: "comedy-themed packaging with stage background and 'LAUGH RIOT' branding"
  },
  {
    title: "News Anchor",
    archetype: "Reporter",
    basePrompt: "A professional action figure of a TV news anchor character wearing a business suit, sitting at a news desk with teleprompter and journalistic accessories.",
    additions: ["microphone", "news script", "coffee mug", "press badge", "reading glasses", "tablet"],
    removals: ["suit jacket", "tie", "desk", "papers"],
    poses: ["delivering news", "interviewing guest", "field reporting", "breaking news alert", "signing off"],
    packaging: "news-themed packaging with studio background and 'BREAKING NEWS' branding"
  }
];

export default tvPrompts;