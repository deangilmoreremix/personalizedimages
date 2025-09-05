# Setting Up Supabase Edge Function Secrets

This guide walks you through setting up the required secrets for the VideoRemix Supabase Edge Functions.

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Supabase project created
- API keys for OpenAI and Google Gemini

## Required Secrets

The following secrets need to be configured for the Edge Functions to work properly:

| Secret Name | Description | Required By |
|-------------|-------------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key | `image-generation`, `action-figure`, `meme-generator`, etc. |
| `GEMINI_API_KEY` | Your Google Gemini API key | All image generation and analysis functions |
| `GIPHY_API_KEY` | Your GIPHY API key (optional) | For GIF-related functions |
| `LEONARDO_API_KEY` | Your Leonardo.ai API key (optional) | For additional image generation options |

## Setting Up Secrets

Use the Supabase CLI to set secrets:

```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=your_actual_openai_api_key --project-ref your-project-ref

# Set Gemini API key
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key --project-ref your-project-ref

# Set other API keys as needed
supabase secrets set GIPHY_API_KEY=your_actual_giphy_api_key --project-ref your-project-ref
supabase secrets set LEONARDO_API_KEY=your_actual_leonardo_api_key --project-ref your-project-ref
```

## Verifying Secrets

You can verify that your secrets are correctly set by:

1. Checking the Supabase dashboard under Settings > API
2. Testing the function with a simple request
3. Checking the logs for the Edge Function in the Supabase dashboard

## Rotating Secrets

If you need to update a secret:

```bash
# Update an existing secret
supabase secrets set OPENAI_API_KEY=your_new_openai_api_key --project-ref your-project-ref
```

## Local Development with Secrets

For local development, create a `.env.local` file with your secrets:

```
OPENAI_API_KEY=your_actual_openai_api_key
GEMINI_API_KEY=your_actual_gemini_api_key
```

Then start the local Supabase environment with your secrets:

```bash
supabase start
supabase functions serve --env-file .env.local
```

## Troubleshooting

### Common Issues

1. **"API key not found" errors**
   - Ensure the secret is correctly set with the exact name expected by the function
   - Verify the API key is valid and active

2. **Function works locally but not in production**
   - Make sure you've deployed the function after setting secrets
   - Check that secrets are set in the production environment

3. **CORS errors**
   - Ensure your Edge Functions have proper CORS headers

### Logs

Check the Edge Function logs in the Supabase dashboard for detailed error information:

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions
3. Select the function you want to check
4. View the logs tab