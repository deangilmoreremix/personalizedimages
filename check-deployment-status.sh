#!/bin/bash
# Script to check the deployment status of Supabase Edge Functions

# Check if the project reference is provided
if [ "$1" == "" ]; then
  echo "Usage: ./check-deployment-status.sh YOUR_PROJECT_REF"
  echo "Example: ./check-deployment-status.sh abcdefghijklm"
  exit 1
fi

PROJECT_REF=$1
echo "Checking deployment status for project: $PROJECT_REF"

# List of all valid functions to check
FUNCTIONS=(
  "action-figure"
  "assistant-stream"
  "crazy-image"
  "create-payment-intent"
  "ghibli-image"
  "health-check"
  "image-analysis"
  "image-description"
  "image-enhancement"
  "image-generation"
  "image-to-video"
  "meme-generator"
  "prompt-recommendations"
  "reference-image"
)

# Check status of each function
echo "Function Name         | Status"
echo "------------------------|-----------------"

for func in "${FUNCTIONS[@]}"; do
  # Check if the function directory exists
  if [ -d "supabase/functions/$func" ]; then
    # Get the deployment status
    RESPONSE=$(supabase functions deploy $func --project-ref "$PROJECT_REF" --dry-run 2>&1)
    
    # Check if function exists or needs to be deployed
    if [[ $RESPONSE == *"has no changes"* ]]; then
      printf "%-22s | %s\n" "$func" "✓ Deployed"
    else
      printf "%-22s | %s\n" "$func" "✗ Not deployed"
    fi
  else
    printf "%-22s | %s\n" "$func" "! Directory not found"
  fi
done

# Now get the health check status
echo -e "\nChecking health-check function to verify API keys..."

HEALTH_RESPONSE=$(curl -s -X GET "https://$PROJECT_REF.supabase.co/functions/v1/health-check")

# Parse and display API key status
echo "$HEALTH_RESPONSE" | jq -r '.envVars | to_entries[] | "\(.key): \(if .value then "✓ Set" else "✗ Missing" end)"'

echo -e "\nDeployment status check complete!"