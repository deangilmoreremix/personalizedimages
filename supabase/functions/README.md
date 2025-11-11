# VideoRemix Supabase Edge Functions

This directory contains Edge Functions for the VideoRemix application, providing secure API access for AI image generation, video generation, and payment processing.

## Function Overview

| Function | Purpose | Status |
|----------|---------|--------|
| `action-figure` | Generate action figure images from prompts | ✅ Implemented |
| `assistant-stream` | Stream AI assistant responses | ✅ Implemented |
| `crazy-image` | Generate surreal, creative images | ✅ Implemented |
| `create-payment-intent` | Create Stripe payment intents | ✅ Implemented |
| `ghibli-image` | Generate Studio Ghibli-style images | ✅ Implemented |
| `health-check` | Verify Edge Function environment | ✅ Implemented |
| `image-analysis` | Analyze and extract information from images | ✅ Implemented |
| `image-description` | Generate descriptions for image generation | ✅ Implemented |
| `image-enhancement` | Enhance images with AI | ✅ Implemented |
| `image-generation` | Generate images from text prompts | ✅ Implemented |
| `image-to-video` | Convert still images to short videos | ⚠️ Partially implemented (API response format) |
| `meme-generator` | Create personalized memes | ✅ Implemented |
| `prompt-recommendations` | Generate enhanced prompt suggestions | ✅ Implemented |
| `reference-image` | Generate images using reference images | ✅ Implemented |

## Recent Security & Compatibility Updates

### ✅ Completed Fixes
- **CORS Security**: Replaced wildcard origin (`*`) with environment-based configuration
- **API Key Validation**: Added validation for OpenAI, Gemini, and Stripe API keys
- **Input Sanitization**: Implemented comprehensive input validation and sanitization
- **Model Updates**: Migrated from deprecated `gpt-4-vision-preview` to `gpt-4o`
- **Deno Updates**: Updated standard library from v0.168.0 to v0.224.0
- **URL Validation**: Added proper URL validation for reference images

### ⚠️ Remaining Issues
- **Missing Implementations**: 12 out of 14 functions are placeholders
- **Error Handling**: Needs standardization across functions
- **TypeScript Types**: Missing proper typing for Deno runtime

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

# Set CORS allowed origins
supabase secrets set ALLOWED_ORIGINS=https://yourdomain.com,https://localhost:3000 --project-ref your-project-ref

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
supabase functions deploy ghibli-image --project-ref your-project-ref
supabase functions deploy meme-generator --project-ref your-project-ref
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
   curl -i --location --request POST 'http://localhost:54321/functions/v1/ghibli-image' \
   --header 'Authorization: Bearer YOUR_ANON_KEY' \
   --header 'Content-Type: application/json' \
   --data '{"provider":"gemini","prompt":"A beautiful sunset over mountains"}'
   ```

## Security Best Practices

### CORS Configuration
- Uses environment variable `ALLOWED_ORIGINS` instead of wildcard
- Supports multiple comma-separated origins
- Defaults to localhost for development

### Input Validation
- All user inputs are sanitized to prevent injection attacks
- URLs are validated before processing
- API keys are validated for correct format

### API Key Security
- Keys are validated for proper prefixes (sk-, AIza, sk_)
- Functions fail gracefully with invalid keys
- Keys are never logged or exposed in responses

## Troubleshooting

Common issues and solutions:

1. **CORS Errors**: Ensure `ALLOWED_ORIGINS` environment variable is set correctly.

2. **API Key Validation Errors**: Verify API keys start with correct prefixes:
   - OpenAI: `sk-`
   - Gemini: `AIza`
   - Stripe: `sk_`

3. **Input Validation Errors**: Check that prompts and URLs are properly formatted.

4. **Missing API Keys**: Verify that all required API keys are set in Supabase secrets.

5. **Deployment Errors**: Check for syntax errors in your TypeScript code. Run `tsc --noEmit` to validate.

6. **Failed Responses**: Check Supabase Edge Function logs in the dashboard for detailed error messages.

7. **API Limits**: Some errors may be due to hitting rate limits on third-party APIs.

## Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Runtime Documentation](https://docs.deno.com/runtime/manual)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)