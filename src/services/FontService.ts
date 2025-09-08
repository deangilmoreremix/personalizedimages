import { FONTS, Font, FontCategory } from '../types/fonts';

// Initialize loaded fonts tracking
let loadedFonts = new Set<string>();

// Web-safe fonts that don't need to be loaded
const WEB_SAFE_FONTS = [
  'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 
  'Courier New', 'Georgia', 'Tahoma', 'Trebuchet MS', 
  'Impact', 'Comic Sans MS'
];

// Font packages available through @fontsource
const FONTSOURCE_PACKAGES = [
  'inter', 'roboto', 'open-sans', 'montserrat', 'lato', 'raleway', 'oswald',
  'playfair-display', 'source-sans-3', 'poppins', 'nunito',
  'jetbrains-mono', 'fira-code', 'roboto-mono', 'ibm-plex-mono',
  'merriweather', 'lora', 'pt-serif',
  'caveat', 'dancing-script', 'pacifico', 'permanent-marker', 'shadows-into-light',
  'bebas-neue', 'anton', 'alfa-slab-one', 'lobster'
];

// Variable fonts available through @fontsource-variable packages
const VARIABLE_FONTS = [
  'inter', 'montserrat', 'open-sans', 'oswald', 'playfair-display', 'roboto', 'source-sans-3'
];

/**
 * Check if a font is available via @fontsource package
 */
function hasFontsourcePackage(fontFamily: string): boolean {
  const normalizedName = fontFamily.toLowerCase().replace(/\s+/g, '-');
  return FONTSOURCE_PACKAGES.includes(normalizedName);
}

/**
 * Check if a font is available as a variable font via @fontsource-variable package
 */
function hasVariableFontPackage(fontFamily: string): boolean {
  const normalizedName = fontFamily.toLowerCase().replace(/\s+/g, '-');
  return VARIABLE_FONTS.includes(normalizedName);
}

/**
 * Loads a font dynamically if it's not already loaded
 */
export async function loadFont(fontFamily: string): Promise<boolean> {
  // Skip if font is already loaded or is web-safe
  if (loadedFonts.has(fontFamily) || WEB_SAFE_FONTS.includes(fontFamily)) {
    return true;
  }

  try {
    const font = FONTS.find(f => f.family === fontFamily);
    if (!font) {
      console.warn(`Font "${fontFamily}" not found in font registry`);
      return false;
    }

    // Normalize font name for package imports
    const normalizedName = fontFamily.toLowerCase().replace(/\s+/g, '-');
    
    // First attempt to load via @fontsource package
    if (hasVariableFontPackage(fontFamily)) {
      try {
        // For variable fonts
        console.log(`Loading variable font: ${fontFamily}`);
        await import(/* @vite-ignore */ `@fontsource-variable/${normalizedName}`);
        loadedFonts.add(fontFamily);
        console.log(`✅ Loaded variable font ${fontFamily} from @fontsource-variable package`);
        return true;
      } catch (importError) {
        console.warn(`⚠️ Could not load variable font ${fontFamily}, trying standard package`);
      }
    }
    
    if (hasFontsourcePackage(fontFamily)) {
      try {
        // For standard fonts
        console.log(`Loading standard font: ${fontFamily}`);
        await import(/* @vite-ignore */ `@fontsource/${normalizedName}`);
        loadedFonts.add(fontFamily);
        console.log(`✅ Loaded font ${fontFamily} from @fontsource package`);
        return true;
      } catch (importError) {
        console.warn(`⚠️ Could not load font ${fontFamily} from @fontsource package`);
      }
    }
    
    // Fallback to Google Fonts API if package loading failed
    console.log(`Attempting to load ${fontFamily} from Google Fonts`);
    
    return new Promise((resolve) => {
      // Check if the font link is already in the document
      const existingLink = document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`);
      if (existingLink) {
        loadedFonts.add(fontFamily);
        console.log(`✅ Font ${fontFamily} already loaded via HTML link`);
        resolve(true);
        return;
      }
      
      // Create a new link element
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      // Handle successful load
      link.onload = () => {
        loadedFonts.add(fontFamily);
        console.log(`✅ Loaded font ${fontFamily} from Google Fonts`);
        resolve(true);
      };
      
      // Handle loading error
      link.onerror = () => {
        console.error(`❌ Failed to load font ${fontFamily} from Google Fonts`);
        // Use a system fallback font instead
        const fallbackFont = FONTS.find(f => f.family === fontFamily)?.fallback || 'sans-serif';
        console.log(`⚠️ Using system fallback: ${fallbackFont}`);
        
        // Still resolve, but indicate failure
        resolve(false);
      };
      
      // Set a timeout to avoid hanging forever
      setTimeout(() => {
        if (!loadedFonts.has(fontFamily)) {
          console.warn(`⏱️ Loading timeout for ${fontFamily}, using system fallback`);
          resolve(false);
        }
      }, 3000);
    });
  } catch (error) {
    console.error(`Error loading font ${fontFamily}:`, error);
    return false;
  }
}

/**
 * Loads multiple fonts at once
 */
export async function loadFonts(fontFamilies: string[]): Promise<boolean[]> {
  // Filter out fonts that are already loaded or web-safe
  const fontsToLoad = fontFamilies.filter(
    font => !loadedFonts.has(font) && !WEB_SAFE_FONTS.includes(font)
  );
  
  if (fontsToLoad.length === 0) return Promise.resolve([]);
  
  const results = await Promise.all(
    fontsToLoad.map(font => loadFont(font))
  );
  return results;
}

/**
 * Check if a font is already loaded
 */
export function isFontLoaded(fontFamily: string): boolean {
  // Web-safe fonts are always considered loaded
  if (WEB_SAFE_FONTS.includes(fontFamily)) return true;
  
  return loadedFonts.has(fontFamily);
}

/**
 * Preload common fonts used throughout the application
 */
export function preloadCommonFonts(): void {
  const essentialFonts = [
    'Inter', // UI base font
    'Roboto', // Common UI alternative
    'Open Sans', // Another common UI font
    'Poppins', // Popular modern font
    'Impact', // For memes
    'Montserrat', // Popular for headings
    'Lato' // Clean, versatile font
  ];
  
  console.log('🔠 Preloading common fonts:', essentialFonts);
  loadFonts(essentialFonts).then(results => {
    const successCount = results.filter(Boolean).length;
    console.log(`✅ Successfully preloaded ${successCount}/${essentialFonts.length} common fonts`);
  });
}

/**
 * Preload fonts by category
 */
async function preloadFontCategory(category: FontCategory): Promise<void> {
  const fontsInCategory = FONTS.filter(font => font.category === category);
  const fontFamilies = fontsInCategory.map(font => font.family);
  await loadFonts(fontFamilies);
}

/**
 * Get list of all loaded fonts
 */
export function getLoadedFonts(): string[] {
  return [...loadedFonts];
}

/**
 * Generate font-face declarations for all available fonts
 * Used for creating a stylesheet with all font definitions
 */
function generateFontFaceDeclarations(): string {
  let css = '';
  
  FONTS.forEach(font => {
    if (WEB_SAFE_FONTS.includes(font.family)) return;
    
    // Basic font-face declaration
    css += `@font-face {
      font-family: "${font.family}";
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: local("${font.family}"), url("https://fonts.gstatic.com/s/${font.family.toLowerCase().replace(/\s+/g, '')}/v1/400.woff2") format("woff2");
    }\n`;
    
    // Bold version if available
    if (font.variants?.includes('700')) {
      css += `@font-face {
        font-family: "${font.family}";
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: local("${font.family} Bold"), local("${font.family}-Bold"), url("https://fonts.gstatic.com/s/${font.family.toLowerCase().replace(/\s+/g, '')}/v1/700.woff2") format("woff2");
      }\n`;
    }
  });
  
  return css;
}