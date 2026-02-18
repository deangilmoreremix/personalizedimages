#!/bin/bash

# Setup ALLOWED_ORIGINS for Supabase Edge Functions
# This script configures which domains can access your API

PROJECT_REF="gyncvxxmvealrfnpnzhw"

echo "🔐 Setting up ALLOWED_ORIGINS for Supabase Edge Functions"
echo "=================================================="
echo ""

# Check if user wants to add production domain
echo "Do you have a production domain? (e.g., https://myapp.com)"
echo "Enter your production domain URL (or press Enter to skip):"
read -r PRODUCTION_DOMAIN

# Build the ALLOWED_ORIGINS list
ORIGINS="http://localhost:5173,http://localhost:3000"

if [ -n "$PRODUCTION_DOMAIN" ]; then
  # Remove trailing slash if present
  PRODUCTION_DOMAIN=${PRODUCTION_DOMAIN%/}

  # Add both www and non-www versions
  ORIGINS="$ORIGINS,$PRODUCTION_DOMAIN"

  # If it's https://, also add www version
  if [[ $PRODUCTION_DOMAIN == https://* ]]; then
    WWW_DOMAIN="${PRODUCTION_DOMAIN/https:\/\//https://www.}"
    ORIGINS="$ORIGINS,$WWW_DOMAIN"
  fi
fi

echo ""
echo "📋 ALLOWED_ORIGINS will be set to:"
echo "$ORIGINS"
echo ""
echo "This will allow requests from:"
echo "  ✓ Local development (http://localhost:5173)"
echo "  ✓ Alternative local port (http://localhost:3000)"
if [ -n "$PRODUCTION_DOMAIN" ]; then
  echo "  ✓ Your production domain"
fi
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "🚀 Setting ALLOWED_ORIGINS in Supabase..."

  # Set the secret
  supabase secrets set ALLOWED_ORIGINS="$ORIGINS" --project-ref "$PROJECT_REF"

  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! ALLOWED_ORIGINS has been configured."
    echo ""
    echo "📝 Next steps:"
    echo "1. Your edge functions will now accept requests from the configured domains"
    echo "2. If you add more domains later, run this script again"
    echo "3. Restart any running edge functions for changes to take effect"
    echo ""
    echo "💡 To verify your secrets, run:"
    echo "   supabase secrets list --project-ref $PROJECT_REF"
  else
    echo ""
    echo "❌ Failed to set ALLOWED_ORIGINS"
    echo "Make sure you're logged in with: supabase login"
  fi
else
  echo "Setup cancelled."
fi
