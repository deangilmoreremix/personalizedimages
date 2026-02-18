# Freepik Integration - Quick Reference

## ✅ All Features Are Compliant!

All 10 proposed Freepik enhancements are **FULLY APPROVED** and comply with Freepik's Terms of Use.

---

## 🚀 Implementation Priority

### **Phase 1: Quick Wins** (Start Here!)

1. **Meme Background Library** - Replace fixed templates with Freepik search
2. **AI Reference Images** - Use Freepik images as AI generation references
3. **Video Thumbnail Generator** - Create thumbnails from Freepik images

### **Phase 2: High Value**

4. **Email Campaign Assets** - Dynamic email images from Freepik
5. **Template System Integration** - Pre-populate templates with stock assets
6. **Batch Asset Library** - Bulk process Freepik images

### **Phase 3: Advanced**

7. **AI Smart Recommendations** - Auto-suggest relevant images
8. **Multi-Platform Export** - Export with auto-resizing
9. **Action Figure Backgrounds** - Composite characters with scenes
10. **GIF Background Replacement** - Dynamic GIF backgrounds

---

## 📋 Compliance Checklist

### ✅ What You CAN Do

- Use commercially in products
- Modify and transform
- Create derivative works
- Combine with other elements
- Use in templates/services
- Keep using after subscription expires

### ❌ What You CANNOT Do

- Resell unmodified images
- Redistribute as standalone files
- Use as ONLY product element
- Sublicense to others

### ⚠️ What You MUST Do

- Add attribution for free users
- Respect API rate limits
- Transform/add value to images
- Track usage for auditing

---

## 💻 Code Quick Start

### 1. Import Compliance Tools

```typescript
import { FreepikCompliance } from './utils/freepikCompliance';
import { FreepikAttribution } from './components/shared/FreepikAttribution';
```

### 2. Check If Attribution Needed

```typescript
const isPremiumUser = checkUserSubscription();
const requiresAttribution = !isPremiumUser;
```

### 3. Validate Usage

```typescript
const validation = FreepikCompliance.validateFreepikUsage(
  'your-feature-name',
  true,  // has transformation (text, filters, etc.)
  false, // is NOT the only element
  false  // NOT redistributing
);

if (!validation.isCompliant) {
  console.warn('Issues:', validation.warnings);
}
```

### 4. Track Usage

```typescript
FreepikCompliance.trackFreepikUsage(
  resource.id,
  'feature-name',
  'derivative' // or 'composite', 'reference', 'template', 'thumbnail'
);
```

### 5. Add Attribution to Exports

```typescript
if (requiresAttribution) {
  // Get attribution text
  const attribution = FreepikCompliance.getAttributionText(resource);

  // Option A: Embed in image
  const imageWithAttribution = await FreepikCompliance.embedAttributionInImage(
    imageDataUrl,
    attribution,
    'bottom-right'
  );

  // Option B: Add to metadata
  exportData.attribution = FreepikCompliance.formatAttributionForExport(
    [resource],
    'metadata',
    isPremiumUser
  );
}
```

### 6. Display Attribution in UI

```tsx
<FreepikAttribution
  resources={usedFreepikImages}
  isPremiumUser={isPremiumUser}
  showComplianceInfo={true}
  variant="footer"
/>
```

---

## 🎨 Attribution Formats

### Text Format
```
Designed by Freepik (https://www.freepik.com)
```

### HTML Format
```html
<a href="https://www.freepik.com" target="_blank">Designed by Freepik</a>
```

### Metadata Format
```json
[{"text":"Designed by Freepik","url":"https://www.freepik.com","resourceId":12345}]
```

### Image Watermark
Embedded in bottom-right corner with semi-transparent background

---

## 🔧 Feature-Specific Implementation

### Meme Generator
```typescript
// 1. User selects Freepik image
const background = await freepikService.getImage(imageId);

// 2. User adds text/effects
const meme = createMeme(background, text, effects);

// 3. Track usage
FreepikCompliance.trackFreepikUsage(background.id, 'meme-generator', 'derivative');

// 4. Export with attribution
if (!isPremiumUser) {
  const attribution = FreepikCompliance.getAttributionText(background);
  meme.withAttribution(attribution);
}
```

### AI Reference Images
```typescript
// 1. User selects reference
const reference = await freepikService.getImage(imageId);

// 2. AI generates NEW image
const aiGenerated = await generateWithReference(prompt, reference.url);

// 3. Track reference usage
FreepikCompliance.trackFreepikUsage(reference.id, 'ai-generator', 'reference');

// No attribution needed in output (AI-generated content)
// But display attribution in UI during selection
```

### Email Campaign
```typescript
// 1. Add Freepik images to email
const emailImages = await freepikService.search('business professional');

// 2. Build email template
const emailHtml = buildEmail(content, emailImages);

// 3. Add attribution to footer
if (!isPremiumUser) {
  const attribution = FreepikCompliance.formatAttributionForExport(
    emailImages,
    'html',
    false
  );
  emailHtml += `<div class="attribution">${attribution}</div>`;
}
```

### Template System
```typescript
// 1. Create template with Freepik assets
const template = {
  id: 'social-post-1',
  name: 'Instagram Story',
  freepikAssets: [image1, image2],
  requiresAttribution: !isPremiumUser
};

// 2. User customizes
const customized = customizeTemplate(template, userChanges);

// 3. Export with attribution in metadata
customized.metadata.attribution = FreepikCompliance.formatAttributionForExport(
  template.freepikAssets,
  'metadata',
  isPremiumUser
);
```

---

## 🎯 Best Practices

### Always Add Value
```typescript
// ❌ Bad: Just resize
const output = resize(freepikImage, 1920, 1080);

// ✅ Good: Transform
const output = resize(freepikImage, 1920, 1080)
  .addTextOverlay(userText)
  .applyFilter('vibrant')
  .addBranding(userLogo);
```

### Track Everything
```typescript
// Track each usage for compliance auditing
FreepikCompliance.trackFreepikUsage(
  resource.id,
  'current-feature',
  'transformation-type'
);

// Later: Review usage history
const history = FreepikCompliance.getUsageHistory();
console.log(`Used ${history.length} Freepik resources`);
```

### Cache Intelligently
```typescript
// Respect rate limits by caching
const cacheKey = `freepik_search_${query}`;
const cached = getFromCache(cacheKey);

if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
  return cached.results;
}

const results = await freepikService.search(query);
setCache(cacheKey, results);
```

---

## 🚨 Common Mistakes to Avoid

### 1. Forgetting Attribution for Free Users
```typescript
// ❌ Wrong
export function exportImage(image: Image) {
  return image.toDataURL();
}

// ✅ Correct
export function exportImage(image: Image, isPremium: boolean) {
  const dataUrl = image.toDataURL();

  if (!isPremium && image.freepikResources.length > 0) {
    return addAttribution(dataUrl, image.freepikResources);
  }

  return dataUrl;
}
```

### 2. Not Transforming Images
```typescript
// ❌ Wrong: Just passing through
return freepikImage;

// ✅ Correct: Add value
return transformImage(freepikImage, {
  filters: userFilters,
  text: userText,
  effects: userEffects
});
```

### 3. Using as Only Element
```typescript
// ❌ Wrong
const product = {
  image: freepikImage // Only element
};

// ✅ Correct
const product = {
  background: freepikImage,
  text: userText,
  logo: userLogo,
  effects: appliedEffects
};
```

---

## 📊 User Type Detection

```typescript
// Detect user subscription level
function getUserSubscriptionLevel(user: User): 'free' | 'essential' | 'premium' | 'enterprise' {
  if (!user) return 'free';

  if (user.subscription?.plan === 'enterprise') return 'enterprise';
  if (user.subscription?.plan === 'premium') return 'premium';
  if (user.subscription?.plan === 'essential') return 'essential';

  return 'free';
}

// Check if attribution needed
function requiresAttribution(user: User): boolean {
  const level = getUserSubscriptionLevel(user);
  return level === 'free' || level === 'essential';
}
```

---

## 🔗 Resources

- **Full Guide**: `/FREEPIK_COMPLIANCE_GUIDE.md`
- **Utilities**: `/src/utils/freepikCompliance.ts`
- **UI Components**: `/src/components/shared/FreepikAttribution.tsx`
- **Freepik Terms**: https://www.freepik.com/legal/terms-of-use
- **API Docs**: https://www.freepik.com/api

---

## ✅ Pre-Implementation Checklist

Before building any feature:

- [ ] Feature adds transformation/value to Freepik images
- [ ] Freepik content is NOT the only element
- [ ] Attribution system is integrated
- [ ] Usage tracking is implemented
- [ ] Rate limiting is respected
- [ ] User type detection works
- [ ] Export includes attribution (for free users)
- [ ] UI displays compliance info

---

## 🎉 Ready to Build!

Pick any feature from Phase 1-3 and start implementing. All utilities and components are ready to use.

**Need help?** Check the full compliance guide or code examples above.
