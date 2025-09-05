#!/bin/bash
# Script to test Supabase Edge Functions connectivity

# Check if the project reference is provided
if [ "$1" == "" ]; then
  echo "Usage: ./test-edge-functions.sh YOUR_PROJECT_REF"
  echo "Example: ./test-edge-functions.sh abcdefghijklm"
  exit 1
fi

PROJECT_REF=$1
SUPABASE_URL="https://$PROJECT_REF.supabase.co"

# Get the ANON key for authorization
if [ -f ".env" ]; then
  SUPABASE_ANON_KEY=$(grep "VITE_SUPABASE_ANON_KEY" .env | cut -d '=' -f 2-)
elif [ -f ".env.local" ]; then
  SUPABASE_ANON_KEY=$(grep "VITE_SUPABASE_ANON_KEY" .env.local | cut -d '=' -f 2-)
else
  read -p "Enter your Supabase ANON KEY: " SUPABASE_ANON_KEY
fi

echo "🔍 Testing Edge Functions at $SUPABASE_URL"
echo "------------------------------------------------"

# First check the health endpoint
echo "📊 Checking health-check function..."
HEALTH_RESPONSE=$(curl -s -X GET "$SUPABASE_URL/functions/v1/health-check" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

# Check if response contains "status"
if echo "$HEALTH_RESPONSE" | grep -q "status"; then
  echo "✅ Health check successful!"
  
  # Parse the JSON and display environment variable status
  echo "🔑 API Key Status:"
  if command -v jq >/dev/null 2>&1; then
    # If jq is available, use it to parse the JSON
    echo "$HEALTH_RESPONSE" | jq -r '.envVars | to_entries[] | "\(.key): \(if .value then "✅ Set" else "❌ Missing" end)"'
  else
    # Basic grep fallback if jq is not available
    echo "$HEALTH_RESPONSE" | grep -o '"OPENAI_API_KEY":[^,}]*' | sed 's/"OPENAI_API_KEY":\([^,}]*\)/OPENAI_API_KEY: \1/'
    echo "$HEALTH_RESPONSE" | grep -o '"GEMINI_API_KEY":[^,}]*' | sed 's/"GEMINI_API_KEY":\([^,}]*\)/GEMINI_API_KEY: \1/'
    echo "$HEALTH_RESPONSE" | grep -o '"GIPHY_API_KEY":[^,}]*' | sed 's/"GIPHY_API_KEY":\([^,}]*\)/GIPHY_API_KEY: \1/'
    echo "$HEALTH_RESPONSE" | grep -o '"LEONARDO_API_KEY":[^,}]*' | sed 's/"LEONARDO_API_KEY":\([^,}]*\)/LEONARDO_API_KEY: \1/'
  fi
else
  echo "❌ Health check failed or returned unexpected response"
  echo "Response: $HEALTH_RESPONSE"
fi

echo "------------------------------------------------"

# List of functions to test
FUNCTIONS=(
  "action-figure"
  "assistant-stream"
  "crazy-image"
  "ghibli-image"
  "image-generation"
  "meme-generator"
  "reference-image"
)

# Test each function with CORS preflight (OPTIONS) request
echo "🔄 Testing CORS configuration for all functions..."
for func in "${FUNCTIONS[@]}"; do
  # Check OPTIONS request (CORS preflight)
  OPTIONS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$SUPABASE_URL/functions/v1/$func")
  
  if [ "$OPTIONS_RESPONSE" -eq 204 ]; then
    echo "✅ $func: CORS is properly configured"
  else
    echo "❌ $func: CORS issue - received $OPTIONS_RESPONSE instead of 204"
  fi
done

echo "------------------------------------------------"

# Function to test with actual data
test_function() {
  local func=$1
  local payload=$2
  
  echo "🧪 Testing $func with payload..."
  echo "   $payload"
  
  RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/$func" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload")
  
  # Check if the response contains an error
  if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ Test failed with error:"
    echo "$RESPONSE" | grep -o '"error":[^,}]*' | sed 's/"error":\([^,}]*\)/\1/'
  else
    echo "✅ Test successful! Response received"
    # Don't print the full response as it might be very large for image data
    echo "   Response contains data (use the browser debugger to see the full response)"
  fi
  
  echo "------------------------------------------------"
}

# Test image generation (basic test)
test_function "image-generation" '{"provider":"gemini","prompt":"A beautiful sunset over mountains"}'

# Test action figure generation
test_function "action-figure" '{"prompt":"A superhero action figure in a box","provider":"gemini"}'

# Test Ghibli style generation
test_function "ghibli-image" '{"prompt":"A peaceful mountain village with a river","provider":"gemini"}'

echo "✨ Edge Function testing complete!"
echo "If you see any errors, check your Supabase project configuration and make sure:"
echo "1. Your Edge Functions are properly deployed"
echo "2. Your API keys are set as Supabase secrets"
echo "3. Your functions have the correct CORS configuration"
echo ""
echo "For more detailed testing with browser debugging, visit:"
echo "http://localhost:5173/debug"