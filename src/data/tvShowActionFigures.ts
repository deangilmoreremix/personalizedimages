interface TVShowActionFigurePrompt {
  archetype: string;
  basePrompt: string;
  additions: string[];
  removals: string[];
  poses: string[];
  packaging: string;
}

const tvPrompts: TVShowActionFigurePrompt[] = [
  {
    archetype: "High School Heartthrob Figure",
    basePrompt: "Create a pastel clamshell package for a high school heartthrob action figure in a colorful polo and acid-washed jeans, holding a giant brick cell phone and standing in front of a locker-lined hallway. Includes time-freeze pose feature. Professional toy photography with 90s aesthetic lighting.",
    additions: ["School yearbook", "Detention slip prop"],
    removals: ["Phone", "Backpack"],
    poses: ["Finger point", "Cell phone lean", "Locker lean"],
    packaging: "Pastel clamshell with quotes and zig-zag borders"
  },
  {
    archetype: "Paranormal Agent Figure",
    basePrompt: "Create a dark government-issue packaging for a trench-coat wearing FBI agent with briefcase and flashlight, posed mid-investigation with a flying saucer silhouette behind. Includes alien skull and poster accessory. Professional photography with mysterious lighting.",
    additions: ["Files folder", "Secret vault backdrop"],
    removals: ["Flashlight", "Poster"],
    poses: ["Flashlight crouch", "Holding badge", "Looking up at light"],
    packaging: "Dark government-issue packaging with foil stamp and secret message liner"
  },
  {
    archetype: "Fresh Prince Style Figure",
    basePrompt: "Create a graffiti-sprayed flip box for a stylish 90s teen in neon streetwear, posed with a tilted cap and boom box accessory on a graffiti wall base. Features expressive facial stickers and poseable dance limbs. Professional photography with urban street lighting.",
    additions: ["Basketball", "DJ accessory"],
    removals: ["Boom box", "Jacket"],
    poses: ["Jump pose", "One-arm mic move", "Side lean chill"],
    packaging: "Graffiti-sprayed flip box with bold sticker sheet"
  },
  {
    archetype: "Coffee Shop Fashionista Figure",
    basePrompt: "Create a sitcom-style stage set box for a 90s fashionista figure with layered haircut and coffee tray, posed behind a coffee shop sofa backdrop with chalkboard specials wall. Includes changeable waitress and casual outfits. Professional toy photography.",
    additions: ["Coffee cup", "Quote banner"],
    removals: ["Tray", "Apron"],
    poses: ["Serving pose", "Talking on phone", "Hand on hip smile"],
    packaging: "Sitcom-style stage set box with pop-out quote bubbles and couch stand"
  },
  {
    archetype: "Lifeguard Figure",
    basePrompt: "Create a wave-washed box for an action-ready lifeguard figure in red swimsuit and whistle, posed on a sandy beach base with lifeguard tower backdrop. Features splash effects and slow-motion running stance. Professional photography with beach lighting.",
    additions: ["Rescue float", "Binoculars"],
    removals: ["Whistle", "Logo patch"],
    poses: ["Running stance", "Lifeguard stand wave", "Kneeling rescue pose"],
    packaging: "Wave-washed box with transparent ocean texture and iconic 90s title bar"
  },
  {
    archetype: "Cool Uncle Rocker Figure",
    basePrompt: "Create a 90s sitcom box for a cool uncle figure with flowing hair, leather jacket, and guitar accessory, posed in front of a suburban townhouse with a soft pink sky. Includes motorcycle and motivational sign. Professional photography with sitcom lighting.",
    additions: ["Drumsticks", "Baby backpack"],
    removals: ["Guitar", "Sunglasses"],
    poses: ["Finger point", "Mic croon", "Family hug pose"],
    packaging: "90s sitcom box with family photo cutout and soft glow filter"
  },
  {
    archetype: "Nerd Icon Figure",
    basePrompt: "Create a checkerboard clamshell for a quirky nerd figure in suspenders, thick glasses, and high-waisted pants, posed mid-snort with science kit and family house background. Includes interchangeable 'cool' variant. Professional toy photography.",
    additions: ["Beaker", "Hover boots"],
    removals: ["Suspenders", "Glasses"],
    poses: ["Did I do that? pose", "Point and laugh", "Nose push"],
    packaging: "Checkerboard clamshell with pop quiz stickers and catchphrases"
  },
  {
    archetype: "Vampire Slayer Figure",
    basePrompt: "Create a graveyard gate box for a high school slayer figure with wooden stake, crossbow, and leather jacket, posed on a dark cemetery base with crypt lights. Includes vampire dust effects and library accessories. Professional photography with gothic lighting.",
    additions: ["Pointy stake", "Grimoire"],
    removals: ["Crossbow", "Jacket"],
    poses: ["Mid-kick stake", "Defensive cross pose", "Library research"],
    packaging: "Graveyard gate box with gothic text and embossed stake emblems"
  },
  {
    archetype: "Dance Icon Figure",
    basePrompt: "Create a family mansion diorama for a stylish cousin in sweater vest and bowtie posed doing his iconic dance move in a luxury foyer set. Includes dance radio, trophy case backdrop, and piano stand. Professional photography with mansion lighting.",
    additions: ["Dance boom box", "Family photo"],
    removals: ["Sweater vest", "Radio"],
    poses: ["Dance move", "Jazz hands", "Clap and spin"],
    packaging: "Family mansion diorama with pop-out floor rug and disco overlay"
  },
  {
    archetype: "Teenage Witch Figure",
    basePrompt: "Create a mystical purple box for a teen witch figure in sparkly top with spell book and black cat, posed in front of her living room with magic portal base. Includes bubbling cauldron and wand. Professional photography with magical lighting.",
    additions: ["Talking cat", "Magic journal"],
    removals: ["Cauldron", "Wand"],
    poses: ["Wand cast pose", "Smirk with book", "Floating meditation"],
    packaging: "Mystical purple box with star shimmer and cauldron bubble textures"
  },
  {
    archetype: "Couch Potato Figure",
    basePrompt: "Create a faded family living room box for a grumpy dad figure in dress shirt and tie sitting on a cracked living room couch with TV remote and football. Includes newspaper and receipt props. Professional toy photography.",
    additions: ["Shoe box", "High school jersey"],
    removals: ["Remote", "Shoes"],
    poses: ["Couch recline", "Facepalm", "Football throw"],
    packaging: "Faded family living room box with remote flap and sarcastic banner"
  },
  {
    archetype: "Sci-Fi Analyst Figure",
    basePrompt: "Create an X-Files black and white slipcase for a sharp-suited FBI figure with medical folder and glowing file, standing against a lab background with alien outline shadow. Includes gun holster and flashlight. Professional photography with sci-fi lighting.",
    additions: ["X-ray slide", "Alien handprint"],
    removals: ["Flashlight", "Medical file"],
    poses: ["Holding evidence", "File open", "Pistol stance"],
    packaging: "Black and white slipcase with mysterious symbols and seal cutout"
  },
  {
    archetype: "Actor Wannabe Figure",
    basePrompt: "Create a studio apartment box for a laid-back figure with leather jacket and pizza box, posed mid-greeting with camera light base. Includes soap opera script and sandwich add-ons. Professional photography with apartment lighting.",
    additions: ["Stuffed penguin", "Soap script"],
    removals: ["Pizza box", "Jacket"],
    poses: ["How you doin?", "Overacting stare", "Thumbs-up nod"],
    packaging: "Studio apartment box with cheesy spotlight overlay and pizza scent panel"
  },
  {
    archetype: "Improv Survivalist Figure",
    basePrompt: "Create a utility case box for a resourceful agent in mullet hairstyle, leather jacket, and tool belt, surrounded by random objects turned inventions. Includes wire-cutting pose and explosion backdrop. Professional toy photography.",
    additions: ["Swiss army knife", "Toothpick"],
    removals: ["Jacket", "Duct tape roll"],
    poses: ["Trap build", "Escape crawl", "Thinking pose"],
    packaging: "Utility case box with blueprint inserts and mystery object bag"
  },
  {
    archetype: "Radio Shrink Figure",
    basePrompt: "Create a radio booth backdrop box for a classy figure in blazer with coffee cup and psychology book, posed mid-rant in front of a talk-radio mic. Includes wine bottle prop and studio chair. Professional photography with radio studio lighting.",
    additions: ["Sherry glass", "Call-in light"],
    removals: ["Coffee", "Book"],
    poses: ["Finger in air", "Relaxed monologue", "Coffee lean"],
    packaging: "Radio booth backdrop box with Seattle skyline and mini cameo"
  },
  {
    archetype: "Cartoon Father Figure",
    basePrompt: "Create a cartoon background box for a yellow cartoon father figure in white shirt and blue pants, holding a pink donut and beverage can. Background features living room couch and TV set. Professional toy photography with cartoon lighting.",
    additions: ["Nuclear plant badge", "Saxophone"],
    removals: ["Beverage can", "Donut"],
    poses: ["D'oh face", "Donut drool", "Strangling pose"],
    packaging: "Cartoon background box with cloud shape window and character silhouettes"
  },
  {
    archetype: "Starfleet Commander",
    basePrompt: "Create a Federation-style slipcase for a bald starship captain figure in red and black uniform, seated in captain's chair with phaser and communicator badge. Backdrop shows bridge view of space with stars. Professional photography with sci-fi lighting.",
    additions: ["Tea cup", "Command console"],
    removals: ["Phaser", "Chair"],
    poses: ["Engage point", "Make it so stance", "Facepalm"],
    packaging: "Federation-style slipcase with transporter effect window and tech specs"
  },
  {
    archetype: "Entrance Specialist Figure",
    basePrompt: "Create an apartment door cardboard cutout for a tall lanky neighbor figure with wild hair, colorful vintage shirt, and exaggerated gestures. Features spring-loaded door-slide action and apartment backdrop. Professional toy photography.",
    additions: ["Coffee table book", "Lobster bib"],
    removals: ["Apartment door", "Vintage shirt"],
    poses: ["Door slide", "Hair push", "Elaborate gesture"],
    packaging: "Apartment door cardboard cutout with peephole viewer and bassline button"
  },
  {
    archetype: "Pity Fool Commando",
    basePrompt: "Create a van box for a muscular action hero figure with mohawk, gold chains, and camo pants. Includes van accessory and motivational sound chip when squeezed. Professional photography with action lighting.",
    additions: ["Gold van", "Tool belt"],
    removals: ["Chains", "Mohawk"],
    poses: ["Fist-up stance", "Grimace face", "Pointing pose"],
    packaging: "Van box with metallic gold trim and explosion effects"
  },
  {
    archetype: "Paleontology Prof Figure",
    basePrompt: "Create a museum display case for a nerdy scientist figure in tweed jacket holding fossil and pointing at dinosaur chart. Features 'pivot' sound button and museum display backdrop. Professional photography with museum lighting.",
    additions: ["Mini couch", "Leather pants"],
    removals: ["Fossil", "Chart"],
    poses: ["Pivot pose", "Professor lecture", "Emotional outburst"],
    packaging: "Museum display case with foldout dinosaur diorama and friend group photo"
  },
  {
    archetype: "Sarcasm Master Figure",
    basePrompt: "Create an office cubicle box for a 90s office worker figure in vest and tie with sarcastic expression and briefcase. Includes office cubicle backdrop and comic speech bubble attachments. Professional toy photography.",
    additions: ["Recliner", "Duck and chick pets"],
    removals: ["Briefcase", "Office backdrop"],
    poses: ["Could I BE any more...?", "Dance awkward", "Sarcastic point"],
    packaging: "Office cubicle box with sarcastic quips and magnets for speech bubbles"
  },
  {
    archetype: "Clean Freak Chef",
    basePrompt: "Create a kitchen backdrop box for a perfectionist chef figure with spatula and chef hat in spotless kitchen backdrop. Includes cleaning supplies and miniature thanksgiving turkey. Professional photography with kitchen lighting.",
    additions: ["Cooking timer", "Recipe cards"],
    removals: ["Chef hat", "Cleaning supplies"],
    poses: ["Cooking stance", "Competitive point", "Cleaning frenzy"],
    packaging: "Kitchen backdrop box with real recipe cards and miniature apron"
  },
  {
    archetype: "Eccentric Musician",
    basePrompt: "Create a coffee shop stage for a quirky bohemian figure with acoustic guitar and flowing dress, posed mid-song in coffee shop. Includes lyric sheet and street performer case. Professional photography with coffee shop lighting.",
    additions: ["Massage table", "Triplet babies"],
    removals: ["Guitar", "Coffee shop backdrop"],
    poses: ["Guitar strum", "Surprised face", "Running weird"],
    packaging: "Coffee shop stage with musical note border and cat stickers"
  },
  {
    archetype: "Chemistry Teacher",
    basePrompt: "Create a chemistry lab box for a chemistry teacher figure in green apron and glasses with lab equipment and RV backdrop. Features removable hat and color-changing features. Professional toy photography with lab lighting.",
    additions: ["Gas mask", "Blue crystal prop"],
    removals: ["Glasses", "Lab equipment"],
    poses: ["Say my name stance", "Lab work", "Hat adjustment"],
    packaging: "Chemistry lab box with periodic table background and warning labels"
  },
  {
    archetype: "Psychic Girl Figure",
    basePrompt: "Create an 80s-style blister pack for a young girl figure with shaved head, hospital gown, and nosebleed effect. Features light-up eyes and telekinetic hand pose with floating objects. Professional photography with supernatural lighting.",
    additions: ["Waffle prop", "Sensory tank"],
    removals: ["Hospital gown", "Nosebleed effect"],
    poses: ["Telekinetic stance", "Staring intensely", "Running scared"],
    packaging: "80s-style blister pack with flickering Christmas lights border and alphabet wall"
  },
  {
    archetype: "Strategic Advisor",
    basePrompt: "Create an Iron Throne backdrop box for a diminutive noble figure in medieval tunic with goblet and scroll, posed with knowing smirk beside castle table map. Includes advisor pin. Professional photography with medieval lighting.",
    additions: ["Throne mini", "Crossbow prop"],
    removals: ["Goblet", "Scroll"],
    poses: ["Drinking stance", "Strategic planning", "Court statement"],
    packaging: "Iron Throne backdrop box with House sigil banners and medieval scroll text"
  },
  {
    archetype: "Dragon Queen",
    basePrompt: "Create an Iron and dragonscale box for a silver-haired royal figure in blue dress with dragon on shoulder and chain accessory. Features flame light effects and rocky throne base. Professional photography with fantasy lighting.",
    additions: ["Dragon eggs", "Ancient weapon"],
    removals: ["Dragon", "Throne"],
    poses: ["Conquest stance", "Dragon command", "Queen's address"],
    packaging: "Iron and dragonscale box with map and fire effect backdrop"
  },
  {
    archetype: "Winter Warden",
    basePrompt: "Create a Castle Black wall display for a brooding warrior figure in black fur cloak with sword and direwolf companion, posed on snowy castle wall backdrop. Includes Night's Watch accessories. Professional photography with winter lighting.",
    additions: ["Dragonglass dagger", "Wildling companion"],
    removals: ["Direwolf", "Sword"],
    poses: ["Sword stance", "Brooding look", "Battle ready"],
    packaging: "Castle Black wall display with icy effect window and falling snow accents"
  },
  {
    archetype: "Assistant Manager",
    basePrompt: "Create an office supply clamshell for a serious office figure in short-sleeve shirt and tie with glasses and briefcase. Includes farm backdrop and removable mustard-colored shirt. Professional toy photography.",
    additions: ["Bobblehead mini", "Farming tools"],
    removals: ["Glasses", "Briefcase"],
    poses: ["Karate stance", "Fact declaration", "Office presentation"],
    packaging: "Office supply clamshell with Dunder Mifflin logo and desk accessory set"
  },
  {
    archetype: "World's Best Boss",
    basePrompt: "Create an office diorama for a clueless manager figure with coffee mug, suit with too-short tie, and motivational voice box. Features conference room backdrop. Professional photography with office lighting.",
    additions: ["Bandana", "Award"],
    removals: ["Coffee mug", "Tie"],
    poses: ["Finger guns", "Dynamic presentation", "Awkward dancing"],
    packaging: "Office diorama with pull-out quotes and character photo wall"
  }
];