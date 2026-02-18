#!/bin/bash

# Freepik API Setup Script
# This script helps you configure Freepik API in your application

set -e

PROJECT_REF="gyncvxxmvealrfnpnzhw"
EDGE_FUNCTION="freepik-resources"

echo "🎨 Freepik API Setup"
echo "===================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo ""
    echo "Install it with:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

# Get API key from user
echo "📝 Please enter your Freepik API key:"
echo "(Get it from: https://www.freepik.com/api)"
echo ""
read -r -p "Freepik API Key: " FREEPIK_API_KEY

if [ -z "$FREEPIK_API_KEY" ]; then
    echo "❌ API key is required"
    exit 1
fi

echo ""
echo "Choose setup type:"
echo "1) Local Development Only (.env file)"
echo "2) Production (Supabase secrets + edge function)"
echo "3) Both (recommended)"
echo ""
read -r -p "Enter choice (1/2/3): " SETUP_CHOICE

# Local development setup
if [ "$SETUP_CHOICE" = "1" ] || [ "$SETUP_CHOICE" = "3" ]; then
    echo ""
    echo "📁 Setting up local development..."

    # Check if .env exists
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            echo "✅ Created .env from .env.example"
        else
            touch .env
            echo "✅ Created .env file"
        fi
    fi

    # Add or update Freepik API key
    if grep -q "VITE_FREEPIK_API_KEY" .env; then
        # Update existing key
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/VITE_FREEPIK_API_KEY=.*/VITE_FREEPIK_API_KEY=$FREEPIK_API_KEY/" .env
        else
            sed -i "s/VITE_FREEPIK_API_KEY=.*/VITE_FREEPIK_API_KEY=$FREEPIK_API_KEY/" .env
        fi
        echo "✅ Updated VITE_FREEPIK_API_KEY in .env"
    else
        # Add new key
        echo "" >> .env
        echo "# Freepik API" >> .env
        echo "VITE_FREEPIK_API_KEY=$FREEPIK_API_KEY" >> .env
        echo "✅ Added VITE_FREEPIK_API_KEY to .env"
    fi
fi

# Production setup
if [ "$SETUP_CHOICE" = "2" ] || [ "$SETUP_CHOICE" = "3" ]; then
    echo ""
    echo "🚀 Setting up production..."

    # Check if logged in to Supabase
    if ! supabase projects list &> /dev/null; then
        echo "❌ Not logged in to Supabase"
        echo ""
        echo "Login with:"
        echo "  supabase login"
        echo ""
        exit 1
    fi

    # Set the secret
    echo "🔐 Setting Supabase secret..."
    supabase secrets set FREEPIK_API_KEY="$FREEPIK_API_KEY" --project-ref "$PROJECT_REF"

    if [ $? -eq 0 ]; then
        echo "✅ Secret set successfully"
    else
        echo "❌ Failed to set secret"
        exit 1
    fi

    # Deploy edge function
    echo ""
    read -r -p "Deploy edge function now? (y/n) " DEPLOY_FUNCTION

    if [[ $DEPLOY_FUNCTION =~ ^[Yy]$ ]]; then
        echo "📦 Deploying edge function..."

        if [ -d "supabase/functions/$EDGE_FUNCTION" ]; then
            supabase functions deploy "$EDGE_FUNCTION" --project-ref "$PROJECT_REF"

            if [ $? -eq 0 ]; then
                echo "✅ Edge function deployed successfully"
            else
                echo "❌ Failed to deploy edge function"
                exit 1
            fi
        else
            echo "❌ Edge function directory not found"
            echo "Expected: supabase/functions/$EDGE_FUNCTION"
            exit 1
        fi
    fi
fi

echo ""
echo "✨ Setup Complete!"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Read the Quick Start Guide:"
echo "   cat FREEPIK_QUICKSTART.md"
echo ""
echo "2. View the full integration guide:"
echo "   cat FREEPIK_API_INTEGRATION_GUIDE.md"
echo ""
echo "3. Try the demo page:"
echo "   npm run dev"
echo "   Then visit: http://localhost:5173/freepik-demo"
echo ""
echo "4. Test your integration:"
echo "   - Use FreepikResourceGallery component"
echo "   - Or use stockImageService directly"
echo ""

if [ "$SETUP_CHOICE" = "2" ] || [ "$SETUP_CHOICE" = "3" ]; then
    echo "5. Verify your secrets:"
    echo "   supabase secrets list --project-ref $PROJECT_REF"
    echo ""
fi

echo "🎉 Happy coding!"
