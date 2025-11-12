# Image Replacement Quick Start Guide

This guide helps you replace the placeholder images in your VideoRemix application with your custom images.

## Quick Reference

**Total Images**: 51 unique assets across 8 categories

**Main Categories**:
- Hero Section (1 image)
- How It Works (1 image)
- Templates Showcase (6 images)
- Testimonials (5 images)
- Action Figure Templates (13 images) ⭐
- Action Figure Carousel (12 images) ⭐
- Feature Showcase (5 images)
- Gallery Thumbnails (8 images)

## Method 1: Direct URL Replacement (Recommended)

### Step 1: Locate Your Image in the Mapping

Open `IMAGE_MAPPING.md` and find your target image. For example:

```markdown
### 1. Classic Blister Pack
- **Current URL**: `https://images.pexels.com/photos/12211/...`
- **Section**: `action-figures`
- **Slot**: `classic_blister`
- **Template ID**: `classic-blister`
- **Replacement URL**: _[Your custom image URL here]_
```

### Step 2: Update in Code

Open `src/constants/imageAssets.ts` and find the matching entry:

```typescript
classicBlister: {
  url: 'https://images.pexels.com/photos/12211/...',  // Replace this
  description: 'Classic Blister Pack...',
  // ... rest of config
}
```

Replace the `url` value with your custom URL:

```typescript
classicBlister: {
  url: '01_Classic_Action_Figure_Modern_Glassmorphism.png',  // Your image
  description: 'Classic Blister Pack...',
  // ... rest of config
}
```

## Method 2: Programmatic Replacement

### Using the Utility Functions

```typescript
import { replaceSingleImage, replaceMultipleImages } from '@/utils/imageReplacer';

// Replace a single image
replaceSingleImage('action-figures', 'classic_blister',
  '01_Classic_Action_Figure_Modern_Glassmorphism.png');

// Replace multiple images at once
replaceMultipleImages([
  {
    section: 'action-figures',
    slot: 'classic_blister',
    url: '01_Classic_Action_Figure_Modern_Glassmorphism.png'
  },
  {
    section: 'action-figures',
    slot: 'deluxe_boxed',
    url: '02_Deluxe_Boxed_Premium.png'
  },
  {
    section: 'hero',
    slot: 'main_image',
    url: 'https://cdn1.genspark.ai/user-upload-image/gemini_generated/hero.png'
  }
]);
```

## Method 3: JSON Batch Import

### Step 1: Create a JSON file with your replacements

Create `my-images.json`:

```json
{
  "replacements": [
    {
      "section": "action-figures",
      "slot": "classic_blister",
      "url": "01_Classic_Action_Figure_Modern_Glassmorphism.png",
      "description": "Custom classic blister pack"
    },
    {
      "section": "action-figures",
      "slot": "deluxe_boxed",
      "url": "https://cdn1.genspark.ai/your-image-id.png",
      "description": "Custom deluxe boxed edition"
    }
  ]
}
```

### Step 2: Load and apply

```typescript
import { loadReplacementsFromJson } from '@/utils/imageReplacer';
import replacements from './my-images.json';

const result = await loadReplacementsFromJson(replacements);
console.log(`Success: ${result.success}, Failed: ${result.failed}`);
```

## Common Use Cases

### Replace All Action Figure Templates

```typescript
const actionFigureReplacements = [
  { section: 'action-figures', slot: 'classic_blister', url: '01_Classic.png' },
  { section: 'action-figures', slot: 'deluxe_boxed', url: '02_Deluxe.png' },
  { section: 'action-figures', slot: 'vintage_cardback', url: '03_Vintage.png' },
  { section: 'action-figures', slot: 'collectors_display', url: '04_Collector.png' },
  { section: 'action-figures', slot: 'trading_card', url: '05_Trading.png' },
  { section: 'action-figures', slot: 'two_pack_battle', url: '06_TwoPack.png' },
  { section: 'action-figures', slot: 'bobblehead', url: '07_Bobblehead.png' },
  { section: 'action-figures', slot: 'vinyl_pop', url: '08_Vinyl.png' },
  { section: 'action-figures', slot: 'buildable_set', url: '09_Buildable.png' },
  { section: 'action-figures', slot: 'action_roleplay', url: '10_Roleplay.png' },
  { section: 'action-figures', slot: 'digital_avatar', url: '11_Digital.png' },
  { section: 'action-figures', slot: 'chibi_style', url: '12_Chibi.png' },
  { section: 'action-figures', slot: 'lego_minifig', url: '13_Lego.png' }
];

replaceMultipleImages(actionFigureReplacements);
```

### Replace Hero and Feature Images

```typescript
const mainImages = [
  {
    section: 'hero',
    slot: 'main_image',
    url: 'https://cdn1.genspark.ai/.../hero-main.png'
  },
  {
    section: 'features',
    slot: 'ai_studio',
    url: 'https://cdn1.genspark.ai/.../ai-studio.png'
  },
  {
    section: 'features',
    slot: 'tokens_panel',
    url: 'https://cdn1.genspark.ai/.../tokens.png'
  }
];

replaceMultipleImages(mainImages);
```

### Convert Local Filenames to CDN URLs

```typescript
import { convertToFullUrl, replaceMultipleImages } from '@/utils/imageReplacer';

const localFiles = [
  '01_Classic_Action_Figure.png',
  '02_Deluxe_Boxed.png',
  '03_Vintage_Cardback.png'
];

const cdnBase = 'https://cdn1.genspark.ai/user-upload-image/gemini_generated/';

const replacements = localFiles.map((filename, index) => ({
  section: 'action-figures',
  slot: ['classic_blister', 'deluxe_boxed', 'vintage_cardback'][index],
  url: convertToFullUrl(filename, cdnBase)
}));

replaceMultipleImages(replacements);
```

## Image Specifications

### Required Dimensions by Category

| Category | Dimensions | Aspect Ratio | Notes |
|----------|-----------|--------------|-------|
| Hero | 800x600+ | 4:3 | High quality, main landing image |
| Action Figure Templates | 600x600 | 1:1 | Square thumbnails, consistent sizing |
| Carousel | 1260x750 | 16:9 | Widescreen format for slides |
| Testimonials | 600x600 | 1:1 | Professional headshots |
| Gallery Thumbnails | 100x100 | 1:1 | Small icons |
| Templates | 1260x750 | 16:10 | Marketing template previews |
| Feature Showcase | 800x600 | 4:3 | Feature screenshots |
| Backgrounds | 1260x750+ | 16:10+ | Used at low opacity |

### File Format Recommendations

- **Primary Format**: PNG (supports transparency)
- **Alternative**: JPEG (smaller file size for photos)
- **WebP**: Recommended for modern browsers (better compression)
- **SVG**: For icons and logos only

### Naming Convention

Use descriptive names that match your content:

✅ **Good Examples**:
- `01_Classic_Action_Figure_Modern_Glassmorphism.png`
- `hero_ai_studio_interface_v2.png`
- `testimonial_john_smith_headshot.jpg`

❌ **Avoid**:
- `image1.png`
- `IMG_0234.jpg`
- `Untitled.png`

## URL Formats Supported

### Full CDN URLs
```
https://cdn1.genspark.ai/user-upload-image/gemini_generated/8504d092-5a7c-4620-8570-25c62ef34aec.png
```

### Relative Paths
```
/images/action-figures/01_Classic.png
./assets/hero-main.png
```

### Local Filenames (auto-converted to CDN)
```
01_Classic_Action_Figure_Modern_Glassmorphism.png
```

## Validation

### Check URL Format

```typescript
import { validateImageUrl } from '@/utils/imageReplacer';

const isValid = validateImageUrl('01_Classic.png');
console.log(isValid); // true or false
```

### Validate All Images

```typescript
import { validateAllImages } from '@/utils/imageReplacer';

const validation = validateAllImages();
const invalid = validation.filter(v => !v.isValid);
console.log('Invalid images:', invalid);
```

## Search and Discovery

### Find Images by Description

```typescript
import { searchImages } from '@/utils/imageReplacer';

// Find all action figure related images
const actionFigures = searchImages('action figure');

// Find all carousel images
const carouselImages = searchImages('carousel');

// Find specific packaging type
const blisterPacks = searchImages('blister pack');
```

### Get Images by Section

```typescript
import { getImagesBySection } from '@/utils/imageReplacer';

const heroImages = getImagesBySection('hero');
const testimonialImages = getImagesBySection('testimonials');
const actionFigureTemplates = getImagesBySection('action-figures');
```

### Get Statistics

```typescript
import { getImageStats } from '@/utils/imageReplacer';

const stats = getImageStats();
console.log('Total images:', stats.total);
console.log('By section:', stats.bySections);
console.log('By dimensions:', stats.byDimensions);
```

## Troubleshooting

### Image Not Displaying

1. **Check URL format**: Ensure it's a valid URL or path
2. **Check file extension**: Must be .jpg, .jpeg, .png, .gif, .webp, or .svg
3. **Check CORS**: If using external CDN, ensure CORS is configured
4. **Check file exists**: Verify the file is accessible at the URL

### Image Shows But Wrong Size

1. **Check dimensions**: Use recommended dimensions for each category
2. **Check aspect ratio**: Maintain proper aspect ratios (listed above)
3. **Check CSS**: Component may have fixed dimensions

### Bulk Import Failed

```typescript
const result = replaceMultipleImages(replacements);

if (result.failed > 0) {
  console.log('Errors:', result.errors);
  // Fix the errored entries and retry
}
```

## Priority Replacement Order

Recommended order based on visual impact:

1. **High Priority** (Most visible):
   - Hero main image
   - Action Figure Carousel (12 slides)
   - Action Figure Templates (13 styles)

2. **Medium Priority**:
   - Feature Showcase (4 features)
   - Templates (6 thumbnails)
   - Testimonials (5 headshots)

3. **Low Priority** (Less visible):
   - Background patterns
   - Small gallery thumbnails

## Export Current Configuration

```typescript
import { exportImageConfiguration } from '@/utils/imageReplacer';

const currentImages = exportImageConfiguration();
console.log(JSON.stringify(currentImages, null, 2));

// Save to file or send to API
```

## Generate Replacement Template

```typescript
import { generateReplacementTemplate } from '@/utils/imageReplacer';

const template = generateReplacementTemplate();
console.log(JSON.stringify(template, null, 2));

// This creates a JSON file with all images and empty URL fields
// Fill in the URLs and import back
```

## Best Practices

1. **Test Locally First**: Replace a few images and verify they display correctly
2. **Use CDN**: Host images on a CDN for better performance
3. **Optimize Images**: Compress images before uploading
4. **Consistent Naming**: Use clear, descriptive filenames
5. **Keep Backups**: Save original URLs before replacing
6. **Batch Updates**: Use JSON import for multiple replacements
7. **Version Control**: Track image URL changes in git

## Need Help?

- Full documentation: `IMAGE_MAPPING.md`
- JSON reference: `image-mapping.json`
- Code examples: `src/utils/imageReplacer.ts`
- TypeScript types: `src/constants/imageAssets.ts`
