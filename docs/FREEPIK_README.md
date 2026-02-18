# Freepik API Integration

Complete Freepik API integration for React/TypeScript application with Supabase backend.

## 🎯 What's Included

Your application already has a **production-ready Freepik integration** with:

- ✅ **Secure API Key Management** - Keys stored in Supabase secrets
- ✅ **Edge Function** - Server-side proxy at `/supabase/functions/freepik-resources/`
- ✅ **Service Layer** - TypeScript service at `/src/services/stockImageService.ts`
- ✅ **UI Component** - Ready-to-use gallery at `/src/components/FreepikResourceGallery.tsx`
- ✅ **Rate Limiting** - 100 requests per 15 minutes per user
- ✅ **Credit Tracking** - 500 credits per day per user
- ✅ **Caching** - 5-minute cache to reduce API calls
- ✅ **Favorites System** - Save and manage favorite resources
- ✅ **Download Tracking** - Track resource usage
- ✅ **TypeScript Support** - Full type definitions

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
./setup-freepik.sh
```

Follow the prompts to configure your API key for local development and/or production.

### Option 2: Manual Setup

**For Local Development:**
```bash
echo "VITE_FREEPIK_API_KEY=your_api_key_here" >> .env
```

**For Production:**
```bash
supabase secrets set FREEPIK_API_KEY="your_api_key_here" --project-ref gyncvxxmvealrfnpnzhw
supabase functions deploy freepik-resources --project-ref gyncvxxmvealrfnpnzhw
```

## 📖 Documentation

- **[Quick Start Guide](../FREEPIK_QUICKSTART.md)** - Get started in 5 minutes
- **[Complete Integration Guide](../FREEPIK_API_INTEGRATION_GUIDE.md)** - Comprehensive documentation
- **[Demo Page](../src/pages/FreepikDemo.tsx)** - Interactive examples

## 💻 Usage Examples

### Use the Gallery Component

```tsx
import FreepikResourceGallery from './components/FreepikResourceGallery';

function MyPage() {
  const handleResourceSelect = (resource) => {
    console.log('Selected:', resource);
  };

  return (
    <FreepikResourceGallery
      onResourceSelect={handleResourceSelect}
      maxHeight="600px"
      showFilters={true}
    />
  );
}
```

### Use the Service Directly

```typescript
import { stockImageService } from './services/stockImageService';

// Search for resources
const result = await stockImageService.search({
  keywords: 'business',
  content_type: 'photo',
  orientation: 'horizontal',
  page: 1,
  per_page: 20
});

// Add to favorites
await stockImageService.addFavorite(resource);

// Get favorites
const favorites = await stockImageService.getFavorites();
```

### Use the API Wrapper

```typescript
import { fetchFreepikResources } from './utils/api';

const result = await fetchFreepikResources({
  keywords: 'technology',
  content_type: 'vector'
});
```

## 🏗️ Architecture

```
Frontend (React/TypeScript)
  ↓
stockImageService (Caching + State Management)
  ↓
┌─────────────────────────────────────┐
│ Primary: Supabase Edge Function     │ ← Secure, rate-limited
│ Fallback: Direct API Call           │ ← Client-side fallback
└─────────────────────────────────────┘
  ↓
Freepik API
```

## 📁 File Structure

```
├── supabase/functions/freepik-resources/
│   └── index.ts                          # Edge function (server-side)
├── src/
│   ├── components/
│   │   └── FreepikResourceGallery.tsx    # UI component
│   ├── services/
│   │   └── stockImageService.ts          # Service layer
│   ├── utils/
│   │   └── api.ts                        # API wrapper
│   └── pages/
│       └── FreepikDemo.tsx               # Demo page
├── docs/
│   └── FREEPIK_README.md                 # This file
├── FREEPIK_QUICKSTART.md                 # Quick start guide
├── FREEPIK_API_INTEGRATION_GUIDE.md      # Complete guide
└── setup-freepik.sh                      # Setup script
```

## 🎨 Features

### Search & Filters
- Search by keywords
- Filter by content type (photo, vector, PSD, icon, video)
- Filter by orientation (horizontal, vertical, square)
- Pagination support

### User Features
- Save favorites
- Track downloads
- View download history
- Grid/List view modes

### Developer Features
- TypeScript interfaces
- Response caching
- Error handling
- Rate limiting
- Credit tracking
- Usage analytics

## 🔐 Security

- API keys stored securely in Supabase secrets
- Edge functions protect API keys from client exposure
- User authentication required
- Rate limiting prevents abuse
- Credit system prevents overuse

## 📊 Rate Limits

| Limit Type | Value | Scope |
|------------|-------|-------|
| API Requests | 100 | Per 15 minutes per user |
| Daily Credits | 500 | Per day per user |
| Cache Duration | 5 min | Global |
| Max Cache Size | 50 entries | Global |

## 🛠️ API Reference

### stockImageService

```typescript
interface StockImageService {
  search(options): Promise<StockSearchResult>
  getResourceDetails(id): Promise<StockResource>
  getFavorites(): Promise<StockFavorite[]>
  addFavorite(resource): Promise<boolean>
  removeFavorite(id): Promise<boolean>
  isFavorite(id): Promise<boolean>
  recordDownload(...): Promise<boolean>
  getDownloadHistory(limit): Promise<StockDownload[]>
  trackUsage(...): Promise<void>
  clearCache(): void
  getPopularSearches(): Promise<string[]>
  getCategories(): Promise<Category[]>
}
```

### Search Options

```typescript
interface StockSearchOptions {
  keywords?: string;
  content_type?: 'photo' | 'vector' | 'psd' | 'icon' | 'video';
  orientation?: 'horizontal' | 'vertical' | 'square';
  license?: string;
  page?: number;
  per_page?: number;
}
```

### Resource Type

```typescript
interface StockResource {
  id: number;
  title: string;
  url: string;
  filename: string;
  thumbnailUrl: string | null;
  type: string | null;
  orientation: string | null;
  width: number | null;
  height: number | null;
  downloads: number;
  likes: number;
  author: string | null;
  publishedAt: string | null;
  license: string | null;
}
```

## 🧪 Testing

### Test the Demo Page

```bash
npm run dev
```

Then visit: `http://localhost:5173/freepik-demo`

### Test the Service

```typescript
import { stockImageService } from './services/stockImageService';

// Check if available
if (stockImageService.isAvailable()) {
  const result = await stockImageService.search({
    keywords: 'test',
    per_page: 5
  });
  console.log('Found:', result.resources.length);
}
```

## 🐛 Troubleshooting

### API Key Not Configured

**Local Development:**
```bash
# Check .env file
cat .env | grep FREEPIK

# If missing, add it
echo "VITE_FREEPIK_API_KEY=your_key" >> .env
```

**Production:**
```bash
# Check secrets
supabase secrets list --project-ref gyncvxxmvealrfnpnzhw

# If missing, set it
supabase secrets set FREEPIK_API_KEY="your_key" --project-ref gyncvxxmvealrfnpnzhw
```

### Edge Function Not Working

```bash
# Redeploy
supabase functions deploy freepik-resources --project-ref gyncvxxmvealrfnpnzhw

# Check logs
supabase functions logs freepik-resources --project-ref gyncvxxmvealrfnpnzhw
```

### CORS Errors

```bash
./setup-allowed-origins.sh
```

## 📚 Resources

- **Freepik API Docs**: https://www.freepik.com/api/docs
- **Get API Key**: https://www.freepik.com/api
- **Supabase Docs**: https://supabase.com/docs

## 💡 Best Practices

1. **Always check rate limits** - Monitor X-RateLimit headers
2. **Use caching** - Don't clear cache unnecessarily
3. **Implement pagination** - Load 20-50 items at a time
4. **Handle errors gracefully** - Show user-friendly messages
5. **Track usage** - Use analytics to understand user behavior
6. **Respect licenses** - Check resource.license for attribution requirements

## 🎓 Learning Resources

- Read the [Quick Start Guide](../FREEPIK_QUICKSTART.md)
- Study the [Demo Page](../src/pages/FreepikDemo.tsx)
- Review the [Integration Guide](../FREEPIK_API_INTEGRATION_GUIDE.md)
- Explore the [Service Layer](../src/services/stockImageService.ts)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the complete integration guide
3. File an issue in your repository

---

**Made with ❤️ for solopreneurs building scalable businesses**
