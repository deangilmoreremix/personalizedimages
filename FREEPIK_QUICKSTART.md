# Freepik API - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Your API Key

1. Sign up at [https://www.freepik.com/api](https://www.freepik.com/api)
2. Go to your Developer Dashboard
3. Copy your API key

### Step 2: Configure Your Environment

**For Local Development:**
```bash
# Add to your .env file
echo "VITE_FREEPIK_API_KEY=your_actual_api_key_here" >> .env
```

**For Production (Supabase):**
```bash
supabase secrets set FREEPIK_API_KEY="your_actual_api_key_here" --project-ref gyncvxxmvealrfnpnzhw
```

### Step 3: Deploy Edge Function (Production Only)

```bash
supabase functions deploy freepik-resources --project-ref gyncvxxmvealrfnpnzhw
```

### Step 4: Use in Your App

**Option A: Use the Gallery Component**
```tsx
import FreepikResourceGallery from './components/FreepikResourceGallery';

function MyPage() {
  return (
    <FreepikResourceGallery
      onResourceSelect={(resource) => {
        console.log('Selected:', resource);
      }}
    />
  );
}
```

**Option B: Use the Service Directly**
```typescript
import { stockImageService } from './services/stockImageService';

const result = await stockImageService.search({
  keywords: 'business',
  content_type: 'photo',
  orientation: 'horizontal'
});

console.log('Found:', result.resources);
```

## 🎯 Common Use Cases

### Search for Photos
```typescript
const photos = await stockImageService.search({
  keywords: 'coffee shop',
  content_type: 'photo'
});
```

### Search for Vectors
```typescript
const vectors = await stockImageService.search({
  keywords: 'logo design',
  content_type: 'vector'
});
```

### Search with Filters
```typescript
const filtered = await stockImageService.search({
  keywords: 'team meeting',
  content_type: 'photo',
  orientation: 'horizontal',
  page: 1,
  per_page: 20
});
```

### Save Favorites
```typescript
// Add to favorites
await stockImageService.addFavorite(resource);

// Get all favorites
const favorites = await stockImageService.getFavorites();

// Check if favorited
const isFav = await stockImageService.isFavorite(resourceId);
```

## 🔧 Troubleshooting

### "API key not configured"
```bash
# Check if it's set
echo $VITE_FREEPIK_API_KEY

# If empty, add it to .env
```

### "Rate limit exceeded"
- **Free tier**: 100 requests/day
- **Wait**: Check X-RateLimit-Reset header
- **Upgrade**: Consider upgrading your Freepik plan

### CORS Errors
```bash
# Set allowed origins
./setup-allowed-origins.sh
```

## 📚 Full Documentation

For complete documentation, see [FREEPIK_API_INTEGRATION_GUIDE.md](./FREEPIK_API_INTEGRATION_GUIDE.md)

## 🎨 What You Can Access

- **Photos**: High-quality stock images
- **Vectors**: Scalable SVG/AI graphics
- **PSD Files**: Editable Photoshop templates
- **Icons**: Icon sets and graphics
- **Videos**: Stock video footage

## 💡 Pro Tips

1. **Cache searches**: Results are cached for 5 minutes
2. **Use pagination**: Load 20 items at a time
3. **Track favorites**: Let users save their preferred resources
4. **Check licenses**: Some resources require attribution

## 🔐 Security

- ✅ API keys stored securely in Supabase secrets
- ✅ Rate limiting protects against abuse
- ✅ User authentication required
- ✅ Credit tracking prevents overuse

## 📊 Rate Limits

| Plan | Requests/Day | Cost |
|------|--------------|------|
| Free | 100 | $0 |
| Basic | 1,000 | Check Freepik |
| Pro | 10,000 | Check Freepik |
| Enterprise | Custom | Contact Freepik |

---

Need help? Check the [full integration guide](./FREEPIK_API_INTEGRATION_GUIDE.md) or file an issue.
