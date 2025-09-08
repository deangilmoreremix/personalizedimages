#!/bin/bash
# Script to deploy Supabase Edge Functions

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first."
    echo "You can install it using: npm install -g supabase"
    exit 1
fi

# Check if logged in to Supabase
supabase_status=$(supabase status 2>&1)
if [[ $supabase_status == *"not logged in"* ]]; then
    echo "You are not logged in to Supabase. Please login first."
    echo "Run: supabase login"
    exit 1
fi

# Ask for project reference
read -p "Enter your Supabase project reference (found in project settings): " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "Project reference is required."
    exit 1
fi

echo "Deploying Edge Functions to project: $PROJECT_REF"

# Create a temporary .env file for deployment that excludes local-only variables
echo "Creating deployment environment configuration..."
grep -v "^#" .env | grep -v "^$" > .env.deploy

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

# Automatically discover all valid functions (directories with index.ts)
echo "Discovering Edge Functions..."
FUNCTIONS=()
for dir in supabase/functions/*/; do
  if [ -d "$dir" ]; then
    func_name=$(basename "$dir")
    # Skip non-function files and directories
    if [ -f "$dir/index.ts" ] && [ "$func_name" != "health-check" ]; then
      FUNCTIONS+=("$func_name")
      echo "Found function: $func_name"
    fi
  fi
done

if [ ${#FUNCTIONS[@]} -eq 0 ]; then
  echo "No valid Edge Functions found to deploy."
  exit 0
fi

# Ask user if they want to continue
read -p "Do you want to continue deploying all other functions? (y/n): " CONTINUE
if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
  echo "Deployment aborted."
  exit 0
fi

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
  deploy_function "$func"
  echo "------------------------------"
done

echo "Running post-deployment health check..."
curl -s -X GET https://$PROJECT_REF.supabase.co/functions/v1/health-check | jq .

echo "Deployment complete!"
echo "You can now use the Edge Functions in your application."