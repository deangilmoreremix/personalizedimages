export interface Font {
  family: string;
  category: FontCategory;
  variants?: string[];
  fallback?: string;
  displayName?: string;
}

export type FontCategory = 
  | 'sans-serif'
  | 'serif'
  | 'monospace'
  | 'display'
  | 'handwriting'
  | 'decorative';

// Comprehensive font collection with Google Fonts integration
export const FONTS: Font[] = [
  // Sans-Serif Fonts
  { family: 'Inter', category: 'sans-serif', variants: ['400', '500', '600', '700'], fallback: 'sans-serif' },
  { family: 'Roboto', category: 'sans-serif', variants: ['300', '400', '500', '700'], fallback: 'sans-serif' },
  { family: 'Open Sans', category: 'sans-serif', variants: ['300', '400', '600', '700'], fallback: 'sans-serif' },
  { family: 'Poppins', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], fallback: 'sans-serif' },
  { family: 'Montserrat', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], fallback: 'sans-serif' },
  { family: 'Lato', category: 'sans-serif', variants: ['300', '400', '700', '900'], fallback: 'sans-serif' },
  { family: 'Raleway', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], fallback: 'sans-serif' },
  { family: 'Nunito', category: 'sans-serif', variants: ['300', '400', '600', '700'], fallback: 'sans-serif' },
  { family: 'Source Sans Pro', category: 'sans-serif', variants: ['300', '400', '600', '700'], fallback: 'sans-serif' },
  { family: 'Work Sans', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], fallback: 'sans-serif' },
  
  // Serif Fonts
  { family: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'serif' },
  { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700'], fallback: 'serif' },
  { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'], fallback: 'serif' },
  { family: 'PT Serif', category: 'serif', variants: ['400', '700'], fallback: 'serif' },
  { family: 'Noto Serif', category: 'serif', variants: ['400', '700'], fallback: 'serif' },
  { family: 'Source Serif Pro', category: 'serif', variants: ['400', '600', '700'], fallback: 'serif' },
  { family: 'Georgia', category: 'serif', fallback: 'serif' },
  { family: 'Times New Roman', category: 'serif', fallback: 'serif', displayName: 'Times New Roman' },
  
  // Monospace Fonts
  { family: 'JetBrains Mono', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'monospace' },
  { family: 'Fira Code', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'monospace' },
  { family: 'Roboto Mono', category: 'monospace', variants: ['300', '400', '500', '700'], fallback: 'monospace' },
  { family: 'Source Code Pro', category: 'monospace', variants: ['400', '500', '600', '700'], fallback: 'monospace' },
  { family: 'IBM Plex Mono', category: 'monospace', variants: ['300', '400', '500', '600', '700'], fallback: 'monospace' },
  { family: 'Courier New', category: 'monospace', fallback: 'monospace', displayName: 'Courier New' },
  { family: 'Consolas', category: 'monospace', fallback: 'monospace' },
  
  // Display Fonts
  { family: 'Bebas Neue', category: 'display', variants: ['400'], fallback: 'sans-serif' },
  { family: 'Anton', category: 'display', variants: ['400'], fallback: 'sans-serif' },
  { family: 'Oswald', category: 'display', variants: ['300', '400', '500', '600', '700'], fallback: 'sans-serif' },
  { family: 'Alfa Slab One', category: 'display', variants: ['400'], fallback: 'serif' },
  { family: 'Staatliches', category: 'display', variants: ['400'], fallback: 'sans-serif' },
  { family: 'Righteous', category: 'display', variants: ['400'], fallback: 'sans-serif' },
  { family: 'Changa One', category: 'display', variants: ['400'], fallback: 'sans-serif' },
  { family: 'Teko', category: 'display', variants: ['300', '400', '500', '600', '700'], fallback: 'sans-serif' },
  
  // Handwriting Fonts
  { family: 'Caveat', category: 'handwriting', variants: ['400', '500', '600', '700'], fallback: 'cursive' },
  { family: 'Permanent Marker', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
  { family: 'Pacifico', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
  { family: 'Dancing Script', category: 'handwriting', variants: ['400', '500', '600', '700'], fallback: 'cursive' },
  { family: 'Gloria Hallelujah', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
  { family: 'Indie Flower', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
  { family: 'Shadows Into Light', category: 'handwriting', variants: ['400'], fallback: 'cursive' },
  
  // Decorative Fonts
  { family: 'Lobster', category: 'decorative', variants: ['400'], fallback: 'cursive' },
  { family: 'Bangers', category: 'decorative', variants: ['400'], fallback: 'cursive' },
  { family: 'Bungee Shade', category: 'decorative', variants: ['400'], fallback: 'cursive' },
  { family: 'Fredoka One', category: 'decorative', variants: ['400'], fallback: 'cursive' },
  { family: 'Press Start 2P', category: 'decorative', variants: ['400'], fallback: 'cursive' },
  { family: 'Creepster', category: 'decorative', variants: ['400'], fallback: 'cursive' },
  { family: 'Black Ops One', category: 'decorative', variants: ['400'], fallback: 'cursive' },
  
  // Web-safe Fonts
  { family: 'Arial', category: 'sans-serif', fallback: 'sans-serif' },
  { family: 'Verdana', category: 'sans-serif', fallback: 'sans-serif' },
  { family: 'Helvetica', category: 'sans-serif', fallback: 'sans-serif' },
  { family: 'Tahoma', category: 'sans-serif', fallback: 'sans-serif' },
  { family: 'Trebuchet MS', category: 'sans-serif', fallback: 'sans-serif', displayName: 'Trebuchet MS' },
  { family: 'Impact', category: 'display', fallback: 'sans-serif' },
  
  // Meme Fonts
  { family: 'Impact', category: 'display', fallback: 'sans-serif', displayName: 'Impact (Meme)' },
  { family: 'Comic Sans MS', category: 'handwriting', fallback: 'cursive', displayName: 'Comic Sans MS' },
];

// Get fonts by category
export function getFontsByCategory(category: FontCategory): Font[] {
  return FONTS.filter(font => font.category === category);
}

// Get all available categories
export function getFontCategories(): FontCategory[] {
  return [...new Set(FONTS.map(font => font.category))];
}

// Generate URL for loading Google Fonts
function generateGoogleFontsUrl(fonts: Font[]): string {
  // Filter out web-safe fonts (they don't need to be loaded from Google)
  const webSafeFonts = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS'];
  
  const googleFonts = fonts.filter(font => !webSafeFonts.includes(font.family));
  
  if (googleFonts.length === 0) return '';
  
  const fontFamilies = googleFonts.map(font => {
    const familyName = font.family.replace(/\s+/g, '+');
    if (font.variants && font.variants.length > 0) {
      return `${familyName}:${font.variants.join(',')}`;
    }
    return familyName;
  });
  
  return `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f}`).join('&')}&display=swap`;
}

// Get font display name
export function getFontDisplayName(font: Font): string {
  return font.displayName || font.family;
}

// Function to group fonts by category for UI organization
function groupFontsByCategory(): Record<FontCategory, Font[]> {
  const groupedFonts: Partial<Record<FontCategory, Font[]>> = {};
  
  FONTS.forEach(font => {
    if (!groupedFonts[font.category]) {
      groupedFonts[font.category] = [];
    }
    
    groupedFonts[font.category]?.push(font);
  });
  
  return groupedFonts as Record<FontCategory, Font[]>;
}

// Get web-safe font stack
function getFontStack(fontFamily: string): string {
  const font = FONTS.find(f => f.family === fontFamily);
  if (!font) return `"${fontFamily}", sans-serif`;
  
  return `"${font.family}", ${font.fallback}`;
}