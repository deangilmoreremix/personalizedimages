# Freepik API Integration Guide

## Overview

This guide covers the complete Freepik API integration in your React/TypeScript web application. The integration is built with a **hybrid architecture** that uses both Supabase Edge Functions (for security) and direct API calls (as fallback).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Setup Instructions](#setup-instructions)
4. [API Features](#api-features)
5. [Usage Examples](#usage-examples)
6. [Security & Best Practices](#security--best-practices)
7. [Rate Limits & Credits](#rate-limits--credits)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Freepik API Account

1. **Sign up for Freepik API access**: [https://www.freepik.com/api](https://www.freepik.com/api)
2. **Get your API key** from the Freepik Developer Dashboard
3. **Note**: Freepik API has different tiers with varying rate limits

### 2. Required Dependencies

All dependencies are already installed in your project:
```json
{
  "@supabase/supabase-js": "^2.78.0",
  "react": "^18.2.0",
  "lucide-react": "^0.344.0"
}
```

### 3. Environment Setup

Your application is a:
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth

---

## Architecture Overview

### Hybrid Architecture Pattern

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React)                                    │
│  ├── FreepikResourceGallery Component               │
│  └── stockImageService                              │
└────────────────┬────────────────────────────────────┘
                 │
                 ├─ Primary Path: Supabase Edge Function
                 │  (Secure, includes rate limiting & credits)
                 │
                 └─ Fallback Path: Direct API Call
                    (Client-side, when edge function unavailable)
```

### Key Components

1. **Edge Function** (`/supabase/functions/freepik-resources/index.ts`)
   - Handles authentication
   - Implements rate limiting
   - Tracks credit usage
   - Secures API key

2. **Service Layer** (`/src/services/stockImageService.ts`)
   - Provides TypeScript interfaces
   - Implements caching (5-minute duration)
   - Manages favorites & download history

3. **UI Component** (`/src/components/FreepikResourceGallery.tsx`)
   - Search interface with filters
   - Grid/List view modes
   - Pagination support
   - Favorites management

4. **API Utility** (`/src/utils/api.ts`)
   - Wrapper function `fetchFreepikResources()`
   - Handles edge function calls and direct API fallback

---

## Setup Instructions

### Step 1: Configure API Keys

#### Option A: For Production (Recommended - Secure)

Set the Freepik API key as a **Supabase secret**:

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Set the secret
supabase secrets set FREEPIK_API_KEY="your_freepik_api_key_here" --project-ref gyncvxxmvealrfnpnzhw
```

#### Option B: For Local Development

Add to your `.env` file:

```bash
# Freepik API Key
VITE_FREEPIK_API_KEY=your_freepik_api_key_here
```

### Step 2: Deploy the Edge Function

The edge function is already created at `/supabase/functions/freepik-resources/index.ts`.

Deploy it:

```bash
supabase functions deploy freepik-resources --project-ref gyncvxxmvealrfnpnzhw
```

### Step 3: Set Up Database Tables (Optional)

For tracking favorites and downloads, these tables are already migrated:

- `stock_favorites` - User's favorite resources
- `stock_downloads` - Download history
- `stock_usage_analytics` - Usage tracking

### Step 4: Test the Integration

```bash
npm run dev
```

Then visit the Gallery or use the FreepikResourceGallery component.

---

## API Features

### 1. Search Resources

**Endpoint**: `GET /v1/resources`

**Supported Filters**:
- `keywords` - Search terms
- `content_type` - photo, vector, psd, icon, video
- `orientation` - horizontal, vertical, square
- `license` - License type
- `page` - Page number (pagination)
- `per_page` - Results per page (default: 20)

### 2. Resource Types

- **Photos**: High-quality stock photos
- **Vectors**: Scalable vector graphics (SVG, AI, EPS)
- **PSD**: Adobe Photoshop files
- **Icons**: Icon sets
- **Videos**: Stock video footage

### 3. Response Structure

```typescript
interface FreepikResource {
  id: number;
  title: string;
  url: string;              // Link to resource on Freepik
  filename: string;
  thumbnailUrl: string | null;
  type: 'photo' | 'vector' | 'psd' | 'icon' | 'video' | null;
  orientation: 'horizontal' | 'vertical' | 'square' | null;
  width: number | null;
  height: number | null;
  downloads: number;        // Popularity metric
  likes: number;            // User engagement
  author: string | null;    // Creator name
  publishedAt: string | null;
  license: string | null;   // License type
}
```

---

## Usage Examples

### Example 1: Basic Search Component

```tsx
import FreepikResourceGallery from './components/FreepikResourceGallery';

function MyPage() {
  const handleResourceSelect = (resource) => {
    console.log('Selected:', resource);
    // Use the resource in your application
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

### Example 2: Search Using Service Layer

```typescript
import { stockImageService } from './services/stockImageService';

async function searchImages() {
  try {
    const result = await stockImageService.search({
      keywords: 'business meeting',
      content_type: 'photo',
      orientation: 'horizontal',
      page: 1,
      per_page: 20
    });

    console.log('Found resources:', result.resources);
    console.log('Total results:', result.meta.total);
    console.log('Credits remaining:', result.creditsRemaining);
  } catch (error) {
    console.error('Search failed:', error);
  }
}
```

### Example 3: Add to Favorites

```typescript
import { stockImageService } from './services/stockImageService';

async function addToFavorites(resource: StockResource) {
  const success = await stockImageService.addFavorite(resource);

  if (success) {
    console.log('Added to favorites!');
  }
}

async function getFavorites() {
  const favorites = await stockImageService.getFavorites();
  console.log('User favorites:', favorites);
}
```

### Example 4: Track Download

```typescript
import { stockImageService } from './services/stockImageService';

async function downloadResource(resource: StockResource) {
  // Record the download in your database
  await stockImageService.recordDownload(
    resource,
    'jpg',
    resource.url,
    'email-campaign'
  );

  // Get download history
  const history = await stockImageService.getDownloadHistory();
  console.log('Download history:', history);
}
```

### Example 5: Direct API Call

```typescript
import { fetchFreepikResources } from './utils/api';

async function searchDirectly() {
  const result = await fetchFreepikResources({
    keywords: 'technology',
    content_type: 'vector',
    page: 1
  });

  console.log('Resources:', result.resources);
}
```

---

## Security & Best Practices

### 1. API Key Security

✅ **DO**:
- Store API key in Supabase secrets (production)
- Use environment variables (local development)
- Use edge functions to proxy API calls

❌ **DON'T**:
- Commit API keys to version control
- Expose API keys in client-side code
- Share API keys publicly

### 2. Rate Limiting

The edge function implements automatic rate limiting:

```typescript
// Default rate limits per user
const rateLimit = {
  maxRequests: 100,      // per window
  windowMs: 15 * 60 * 1000  // 15 minutes
};
```

**Headers Returned**:
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Reset timestamp

### 3. Credit System

Each API call consumes credits:

```typescript
// Credit tracking
const creditCheck = {
  dailyLimit: 500,       // credits per day
  remainingCredits: 450, // current balance
  resetTime: Date       // when credits reset
};
```

### 4. Caching Strategy

Implemented 5-minute cache to reduce API calls:

```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

**Cache is automatically**:
- Cleared after 5 minutes
- Limited to 50 entries (LRU eviction)
- Keyed by search parameters

### 5. Error Handling

```typescript
try {
  const result = await stockImageService.search(options);
} catch (error) {
  if (error.message.includes('401')) {
    // Invalid API key
  } else if (error.message.includes('429')) {
    // Rate limit exceeded
  } else {
    // Other errors
  }
}
```

---

## Rate Limits & Credits

### Freepik API Limits

Typical limits (check your plan):
- **Free tier**: 100 requests/day
- **Basic tier**: 1,000 requests/day
- **Pro tier**: 10,000 requests/day
- **Enterprise**: Custom limits

### Application Rate Limiting

Your edge function implements additional limits:
- **100 requests per 15 minutes** per user
- **500 credits per day** per user

### Optimizing API Usage

1. **Use caching**: Results cached for 5 minutes
2. **Implement pagination**: Load 20 items at a time
3. **Debounce searches**: Wait for user to finish typing
4. **Cache popular searches**: Pre-load trending terms

---

## Troubleshooting

### Issue 1: "Freepik API key not configured"

**Solution**:
```bash
# Check if secret is set
supabase secrets list --project-ref gyncvxxmvealrfnpnzhw

# If missing, set it
supabase secrets set FREEPIK_API_KEY="your_key" --project-ref gyncvxxmvealrfnpnzhw

# For local development, check .env file
echo $VITE_FREEPIK_API_KEY
```

### Issue 2: "Rate limit exceeded"

**Check**:
- X-RateLimit-Remaining header
- X-RateLimit-Reset timestamp

**Solution**:
- Wait for rate limit window to reset
- Implement retry logic with exponential backoff
- Reduce request frequency

### Issue 3: CORS Errors

**Solution**:
```bash
# Make sure ALLOWED_ORIGINS is set
./setup-allowed-origins.sh
```

### Issue 4: Edge Function Not Working

**Check deployment**:
```bash
# Verify function is deployed
supabase functions list --project-ref gyncvxxmvealrfnpnzhw

# Redeploy if needed
supabase functions deploy freepik-resources --project-ref gyncvxxmvealrfnpnzhw

# Check logs
supabase functions logs freepik-resources --project-ref gyncvxxmvealrfnpnzhw
```

### Issue 5: Authentication Required

The edge function requires authenticated users. Make sure:
```typescript
// User must be logged in
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Redirect to login
}
```

---

## Advanced Features

### 1. Track Usage Analytics

```typescript
await stockImageService.trackUsage(
  'email-campaign',  // module name
  'search',          // action type
  undefined,         // resource ID (optional)
  'business team'    // search query (optional)
);
```

### 2. Get Popular Searches

```typescript
const popularSearches = await stockImageService.getPopularSearches();
// Returns: ['business', 'technology', 'nature', ...]
```

### 3. Get Categories

```typescript
const categories = await stockImageService.getCategories();
// Returns array of { id, name, icon }
```

### 4. Clear Cache

```typescript
stockImageService.clearCache();
```

---

## Performance Optimization

### 1. Lazy Loading Images

The component already implements lazy loading:
```tsx
<img loading="lazy" src={resource.thumbnailUrl} />
```

### 2. Pagination

Load resources in batches:
```typescript
const result = await stockImageService.search({
  keywords: 'technology',
  page: 2,      // Load page 2
  per_page: 20  // 20 items per page
});
```

### 3. Debounced Search

Implement debouncing to reduce API calls:
```typescript
import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useCallback(
  debounce((query: string) => {
    stockImageService.search({ keywords: query });
  }, 500),
  []
);
```

---

## Production Deployment Checklist

- [ ] Freepik API key configured in Supabase secrets
- [ ] ALLOWED_ORIGINS configured for your domain
- [ ] Edge function deployed
- [ ] Database tables migrated
- [ ] Rate limiting configured
- [ ] Error monitoring enabled
- [ ] CORS properly configured
- [ ] SSL certificate valid
- [ ] Analytics tracking setup

---

## API Reference

### stockImageService Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `search(options)` | Search resources | `Promise<StockSearchResult>` |
| `getResourceDetails(id)` | Get single resource | `Promise<StockResource>` |
| `getFavorites()` | Get user favorites | `Promise<StockFavorite[]>` |
| `addFavorite(resource)` | Add to favorites | `Promise<boolean>` |
| `removeFavorite(id)` | Remove favorite | `Promise<boolean>` |
| `isFavorite(id)` | Check if favorited | `Promise<boolean>` |
| `recordDownload(...)` | Track download | `Promise<boolean>` |
| `getDownloadHistory(limit)` | Get history | `Promise<StockDownload[]>` |
| `trackUsage(...)` | Track usage | `Promise<void>` |
| `clearCache()` | Clear search cache | `void` |

### fetchFreepikResources Parameters

```typescript
interface FreepikSearchOptions {
  keywords?: string;
  content_type?: 'photo' | 'vector' | 'psd' | 'icon' | 'video';
  orientation?: 'horizontal' | 'vertical' | 'square';
  license?: string;
  page?: number;
  per_page?: number;
}
```

---

## Support & Resources

- **Freepik API Docs**: [https://www.freepik.com/api/docs](https://www.freepik.com/api/docs)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Project Issues**: File issues in your repository

---

## License & Attribution

When using Freepik resources, ensure proper attribution according to the license type:
- **Free license**: Attribution required
- **Premium license**: No attribution needed (with subscription)

Always check `resource.license` field for specific requirements.

---

## Summary

Your Freepik integration is production-ready with:
- ✅ Secure API key handling
- ✅ Rate limiting & credit tracking
- ✅ Caching for performance
- ✅ Favorites & download tracking
- ✅ Comprehensive error handling
- ✅ TypeScript type safety

The hybrid architecture ensures reliability with edge functions as primary method and direct API calls as fallback.
