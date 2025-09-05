#!/bin/bash
# Script to set up and deploy all Supabase Edge Functions

# Check if the project reference is provided
if [ "$1" == "" ]; then
  echo "Usage: ./setup-edge-functions.sh YOUR_PROJECT_REF"
  echo "Example: ./setup-edge-functions.sh abcdefghijklm"
  exit 1
fi

PROJECT_REF=$1
echo "Setting up Supabase Edge Functions for project: $PROJECT_REF"

# Create a temporary .env file for deployment that excludes local-only variables
echo "Creating deployment environment configuration..."
grep -v "^#" .env.local | grep -v "^$" > .env.deploy

# Set up secrets from the deployment environment file
echo "Setting up API keys as Supabase secrets..."
while IFS='=' read -r key value; do
  # Skip empty lines and comments
  if [ -z "$key" ] || [[ "$key" == \#* ]]; then
    continue
  fi
  
  # Skip Supabase-specific variables that are already available in the Edge Function environment
  if [[ "$key" == SUPABASE_* ]]; then
    echo "Skipping Supabase variable: $key (already available in Edge Functions)"
    continue
  fi
  
  echo "Setting $key..."
  supabase secrets set "$key"="$value" --project-ref "$PROJECT_REF"
done < .env.deploy

# Clean up temporary file
rm .env.deploy

echo "Secrets configured!"

# Function to deploy a specific edge function
deploy_function() {
  # Check if the function directory exists and is a directory
  if [ -d "supabase/functions/$1" ]; then
    echo "Deploying function: $1..."
    supabase functions deploy "$1" --project-ref "$PROJECT_REF"
    if [ $? -eq 0 ]; then
      echo "✓ Successfully deployed $1"
    else
      echo "✗ Failed to deploy $1"
    fi
  else
    echo "Skipping $1 - not a valid function directory"
  fi
}

# Deploy the health-check function first to validate setup
echo "Deploying health-check function to validate setup..."
deploy_function "health-check"

# Ask user if they want to continue
read -p "Do you want to continue deploying all other functions? (y/n): " CONTINUE
if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
  echo "Deployment aborted."
  exit 0
fi

# List of all valid functions to deploy
FUNCTIONS=(
  "action-figure"
  "assistant-stream"
  "crazy-image"
  "create-payment-intent"
  "ghibli-image"
  "image-analysis"
  "image-description"
  "image-enhancement"
  "image-generation"
  "image-to-video"
  "meme-generator"
  "prompt-recommendations"
  "reference-image"
)

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
  deploy_function "$func"
  echo "------------------------------"
done

echo "Running post-deployment health check..."
curl -s -X GET https://$PROJECT_REF.supabase.co/functions/v1/health-check | jq .

echo "Deployment complete!"
echo "You can now use the Edge Functions in your application."