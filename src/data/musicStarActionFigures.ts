// Music Star Action Figure Prompts - Generic musical archetypes
interface MusicStarActionFigurePrompt {
  archetype: string;
  basePrompt: string;
  additions: string[];
  removals: string[];
  poses: string[];
  packaging: string;
}

const musicPrompts: MusicStarActionFigurePrompt[] = [
  {
    archetype: "Purple Pop Royalty Figure",
    basePrompt: "Create a photorealistic boxed toy of [NAME] from [COMPANY] as a charismatic 80s rock star in a purple velvet suit and ruffled shirt, holding an electric guitar with lightning bolts. Toy box styled as a purple neon stage with fog effects and vinyl record backdrop. Studio lighting, crisp reflections, high detail.",
    additions: ["Sparkle mic stand", "Heart-shaped sunglasses"],
    removals: ["Guitar", "Stage fog"],
    poses: ["Mic raise", "Guitar solo crouch", "Pointing to crowd"],
    packaging: "Translucent purple clamshell with electric font and musical notes trim"
  },
  {
    archetype: "Disco Queen Figure",
    basePrompt: "Create a reflective silver box for [NAME] from [COMPANY] as a glittering disco diva figure in a sequined jumpsuit and high heels, posed on a spinning mirrored base with spotlights in every corner. Includes disco ball accessory and pink boom mic. Professional toy photography with dramatic lighting.",
    additions: ["Vinyl record", "Spotlight arch"],
    removals: ["Disco ball", "Platform heels"],
    poses: ["Arm wave", "Microphone stance", "Dance dip"],
    packaging: "Reflective silver box with glitter borders and disco light graphics"
  },
  {
    archetype: "West Coast Legend Figure",
    basePrompt: "Create an urban-style blister box for [NAME] from [COMPANY] as a street-styled action figure in bandana, jeans, and gold chains, posed mid-verse with a boom mic and graffiti wall background. Includes motivational stamped accessories and cassette tape belt. Professional product photography with urban aesthetic.",
    additions: ["Graffiti wall backdrop", "Boom box"],
    removals: ["Bandana", "Chains"],
    poses: ["Mic drop", "Arms crossed", "Side profile flow"],
    packaging: "Urban-style blister box with caution tape accents and cracked pavement texture"
  },
  {
    archetype: "Godfather of Soul Figure",
    basePrompt: "Create a gold foil embossed box for [NAME] from [COMPANY] as a funky soul figure in a shimmering red cape and slick shoes, posed doing the splits on stage with a glowing retro mic stand. Backdrop features bright marquee lights and vintage speakers. Studio lighting with dramatic shadows.",
    additions: ["Backup dancer figures", "Microphone stand"],
    removals: ["Cape", "Stage lights"],
    poses: ["On-the-knees scream", "Funky lean", "Mic stand lean"],
    packaging: "Gold foil embossed box with stage curtain flap and retro label tag"
  },
  {
    archetype: "Ziggy Stardust Starman Figure",
    basePrompt: "Create a holographic box for [NAME] from [COMPANY] as a glam rock action figure with red spiked hair, lightning bolt makeup, and metallic jumpsuit. Includes outer space guitar and floating star platform, with a cosmic stage backdrop. Professional toy photography with cosmic lighting effects.",
    additions: ["Lightning mic", "Alien cat companion"],
    removals: ["Star platform", "Eye makeup"],
    poses: ["One-leg starman leap", "Cosmic salute", "Bass guitar pose"],
    packaging: "Holographic box with constellations and foil Ziggy font overlay"
  },
  {
    archetype: "Vocal Powerhouse Figure",
    basePrompt: "Create a crystal-clear front box for [NAME] from [COMPANY] as a powerful vocalist action figure in a glamorous white gown, standing on a gold-trimmed stage with spotlight effect. Includes a clear stand for belting pose and glitter mic accessory. Professional photography with dramatic stage lighting.",
    additions: ["Golden award", "Backup singer mini-figures"],
    removals: ["Spotlight", "Mic"],
    poses: ["Arms wide finale", "One-hand reach", "Standing still with emotion"],
    packaging: "Crystal-clear front with gold foil starry night design"
  },
  {
    archetype: "Rockabilly Icon Figure",
    basePrompt: "Create a jukebox-styled display for [NAME] from [COMPANY] as a rock 'n' roll action figure in white jumpsuit with red scarf and slicked hair, standing mid-pose with a retro mic and guitar in hand. Background features Vegas stage flames and retro radio waves. Professional product photography.",
    additions: ["Guitar stand", "Record player base"],
    removals: ["Scarf", "Microphone"],
    poses: ["Hip swing", "Leg split", "Side mic lean"],
    packaging: "Jukebox-styled display with glowing marquee lights"
  },
  {
    archetype: "80s Rebel Pop Star Figure",
    basePrompt: "Create a neon pink case for [NAME] from [COMPANY] as a fashion-forward pop diva figure in lace gloves, corset top, and layered jewelry. Includes microphone headset and hair teased high. Toy box styled like a neon music video set with graffiti hearts. Professional toy photography.",
    additions: ["Boom box", "Cassette tape accessories"],
    removals: ["Corset", "Gloves"],
    poses: ["Dance spin", "Arms up", "Lip sync pose"],
    packaging: "Neon pink case with glitter sticker sheet and lyric scroll"
  },
  {
    archetype: "Reggae Legend Figure",
    basePrompt: "Create an island-inspired box for [NAME] from [COMPANY] as a relaxed figure with dreadlocks, wearing a colorful knit cap and holding a wooden guitar, posed mid-song with beachside reggae stage backdrop. Professional photography with tropical lighting.",
    additions: ["Drum accessory", "Sunset background"],
    removals: ["Guitar", "Hat"],
    poses: ["Standing jam", "Lean back strum", "One foot stomp"],
    packaging: "Island-inspired box with palm leaves and irie color bands"
  },
  {
    archetype: "Stadium King Figure",
    basePrompt: "Create a concert box for [NAME] from [COMPANY] as an electrifying figure in yellow military jacket and white pants, standing mid-kick with a half mic stand in hand. Stage lights behind capture his iconic energy. Professional toy photography with concert lighting.",
    additions: ["Crown accessory", "Piano stage backdrop"],
    removals: ["Jacket", "Mic stand"],
    poses: ["Knee-down pose", "Fist to sky", "Tiptoe power move"],
    packaging: "Concert box with holographic crowd and spotlight sticker"
  },
  {
    archetype: "Rhythm Nation Figure",
    basePrompt: "Create a metallic matte black box for [NAME] from [COMPANY] as a military-styled figure in black with shoulder pads and hat, posed in a synchronized dance stance with futuristic urban backdrop. Includes microphone headset and movement stand. Professional photography.",
    additions: ["Dance light base", "Boom mic stage"],
    removals: ["Hat", "Headset"],
    poses: ["Salute dance pose", "Step snap", "Crouch and spin"],
    packaging: "Metallic matte black with tech-style borders and control pad cutout"
  },
  {
    archetype: "Keys of Soul Figure",
    basePrompt: "Create a clear piano-inspired front box for [NAME] from [COMPANY] as a soulful figure in flowing colorful shirt and sunglasses, seated at a retro keyboard with floating musical notes above. Background is a studio with vinyl walls. Professional product photography.",
    additions: ["Braille lyric sheet", "Backup band icons"],
    removals: ["Keyboard", "Sunglasses"],
    poses: ["Playing piano mid-note", "Standing mic solo", "Sitting with drink"],
    packaging: "Clear piano-inspired front with record label motif and liner notes"
  },
  {
    archetype: "Glamorous Time Traveler Figure",
    basePrompt: "Create a silver sparkle clamshell for [NAME] from [COMPANY] as a glittering goddess figure with sequin bodysuit, long hair, and iconic boots. Displayed in a holographic time capsule with spotlight base. Professional photography with glamorous lighting.",
    additions: ["Microphone with star trail", "Futuristic stage ramp"],
    removals: ["Cape", "Headdress"],
    poses: ["Power stand", "Hair flip", "Arms-out diva move"],
    packaging: "Silver sparkle clamshell with swirling galaxy background"
  },
  {
    archetype: "Hip-Hop Hype Figure",
    basePrompt: "Create a gold foil box for [NAME] from [COMPANY] as an energetic rapper figure in gold parachute pants and shades, caught mid-dance with neon boombox base and spotlights behind. Includes motivational lyrics sticker. Professional toy photography with urban lighting.",
    additions: ["Dance stage", "Breakdance accessory"],
    removals: ["Shades", "Pants"],
    poses: ["Running man", "Shuffle slide", "Finger wave"],
    packaging: "Gold foil box with zig-zag neon trim and old-school text overlays"
  },
  {
    archetype: "Queen of Soul Figure",
    basePrompt: "Create a royal purple box for [NAME] from [COMPANY] as a regal soul figure in an elegant dress and fur wrap, posed next to a grand piano with spotlight halo behind. Accessories include a crown and vinyl single. Professional photography with regal lighting.",
    additions: ["Microphone pedestal", "Song lyric scroll"],
    removals: ["Fur wrap", "Piano"],
    poses: ["Hand to heart", "Open arms praise", "Ballad pose seated"],
    packaging: "Royal purple box with gold trim and crown iconography"
  },
  {
    archetype: "Grunge Legend Figure",
    basePrompt: "Create a muted gray cardboard box for [NAME] from [COMPANY] as an introspective rocker in flannel shirt and ripped jeans, seated with acoustic guitar on a minimalist concert stage. Includes amplifier and lyric sheet. Professional photography with moody lighting.",
    additions: ["Guitar pick", "Cassette tape case"],
    removals: ["Flannel", "Acoustic guitar"],
    poses: ["Seated strum", "Hair over face", "Standing side profile"],
    packaging: "Muted gray cardboard box with sticker graffiti and underground feel"
  },
  {
    archetype: "Thriller Icon Figure",
    basePrompt: "Create a glow-in-the-dark box for [NAME] from [COMPANY] as a pop icon in red leather jacket and black pants, posed mid-dance with zombies behind. Toy box glows in low light and plays music when opened. Professional toy photography with theatrical lighting.",
    additions: ["Moonwalk base", "White glove"],
    removals: ["Zombies", "Jacket"],
    poses: ["Moonwalk", "Lean pose", "Crouched toe spin"],
    packaging: "Glow-in-the-dark box with VHS-style front and Thriller logo"
  },
  {
    archetype: "Neo-Soul Poet Figure",
    basePrompt: "Create a soft matte brown box for [NAME] from [COMPANY] as a soulful figure seated on a stool with natural curls, holding a journal in one hand and microphone in the other. Set in a record shop with low lights and lyric sheets. Professional photography with intimate lighting.",
    additions: ["Poetry notebook", "Boom box stack"],
    removals: ["Mic", "Stool"],
    poses: ["Eyes closed vibe", "Head tilt mic pose", "Journal writing"],
    packaging: "Soft matte brown box with paper texture and hand-drawn elements"
  },
  {
    archetype: "Pop Icon Figure",
    basePrompt: "Create a glossy black and chrome finish box for [NAME] from [COMPANY] as a 90s icon figure in leather jacket and shades, leaning against a jukebox with wireless mic. Background shows flashing concert screens and retro animations. Professional product photography.",
    additions: ["Faith sticker set", "Vinyl backdrop"],
    removals: ["Jacket", "Jukebox"],
    poses: ["Mic stance", "Hip sway", "Finger point"],
    packaging: "Glossy black and chrome finish with music video graphics"
  },
  {
    archetype: "Rap Icons 3-Pack",
    basePrompt: "Create a graffiti wall box for [NAME] and teammates from [COMPANY] as a trio of hip-hop legends with hats, gold chains, and sneakers posed mid-walk. Box includes turntable stickers and vinyl collector cutouts. Professional photography with urban aesthetic.",
    additions: ["Boom box", "Track stand"],
    removals: ["Chains", "Sneakers"],
    poses: ["Mic lean", "Walk this way stance", "Pose with LP"],
    packaging: "Graffiti wall box with spray-paint name tags and NYC skyline backdrop"
  },
  {
    archetype: "Diva Deluxe Figure",
    basePrompt: "Create a velvet-textured box for [NAME] from [COMPANY] as a glamorous soul figure with feathered boa and sparkly high heels, performing on a jewel-toned stage with wind-blown hair effect and backup singers. Professional photography with theatrical lighting.",
    additions: ["Stage fan", "Glitter scarf"],
    removals: ["Boa", "Backup singers"],
    poses: ["Mic hold high", "Runway walk pose", "Open arms belt"],
    packaging: "Velvet-textured box with spotlight shimmer and golden border"
  },
  {
    archetype: "Drumline Frontman Figure",
    basePrompt: "Create a concert lighting cutout box for [NAME] from [COMPANY] as a drummer figure seated behind a drum set mid-performance, holding drumsticks aloft with spotlight background. Comes with piano keyboard base and stage lights. Professional toy photography.",
    additions: ["Microphone headset", "Tour ticket"],
    removals: ["Drumsticks", "Drum set"],
    poses: ["Drumming mid-air", "Mic pose behind kit", "Seated smile"],
    packaging: "Concert lighting cutout box with tour font"
  },
  {
    archetype: "Rock Queen Figure",
    basePrompt: "Create a red flame-trim box for [NAME] from [COMPANY] as a dynamic figure in fringe dress and heels, dancing on stage with red spotlights and backup band silhouettes. Includes leg-kick base stand. Professional photography with dynamic stage lighting.",
    additions: ["Glitter mic", "Stage fog machine"],
    removals: ["Heels", "Fringe dress"],
    poses: ["Mid-kick pose", "Power scream", "Arms to the sky"],
    packaging: "Red flame-trim box with spotlight frame and iconic hair silhouette"
  },
  {
    archetype: "Piano Man Figure",
    basePrompt: "Create a classic pub-style window box for [NAME] from [COMPANY] as a seated piano player in a tux with rolled sleeves, surrounded by musical bar stools and swinging lights. Includes tip jar and harmonica case. Professional product photography with warm pub lighting.",
    additions: ["Bar stool", "Lyric sheet"],
    removals: ["Piano", "Tip jar"],
    poses: ["Playing piano mid-note", "Standing mic solo", "Sitting with drink"],
    packaging: "Classic pub-style window box with musical border scroll"
  },
  {
    archetype: "Pop Color Explosion Figure",
    basePrompt: "Create an exploding color clamshell for [NAME] from [COMPANY] as a punk-pop icon in bright mismatched fashion and wild hair, surrounded by boom box props and confetti. Includes fun accessories and sticker set. Professional photography with vibrant lighting.",
    additions: ["Rainbow shades", "Lace gloves"],
    removals: ["Confetti", "Boom box"],
    poses: ["Jump pose", "Hands up cheer", "Side smirk"],
    packaging: "Exploding color clamshell with retro TV pattern"
  }
];

export default musicPrompts;