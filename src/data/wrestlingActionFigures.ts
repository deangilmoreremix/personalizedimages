export interface WrestlingActionFigurePrompt {
  title: string;
  basePrompt: string;
  additions: string[];
  removals: string[];
  poses: string[];
  packaging: string;
}

export const wrestlingActionFigurePrompts: WrestlingActionFigurePrompt[] = [
  {
    title: "Showman Champion Figure",
    basePrompt: "A charismatic wrestling champion in elaborate entrance robe, championship belt, and signature pose, standing on a wrestling ring with spotlights and crowd reactions. The backdrop features arena crowds, championship banners, and pyrotechnic effects. Accessories include a championship belt and microphone. The figure has flamboyant features and championship presence, photographed with dramatic arena lighting that emphasizes showmanship and wrestling entertainment.",
    additions: ["Championship belt", "Entrance robe"],
    removals: ["Signature pose", "Microphone"],
    poses: ["Championship celebration", "Entrance pose", "Victory taunt"],
    packaging: "Championship gold box with belt patterns, crowd graphics, and wrestling typography"
  },
  {
    title: "Masked High-Flyer Figure",
    basePrompt: "A mysterious masked wrestler in colorful mask, athletic gear, and acrobatic stance, posed on the top rope with aerial readiness. The backdrop features wrestling rings, turnbuckles, and crowd anticipation. Accessories include a colorful mask and protective gear. The figure has athletic features and aerial presence, photographed with dynamic lighting that emphasizes high-flying action and masked mystery.",
    additions: ["Protective gear", "Aerial harness"],
    removals: ["Colorful mask", "Athletic gear"],
    poses: ["Top rope stance", "Aerial pose", "Mask reveal"],
    packaging: "High-flyer blue box with mask patterns, aerial graphics, and acrobatic typography"
  },
  {
    title: "Hardcore Icon Figure",
    basePrompt: "A brutal hardcore wrestler in worn gear, barbed wire accessories, and intense expression, posed with weapon and battle damage. The backdrop features destruction, weapons, and hardcore environment. Accessories include barbed wire and weapon props. The figure has rugged features and hardcore presence, photographed with harsh lighting that emphasizes brutality and hardcore wrestling intensity.",
    additions: ["Weapon props", "Battle damage"],
    removals: ["Worn gear", "Barbed wire"],
    poses: ["Weapon swing", "Intense stare", "Hardcore stance"],
    packaging: "Hardcore black box with weapon patterns, destruction graphics, and brutal typography"
  },
  {
    title: "Beast Incarnate Figure",
    basePrompt: "A monstrous powerhouse wrestler in intimidating gear, face paint, and aggressive stance, posed with intimidating presence and beast-like features. The backdrop features dark arenas, chains, and beast motifs. Accessories include chains and intimidating props. The figure has monstrous features and beast presence, photographed with shadowy lighting that emphasizes intimidation and monstrous power.",
    additions: ["Chains", "Face paint"],
    removals: ["Intimidating gear", "Beast props"],
    poses: ["Intimidating glare", "Beast roar", "Power stance"],
    packaging: "Beast red box with chain patterns, monster graphics, and intimidating typography"
  },
  {
    title: "Technical Master Figure",
    basePrompt: "A skilled technical wrestler in form-fitting gear, focus pads, and precise stance, posed with submission hold demonstration. The backdrop features training mats, technical diagrams, and wrestling instruction. Accessories include focus pads and technical props. The figure has skilled features and technical presence, photographed with clinical lighting that emphasizes precision and wrestling technique.",
    additions: ["Focus pads", "Technical diagrams"],
    removals: ["Form-fitting gear", "Submission props"],
    poses: ["Submission hold", "Technical stance", "Training demonstration"],
    packaging: "Technical blue box with mat patterns, technique graphics, and precision typography"
  },
  {
    title: "Giant Destroyer Figure",
    basePrompt: "A massive giant wrestler in oversized gear, intimidating presence, and powerful stance, posed with overwhelming size and strength. The backdrop features giant motifs, destruction, and size comparison. Accessories include oversized props and strength indicators. The figure has massive features and giant presence, photographed with wide-angle lighting that emphasizes overwhelming size and destructive power.",
    additions: ["Oversized props", "Strength indicators"],
    removals: ["Oversized gear", "Intimidating presence"],
    poses: ["Overwhelming stance", "Destructive pose", "Giant presence"],
    packaging: "Giant green box with size patterns, destruction graphics, and massive typography"
  },
  {
    title: "Speed Demon Figure",
    basePrompt: "A lightning-fast wrestler in sleek gear, aerodynamic design, and quick stance, posed with motion blur and speed effects. The backdrop features speed lines, motion effects, and fast-paced action. Accessories include speed-enhancing props and motion indicators. The figure has sleek features and speed presence, photographed with fast shutter lighting that emphasizes lightning speed and quick action.",
    additions: ["Speed props", "Motion indicators"],
    removals: ["Sleek gear", "Aerodynamic design"],
    poses: ["Speed dash", "Quick strike", "Motion blur"],
    packaging: "Speed yellow box with motion patterns, speed graphics, and lightning typography"
  },
  {
    title: "Foreign Heel Figure",
    basePrompt: "An arrogant foreign wrestler in elaborate gear, flag motifs, and cocky stance, posed with national pride and heel tactics. The backdrop features international flags, foreign motifs, and heel behavior. Accessories include flag props and arrogant accessories. The figure has arrogant features and foreign presence, photographed with international lighting that emphasizes national pride and heel arrogance.",
    additions: ["Flag props", "National symbols"],
    removals: ["Elaborate gear", "Flag motifs"],
    poses: ["Cocky stance", "National salute", "Heel taunt"],
    packaging: "Foreign red box with flag patterns, international graphics, and arrogant typography"
  },
  {
    title: "Luchador Legend Figure",
    basePrompt: "A masked luchador wrestler in traditional mask, colorful tights, and acrobatic pose, posed with lucha libre tradition and aerial capability. The backdrop features lucha libre motifs, masks, and Mexican wrestling tradition. Accessories include traditional mask and lucha props. The figure has masked features and luchador presence, photographed with traditional lighting that emphasizes lucha libre heritage and acrobatic skill.",
    additions: ["Lucha props", "Traditional accessories"],
    removals: ["Traditional mask", "Colorful tights"],
    poses: ["Acrobatic pose", "Mask flourish", "Lucha stance"],
    packaging: "Luchador color box with mask patterns, lucha graphics, and traditional typography"
  },
  {
    title: "Manager Manipulator Figure",
    basePrompt: "A scheming wrestling manager in business attire, megaphone, and manipulative pose, posed with strategy and manipulation tactics. The backdrop features strategy boards, contracts, and managerial elements. Accessories include megaphone and strategy props. The figure has scheming features and managerial presence, photographed with strategic lighting that emphasizes manipulation and wrestling politics.",
    additions: ["Strategy props", "Contract documents"],
    removals: ["Business attire", "Megaphone"],
    poses: ["Manipulative gesture", "Strategy pose", "Manager stance"],
    packaging: "Manager black box with strategy patterns, contract graphics, and manipulative typography"
  },
  {
    title: "Tag Team Partner Figure",
    basePrompt: "A loyal tag team wrestler in matching gear, team colors, and unified stance, posed with partner coordination and team tactics. The backdrop features tag team motifs, partner elements, and team unity. Accessories include team props and partner indicators. The figure has loyal features and team presence, photographed with unified lighting that emphasizes partnership and tag team synergy.",
    additions: ["Team props", "Partner indicators"],
    removals: ["Matching gear", "Team colors"],
    poses: ["Team stance", "Partner coordination", "Tag team pose"],
    packaging: "Tag team color box with partner patterns, team graphics, and unified typography"
  },
  {
    title: "Underdog Hero Figure",
    basePrompt: "A determined underdog wrestler in worn gear, heart symbol, and inspirational pose, posed with determination and heroic spirit. The backdrop features underdog motifs, heart elements, and inspirational scenes. Accessories include heart props and determination indicators. The figure has determined features and heroic presence, photographed with inspirational lighting that emphasizes heart and underdog spirit.",
    additions: ["Heart props", "Determination indicators"],
    removals: ["Worn gear", "Heart symbol"],
    poses: ["Inspirational pose", "Determination stance", "Heroic gesture"],
    packaging: "Hero red box with heart patterns, inspiration graphics, and determined typography"
  },
  {
    title: "Submission Specialist Figure",
    basePrompt: "A technical submission wrestler in joint locks, pressure points, and precise stance, posed with submission hold demonstration. The backdrop features joint techniques, pressure points, and submission elements. Accessories include joint props and submission indicators. The figure has precise features and submission presence, photographed with technical lighting that emphasizes joint techniques and submission skill.",
    additions: ["Joint props", "Submission indicators"],
    removals: ["Joint locks", "Pressure points"],
    poses: ["Submission hold", "Joint lock", "Technical stance"],
    packaging: "Submission blue box with joint patterns, technique graphics, and technical typography"
  },
  {
    title: "Ring Announcer Figure",
    basePrompt: "A charismatic ring announcer in tuxedo, microphone, and enthusiastic pose, posed with announcement energy and crowd engagement. The backdrop features announcement motifs, crowd elements, and ring presentation. Accessories include microphone and announcement props. The figure has charismatic features and announcer presence, photographed with enthusiastic lighting that emphasizes crowd engagement and ring presentation.",
    additions: ["Announcement props", "Crowd engagement"],
    removals: ["Tuxedo", "Microphone"],
    poses: ["Announcement pose", "Crowd engagement", "Ring presentation"],
    packaging: "Announcer white box with microphone patterns, crowd graphics, and enthusiastic typography"
  },
  {
    title: "Veteran Warrior Figure",
    basePrompt: "A seasoned veteran wrestler in battle-worn gear, scars, and experienced stance, posed with wisdom and battle experience. The backdrop features veteran motifs, battle scars, and experience elements. Accessories include scar props and experience indicators. The figure has seasoned features and veteran presence, photographed with experienced lighting that emphasizes wisdom and battle scars.",
    additions: ["Scar props", "Experience indicators"],
    removals: ["Battle-worn gear", "Scars"],
    poses: ["Experienced stance", "Wise gesture", "Battle pose"],
    packaging: "Veteran brown box with scar patterns, experience graphics, and seasoned typography"
  },
  {
    title: "High Society Heel Figure",
    basePrompt: "An aristocratic heel wrestler in elegant attire, cane, and superior pose, posed with class and heel tactics. The backdrop features aristocratic motifs, class elements, and heel behavior. Accessories include cane and aristocratic props. The figure has aristocratic features and heel presence, photographed with elegant lighting that emphasizes class and heel superiority.",
    additions: ["Aristocratic props", "Class indicators"],
    removals: ["Elegant attire", "Cane"],
    poses: ["Superior pose", "Class gesture", "Heel stance"],
    packaging: "Aristocratic gold box with class patterns, elegance graphics, and superior typography"
  },
  {
    title: "Fire Breathing Figure",
    basePrompt: "A dramatic fire-breathing wrestler in flame gear, fire effects, and intense pose, posed with fire breath and dramatic presence. The backdrop features fire motifs, flame elements, and dramatic scenes. Accessories include fire props and flame indicators. The figure has dramatic features and fire presence, photographed with fiery lighting that emphasizes flame effects and dramatic intensity.",
    additions: ["Fire props", "Flame indicators"],
    removals: ["Flame gear", "Fire effects"],
    poses: ["Fire breath", "Dramatic pose", "Flame stance"],
    packaging: "Fire red box with flame patterns, fire graphics, and dramatic typography"
  },
  {
    title: "Psychotic Heel Figure",
    basePrompt: "An unhinged psychotic wrestler in disturbing gear, wild expression, and erratic pose, posed with madness and heel tactics. The backdrop features psychotic motifs, madness elements, and disturbing scenes. Accessories include disturbing props and madness indicators. The figure has unhinged features and psychotic presence, photographed with disturbing lighting that emphasizes madness and heel psychosis.",
    additions: ["Disturbing props", "Madness indicators"],
    removals: ["Disturbing gear", "Wild expression"],
    poses: ["Erratic pose", "Mad gesture", "Psychotic stance"],
    packaging: "Psychotic purple box with madness patterns, disturbing graphics, and unhinged typography"
  },
  {
    title: "Family Legacy Figure",
    basePrompt: "A proud family legacy wrestler in heritage gear, family crest, and proud pose, posed with family pride and wrestling tradition. The backdrop features family motifs, heritage elements, and traditional scenes. Accessories include family props and heritage indicators. The figure has proud features and legacy presence, photographed with traditional lighting that emphasizes family pride and wrestling heritage.",
    additions: ["Family props", "Heritage indicators"],
    removals: ["Heritage gear", "Family crest"],
    poses: ["Proud pose", "Family gesture", "Legacy stance"],
    packaging: "Legacy blue box with family patterns, heritage graphics, and proud typography"
  },
  {
    title: "Super Heavyweight Figure",
    basePrompt: "An enormous super heavyweight wrestler in massive gear, overwhelming presence, and powerful stance, posed with size and strength dominance. The backdrop features heavyweight motifs, size elements, and dominance scenes. Accessories include massive props and strength indicators. The figure has enormous features and heavyweight presence, photographed with overwhelming lighting that emphasizes size dominance and heavyweight power.",
    additions: ["Massive props", "Strength indicators"],
    removals: ["Massive gear", "Overwhelming presence"],
    poses: ["Dominant stance", "Size pose", "Power gesture"],
    packaging: "Heavyweight silver box with size patterns, dominance graphics, and massive typography"
  },
  {
    title: "Cowardly Heel Figure",
    basePrompt: "A cowardly heel wrestler in sneaky gear, cowardly expression, and deceptive pose, posed with cowardice and heel tactics. The backdrop features cowardly motifs, deception elements, and sneaky scenes. Accessories include sneaky props and cowardice indicators. The figure has cowardly features and heel presence, photographed with deceptive lighting that emphasizes cowardice and heel sneakiness.",
    additions: ["Sneaky props", "Cowardice indicators"],
    removals: ["Sneaky gear", "Cowardly expression"],
    poses: ["Deceptive pose", "Sneaky gesture", "Cowardly stance"],
    packaging: "Cowardly gray box with sneaky patterns, deception graphics, and cowardly typography"
  },
  {
    title: "Martial Arts Master Figure",
    basePrompt: "A disciplined martial arts wrestler in traditional gear, focused expression, and precise pose, posed with martial discipline and fighting skill. The backdrop features martial motifs, discipline elements, and traditional scenes. Accessories include martial props and discipline indicators. The figure has disciplined features and martial presence, photographed with traditional lighting that emphasizes martial discipline and fighting skill.",
    additions: ["Martial props", "Discipline indicators"],
    removals: ["Traditional gear", "Focused expression"],
    poses: ["Precise pose", "Martial gesture", "Discipline stance"],
    packaging: "Martial red box with discipline patterns, martial graphics, and traditional typography"
  },
  {
    title: "Party Animal Figure",
    basePrompt: "A fun-loving party wrestler in festive gear, party expression, and celebratory pose, posed with party energy and wrestling entertainment. The backdrop features party motifs, celebration elements, and fun scenes. Accessories include party props and celebration indicators. The figure has fun features and party presence, photographed with celebratory lighting that emphasizes party energy and wrestling fun.",
    additions: ["Party props", "Celebration indicators"],
    removals: ["Festive gear", "Party expression"],
    poses: ["Celebratory pose", "Party gesture", "Fun stance"],
    packaging: "Party color box with celebration patterns, fun graphics, and party typography"
  },
  {
    title: "Mystery Wrestler Figure",
    basePrompt: "An enigmatic mystery wrestler in concealed gear, mysterious expression, and hidden pose, posed with mystery and wrestling intrigue. The backdrop features mystery motifs, concealment elements, and intriguing scenes. Accessories include mystery props and concealment indicators. The figure has enigmatic features and mystery presence, photographed with mysterious lighting that emphasizes concealment and wrestling intrigue.",
    additions: ["Mystery props", "Concealment indicators"],
    removals: ["Concealed gear", "Mysterious expression"],
    poses: ["Hidden pose", "Mystery gesture", "Intriguing stance"],
    packaging: "Mystery black box with concealment patterns, mystery graphics, and enigmatic typography"
  },
  {
    title: "Powerhouse Bruiser Figure",
    basePrompt: "A powerful bruiser wrestler in tough gear, strong expression, and forceful pose, posed with power and wrestling strength. The backdrop features power motifs, strength elements, and forceful scenes. Accessories include power props and strength indicators. The figure has powerful features and bruiser presence, photographed with forceful lighting that emphasizes power and wrestling strength.",
    additions: ["Power props", "Strength indicators"],
    removals: ["Tough gear", "Strong expression"],
    poses: ["Forceful pose", "Power gesture", "Strength stance"],
    packaging: "Power red box with strength patterns, power graphics, and forceful typography"
  },
  {
    title: "Comedy Wrestler Figure",
    basePrompt: "A humorous comedy wrestler in funny gear, comedic expression, and silly pose, posed with humor and wrestling comedy. The backdrop features comedy motifs, humor elements, and funny scenes. Accessories include comedy props and humor indicators. The figure has humorous features and comedy presence, photographed with funny lighting that emphasizes humor and wrestling comedy.",
    additions: ["Comedy props", "Humor indicators"],
    removals: ["Funny gear", "Comedic expression"],
    poses: ["Silly pose", "Comedy gesture", "Funny stance"],
    packaging: "Comedy yellow box with humor patterns, comedy graphics, and funny typography"
  },
  {
    title: "Extreme Rules Figure",
    basePrompt: "A dangerous extreme wrestler in weapon gear, extreme expression, and risky pose, posed with danger and wrestling extremity. The backdrop features extreme motifs, danger elements, and risky scenes. Accessories include weapon props and danger indicators. The figure has dangerous features and extreme presence, photographed with risky lighting that emphasizes danger and wrestling extremity.",
    additions: ["Weapon props", "Danger indicators"],
    removals: ["Weapon gear", "Extreme expression"],
    poses: ["Risky pose", "Danger gesture", "Extreme stance"],
    packaging: "Extreme black box with danger patterns, extreme graphics, and risky typography"
  },
  {
    title: "International Sensation Figure",
    basePrompt: "A global international wrestler in world gear, international expression, and worldwide pose, posed with global appeal and wrestling internationality. The backdrop features international motifs, global elements, and worldwide scenes. Accessories include world props and international indicators. The figure has global features and international presence, photographed with worldwide lighting that emphasizes global appeal and wrestling internationality.",
    additions: ["World props", "International indicators"],
    removals: ["World gear", "International expression"],
    poses: ["Worldwide pose", "Global gesture", "International stance"],
    packaging: "International blue box with global patterns, world graphics, and international typography"
  },
  {
    title: "Rising Star Figure",
    basePrompt: "An aspiring rising wrestler in promising gear, hopeful expression, and potential pose, posed with promise and wrestling potential. The backdrop features rising motifs, potential elements, and aspiring scenes. Accessories include promise props and potential indicators. The figure has aspiring features and rising presence, photographed with hopeful lighting that emphasizes promise and wrestling potential.",
    additions: ["Promise props", "Potential indicators"],
    removals: ["Promising gear", "Hopeful expression"],
    poses: ["Potential pose", "Promise gesture", "Rising stance"],
    packaging: "Rising gold box with potential patterns, promise graphics, and aspiring typography"
  },
  {
    title: "Legendary Icon Figure",
    basePrompt: "An iconic legendary wrestler in classic gear, legendary expression, and iconic pose, posed with legend and wrestling iconography. The backdrop features legendary motifs, icon elements, and classic scenes. Accessories include legend props and icon indicators. The figure has iconic features and legendary presence, photographed with classic lighting that emphasizes legend and wrestling iconography.",
    additions: ["Legend props", "Icon indicators"],
    removals: ["Classic gear", "Legendary expression"],
    poses: ["Iconic pose", "Legend gesture", "Classic stance"],
    packaging: "Legendary gold box with icon patterns, legend graphics, and classic typography"
  },
  {
    title: "Rebel Outlaw Figure",
    basePrompt: "A defiant rebel wrestler in outlaw gear, rebellious expression, and defiant pose, posed with rebellion and wrestling defiance. The backdrop features rebel motifs, defiance elements, and outlaw scenes. Accessories include rebel props and defiance indicators. The figure has defiant features and rebel presence, photographed with rebellious lighting that emphasizes rebellion and wrestling defiance.",
    additions: ["Rebel props", "Defiance indicators"],
    removals: ["Outlaw gear", "Rebellious expression"],
    poses: ["Defiant pose", "Rebel gesture", "Outlaw stance"],
    packaging: "Rebel black box with defiance patterns, rebel graphics, and defiant typography"
  }
];