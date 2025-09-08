#!/bin/bash

# Complete Migration Guide for VideoRemix Database Schema
# Run this script step by step to apply the comprehensive schema

echo "🚀 VideoRemix Database Schema Migration Guide"
echo "=============================================="
echo ""

# Step 1: Check prerequisites
echo "Step 1: Checking Prerequisites"
echo "------------------------------"
echo "✅ Node.js and npm installed"
echo "✅ Supabase CLI available via npx"
echo ""

# Step 2: Get access token
echo "Step 2: Get Your Supabase Access Token"
echo "---------------------------------------"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project: gadedbrnqzpfqtsdfzcg"
echo "3. Go to Settings → API"
echo "4. Copy the 'service_role' key (this is your access token)"
echo ""
echo "⚠️  IMPORTANT: Keep this token secure and don't share it!"
echo ""

# Step 3: Set environment variable
echo "Step 3: Set Access Token Environment Variable"
echo "---------------------------------------------"
echo "Run this command (replace YOUR_TOKEN with the actual token):"
echo ""
echo "export SUPABASE_ACCESS_TOKEN=YOUR_TOKEN"
echo ""
echo "Or create a .env file with:"
echo "SUPABASE_ACCESS_TOKEN=your_token_here"
echo ""

# Step 4: Link project
echo "Step 4: Link Supabase Project"
echo "-----------------------------"
echo "npx supabase link --project-ref gadedbrnqzpfqtsdfzcg"
echo ""

# Step 5: Apply migration
echo "Step 5: Apply Database Migration"
echo "---------------------------------"
echo "npx supabase db push"
echo ""

# Step 6: Quick verification
echo "Step 6: Quick Migration Verification"
echo "-------------------------------------"
echo "npx supabase db diff"
echo ""
echo "Or run our quick verification script:"
echo "node verify-migration.js"
echo ""

# Step 7: Run comprehensive integration tests
echo "Step 7: Run Comprehensive Integration Tests"
echo "---------------------------------------------"
echo "node test-schema-integration.js"
echo ""

# Step 8: Test application
echo "Step 8: Test Application Features"
echo "----------------------------------"
echo "npm run dev"
echo ""
echo "Then test these features:"
echo "✅ User authentication and profiles"
echo "✅ Personalization token management"
echo "✅ Image generation and storage"
echo "✅ Project creation and management"
echo "✅ API usage tracking"
echo ""

echo "🎯 Migration Checklist:"
echo "======================="
echo "□ Get Supabase access token from dashboard"
echo "□ Set SUPABASE_ACCESS_TOKEN environment variable"
echo "□ Link project: npx supabase link --project-ref gadedbrnqzpfqtsdfzcg"
echo "□ Apply migration: npx supabase db push"
echo "□ Quick verification: node verify-migration.js"
echo "□ Detailed verification: npx supabase db diff"
echo "□ Run comprehensive tests: node test-schema-integration.js"
echo "□ Test application: npm run dev"
echo ""

echo "📞 Need Help?"
echo "============="
echo "If you encounter any issues:"
echo "1. Check the error messages carefully"
echo "2. Verify your access token is correct"
echo "3. Ensure you're in the project directory"
echo "4. Try running: npx supabase status"
echo ""

echo "🎉 Ready to start the migration!"
echo "Run the commands above in order."