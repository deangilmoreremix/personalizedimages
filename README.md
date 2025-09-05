# VideoRemix - AI-Powered Content Personalization

This project uses advanced AI models to create personalized images, videos, and creative content.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- API keys for AI services
- Supabase project (for Edge Functions)

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

4. Add your actual API keys to the `.env` file:

```
# Supabase credentials (required for Edge Functions)
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key

# AI API Keys - REQUIRED for using actual AI services
VITE_OPENAI_API_KEY=your_actual_openai_api_key
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
VITE_LEONARDO_API_KEY=your_actual_leonardo_api_key
VITE_GIPHY_API_KEY=your_actual_giphy_api_key

# OpenAI Assistant Configuration
VITE_OPENAI_ASSISTANT_ID=your_assistant_id_here
```

5. Start the development server:

```bash
npm run dev
```

## 🤖 AI Features

This application integrates with multiple AI providers:

- **OpenAI (DALL-E)**: For text-to-image generation
- **Google Gemini**: For image generation, editing, and analysis
- **Ideogram AI**: For image generation with precise text rendering

## ⚙️ Supabase Edge Functions

All AI API calls are routed through Supabase Edge Functions for security and consistency. The key Edge Functions include:

- `reference-image`: Unified handler for reference-based image generations
- `image-generation`: Handles text-to-image generation across providers
- `image-analysis`: Performs analysis on images using Gemini Vision
- `action-figure`: Specialized for action figure generation
- `ghibli-image`: Creates Studio Ghibli style imagery
- `crazy-image`: Generates surreal and creative images
- `meme-generator`: Creates customized memes
- `assistant-stream`: Streams AI assistant responses

### Deploying Edge Functions

To deploy the Edge Functions to your Supabase project:

1. Install the Supabase CLI:
```bash
npm install -g supabase
```

2. Login to your Supabase account:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Deploy all functions at once:
```bash
supabase functions deploy --project-ref your-project-ref
```

Or deploy individual functions:
```bash
supabase functions deploy reference-image --project-ref your-project-ref
supabase functions deploy image-generation --project-ref your-project-ref
# etc. for each function
```

### Setting Up Secrets

The Edge Functions require API keys to be set as environment variables. Set them using the Supabase CLI:

```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=your_actual_openai_api_key --project-ref your-project-ref

# Set Gemini API key
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key --project-ref your-project-ref

# Set any other required API keys
supabase secrets set LEONARDO_API_KEY=your_actual_leonardo_api_key --project-ref your-project-ref
supabase secrets set GIPHY_API_KEY=your_actual_giphy_api_key --project-ref your-project-ref
```

### Handling Edge Function Issues in WebContainer

In the WebContainer preview environment, edge functions cannot be accessed directly. The application is designed to gracefully fall back to:

1. Direct API calls where possible (with appropriate API keys from `.env`)
2. Placeholder content when API keys aren't available
3. Helpful error messages explaining the limitations

To fully experience the application's capabilities:
1. Set up your own Supabase project with the edge functions
2. Configure necessary API keys both in your environment and Supabase secrets
3. Update the SUPABASE_URL and SUPABASE_ANON_KEY in your .env file

### Testing Edge Functions Locally

You can test the Edge Functions locally before deploying:

1. Start the local Supabase environment:
```bash
supabase start
```

2. Run a specific function locally:
```bash
supabase functions serve reference-image --env-file .env.local
```

3. Test the function with curl or any API client:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/reference-image' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"provider":"gemini","prompt":"A beautiful sunset","referenceImageUrl":"https://example.com/image.jpg"}'
```

## 📡 API Integration Flow

The application uses a consistent pattern for integrating with AI services:

1. First, attempt to call the Supabase Edge Function
2. If the Edge Function is unavailable or fails, fall back to direct API calls
3. Always handle errors gracefully with informative messages

Here's an example of this pattern:

```typescript
export async function generateImageWithProvider(prompt: string): Promise<string> {
  try {
    // Try edge function first
    try {
      const result = await callEdgeFunction('image-generation', { 
        provider: 'gemini',
        prompt
      });
      
      if (result && result.imageUrl) {
        return result.imageUrl;
      }
    } catch (edgeError) {
      console.warn('Edge function failed:', edgeError);
    }
    
    // Fall back to direct API call
    // Make the direct API call here
    
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}
```

## 🔒 Authentication & Security

The Edge Functions handle authentication using Supabase Auth. The client-side code passes either:
- The user's JWT token if they're authenticated
- The anonymous key for unauthenticated requests

This ensures proper authorization for all API calls and maintains security best practices.

## 🔍 Troubleshooting

### Edge Function Errors

1. Check your Supabase URL and Anon Key in the `.env` file
2. Ensure API keys are properly set as secrets in Supabase
3. Look for CORS issues if getting 401 errors
4. Check Edge Function logs in the Supabase dashboard

### AI Provider Errors

1. Verify your API keys are valid and not expired
2. Check for rate limiting or quota exceeded errors
3. Ensure prompt content complies with provider's content policies

## 📚 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📃 License

This project is licensed under the MIT License - see the LICENSE file for details.