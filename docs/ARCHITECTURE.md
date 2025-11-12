# System Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [API Architecture](#api-architecture)
7. [Security Architecture](#security-architecture)
8. [Performance & Scalability](#performance--scalability)

---

## Overview

This document provides a comprehensive technical architecture overview of the AI-Powered Personalization & Image Generation Platform.

### Architecture Principles

1. **Modularity**: Self-contained components with clear interfaces
2. **Scalability**: Horizontal scaling support for all services
3. **Security First**: Defense in depth with multiple security layers
4. **Performance**: Optimized for speed with caching and lazy loading
5. **Maintainability**: Clear code organization and documentation

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │   Mobile     │  │  External    │          │
│  │   (React)    │  │   (Future)   │  │   API        │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Supabase Edge Functions (Deno Runtime)                │    │
│  │  - Authentication middleware                            │    │
│  │  - Rate limiting                                        │    │
│  │  - Request validation                                   │    │
│  └────────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
┌─────────────▼──┐  ┌──────▼──────┐  ┌──▼─────────────┐
│   AI Services  │  │  Database   │  │   Storage      │
│                │  │             │  │                │
│ • OpenAI       │  │  Supabase   │  │  Supabase      │
│ • Google AI    │  │  PostgreSQL │  │  Storage       │
│ • Gemini       │  │             │  │                │
│ • Imagen       │  │  • RLS      │  │  • Images      │
│                │  │  • Triggers │  │  • Videos      │
│                │  │  • Functions│  │  • Assets      │
└────────────────┘  └─────────────┘  └────────────────┘
```

### Technology Stack Detail

#### Frontend Stack
```
React 18.2.0
├── TypeScript 5.3.3
├── Vite 5.1.6 (Build tool)
├── React Router DOM 6.22.2 (Routing)
├── Tailwind CSS 3.4.1 (Styling)
├── Framer Motion 11.0.3 (Animations)
├── React DND 16.0.1 (Drag & Drop)
└── Supabase Client 2.78.0 (Backend SDK)
```

#### Backend Stack
```
Supabase Platform
├── PostgreSQL (Database)
├── Edge Functions (Serverless)
│   ├── Deno Runtime
│   └── TypeScript
├── Authentication (Supabase Auth)
├── Storage (Object Storage)
└── Real-time (WebSocket)
```

#### External Services
```
AI Services
├── OpenAI
│   ├── DALL-E 3
│   ├── GPT-4
│   └── GPT-4 Vision
├── Google Cloud
│   ├── Gemini AI
│   ├── Gemini 2.5 Flash
│   ├── Imagen 3
│   └── Gemini Nano
└── Stripe (Payments)
```

---

## Component Architecture

### Frontend Component Hierarchy

```
App (Root)
│
├── ErrorBoundary
│   └── Wraps entire application for error handling
│
├── AuthContext Provider
│   ├── User authentication state
│   └── Session management
│
├── ModernHeader
│   ├── Navigation
│   ├── User menu
│   └── Mobile responsive
│
├── Router
│   ├── Public Routes
│   │   ├── Home (/)
│   │   ├── How It Works (/how-it-works)
│   │   ├── Features (/)
│   │   └── Pricing (Future)
│   │
│   ├── Feature Routes
│   │   ├── AI Image (/features/ai-image)
│   │   ├── Action Figures (/features/action-figures)
│   │   ├── Ghibli Style (/features/ghibli-style)
│   │   ├── Cartoon Style (/features/cartoon-style)
│   │   ├── Meme Generator (/features/meme-generator)
│   │   └── [12+ other features]
│   │
│   ├── Tool Routes
│   │   ├── Editor (/editor)
│   │   ├── Gallery (/gallery)
│   │   ├── Batch Generation (/batch-generation)
│   │   ├── Model Comparison (/model-comparison)
│   │   └── Analytics (/analytics)
│   │
│   └── Admin Routes
│       ├── Admin Dashboard (/admin)
│       └── Protected by authentication
│
└── PWAInstallPrompt
    └── Progressive Web App features
```

### Core Component Patterns

#### 1. Generator Components Pattern
```typescript
interface GeneratorProps {
  tokens: Record<string, string>;        // Personalization tokens
  onImageGenerated: (url: string) => void; // Callback
  initialSettings?: Partial<Settings>;  // Optional config
}

// Example: AIImageGenerator, ActionFigureGenerator, etc.
```

#### 2. Editor Components Pattern
```typescript
interface EditorProps {
  imageUrl: string;                      // Source image
  onImageUpdated: (url: string) => void; // Update callback
  mode?: 'classic' | 'gemini-nano';      // Editor type
  tokens?: Record<string, string>;       // For personalization
}
```

#### 3. Utility Components Pattern
```typescript
// Reusable UI components
- DroppableTextArea (Token insertion)
- ReferenceImageUploader (Image upload)
- PromptHelper (AI assistance)
- PromptPolisher (Prompt enhancement)
```

### Component Communication

```
┌──────────────────────────────────────────────────────┐
│  Parent Component (Feature Page)                     │
│  ┌────────────────────────────────────────────────┐ │
│  │  State Management                               │ │
│  │  - tokens: Record<string, string>              │ │
│  │  - generatedImage: string | null               │ │
│  │  - isGenerating: boolean                       │ │
│  │  - error: string | null                        │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─────────────────┐    ┌─────────────────┐        │
│  │  Generator      │───▶│  Editor         │        │
│  │  Component      │    │  Component      │        │
│  │                 │    │                 │        │
│  │  Outputs: Image │    │  Inputs: Image  │        │
│  └─────────────────┘    └─────────────────┘        │
│           │                      │                  │
│           └──────────┬───────────┘                  │
│                      │                              │
│                      ▼                              │
│           ┌─────────────────┐                       │
│           │  Storage        │                       │
│           │  Service        │                       │
│           └─────────────────┘                       │
└──────────────────────────────────────────────────────┘
```

---

## Data Flow

### Image Generation Flow

```
User Input
    │
    ├─► Prompt Text
    ├─► Selected AI Model
    ├─► Personalization Tokens
    ├─► Advanced Settings
    └─► Reference Image (optional)
    │
    ▼
Token Resolution
    │
    ├─► Replace [FIRSTNAME] → "John"
    ├─► Replace [COMPANY] → "Acme Corp"
    └─► Build final prompt
    │
    ▼
API Request
    │
    ├─► Edge Function (/image-generation)
    ├─► Validate request
    ├─► Check authentication
    └─► Rate limiting
    │
    ▼
AI Processing
    │
    ├─► Send to selected AI model
    ├─► Stream progress updates
    ├─► AI reasoning (if enabled)
    └─► Generate image
    │
    ▼
Post-Processing
    │
    ├─► Image optimization
    ├─► Format conversion
    └─► Quality validation
    │
    ▼
Storage
    │
    ├─► Upload to Supabase Storage
    ├─► Generate signed URL
    ├─► Save metadata to database
    └─► Update usage statistics
    │
    ▼
Response to Client
    │
    ├─► Return image URL
    ├─► Update UI
    ├─► Save to gallery
    └─► Enable post-processing options
```

### Batch Generation Flow

```
CSV Upload
    │
    ├─► Parse CSV file
    ├─► Validate columns
    └─► Extract rows
    │
    ▼
Batch Queue Creation
    │
    ├─► Create batch items
    ├─► Merge with global tokens
    ├─► Calculate estimated cost
    └─► Set initial status: pending
    │
    ▼
Sequential Processing
    │
    ├─► For each item:
    │   ├─► Set status: processing
    │   ├─► Generate image
    │   ├─► Update progress
    │   └─► Save result
    │
    ├─► Rate limiting between items
    └─► Error handling per item
    │
    ▼
Results Collection
    │
    ├─► Compile statistics
    ├─► Generate CSV export
    └─► Update UI with results
```

### Authentication Flow

```
User Login Attempt
    │
    ▼
Supabase Auth
    │
    ├─► Validate credentials
    ├─► Check MFA (if enabled)
    └─► Generate session token
    │
    ▼
Session Management
    │
    ├─► Store in localStorage
    ├─► Set in AuthContext
    └─► Configure API client
    │
    ▼
Protected Route Access
    │
    ├─► Check session validity
    ├─► Verify permissions
    └─► Grant/Deny access
```

---

## Database Schema

### Core Tables

#### users (Managed by Supabase Auth)
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### images
```sql
CREATE TABLE public.images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt TEXT,
  model TEXT NOT NULL, -- 'openai', 'gemini', 'imagen', etc.
  tokens JSONB,        -- Personalization tokens used
  settings JSONB,      -- Generation settings
  metadata JSONB,      -- Additional data
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_images_created_at ON images(created_at DESC);
CREATE INDEX idx_images_model ON images(model);

-- Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images"
  ON images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images"
  ON images FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON images FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

#### templates
```sql
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'action-figure', 'meme', 'email', etc.
  template_data JSONB NOT NULL,
  preview_url TEXT,
  is_public BOOLEAN DEFAULT false,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_public ON templates(is_public) WHERE is_public = true;

-- RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
```

#### batch_jobs
```sql
CREATE TABLE public.batch_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  model TEXT NOT NULL,
  settings JSONB NOT NULL,
  total_items INTEGER NOT NULL,
  completed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  csv_data TEXT,
  results JSONB,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_batch_jobs_user_id ON batch_jobs(user_id);
CREATE INDEX idx_batch_jobs_status ON batch_jobs(status);

-- RLS
ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own batch jobs"
  ON batch_jobs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### videos
```sql
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  video_url TEXT NOT NULL,
  preview_url TEXT,
  effect TEXT NOT NULL,
  duration INTEGER NOT NULL,
  resolution TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed'
  payment_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_payment_status ON videos(payment_status);

-- RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own videos"
  ON videos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

#### personalization_tokens
```sql
CREATE TABLE public.personalization_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token_set_name TEXT NOT NULL,
  tokens JSONB NOT NULL, -- {"FIRSTNAME": "John", "COMPANY": "Acme", ...}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tokens_user_id ON personalization_tokens(user_id);

-- RLS
ALTER TABLE personalization_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens"
  ON personalization_tokens FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### usage_analytics
```sql
CREATE TABLE public.usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'generation', 'edit', 'download', 'video_conversion'
  feature_used TEXT NOT NULL,
  model_used TEXT,
  cost DECIMAL(10, 4),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX idx_analytics_event_type ON usage_analytics(event_type);
CREATE INDEX idx_analytics_created_at ON usage_analytics(created_at DESC);

-- RLS
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON usage_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### Database Relationships

```
auth.users (1) ─────┬──── (many) images
                    ├──── (many) templates
                    ├──── (many) batch_jobs
                    ├──── (many) videos
                    ├──── (many) personalization_tokens
                    └──── (many) usage_analytics

images (1) ──────── (many) videos (via source_image_id)
```

---

## API Architecture

### Edge Functions Structure

```
supabase/functions/
├── _shared/
│   ├── cors.ts              # CORS headers utility
│   └── types.ts             # Shared TypeScript types
│
├── image-generation/
│   ├── index.ts             # Main handler
│   └── import_map.json      # Dependencies
│
├── action-figure/
│   ├── index.ts
│   └── import_map.json
│
├── ghibli-image/
│   ├── index.ts
│   └── import_map.json
│
├── cartoon-style/
│   ├── index.ts
│   └── import_map.json
│
├── meme-generator/
│   ├── index.ts
│   └── import_map.json
│
├── image-enhancement/
│   ├── index.ts
│   └── import_map.json
│
├── image-to-video/
│   ├── index.ts
│   └── import_map.json
│
├── reference-image/
│   ├── index.ts
│   └── import_map.json
│
├── prompt-recommendations/
│   ├── index.ts
│   └── import_map.json
│
├── assistant-stream/
│   ├── index.ts             # Streaming AI assistance
│   └── import_map.json
│
└── create-payment-intent/
    ├── index.ts             # Stripe integration
    └── import_map.json
```

### API Endpoints

#### Image Generation
```typescript
POST /functions/v1/image-generation

Headers:
  Authorization: Bearer <anon-key>
  Content-Type: application/json

Request Body:
{
  "prompt": "Professional portrait of [FIRSTNAME] from [COMPANY]",
  "model": "openai" | "gemini" | "imagen" | "gemini2flash" | "gpt-image-1",
  "tokens": {
    "FIRSTNAME": "John",
    "COMPANY": "Acme Corp"
  },
  "settings": {
    "aspectRatio": "1:1",
    "style": "photography",
    "quality": "high",
    "size": "1024x1024",      // DALL-E specific
    "dalleQuality": "hd",      // DALL-E specific
    "dalleStyle": "natural"    // DALL-E specific
  },
  "referenceImage": "data:image/png;base64,..." // Optional
}

Response:
{
  "imageUrl": "https://...",
  "generationTime": 12500,
  "model": "openai",
  "cost": 0.04
}

Error Response:
{
  "error": "Invalid API key",
  "code": "AUTHENTICATION_ERROR",
  "details": {}
}
```

#### Action Figure Generation
```typescript
POST /functions/v1/action-figure

Request Body:
{
  "style": "blister-pack" | "collector" | "trading-card" | ...,
  "personData": {
    "name": "[FIRSTNAME] [LASTNAME]",
    "company": "[COMPANY]",
    "title": "[JOBTITLE]"
  },
  "tokens": { ... },
  "colors": {
    "primary": "#FF0000",
    "secondary": "#0000FF",
    "accent": "#FFFF00"
  },
  "referenceImage": "...",
  "model": "gemini",
  "includeAccessories": true
}

Response:
{
  "imageUrl": "https://...",
  "style": "blister-pack",
  "generationTime": 15000
}
```

#### Batch Processing
```typescript
POST /functions/v1/batch-process

Request Body:
{
  "batchId": "uuid",
  "items": [
    {
      "prompt": "...",
      "tokens": { ... },
      "settings": { ... }
    },
    // ... more items
  ],
  "model": "openai",
  "globalSettings": { ... }
}

Response (Streaming):
{
  "itemId": "1",
  "status": "processing",
  "progress": 45
}
{
  "itemId": "1",
  "status": "completed",
  "imageUrl": "https://...",
  "cost": 0.04
}
```

#### Video Conversion
```typescript
POST /functions/v1/image-to-video

Request Body:
{
  "imageUrl": "https://...",
  "effect": "zoom" | "pan" | "ken-burns" | ...,
  "duration": 3,
  "resolution": "720p",
  "includeAudio": false
}

Response:
{
  "videoId": "uuid",
  "status": "processing",
  "estimatedTime": 30
}

GET /functions/v1/image-to-video/{videoId}/status

Response:
{
  "status": "completed",
  "videoUrl": "https://...",
  "previewUrl": "https://...",
  "paymentRequired": true,
  "paymentAmount": 1.00
}
```

### Authentication & Authorization

All endpoints require authentication via Supabase JWT:

```typescript
Headers:
  Authorization: Bearer <JWT_TOKEN>
  apikey: <SUPABASE_ANON_KEY>
```

Edge functions validate tokens using:
```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_ANON_KEY'),
  {
    global: {
      headers: { Authorization: req.headers.get('Authorization') }
    }
  }
);

// Get authenticated user
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  return new Response('Unauthorized', { status: 401 });
}
```

---

## Security Architecture

### Defense in Depth

```
Layer 1: Network Security
├── HTTPS only
├── CORS policies
└── DDoS protection

Layer 2: Authentication
├── Supabase Auth (JWT)
├── Email verification
├── Password requirements
└── MFA support (optional)

Layer 3: Authorization
├── Row Level Security (RLS)
├── Role-based access control
└── API key validation

Layer 4: Data Security
├── Encrypted at rest
├── Encrypted in transit
├── Signed URLs for images
└── No plain text secrets

Layer 5: Application Security
├── Input validation
├── XSS prevention
├── SQL injection prevention
└── Rate limiting

Layer 6: Monitoring
├── Error tracking
├── Audit logs
├── Usage monitoring
└── Anomaly detection
```

### Row Level Security (RLS) Policies

All tables use RLS to ensure users can only access their own data:

```sql
-- Example: Images table
CREATE POLICY "Users can only view own images"
  ON images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert with own user_id"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Prevents user from setting user_id to someone else's ID
```

### API Key Management

```typescript
// Environment variables (never committed to repo)
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AIza...
STRIPE_SECRET_KEY=sk_test_...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

// Accessed only in Edge Functions
const apiKey = Deno.env.get('OPENAI_API_KEY');
```

### Input Validation

```typescript
// Sanitize user input
import { sanitizePrompt, sanitizeTokenValue } from '../utils/validation';

const safePrompt = sanitizePrompt(userInput);
const safeToken = sanitizeTokenValue(tokenValue);

// Prevent injection attacks
function sanitizePrompt(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .substring(0, 2000); // Max length
}
```

---

## Performance & Scalability

### Caching Strategy

```
Browser Cache
├── Static assets (JS, CSS, images)
├── Service Worker (PWA)
└── IndexedDB (offline data)

CDN Cache
├── Image assets
├── Video files
└── Static content

Application Cache
├── AI model responses (15 min TTL)
├── Template data
└── User preferences

Database Cache
├── Query results
└── Connection pooling
```

### Optimization Techniques

#### 1. Lazy Loading
```typescript
// Code splitting for routes
const ActionFigurePage = lazy(() => import('./pages/features/ActionFigurePage'));
const GhibliStylePage = lazy(() => import('./pages/features/GhibliStylePage'));

// Component lazy loading
<Suspense fallback={<LoadingSpinner />}>
  <ActionFigurePage />
</Suspense>
```

#### 2. Image Optimization
```typescript
// Generate thumbnails on upload
const thumbnail = await generateThumbnail(imageUrl, {
  width: 200,
  height: 200,
  quality: 70
});

// Use WebP format when supported
const format = supportsWebP() ? 'webp' : 'jpeg';
```

#### 3. Database Optimization
```sql
-- Indexes for common queries
CREATE INDEX idx_images_user_created ON images(user_id, created_at DESC);
CREATE INDEX idx_images_model ON images(model);

-- Materialized views for analytics
CREATE MATERIALIZED VIEW user_stats AS
SELECT
  user_id,
  COUNT(*) as total_images,
  SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as images_this_month
FROM images
GROUP BY user_id;
```

#### 4. API Optimization
```typescript
// Batch requests
const results = await Promise.all(
  items.map(item => generateImage(item))
);

// Connection pooling (handled by Supabase)
// Rate limiting per user
const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000 // 1 minute
});
```

### Scalability Considerations

#### Horizontal Scaling
- Edge Functions scale automatically with Supabase
- Database read replicas for heavy read operations
- CDN distribution for static assets

#### Vertical Scaling
- Database connection pooling
- Increased instance sizes as needed
- SSD storage for fast I/O

#### Load Balancing
- Supabase handles load balancing internally
- Geographic distribution via CDN
- Health checks and automatic failover

---

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging
logger.info('Image generated', {
  userId: user.id,
  model: 'openai',
  generationTime: 12500,
  cost: 0.04,
  timestamp: new Date().toISOString()
});

logger.error('Generation failed', {
  userId: user.id,
  error: error.message,
  stack: error.stack,
  context: { prompt, model, settings }
});
```

### Metrics Collection

```typescript
// Track key metrics
metrics.increment('images.generated', {
  model: 'openai',
  feature: 'action-figure'
});

metrics.timing('generation.duration', generationTime, {
  model: 'openai'
});

metrics.gauge('active.users', activeUserCount);
```

### Health Checks

```typescript
// Edge function health check
export default async function handler(req: Request) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabase(),
      storage: await checkStorage(),
      aiServices: await checkAIServices()
    }
  };

  return new Response(JSON.stringify(health), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

## Deployment Architecture

### Development Environment
```
Local Machine
├── Vite Dev Server (localhost:5173)
├── Supabase Local (Docker)
└── Mock AI Services
```

### Staging Environment
```
Staging Server
├── Supabase Staging Project
├── Real AI Services (limited)
└── Stripe Test Mode
```

### Production Environment
```
Production Infrastructure
├── Supabase Production
│   ├── Primary database
│   ├── Read replicas
│   └── Automatic backups
├── CDN (CloudFlare/Vercel)
├── Real AI Services
└── Stripe Live Mode
```

---

**Last Updated**: November 2025
**Version**: 2.0.0
