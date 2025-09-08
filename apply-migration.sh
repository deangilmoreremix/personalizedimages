#!/bin/bash

# Script to apply the comprehensive database schema migration
# Run this after setting up Supabase authentication

echo "🚀 Applying Comprehensive Database Schema Migration"
echo "=================================================="

# Check if Supabase CLI is available
if ! command -v npx supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if project is linked
echo "📋 Checking Supabase project link..."
if ! npx supabase status &> /dev/null; then
    echo "❌ Project not linked. Please run:"
    echo "npx supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "Replace YOUR_PROJECT_REF with your actual project reference"
    exit 1
fi

echo "✅ Project is linked"

# Apply the migration
echo "📦 Applying database migration..."
npx supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🎉 Next steps:"
    echo "1. Run the integration tests: node test-schema-integration.js"
    echo "2. Test your application with the new schema"
    echo "3. Verify user authentication and data operations"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi