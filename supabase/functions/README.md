# VideoRemix Supabase Edge Functions

This directory contains Edge Functions for the VideoRemix application, providing secure API access for AI image generation, video generation, and payment processing.

## Function Overview

| Function | Purpose |
|----------|---------|
| `action-figure` | Generate action figure images from prompts |
| `assistant-stream` | Stream AI assistant responses |
| `crazy-image` | Generate surreal, creative images |
| `create-payment-intent` | Create Stripe payment intents |
| `ghibli-image` | Generate Studio Ghibli-style images |
| `health-check` | Verify Edge Function environment |
| `image-analysis` | Analyze and extract information from images |
| `image-description` | Generate descriptions for image generation |
| `image-enhancement` | Enhance images with AI |
| `image-generation` | Generate images from text prompts |
| `image-to-video` | Convert still images to short videos |
| `meme-generator` | Create personalized memes |
| `prompt-recommendations` | Generate enhanced prompt suggestions |
| `reference-image` | Generate images using reference images |

## Deployment Process

### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Log into Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

### Setting Up Secrets

Before deploying functions, make sure to set up required secrets:

```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=your_openai_api_key --project-ref your-project-ref

# Set Gemini API key
supabase secrets set GEMINI_API_KEY=your_gemini_api_key --project-ref your-project-ref

# Set Stripe API key (for payment processing)
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key --project-ref your-project-ref

# Set other API keys if needed
supabase secrets set LEONARDO_API_KEY=your_leonardo_api_key --project-ref your-project-ref
supabase secrets set GIPHY_API_KEY=your_giphy_api_key --project-ref your-project-ref
```

### Deploy All Functions at Once

```bash
supabase functions deploy --project-ref your-project-ref
```

### Deploy Individual Functions

```bash
supabase functions deploy action-figure --project-ref your-project-ref
supabase functions deploy image-generation --project-ref your-project-ref
# etc.
```

## Local Development

1. Create a `.env.local` file from template:
   ```bash
   cp .env.local.template .env.local
   # Edit .env.local with your API keys
   ```

2. Start Supabase local dev environment:
   ```bash
   supabase start
   ```

3. Serve functions locally:
   ```bash
   supabase functions serve --env-file .env.local
   ```

4. Test function with curl:
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/image-generation' \
   --header 'Authorization: Bearer YOUR_ANON_KEY' \
   --header 'Content-Type: application/json' \
   --data '{"provider":"gemini","prompt":"A beautiful sunset over mountains"}'
   ```

## Troubleshooting

Common issues and solutions:

1. **CORS Errors**: Make sure your Edge Functions have proper CORS headers, already included in all function templates.

2. **Missing API Keys**: Verify that all required API keys are set in Supabase secrets.

3. **Deployment Errors**: Check for syntax errors in your TypeScript code. Run `tsc --noEmit` to validate.

4. **Failed Responses**: Check Supabase Edge Function logs in the dashboard for detailed error messages.

5. **API Limits**: Some errors may be due to hitting rate limits on third-party APIs.

## Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Runtime Documentation](https://docs.deno.com/runtime/manual)