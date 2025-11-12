# Quick Image Reference Card

Fast lookup for image replacement in VideoRemix application.

## 📁 Files Created

| File | Purpose |
|------|---------|
| `src/constants/imageAssets.ts` | Core image configuration (TypeScript) |
| `src/utils/imageReplacer.ts` | Utility functions for replacements |
| `IMAGE_MAPPING.md` | Full documentation (51 images) |
| `image-mapping.json` | Machine-readable mapping |
| `IMAGE_REPLACEMENT_GUIDE.md` | Step-by-step instructions |
| `IMAGE_SYSTEM_SUMMARY.md` | Complete system overview |

## 🎯 Quick Replacement Methods

### Method 1: Direct Edit
```typescript
// File: src/constants/imageAssets.ts
classicBlister: {
  url: '01_Classic_Action_Figure.png',  // ← Change this
  // ...
}
```

### Method 2: Programmatic
```typescript
import { replaceSingleImage } from '@/utils/imageReplacer';

replaceSingleImage('action-figures', 'classic_blister',
  '01_Classic_Action_Figure_Modern_Glassmorphism.png');
```

### Method 3: JSON Batch
```json
{
  "replacements": [
    {
      "section": "action-figures",
      "slot": "classic_blister",
      "url": "01_Classic.png"
    }
  ]
}
```

## 📊 Image Inventory (51 Total)

### Action Figure Templates (13) - Priority: HIGH
| Slot | Style Name | Current URL Ends With |
|------|-----------|----------------------|
| `classic_blister` | Classic Blister Pack | `12211/pexels...` |
| `deluxe_boxed` | Deluxe Boxed Edition | `5004872/pexels...` |
| `vintage_cardback` | Vintage Cardback | `8345972/pexels...` |
| `collectors_display` | Collector's Display | `2085831/pexels...` |
| `trading_card` | Trading Card | `7241628/pexels...` |
| `two_pack_battle` | 2-Pack Battle Set | `8346904/pexels...` |
| `bobblehead` | Desktop Bobblehead | `163036/mario...` |
| `vinyl_pop` | Vinyl Collectible | `17023172/barbie...` |
| `buildable_set` | Buildable Mini Figure | `6601811/pexels...` |
| `action_roleplay` | Roleplaying Set | `6615294/pexels...` |
| `digital_avatar` | Digital Game Character | `442576/pexels...` |
| `chibi_style` | Chibi Art Style | `1670044/pexels...` |
| `lego_minifig` | Building Block Minifigure | `6498998/pexels...` |

**Section**: `action-figures`
**Dimensions**: 600x600 (1:1)
**Component**: `src/data/actionFigureTemplates.ts`

### Carousel Images (12) - Priority: HIGH
| Slot | Description | Dimensions |
|------|-------------|------------|
| `carousel_1` to `carousel_12` | Personalized action figure variations | 1260x750 (16:9) |

**Section**: `action-figure-carousel`
**Component**: `src/components/ActionFigureCarousel.tsx`

### Hero Section (1) - Priority: HIGH
| Slot | Description | Dimensions |
|------|-------------|------------|
| `main_image` | AI Studio Interface | 800x600 (4:3) |

**Section**: `hero`
**Component**: `src/components/Hero.tsx`

### Templates (6) - Priority: MEDIUM
| Slot | Type | Dimensions |
|------|------|------------|
| `video_1`, `video_2`, `video_3` | Video templates | 1260x750 |
| `image_1`, `image_2`, `image_3` | Image templates | 1260x750 |

**Section**: `templates`
**Component**: `src/components/TemplatesShowcase.tsx`

### Testimonials (5) - Priority: MEDIUM
| Slot | Person | Role |
|------|--------|------|
| `user_1` | Charles Edgerton | Marketing Consultant |
| `user_2` | Mike Larouche | Agency Owner |
| `user_3` | Sarah Johnson | Internet Marketer |
| `user_4` | David Chen | E-commerce Director |
| `user_5` | Emily Rodriguez | Social Media Strategist |

**Section**: `testimonials`
**Dimensions**: 600x600 (1:1)
**Component**: `src/components/Testimonials.tsx`

### Feature Showcase (5) - Priority: MEDIUM
| Slot | Feature | Dimensions |
|------|---------|------------|
| `ai_studio` | AI Creative Studio | 800x600 |
| `tokens_panel` | Tokens Panel | 800x600 |
| `supabase_integration` | Supabase Backend | 800x600 |
| `pwa_features` | PWA Features | 800x600 |
| `background` | Background Pattern | 1260x750 |

**Section**: `features`
**Component**: `src/components/FeatureShowcase.tsx`

### Gallery Thumbnails (8) - Priority: LOW
| Slot | Feature | Dimensions |
|------|---------|------------|
| `gallery_ai_image` | AI Image Gen | 100x100 |
| `gallery_action_figures` | Action Figures | 100x100 |
| `gallery_ghibli` | Ghibli Style | 100x100 |
| `gallery_memes` | AI Memes | 100x100 |
| `gallery_email` | Email Editor | 100x100 |
| `gallery_video` | Video Convert | 100x100 |
| `reference_original` | Original Reference | 1260x750 |
| `reference_personalized` | Personalized Result | 1260x750 |

**Section**: `action-figure-showcase`
**Component**: `src/components/ActionFigureShowcase.tsx`

### Backgrounds (1) - Priority: LOW
| Slot | Description | Dimensions |
|------|-------------|------------|
| `background` | Tech pattern | 1260x750 |

**Section**: `how-it-works`
**Component**: `src/components/HowItWorks.tsx`

## 📐 Dimension Quick Reference

| Size | Aspect Ratio | Used For |
|------|--------------|----------|
| 100x100 | 1:1 | Small thumbnails |
| 600x600 | 1:1 | Action figures, testimonials |
| 800x600 | 4:3 | Hero, features |
| 1260x750 | 16:9 / 16:10 | Carousel, templates |

## 🔍 Finding Images

### By Section
```typescript
import { getImagesBySection } from '@/utils/imageReplacer';

const actionFigures = getImagesBySection('action-figures');
const heroImages = getImagesBySection('hero');
```

### By Description
```typescript
import { searchImages } from '@/utils/imageReplacer';

const blisterPacks = searchImages('blister pack');
const carousels = searchImages('carousel');
```

## ✅ Validation

```typescript
import { validateImageUrl } from '@/utils/imageReplacer';

const isValid = validateImageUrl('your-image.png');
```

## 🔧 Supported URL Formats

✅ **Full CDN**:
`https://cdn1.genspark.ai/user-upload-image/gemini_generated/8504d092.png`

✅ **Relative Path**:
`/images/action-figures/01_Classic.png`

✅ **Local Filename**:
`01_Classic_Action_Figure_Modern_Glassmorphism.png`

## 📝 Common Replacements

### Replace All 13 Action Figure Templates
```typescript
const templates = [
  'classic_blister', 'deluxe_boxed', 'vintage_cardback',
  'collectors_display', 'trading_card', 'two_pack_battle',
  'bobblehead', 'vinyl_pop', 'buildable_set',
  'action_roleplay', 'digital_avatar', 'chibi_style', 'lego_minifig'
];

templates.forEach((slot, i) => {
  replaceSingleImage('action-figures', slot, `${String(i+1).padStart(2,'0')}_${slot}.png`);
});
```

### Replace Hero Image
```typescript
replaceSingleImage('hero', 'main_image',
  'https://cdn1.genspark.ai/.../hero-main.png');
```

### Replace All Carousel
```typescript
for (let i = 1; i <= 12; i++) {
  replaceSingleImage('action-figure-carousel', `carousel_${i}`,
    `carousel_slide_${i}.png`);
}
```

## 🚀 Priority Order

**Start Here** (Most Visible):
1. Hero main image (1)
2. Action Figure Templates (13)
3. Carousel slides (12)

**Then** (Supporting Content):
4. Feature Showcase (4)
5. Templates (6)
6. Testimonials (5)

**Finally** (Details):
7. Gallery thumbnails (6)
8. Background patterns (2)

## 📚 Full Documentation

- **Complete List**: `IMAGE_MAPPING.md`
- **How-To Guide**: `IMAGE_REPLACEMENT_GUIDE.md`
- **System Overview**: `IMAGE_SYSTEM_SUMMARY.md`
- **JSON Data**: `image-mapping.json`

## 🆘 Need Help?

**Image not loading?**
→ Run `validateImageUrl('your-url')`

**Want to see all images?**
→ Check `IMAGE_MAPPING.md`

**Need code examples?**
→ See `IMAGE_REPLACEMENT_GUIDE.md`

**Want to export current config?**
```typescript
import { exportImageConfiguration } from '@/utils/imageReplacer';
const config = exportImageConfiguration();
```

---

**Total Images**: 51
**Total Sections**: 8
**Total Components**: 8
**Ready to customize!** 🎨
