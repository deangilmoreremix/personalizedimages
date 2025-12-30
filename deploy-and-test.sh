#!/bin/bash

# Simple deployment script for VideoRemix

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check dependencies
check_deps() {
    log_info "Checking dependencies..."
    command -v supabase >/dev/null 2>&1 || { echo "Supabase CLI required"; exit 1; }
    command -v node >/dev/null 2>&1 || { echo "Node.js required"; exit 1; }
    command -v npm >/dev/null 2>&1 || { echo "npm required"; exit 1; }
    log_success "Dependencies OK"
}

# Setup environment
setup_env() {
    log_info "Setting up environment..."
    [ -f ".env" ] || cp .env.example .env
    log_success "Environment ready"
}

# Deploy database
deploy_db() {
    log_info "Deploying database..."
    supabase db push
    log_success "Database deployed"
}

# Deploy functions
deploy_functions() {
    log_info "Deploying functions..."
    supabase functions deploy
    log_success "Functions deployed"
}

# Build app
build_app() {
    log_info "Building application..."
    npm run build
    log_success "Build complete"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    npm test
    log_success "Tests passed"
}

# Main deployment function
main() {
    echo "🚀 VideoRemix Deployment"
    echo "========================"

    check_deps
    setup_env
    deploy_db
    deploy_functions
    build_app
    run_tests

    echo ""
    log_success "✅ Deployment complete!"
    echo "Run 'npm run preview' to test locally"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            echo "Usage: $0"
            echo "Simple deployment script for VideoRemix"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

main