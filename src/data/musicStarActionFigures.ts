export interface MusicStarActionFigurePrompt {
  title: string;
  basePrompt: string;
  additions: string[];
  removals: string[];
  poses: string[];
  packaging: string;
}

export const musicStarActionFigurePrompts: MusicStarActionFigurePrompt[] = [
  {
    title: "Purple Pop Starman Figure",
    basePrompt: "A deluxe action figure styled as a flamboyant 80s glam star, wearing a shimmering purple velvet suit with silver ruffles and platform boots. The figure holds a sparkling electric guitar with lightning bolt decals, posed mid-performance with a commanding stage presence and dramatic facial expression. The illustrated backdrop depicts neon lights, fog effects, and a glowing star-shaped stage with colorful lighting effects. Accessories include a detachable microphone stand and cosmic stage props. The design emphasizes vibrant toy photography with dramatic spotlighting, reflective plastic details, and glossy surface textures, making the figure look like a premium collectible straight from a vintage music shop display.",
    additions: ["Star-shaped mic stand", "Cosmic sunglasses"],
    removals: ["Guitar", "Cape"],
    poses: ["Mic raise", "Guitar solo crouch", "Pointing to the crowd"],
    packaging: "Translucent purple clamshell case with holographic starburst overlays, neon lightning accents, and a collectible toy photography finish"
  },
  {
    title: "Disco Diva Figure",
    basePrompt: "A glamorous disco-era performer in a sequined jumpsuit with plunging neckline and platform heels, captured mid-dance with flowing hair and sparkling jewelry. The figure stands on a mirrored dance floor with rotating disco ball effects and colorful light beams. Accessories include a chrome boom microphone and mini disco ball prop. The backdrop features prismatic light rays and confetti bursts, photographed with saturated jewel tones and glossy nightclub sheen for authentic 70s disco vibe.",
    additions: ["Mini disco ball", "Confetti launcher"],
    removals: ["Platform heels", "Necklace"],
    poses: ["Arms raised dance", "Hip sway", "Spin move"],
    packaging: "Reflective silver window box with prism foil accents, rotating disco ball lenticular, and glow-in-the-dark star stickers"
  },
  {
    title: "Hip-Hop Icon Figure",
    basePrompt: "A street-styled urban performer in oversized hoodie, baggy jeans, and chunky sneakers, posed mid-rap with one hand holding a vintage microphone. The backdrop shows graffiti-covered brick walls, chain-link fences, and golden-hour urban lighting. Accessories include gold chains, a boombox base, and removable baseball cap. The figure features detailed tattoos and expressive facial sculpting, photographed with hard shadows and warm street lighting for authentic hip-hop authenticity.",
    additions: ["Gold chain accessory", "Boombox base"],
    removals: ["Baseball cap", "Hoodie"],
    poses: ["Mic drop", "Arms crossed", "Pointing gesture"],
    packaging: "Urban-style blister card with graffiti art, gold foil chains, and street-sign window cutouts"
  },
  {
    title: "Rock Legend Figure",
    basePrompt: "A classic rock guitarist in torn jeans, leather vest, and scuffed boots, posed mid-solo with flying hair and intense expression. The figure holds a battered electric guitar with peeling stickers and worn strings. The backdrop depicts a smoky stage with Marshall amp stacks and colored stage lights. Accessories include a leather belt with metal studs and a cigarette prop. Photographed with dramatic concert lighting and motion blur effects for high-energy rock performance feel.",
    additions: ["Cigarette prop", "Leather belt"],
    removals: ["Guitar", "Vest"],
    poses: ["Guitar windmill", "Headbang", "Stage dive"],
    packaging: " distressed leather-effect box with band stickers, tour dates, and ripped poster artwork"
  },
  {
    title: "Punk Rebel Figure",
    basePrompt: "A rebellious punk rocker in ripped t-shirt, studded leather jacket, and combat boots, posed with aggressive stance and spiked hair. The figure holds a battered electric guitar with safety pins and band stickers. The backdrop shows a gritty club with broken beer bottles and graffiti-covered walls. Accessories include a mohawk comb and chain wallet. Photographed with harsh lighting and high contrast for raw, underground punk aesthetic.",
    additions: ["Mohawk comb", "Chain wallet"],
    removals: ["Leather jacket", "Combat boots"],
    poses: ["Aggressive stance", "Guitar smash", "Crowd surf"],
    packaging: "Ripped and stapled cardboard box with spray-paint effects, band patches, and safety pin accents"
  },
  {
    title: "Reggae Mystic Figure",
    basePrompt: "A laid-back reggae performer in colorful knit hat, loose linen shirt, and cargo shorts, posed with acoustic guitar and relaxed island vibe. The backdrop features palm trees, ocean waves, and tropical sunset gradients. Accessories include beaded necklaces and a small drum prop. The figure has dreadlock hair sculpting and peaceful expression, photographed with warm golden lighting and soft focus for authentic island reggae atmosphere.",
    additions: ["Small hand drum", "Beaded necklace"],
    removals: ["Knit hat", "Cargo shorts"],
    poses: ["Sitting strum", "Peace sign", "Island dance"],
    packaging: "Tropical palm-patterned box with ocean blue accents, reggae color scheme, and woven texture effects"
  },
  {
    title: "Soul Diva Figure",
    basePrompt: "An elegant soul singer in flowing gown with fur stole and sparkling earrings, posed mid-performance with expressive hand gestures. The figure holds a vintage microphone with coiled cord. The backdrop shows a grand theater with velvet curtains and crystal chandeliers. Accessories include a crown prop and sheet music stand. Photographed with warm stage lighting and soft shadows for sophisticated soul music elegance.",
    additions: ["Crown prop", "Sheet music stand"],
    removals: ["Fur stole", "Earrings"],
    poses: ["Arms wide", "Hand to heart", "Dramatic reach"],
    packaging: "Velvet-textured window box with gold foil accents, theater curtain flaps, and crystal bead embellishments"
  },
  {
    title: "Metal Warrior Figure",
    basePrompt: "A heavy metal warrior in black leather pants, studded belt, and sleeveless denim vest, posed with electric guitar raised high. The figure has long hair, tattoos, and intense facial expression. The backdrop depicts flames, skulls, and gothic architecture. Accessories include a pentagram pendant and leather wristbands. Photographed with dramatic red lighting and smoke effects for powerful metal concert atmosphere.",
    additions: ["Pentagram pendant", "Leather wristbands"],
    removals: ["Denim vest", "Studded belt"],
    poses: ["Guitar thrust", "Headbang", "Power stance"],
    packaging: "Black leather-effect box with flame patterns, metal studs, and gothic font lettering"
  },
  {
    title: "Country Outlaw Figure",
    basePrompt: "A rugged country singer in cowboy hat, plaid shirt, jeans, and cowboy boots, posed with acoustic guitar and confident stance. The backdrop shows a wooden stage, hay bales, and American flag. Accessories include a bandana and sheriff's badge. The figure has weathered facial sculpting and relaxed posture, photographed with warm barn lighting and dust particles for authentic country music feel.",
    additions: ["Sheriff badge", "Bandana"],
    removals: ["Cowboy hat", "Plaid shirt"],
    poses: ["Guitar strum", "Hat tip", "Boot stomp"],
    packaging: "Wood-grain textured box with country flag accents, barn door flaps, and rope border design"
  },
  {
    title: "Jazz Saxophonist Figure",
    basePrompt: "A sophisticated jazz musician in tuxedo with bowtie and fedora, posed playing saxophone with eyes closed in musical ecstasy. The backdrop features a smoky jazz club with piano and cocktail glasses. Accessories include a cigarette holder and martini glass. The figure has detailed facial expression and relaxed posture, photographed with warm amber lighting and soft focus for intimate jazz club atmosphere.",
    additions: ["Cigarette holder", "Martini glass"],
    removals: ["Fedora", "Bowtie"],
    poses: ["Eyes closed playing", "Head back", "Finger snap"],
    packaging: "Burgundy velvet box with gold foil accents, cocktail glass cutouts, and jazz note patterns"
  },
  {
    title: "Funk Groove Master Figure",
    basePrompt: "A funky performer in bright patterned shirt, bell-bottoms, and platform shoes, posed with electric bass and dynamic dance move. The backdrop shows colorful geometric patterns and disco ball reflections. Accessories include a wide-brimmed hat and gold chains. The figure has animated expression and energetic posture, photographed with vibrant colors and motion blur for infectious funk energy.",
    additions: ["Wide-brimmed hat", "Gold chains"],
    removals: ["Bell-bottoms", "Platform shoes"],
    poses: ["Bass slap", "Groove dance", "Hat flip"],
    packaging: "Psychedelic pattern box with geometric designs, bright color bursts, and funk sound wave graphics"
  },
  {
    title: "Blues Guitar Hero Figure",
    basePrompt: "A weathered blues guitarist in worn suit, fedora, and scuffed shoes, posed with electric guitar and soulful expression showing detailed facial features and emotional depth. The backdrop depicts a dimly lit stage with whiskey bottles and cigarette smoke creating atmospheric depth. Accessories include a harmonica holder and bottle prop. The figure has detailed age lines and expressive face with textured skin details, photographed with moody lighting, grain effects, and warm amber tones for authentic blues club atmosphere.",
    additions: ["Harmonica holder", "Whiskey bottle"],
    removals: ["Fedora", "Worn suit"],
    poses: ["Soulful bend", "Harmonica play", "Guitar slide"],
    packaging: "Weathered wood box with blues club signage, cigarette smoke patterns, and aged paper effects"
  },
  {
    title: "Electronic Synth Master Figure",
    basePrompt: "A futuristic electronic musician in metallic jacket, neon visor, and fingerless gloves, posed at a glowing synthesizer keyboard. The backdrop features digital grids, neon lights, and holographic effects. Accessories include detachable headphones and data cables. The figure has cybernetic details and intense focus, photographed with blue LED lighting and digital artifacts for cutting-edge electronic music aesthetic.",
    additions: ["Detachable headphones", "Data cables"],
    removals: ["Neon visor", "Fingerless gloves"],
    poses: ["Keyboard mash", "Headphone adjust", "Synth twist"],
    packaging: "Holographic grid-patterned box with neon accents, circuit board designs, and LED light effects"
  },
  {
    title: "Folk Troubadour Figure",
    basePrompt: "A wandering folk musician in patchwork vest, jeans, and hiking boots, posed with acoustic guitar and peaceful expression showing gentle smile and relaxed posture. The backdrop shows forest paths, campfires with warm glowing light, and starry night skies with twinkling details. Accessories include a harmonica and backpack. The figure has weathered features with detailed skin texture and relaxed posture, photographed with natural lighting, soft focus effects, and warm campfire glow for intimate folk music storytelling atmosphere.",
    additions: ["Harmonica", "Backpack"],
    removals: ["Patchwork vest", "Hiking boots"],
    poses: ["Seated strum", "Standing sing", "Forest walk"],
    packaging: "Natural wood box with leaf patterns, campfire glow effects, and hand-drawn folk art"
  },
  {
    title: "Gospel Choir Director Figure",
    basePrompt: "An inspirational gospel leader in flowing robe, choir stole, and expressive pose with raised hands. The figure holds a conductor's baton and has animated facial expression. The backdrop features stained glass windows and choir robes. Accessories include a cross pendant and sheet music. Photographed with warm, uplifting lighting and soft glows for spiritual gospel atmosphere.",
    additions: ["Cross pendant", "Sheet music"],
    removals: ["Choir stole", "Conductor baton"],
    poses: ["Hands raised", "Conductor gesture", "Praise stance"],
    packaging: "Stained glass-inspired box with gold foil accents, choir robe patterns, and inspirational quotes"
  },
  {
    title: "Latin Rhythm Master Figure",
    basePrompt: "A passionate Latin performer in vibrant shirt, tight pants, and dance shoes, posed with maracas and energetic expression. The backdrop shows tropical colors, maracas, and dance floor patterns. Accessories include a sombrero and guitarron. The figure has animated dance posture, photographed with warm tropical lighting and vibrant colors for lively Latin music energy.",
    additions: ["Sombrero", "Guitarron"],
    removals: ["Dance shoes", "Maracas"],
    poses: ["Maraca shake", "Dance step", "Guitar strum"],
    packaging: "Vibrant tropical box with maraca patterns, dance floor designs, and fiesta color schemes"
  },
  {
    title: "Opera Diva Figure",
    basePrompt: "A dramatic opera singer in elaborate gown, jewels, and powdered wig, posed mid-aria with outstretched arms. The figure holds a decorative fan and has intense expression. The backdrop features grand theater curtains and crystal chandeliers. Accessories include opera glasses and rose prop. Photographed with theatrical lighting and dramatic shadows for classical opera grandeur.",
    additions: ["Opera glasses", "Rose prop"],
    removals: ["Powdered wig", "Decorative fan"],
    poses: ["Aria reach", "Dramatic gesture", "Curtsy pose"],
    packaging: "Grand theater box with curtain patterns, crystal accents, and opera house architecture"
  },
  {
    title: "Rap Battle Champion Figure",
    basePrompt: "A competitive rapper in tracksuit, sneakers, and gold chains, posed mid-lyric delivery with intense expression. The figure holds a microphone with coiled cord. The backdrop shows urban graffiti and stage lights. Accessories include a grill and backpack. Photographed with dramatic spotlights and motion effects for high-energy rap battle atmosphere.",
    additions: ["Gold grill", "Backpack"],
    removals: ["Gold chains", "Tracksuit"],
    poses: ["Mic drop", "Arm wave", "Battle stance"],
    packaging: "Urban street box with graffiti art, gold foil accents, and battle royale graphics"
  },
  {
    title: "Bluegrass Fiddler Figure",
    basePrompt: "A spirited bluegrass musician in overalls, work boots, and straw hat, posed playing fiddle with animated expression. The backdrop features barn wood, hay bales, and string instruments. Accessories include a bow and banjo. The figure has energetic posture and detailed facial animation, photographed with warm barn lighting for authentic bluegrass jam session feel.",
    additions: ["Fiddle bow", "Banjo"],
    removals: ["Straw hat", "Overalls"],
    poses: ["Fiddle play", "Bow stroke", "Dance step"],
    packaging: "Barn wood box with hay bale patterns, instrument silhouettes, and folk festival graphics"
  },
  {
    title: "Techno DJ Figure",
    basePrompt: "A futuristic DJ in glowing visor, cybernetic jacket, and fingerless gloves, posed at turntables with animated mixing gestures. The backdrop features digital waveforms, LED lights, and holographic effects. Accessories include detachable headphones and vinyl records. Photographed with neon lighting and digital glitches for cutting-edge techno club atmosphere.",
    additions: ["Detachable headphones", "Vinyl records"],
    removals: ["Glowing visor", "Fingerless gloves"],
    poses: ["Turntable scratch", "Headphone adjust", "Mix gesture"],
    packaging: "Digital grid box with waveform patterns, neon accents, and holographic DJ booth design"
  },
  {
    title: "Celtic Harpist Figure",
    basePrompt: "An ethereal Celtic musician in flowing gown and braided hair, posed playing harp with serene expression. The backdrop shows ancient stone circles, misty landscapes, and Celtic knotwork. Accessories include a torc necklace and Celtic knot brooch. Photographed with mystical lighting and soft focus for enchanting Celtic music atmosphere.",
    additions: ["Torc necklace", "Celtic knot brooch"],
    removals: ["Flowing gown", "Braided hair"],
    poses: ["Harp pluck", "Serene gaze", "Ancient stone pose"],
    packaging: "Ancient stone box with Celtic knot patterns, mist effects, and mystical rune designs"
  },
  {
    title: "Samba Drummer Figure",
    basePrompt: "An energetic samba performer in colorful costume, feathered headdress, and bare feet, posed with surdo drum and joyful expression. The backdrop features carnival colors, confetti, and dance crowds. Accessories include maracas and feathered accessories. Photographed with vibrant tropical lighting for festive samba parade atmosphere.",
    additions: ["Maracas", "Feathered accessories"],
    removals: ["Feathered headdress", "Colorful costume"],
    poses: ["Drum beat", "Dance step", "Carnival wave"],
    packaging: "Carnival color box with samba patterns, confetti effects, and festival graphics"
  },
  {
    title: "Vocal Harmony Group Figure",
    basePrompt: "A doo-wop style harmony singer in leather jacket, pompadour hair, and microphone, posed mid-harmony with animated expression showing wide smile and energetic posture. The backdrop shows 50s diner with checkered floor patterns, jukebox with glowing lights, and classic cars with chrome details. Accessories include a comb and leather wallet. Photographed with warm nostalgic lighting, soft focus effects, and vibrant color tones for classic vocal group aesthetic.",
    additions: ["Pocket comb", "Leather wallet"],
    removals: ["Leather jacket", "Pompadour hair"],
    poses: ["Harmony sing", "Comb hair", "Point gesture"],
    packaging: "Retro diner box with jukebox patterns, classic car silhouettes, and 50s memorabilia"
  },
  {
    title: "Industrial Noise Artist Figure",
    basePrompt: "An experimental noise musician in distressed clothing, safety pins, and welding mask, posed with modified guitar and intense expression. The backdrop features factory machinery, sparks, and urban decay. Accessories include circuit boards and metal scraps. Photographed with harsh industrial lighting for experimental noise music aesthetic.",
    additions: ["Circuit boards", "Metal scraps"],
    removals: ["Welding mask", "Distressed clothing"],
    poses: ["Guitar feedback", "Circuit bend", "Noise gesture"],
    packaging: "Industrial metal box with rust effects, circuit patterns, and factory warning graphics"
  },
  {
    title: "World Fusion Musician Figure",
    basePrompt: "A global fusion artist in eclectic clothing mixing traditional and modern elements, posed with world instruments and peaceful expression. The backdrop shows world map patterns and cultural symbols. Accessories include prayer beads and world instrument props. Photographed with warm global lighting for multicultural music fusion atmosphere.",
    additions: ["Prayer beads", "World instrument props"],
    removals: ["Eclectic clothing", "Traditional elements"],
    poses: ["Instrument play", "Meditation pose", "Cultural gesture"],
    packaging: "World map box with cultural patterns, fusion symbols, and global music graphics"
  },
  {
    title: "Baroque Composer Figure",
    basePrompt: "An elegant baroque musician in powdered wig, velvet coat, and lace cuffs, posed conducting with ornate baton. The backdrop features classical architecture and orchestral instruments. Accessories include a quill pen and sheet music. Photographed with dramatic classical lighting for historical baroque music atmosphere.",
    additions: ["Quill pen", "Sheet music"],
    removals: ["Powdered wig", "Velvet coat"],
    poses: ["Conductor gesture", "Quill write", "Elegant bow"],
    packaging: "Baroque gold box with classical patterns, orchestral designs, and historical motifs"
  },
  {
    title: "Afrobeat Revolutionary Figure",
    basePrompt: "A charismatic afrobeat musician in colorful dashiki, bell necklace, and energetic pose with saxophone. The backdrop shows African patterns, liberation symbols, and vibrant colors. Accessories include cowrie shells and African beads. Photographed with warm African lighting for revolutionary afrobeat energy.",
    additions: ["Cowrie shells", "African beads"],
    removals: ["Dashiki", "Bell necklace"],
    poses: ["Saxophone play", "Dance step", "Liberation gesture"],
    packaging: "African pattern box with liberation symbols, vibrant colors, and afrobeat graphics"
  },
  {
    title: "Chamber Pop Songwriter Figure",
    basePrompt: "An introspective chamber pop musician in cardigan sweater and glasses, posed with acoustic guitar and thoughtful expression. The backdrop features cozy studio, vintage microphones, and sheet music. Accessories include reading glasses and notebook. Photographed with soft intimate lighting for delicate chamber pop atmosphere.",
    additions: ["Reading glasses", "Song notebook"],
    removals: ["Cardigan sweater", "Glasses"],
    poses: ["Guitar strum", "Notebook write", "Thoughtful gaze"],
    packaging: "Cozy studio box with vintage patterns, sheet music designs, and intimate lighting effects"
  },
  {
    title: "Tribal Drummer Figure",
    basePrompt: "An ancient tribal drummer in ceremonial attire and body paint, posed with tribal drum and spiritual expression. The backdrop shows tribal patterns, ceremonial fires, and ancestral spirits. Accessories include ceremonial mask and tribal jewelry. Photographed with mystical lighting for spiritual tribal music atmosphere.",
    additions: ["Ceremonial mask", "Tribal jewelry"],
    removals: ["Ceremonial attire", "Body paint"],
    poses: ["Drum beat", "Spiritual dance", "Ancestral call"],
    packaging: "Tribal pattern box with ceremonial designs, ancestral symbols, and spiritual graphics"
  },
  {
    title: "Lounge Crooner Figure",
    basePrompt: "A sophisticated lounge singer in tuxedo and fedora, posed with cocktail microphone and smooth expression. The backdrop features cocktail lounge, piano, and martini glasses. Accessories include cigarette holder and bowtie. Photographed with warm amber lighting for classic lounge music elegance.",
    additions: ["Cigarette holder", "Bowtie"],
    removals: ["Fedora", "Tuxedo"],
    poses: ["Microphone hold", "Smooth gesture", "Cocktail sip"],
    packaging: "Lounge velvet box with cocktail patterns, piano keys, and sophisticated graphics"
  },
  {
    title: "Psychedelic Rock Figure",
    basePrompt: "A psychedelic rock musician in tie-dye shirt, bell-bottoms, and headband, posed with electric guitar and trippy expression. The backdrop features swirling colors, peace signs, and psychedelic patterns. Accessories include love beads and incense holder. Photographed with vibrant psychedelic lighting for mind-bending rock atmosphere.",
    additions: ["Love beads", "Incense holder"],
    removals: ["Headband", "Bell-bottoms"],
    poses: ["Guitar feedback", "Peace sign", "Trippy dance"],
    packaging: "Psychedelic swirl box with peace signs, vibrant colors, and mind-bending graphics"
  },
  {
    title: "Marching Band Leader Figure",
    basePrompt: "An enthusiastic marching band director in uniform and hat, posed conducting with baton and animated expression. The backdrop shows football field, cheerleaders, and band formation. Accessories include whistle and megaphone. Photographed with bright stadium lighting for energetic marching band atmosphere.",
    additions: ["Whistle", "Megaphone"],
    removals: ["Uniform hat", "Conductor baton"],
    poses: ["Conductor wave", "Whistle blow", "March step"],
    packaging: "Stadium box with band formations, cheerleader patterns, and football field graphics"
  },
  {
    title: "Sea Shanty Singer Figure",
    basePrompt: "A rugged sea shanty singer in sailor's uniform and tricorn hat, posed with accordion and hearty expression. The backdrop features ship deck, ocean waves, and pirate flags. Accessories include spyglass and rope. Photographed with salty sea lighting for adventurous maritime music atmosphere.",
    additions: ["Spyglass", "Rope coil"],
    removals: ["Tricorn hat", "Sailor uniform"],
    poses: ["Accordion play", "Spyglass gaze", "Hearty laugh"],
    packaging: "Ship deck box with ocean patterns, pirate flags, and maritime graphics"
  }
];