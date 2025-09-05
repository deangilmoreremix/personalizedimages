#!/bin/bash
# Script to verify all Supabase Edge Functions are working correctly

# Check if the project reference is provided
if [ "$1" == "" ]; then
  echo "Usage: ./verify-edge-functions.sh YOUR_PROJECT_REF"
  echo "Example: ./verify-edge-functions.sh abcdefghijklm"
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

echo "Verifying Edge Functions at $SUPABASE_URL"

# Function to check an edge function
check_function() {
  FUNCTION_NAME=$1
  SAMPLE_PAYLOAD=$2
  
  echo "Checking $FUNCTION_NAME..."
  
  RESPONSE=$(curl -s -X OPTIONS "$SUPABASE_URL/functions/v1/$FUNCTION_NAME")
  
  if [[ $RESPONSE == "" ]]; then
    echo "✓ CORS for $FUNCTION_NAME is correctly configured"
  else
    echo "✗ CORS for $FUNCTION_NAME returned unexpected response"
    echo "$RESPONSE"
  fi
  
  # If a sample payload is provided, also test the actual function with a real request
  if [[ -n "$SAMPLE_PAYLOAD" ]]; then
    echo "Testing $FUNCTION_NAME with sample payload..."
    
    RESP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPABASE_URL/functions/v1/$FUNCTION_NAME" \
      -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
      -H "Content-Type: application/json" \
      -d "$SAMPLE_PAYLOAD")
    
    if [[ $RESP_CODE -eq 200 ]]; then
      echo "✓ $FUNCTION_NAME is working correctly (Status: $RESP_CODE)"
    else
      echo "✗ $FUNCTION_NAME returned status $RESP_CODE"
    fi
  fi
  
  echo "------------------"
}

# First check the health endpoint
echo "Checking health-check function..."
HEALTH_RESPONSE=$(curl -s -X GET "$SUPABASE_URL/functions/v1/health-check" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

echo "$HEALTH_RESPONSE" | grep -q "status"
if [ $? -eq 0 ]; then
  echo "✓ Health check successful!"
  echo "$HEALTH_RESPONSE"
else
  echo "✗ Health check failed or returned unexpected response"
  echo "$HEALTH_RESPONSE"
fi
echo "------------------"

# Check all other functions
check_function "action-figure" '{"prompt":"A superhero action figure in a box","provider":"gemini"}'
check_function "assistant-stream" # Streaming endpoint, skip payload
check_function "crazy-image" '{"prompt":"A surreal floating island with giant teacups"}'
check_function "create-payment-intent" '{"amount":1,"currency":"usd"}'
check_function "ghibli-image" '{"prompt":"A peaceful mountain village with a river"}'
check_function "image-analysis" '{"imageUrl":"https://picsum.photos/200","action":"analyze"}'
check_function "image-description" '{"tokens":{"FIRSTNAME":"Sarah","COMPANY":"Acme"}}'
check_function "image-enhancement" '{"imageUrl":"https://picsum.photos/200","prompt":"Enhance colors"}'
check_function "image-generation" '{"provider":"gemini","prompt":"A beautiful sunset over mountains"}'
check_function "image-to-video" # Complex endpoint, skip payload
check_function "meme-generator" '{"topText":"When you realize","bottomText":"It's Friday","referenceImageUrl":"https://picsum.photos/200"}'
check_function "prompt-recommendations" '{"basePrompt":"A beautiful landscape"}'
check_function "reference-image" '{"basePrompt":"A professional portrait","provider":"gemini"}'

echo "Verification complete! Check the results above for any issues."