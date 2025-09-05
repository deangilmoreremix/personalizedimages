```markdown
    # VideoRemix - AI-Powered Content Personalization

    This project uses advanced AI models to create personalized images, videos, and creative content.

    ## 🚀 Getting Started

    ### Prerequisites

    - Node.js 18+ and npm
    - API keys for AI services (OpenAI, Google Gemini, Giphy, Leonardo.ai)
    - Supabase project (for Edge Functions and Database)
    - GitHub account (for deployment)

    ### Setup

    1.  **Clone the repository**:
        ```bash
        git clone https://github.com/your-username/VideoRemix.git
        cd VideoRemix
        ```

    2.  **Install dependencies**:
        ```bash
        npm install
        ```

    3.  **Configure Environment Variables**:
        Copy the `.env.example` file to `.env` and fill in your actual API keys and Supabase credentials:
        ```bash
        cp .env.example .env
        ```
        Edit the `.env` file:
        ```
        # Supabase credentials (required for Edge Functions and Database)
        VITE_SUPABASE_URL=your_actual_supabase_url
        VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key

        # AI API Keys - REQUIRED for using actual AI services
        VITE_OPENAI_API_KEY=your_actual_openai_api_key
        VITE_GEMINI_API_KEY=your_actual_gemini_api_key
        VITE_LEONARDO_API_KEY=your_actual_leonardo_api_key
        VITE_GIPHY_API_KEY=your_actual_giphy_api_key

        # OpenAI Assistant Configuration
        VITE_OPENAI_ASSISTANT_ID=your_assistant_id_here

        # Stripe API Keys (for premium features like video downloads)
        VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
        ```

    4.  **Start the development server**:
        ```bash
        npm run dev
        ```
        The application will be accessible at `http://localhost:5173`.

    ## 🤖 AI Features

    This application integrates with multiple AI providers to offer a wide range of creative tools:

    -   **OpenAI (DALL-E)**: For text-to-image generation.
    -   **Google Gemini**: For image generation, editing, analysis, and advanced multimodal capabilities.
    -   **Ideogram AI**: (Potentially integrated via Edge Functions) For image generation with precise text rendering.
    -   **Giphy**: For GIF-related functionalities.
    -   **Leonardo.ai**: For additional image generation options.

    ## ⚙️ Supabase Integration

    All AI API calls are routed through Supabase Edge Functions for enhanced security, performance, and consistency. Supabase also handles user authentication and database management.

    ### Database Schema

    The application uses a PostgreSQL database managed by Supabase. Key tables include:

    -   `users`: Stores user profiles and authentication data.
    -   `user_generated_images`: Stores metadata and URLs of AI-generated images.
    -   `user_generated_videos`: Stores metadata and URLs of AI-generated videos.
    -   `user_generated_gifs`: Stores metadata and URLs of AI-generated GIFs.
    -   `api_usage`: Logs API calls for usage tracking and analytics.
    -   `ai_settings`: Stores user-specific AI model preferences and API keys.
    -   `user_payments`: Records video download purchases via Stripe.
    -   `personalization_tokens`: Manages custom personalization tokens.

    ### Supabase Edge Functions

    The project utilizes several Supabase Edge Functions to securely handle AI API interactions and other backend logic:

    -   `action-figure`: Generates action figure images.
    -   `assistant-stream`: Streams AI assistant responses.
    -   `crazy-image`: Generates surreal images.
    -   `create-payment-intent`: Handles Stripe payment intent creation.
    -   `ghibli-image`: Generates Studio Ghibli-style images.
    -   `health-check`: Verifies Edge Function environment and API key status.
    -   `image-analysis`: Analyzes images using AI.
    -   `image-description`: Generates detailed image descriptions for AI prompts.
    -   `image-enhancement`: Enhances images with AI.
    -   `image-generation`: General text-to-image generation across providers.
    -   `image-to-video`: Converts still images to videos.
    -   `meme-generator`: Creates personalized memes.
    -   `prompt-recommendations`: Provides AI-generated prompt suggestions.
    -   `reference-image`: Generates images based on a reference image.

    ### Deploying Edge Functions

    To deploy the Edge Functions to your Supabase project:

    1.  **Install the Supabase CLI**:
        ```bash
        npm install -g supabase
        ```

    2.  **Login to your Supabase account**:
        ```bash
        supabase login
        ```

    3.  **Link your project**:
        ```bash
        supabase link --project-ref your-project-ref
        ```

    4.  **Set Up Secrets**:
        The Edge Functions require API keys to be set as environment variables in your Supabase project. Use the `setup-edge-functions.sh` script to set these secrets and deploy all functions:
        ```bash
        ./setup-edge-functions.sh your-project-ref
        ```
        This script will prompt you to confirm the deployment of all functions.

    5.  **Deploy Individual Functions (Optional)**:
        If you only want to deploy specific functions, use:
        ```bash
        supabase functions deploy [function-name] --project-ref your-project-ref
        ```
        Example:
        ```bash
        supabase functions deploy image-generation --project-ref your-project-ref
        ```

    ### Local Edge Function Testing

    You can test the Edge Functions locally before deploying:

    1.  **Start the local Supabase environment**:
        ```bash
        supabase start
        ```

    2.  **Serve functions locally**:
        ```bash
        supabase functions serve --env-file .env
        ```

    3.  **Test a function with `curl`**:
        ```bash
        curl -i --location --request POST 'http://localhost:54321/functions/v1/image-generation' \
          --header 'Authorization: Bearer YOUR_ANON_KEY' \
          --header 'Content-Type: application/json' \
          --data '{"provider":"gemini","prompt":"A beautiful sunset over mountains"}'
        ```

    ## 🚀 Deployment

    This application can be easily deployed to platforms like Netlify, Vercel, or any static site hosting service.

    ### Deploy to Netlify

    1.  **Connect to GitHub**: Sign in to Netlify with your GitHub account.
    2.  **New Site from Git**: Click "Add new site" -> "Import an existing project" -> "Deploy with GitHub".
    3.  **Select Repository**: Choose the `VideoRemix` repository.
    4.  **Build Settings**:
        -   **Branch to deploy**: `main` (or your preferred branch)
        -   **Base directory**: (leave empty if your project is at the root)
        -   **Build command**: `npm run build`
        -   **Publish directory**: `dist`
    5.  **Environment Variables**: Add the same `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and AI API keys (`VITE_OPENAI_API_KEY`, `VITE_GEMINI_API_KEY`, etc.) as you have in your local `.env` file.
    6.  **Deploy Site**: Click "Deploy site".

    ## 🔍 Troubleshooting

    ### Edge Function Errors

    1.  **"Failed to deploy edge function: slug: Invalid"**: This usually means you're trying to deploy a non-function file. Ensure your deployment command only targets valid function directories. The provided `setup-edge-functions.sh` script handles this.
    2.  **"No logs usually indicate a CORS error"**: Ensure your Edge Functions have proper CORS headers. This is typically handled by Supabase's default function setup.
    3.  **"API key missing or empty"**: Verify your API keys are correctly set as Supabase secrets using `supabase secrets set KEY=VALUE --project-ref your-project-ref`.
    4.  **Function works locally but not in production**: Double-check that all necessary environment variables are set as secrets in your Supabase project settings.

    ### AI Provider Errors

    1.  **Invalid API Key**: Ensure your API keys are correct and active for the respective AI services.
    2.  **Rate Limiting/Quota Exceeded**: Monitor your usage on the AI provider's dashboard. Implement retry logic with exponential backoff if you hit rate limits.
    3.  **Content Policy Violations**: Some prompts might violate content policies. Adjust your prompts if you encounter such errors.

    ## 📚 Project Structure

    ```
    .
    ├── public/                 # Static assets (e.g., email templates)
    ├── src/                    # React application source code
    │   ├── assets/             # Images, icons, etc.
    │   ├── auth/               # Authentication context and logic
    │   ├── components/         # Reusable React components
    │   │   ├── ui/             # UI-specific components (buttons, dialogs, etc.)
    │   │   └── ...             # Feature-specific components (e.g., ImageEditor, MemeGenerator)
    │   ├── data/               # Static data (e.g., action figure prompts, cartoon themes)
    │   ├── hooks/              # Custom React hooks
    │   ├── pages/              # Application pages (e.g., EditorPage, FontsPage)
    │   ├── services/           # External service integrations (e.g., FontService)
    │   ├── types/              # TypeScript type definitions
    │   └── utils/              # Utility functions (API calls, Supabase client, etc.)
    ├── supabase/               # Supabase Edge Functions and migrations
    │   ├── functions/          # Individual Edge Function source code
    │   └── migrations/         # Database migration files
    ├── .env.example            # Example environment variables
    ├── package.json            # Project dependencies and scripts
    ├── README.md               # Project documentation
    ├── setup-edge-functions.sh # Script to set Supabase secrets and deploy functions
    ├── test-edge-functions.sh  # Script to test deployed Edge Functions
    ├── vite.config.ts          # Vite build configuration
    └── tailwind.config.js      # Tailwind CSS configuration
    ```

    ## 🤝 Contributing

    Contributions are welcome! Please follow these steps:

    1.  Fork the repository.
    2.  Create a new branch (`git checkout -b feature/your-feature-name`).
    3.  Make your changes.
    4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
    5.  Push to the branch (`git push origin feature/your-feature-name`).
    6.  Open a Pull Request.

    ## 📃 License

    This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
    ```