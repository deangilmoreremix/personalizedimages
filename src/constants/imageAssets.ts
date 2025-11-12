/**
 * Centralized Image Assets Configuration
 *
 * This file manages all image URLs across the application, providing a single source
 * of truth for visual assets. Each image entry includes:
 * - url: The image URL (can be local path or CDN URL)
 * - description: What the image depicts and its purpose
 * - alt: Accessible alternative text
 * - dimensions: Recommended dimensions (width x height)
 * - section: Where it's used in the app
 * - slot: Specific slot identifier for admin customization
 * - component: Component file that uses this image
 */

export interface ImageAsset {
  url: string;
  description: string;
  alt: string;
  dimensions: string;
  section: string;
  slot: string;
  component: string;
  currentUrl?: string; // Original placeholder URL for reference
}

/**
 * HERO SECTION IMAGES
 * Main landing page hero section visuals
 */
export const heroImages: Record<string, ImageAsset> = {
  mainFeature: {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
    description: 'AI Creative Studio Interface - Professional design workspace showing computer screens with data analytics, charts, and modern office environment. Should convey technology, productivity, and personalization capabilities.',
    alt: 'AI Creative Studio Interface - Professional design workspace',
    dimensions: '800x600',
    section: 'hero',
    slot: 'main_image',
    component: 'src/components/Hero.tsx',
    currentUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center'
  }
};

/**
 * BENEFITS SECTION IMAGES
 * Feature cards showing different personalization benefits
 */
export const benefitsImages: Record<string, ImageAsset> = {
  // Note: Benefits section uses icon-based cards without background images
  // Images are minimal and primarily use gradient overlays
};

/**
 * HOW IT WORKS SECTION IMAGES
 */
export const howItWorksImages: Record<string, ImageAsset> = {
  backgroundPattern: {
    url: 'https://images.pexels.com/photos/919278/pexels-photo-919278.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Abstract technology pattern background - Subtle texture showing digital connections, circuits, or modern workspace elements at very low opacity',
    alt: 'Technology pattern background',
    dimensions: '1260x750',
    section: 'how-it-works',
    slot: 'background',
    component: 'src/components/HowItWorks.tsx',
    currentUrl: 'https://images.pexels.com/photos/919278/pexels-photo-919278.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
};

/**
 * TEMPLATES SHOWCASE SECTION IMAGES
 */
export const templatesShowcaseImages: Record<string, ImageAsset> = {
  // Video Template Thumbnails
  videoTemplate1: {
    url: 'https://images.pexels.com/photos/8857185/pexels-photo-8857185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Video personalization template example - Professional video production setup or dynamic marketing video content',
    alt: 'Video template 1',
    dimensions: '1260x750',
    section: 'templates',
    slot: 'video_1',
    component: 'src/components/TemplatesShowcase.tsx',
    currentUrl: 'https://images.pexels.com/photos/8857185/pexels-photo-8857185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  videoTemplate2: {
    url: 'https://images.pexels.com/photos/6224/hands-people-woman-working.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Workspace collaboration video template - People working together on creative projects',
    alt: 'Video template 2',
    dimensions: '1260x750',
    section: 'templates',
    slot: 'video_2',
    component: 'src/components/TemplatesShowcase.tsx',
    currentUrl: 'https://images.pexels.com/photos/6224/hands-people-woman-working.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  videoTemplate3: {
    url: 'https://images.pexels.com/photos/4050299/pexels-photo-4050299.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Professional video production template - High-quality video recording or content creation scene',
    alt: 'Video template 3',
    dimensions: '1260x750',
    section: 'templates',
    slot: 'video_3',
    component: 'src/components/TemplatesShowcase.tsx',
    currentUrl: 'https://images.pexels.com/photos/4050299/pexels-photo-4050299.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },

  // Image Template Thumbnails
  imageTemplate1: {
    url: 'https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Modern marketing image template - Professional business marketing materials or digital content',
    alt: 'Image template 1',
    dimensions: '1260x750',
    section: 'templates',
    slot: 'image_1',
    component: 'src/components/TemplatesShowcase.tsx',
    currentUrl: 'https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  imageTemplate2: {
    url: 'https://images.pexels.com/photos/5858167/pexels-photo-5858167.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Social media image template - Engaging visual content for social platforms',
    alt: 'Image template 2',
    dimensions: '1260x750',
    section: 'templates',
    slot: 'image_2',
    component: 'src/components/TemplatesShowcase.tsx',
    currentUrl: 'https://images.pexels.com/photos/5858167/pexels-photo-5858167.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  imageTemplate3: {
    url: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Email marketing image template - Professional email campaign graphics',
    alt: 'Image template 3',
    dimensions: '1260x750',
    section: 'templates',
    slot: 'image_3',
    component: 'src/components/TemplatesShowcase.tsx',
    currentUrl: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
};

/**
 * TESTIMONIALS SECTION IMAGES
 * Professional headshots for testimonial cards
 */
export const testimonialsImages: Record<string, ImageAsset> = {
  testimonial1: {
    url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Professional headshot - Charles Edgerton, Marketing Consultant - Friendly professional business portrait',
    alt: 'Charles Edgerton - Marketing Consultant',
    dimensions: '600x600',
    section: 'testimonials',
    slot: 'user_1',
    component: 'src/components/Testimonials.tsx',
    currentUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  testimonial2: {
    url: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Professional headshot - Mike Larouche, Agency Owner - Confident business professional portrait',
    alt: 'Mike Larouche - Agency Owner',
    dimensions: '600x600',
    section: 'testimonials',
    slot: 'user_2',
    component: 'src/components/Testimonials.tsx',
    currentUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  testimonial3: {
    url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Professional headshot - Sarah Johnson, Internet Marketer - Approachable professional portrait',
    alt: 'Sarah Johnson - Internet Marketer',
    dimensions: '600x600',
    section: 'testimonials',
    slot: 'user_3',
    component: 'src/components/Testimonials.tsx',
    currentUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  testimonial4: {
    url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Professional headshot - David Chen, E-commerce Director - Professional business portrait',
    alt: 'David Chen - E-commerce Director',
    dimensions: '600x600',
    section: 'testimonials',
    slot: 'user_4',
    component: 'src/components/Testimonials.tsx',
    currentUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  testimonial5: {
    url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Professional headshot - Emily Rodriguez, Social Media Strategist - Creative professional portrait',
    alt: 'Emily Rodriguez - Social Media Strategist',
    dimensions: '600x600',
    section: 'testimonials',
    slot: 'user_5',
    component: 'src/components/Testimonials.tsx',
    currentUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
};

/**
 * ACTION FIGURE TEMPLATES
 * Preview images for 13 different action figure packaging styles
 */
export const actionFigureTemplates: Record<string, ImageAsset> = {
  classicBlister: {
    url: 'https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Classic Blister Pack - Traditional action figure in clear plastic bubble packaging with colorful cardboard backing, retro style',
    alt: 'Classic Blister Pack action figure packaging',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'classic_blister',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  deluxeBoxed: {
    url: 'https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Deluxe Boxed Edition - Premium window box packaging with multiple accessories, collector-grade presentation',
    alt: 'Deluxe Boxed Edition action figure',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'deluxe_boxed',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  vintageCardback: {
    url: 'https://images.pexels.com/photos/8345972/pexels-photo-8345972.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Vintage Cardback - Retro 80s-90s style carded figure with nostalgic design elements and vintage aesthetics',
    alt: 'Vintage Cardback action figure',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'vintage_cardback',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/8345972/pexels-photo-8345972.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  collectorsDisplay: {
    url: 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: "Collector's Display Case - Museum-quality clear acrylic display case with premium presentation and LED lighting",
    alt: "Collector's Display Case action figure",
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'collectors_display',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  tradingCard: {
    url: 'https://images.pexels.com/photos/7241628/pexels-photo-7241628.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Collectible Trading Card - Holographic foil card with character stats, abilities, and premium finish',
    alt: 'Collectible Trading Card',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'trading_card',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/7241628/pexels-photo-7241628.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  twoPackBattle: {
    url: 'https://images.pexels.com/photos/8346904/pexels-photo-8346904.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: '2-Pack Battle Set - Double figure packaging showing teamwork edition with complementary poses',
    alt: '2-Pack Battle Set action figures',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'two_pack_battle',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/8346904/pexels-photo-8346904.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  bobblehead: {
    url: 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Desktop Bobblehead - Fun office desk bobblehead with oversized head and spring mechanism',
    alt: 'Desktop Bobblehead figure',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'bobblehead',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  vinylPop: {
    url: 'https://images.pexels.com/photos/17023172/pexels-photo-17023172/free-photo-of-a-barbie-toy-on-a-sofa.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Vinyl Collectible - Stylized vinyl figure with simplified features, oversized head, and square window box',
    alt: 'Vinyl Collectible figure',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'vinyl_pop',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/17023172/pexels-photo-17023172/free-photo-of-a-barbie-toy-on-a-sofa.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  buildableSet: {
    url: 'https://images.pexels.com/photos/6601811/pexels-photo-6601811.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Buildable Mini Figure - Brick-compatible modular mini figure with building blocks and accessories',
    alt: 'Buildable Mini Figure set',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'buildable_set',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/6601811/pexels-photo-6601811.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  actionRoleplay: {
    url: 'https://images.pexels.com/photos/6615294/pexels-photo-6615294.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: "Roleplaying Set - Children's costume and roleplay accessories with hanging blister card packaging",
    alt: 'Roleplaying Set accessories',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'action_roleplay',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/6615294/pexels-photo-6615294.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  digitalAvatar: {
    url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Digital Game Character - Video game character selection screen with stats and customization UI',
    alt: 'Digital Game Character avatar',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'digital_avatar',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  chibiStyle: {
    url: 'https://images.pexels.com/photos/1670044/pexels-photo-1670044.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Chibi Art Style - Cute Japanese chibi style with super-deformed body and oversized head',
    alt: 'Chibi Art Style figure',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'chibi_style',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/1670044/pexels-photo-1670044.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  legoMinifig: {
    url: 'https://images.pexels.com/photos/6498998/pexels-photo-6498998.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Building Block Minifigure - LEGO-style minifigure with cylindrical head and blocky body design',
    alt: 'Building Block Minifigure',
    dimensions: '600x600',
    section: 'action-figures',
    slot: 'lego_minifig',
    component: 'src/data/actionFigureTemplates.ts',
    currentUrl: 'https://images.pexels.com/photos/6498998/pexels-photo-6498998.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
};

/**
 * ACTION FIGURE SHOWCASE CAROUSEL
 * Personalized action figure examples for carousel display
 */
export const actionFigureCarousel: Record<string, ImageAsset> = {
  carousel1: {
    url: 'https://images.pexels.com/photos/6615294/pexels-photo-6615294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized AI Collectible Card - Trading card with holographic design and personalized character stats',
    alt: 'Personalized AI Collectible Card',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_1',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/6615294/pexels-photo-6615294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  carousel2: {
    url: 'https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized Boxed Toy Mockup - Ultra-detailed action figure in collectors packaging with custom name',
    alt: 'Personalized Boxed Toy Mockup',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_2',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/12211/pexels-photo-12211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  carousel3: {
    url: 'https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized 3D Character - 360° view of fully personalized action figure with custom details',
    alt: 'Personalized 3D Character',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_3',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  carousel4: {
    url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized Game Character - Custom fighter selection screen with personalized name and stats',
    alt: 'Personalized Game Character',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_4',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  carousel5: {
    url: 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized Vinyl Figure - Custom vinyl collectible with unique personalized features and name',
    alt: 'Personalized Vinyl Figure',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_5',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  carousel6: {
    url: 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized Mecha Figure - Customized robotic action figure with name on display base',
    alt: 'Personalized Mecha Figure',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_6',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  carousel7: {
    url: 'https://images.pexels.com/photos/17023172/pexels-photo-17023172/free-photo-of-a-barbie-toy-on-a-sofa.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized Fashion Doll - Custom fashion doll with personalized packaging and accessories',
    alt: 'Personalized Fashion Doll',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_7',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/17023172/pexels-photo-17023172/free-photo-of-a-barbie-toy-on-a-sofa.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  carousel8: {
    url: 'https://images.pexels.com/photos/8346904/pexels-photo-8346904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized Superhero Pack - Custom superhero action figure with personalized collectible box',
    alt: 'Personalized Superhero Pack',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_8',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/8346904/pexels-photo-8346904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  carousel9: {
    url: 'https://images.pexels.com/photos/6498998/pexels-photo-6498998.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized Brand Mascot - Custom brand mascot figure with company name and logo',
    alt: 'Personalized Brand Mascot',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_9',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/6498998/pexels-photo-6498998.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  carousel10: {
    url: 'https://images.pexels.com/photos/6601811/pexels-photo-6601811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized Character Box - Custom character with personalized name in design and packaging',
    alt: 'Personalized Character Box',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_10',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/6601811/pexels-photo-6601811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  carousel11: {
    url: 'https://images.pexels.com/photos/1670044/pexels-photo-1670044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized Prize Toy - Custom prize figure with personalized name and story card',
    alt: 'Personalized Prize Toy',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_11',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/1670044/pexels-photo-1670044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  carousel12: {
    url: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized Retro Game Box - Custom video game character box with personalized hero name',
    alt: 'Personalized Retro Game Box',
    dimensions: '1260x750',
    section: 'action-figure-carousel',
    slot: 'carousel_12',
    component: 'src/components/ActionFigureCarousel.tsx',
    currentUrl: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
};

/**
 * FEATURE SHOWCASE SECTION IMAGES
 * Main feature displays for AI Creative Studio capabilities
 */
export const featureShowcaseImages: Record<string, ImageAsset> = {
  aiStudio: {
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&crop=center',
    description: 'AI Creative Studio Interface - Professional editor workspace showing design tools, personalization tokens, and AI generation capabilities',
    alt: 'AI Creative Studio Interface',
    dimensions: '800x600',
    section: 'features',
    slot: 'ai_studio',
    component: 'src/components/FeatureShowcase.tsx',
    currentUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&crop=center'
  },
  tokensPanel: {
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    description: 'Personalization Tokens Panel - Interface showing token management, drag-and-drop functionality, and dynamic content system',
    alt: 'Personalization Tokens Panel',
    dimensions: '800x600',
    section: 'features',
    slot: 'tokens_panel',
    component: 'src/components/FeatureShowcase.tsx',
    currentUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center'
  },
  supabaseIntegration: {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
    description: 'Supabase Backend Dashboard - Real-time database interface with edge functions, authentication, and secure API endpoints',
    alt: 'Supabase Backend Integration',
    dimensions: '800x600',
    section: 'features',
    slot: 'supabase_integration',
    component: 'src/components/FeatureShowcase.tsx',
    currentUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center'
  },
  pwaFeatures: {
    url: 'data:image/svg+xml;base64,...',
    description: 'PWA Features & Offline Support - Progressive Web App capabilities with service worker, offline mode, and native installation',
    alt: 'PWA Features & Offline Support',
    dimensions: '800x600',
    section: 'features',
    slot: 'pwa_features',
    component: 'src/components/FeatureShowcase.tsx',
    currentUrl: 'data:image/svg+xml;base64,...'
  },
  backgroundPattern: {
    url: 'https://images.pexels.com/photos/370799/pexels-photo-370799.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Abstract technology background pattern - Subtle digital texture for feature showcase section',
    alt: 'Technology background pattern',
    dimensions: '1260x750',
    section: 'features',
    slot: 'background',
    component: 'src/components/FeatureShowcase.tsx',
    currentUrl: 'https://images.pexels.com/photos/370799/pexels-photo-370799.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
};

/**
 * ACTION FIGURE SHOWCASE SECTION
 * Gallery thumbnails for AI Creative Studio features
 */
export const actionFigureShowcaseImages: Record<string, ImageAsset> = {
  aiImageGen: {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop&crop=center',
    description: 'AI Image Generation feature thumbnail - Shows AI-powered image creation capabilities',
    alt: 'AI Image Generation',
    dimensions: '100x100',
    section: 'action-figure-showcase',
    slot: 'gallery_ai_image',
    component: 'src/components/ActionFigureShowcase.tsx',
    currentUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop&crop=center'
  },
  actionFigures: {
    url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&fit=crop&crop=center',
    description: 'Action Figures feature thumbnail - Shows personalized action figure creation',
    alt: 'Action Figures',
    dimensions: '100x100',
    section: 'action-figure-showcase',
    slot: 'gallery_action_figures',
    component: 'src/components/ActionFigureShowcase.tsx',
    currentUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&fit=crop&crop=center'
  },
  ghibliStyle: {
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&h=100&fit=crop&crop=center',
    description: 'Ghibli Style feature thumbnail - Shows whimsical anime-inspired art generation',
    alt: 'Ghibli Style',
    dimensions: '100x100',
    section: 'action-figure-showcase',
    slot: 'gallery_ghibli',
    component: 'src/components/ActionFigureShowcase.tsx',
    currentUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&h=100&fit=crop&crop=center'
  },
  aiMemes: {
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop&crop=center',
    description: 'AI Memes feature thumbnail - Shows personalized meme generation capability',
    alt: 'AI Memes',
    dimensions: '100x100',
    section: 'action-figure-showcase',
    slot: 'gallery_memes',
    component: 'src/components/ActionFigureShowcase.tsx',
    currentUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop&crop=center'
  },
  emailEditor: {
    url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&fit=crop&crop=center',
    description: 'Email Editor feature thumbnail - Shows email template personalization interface',
    alt: 'Email Editor',
    dimensions: '100x100',
    section: 'action-figure-showcase',
    slot: 'gallery_email',
    component: 'src/components/ActionFigureShowcase.tsx',
    currentUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=100&h=100&fit=crop&crop=center'
  },
  videoConvert: {
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&h=100&fit=crop&crop=center',
    description: 'Video Converter feature thumbnail - Shows image-to-video conversion capability',
    alt: 'Video Converter',
    dimensions: '100x100',
    section: 'action-figure-showcase',
    slot: 'gallery_video',
    component: 'src/components/ActionFigureShowcase.tsx',
    currentUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&h=100&fit=crop&crop=center'
  },
  referenceOriginal: {
    url: 'https://images.pexels.com/photos/3220360/pexels-photo-3220360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Reference Upload Original Image - Shows original reference photo before personalization',
    alt: 'Original Reference Image',
    dimensions: '1260x750',
    section: 'action-figure-showcase',
    slot: 'reference_original',
    component: 'src/components/ActionFigureShowcase.tsx',
    currentUrl: 'https://images.pexels.com/photos/3220360/pexels-photo-3220360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  referencePersonalized: {
    url: 'https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Personalized Result Image - Shows AI-generated personalized result after processing',
    alt: 'Personalized Result Image',
    dimensions: '1260x750',
    section: 'action-figure-showcase',
    slot: 'reference_personalized',
    component: 'src/components/ActionFigureShowcase.tsx',
    currentUrl: 'https://images.pexels.com/photos/5004872/pexels-photo-5004872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
};

/**
 * Utility function to get image asset by section and slot
 */
export function getImageAsset(section: string, slot: string): ImageAsset | undefined {
  const allImages = {
    ...heroImages,
    ...benefitsImages,
    ...howItWorksImages,
    ...templatesShowcaseImages,
    ...testimonialsImages,
    ...actionFigureTemplates,
    ...actionFigureCarousel,
    ...featureShowcaseImages,
    ...actionFigureShowcaseImages
  };

  return Object.values(allImages).find(
    img => img.section === section && img.slot === slot
  );
}

/**
 * Utility function to update image URL
 */
export function updateImageUrl(section: string, slot: string, newUrl: string): boolean {
  const asset = getImageAsset(section, slot);
  if (asset) {
    asset.url = newUrl;
    return true;
  }
  return false;
}

/**
 * Export all image assets as a flat array for easy iteration
 */
export const allImageAssets: ImageAsset[] = [
  ...Object.values(heroImages),
  ...Object.values(benefitsImages),
  ...Object.values(howItWorksImages),
  ...Object.values(templatesShowcaseImages),
  ...Object.values(testimonialsImages),
  ...Object.values(actionFigureTemplates),
  ...Object.values(actionFigureCarousel),
  ...Object.values(featureShowcaseImages),
  ...Object.values(actionFigureShowcaseImages)
];
