#!/bin/bash

# YJ Child Care Plus Deployment Script
# This script helps automate the deployment process

set -e

echo "🚀 Starting YJ Child Care Plus Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_status "Dependencies check passed!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install client dependencies
    cd client
    npm install
    cd ..
    
    # Install server dependencies
    cd server
    npm install
    cd ..
    
    print_status "Dependencies installed successfully!"
}

# Build the application
build_application() {
    print_status "Building the application..."
    
    # Build frontend
    cd client
    npm run build
    cd ..
    
    print_status "Application built successfully!"
}

# Deploy to Supabase
deploy_supabase() {
    print_status "Deploying to Supabase..."
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not found. Installing..."
        npm install -g supabase
    fi
    
    # Link to remote project (you'll need to provide project ref)
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        print_warning "SUPABASE_PROJECT_REF not set. Please set it or run manually:"
        echo "npx supabase link --project-ref your_project_ref"
    else
        npx supabase link --project-ref $SUPABASE_PROJECT_REF
    fi
    
    # Apply migrations
    npx supabase db push
    
    print_status "Supabase deployment completed!"
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend..."
    
    # Check which platform to deploy to
    if [ "$DEPLOY_PLATFORM" = "railway" ]; then
        deploy_railway
    elif [ "$DEPLOY_PLATFORM" = "render" ]; then
        deploy_render
    elif [ "$DEPLOY_PLATFORM" = "heroku" ]; then
        deploy_heroku
    else
        print_warning "No deployment platform specified. Please set DEPLOY_PLATFORM environment variable."
        print_status "Available options: railway, render, heroku"
    fi
}

# Deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    cd server
    railway up
    cd ..
    
    print_status "Railway deployment completed!"
}

# Deploy to Render
deploy_render() {
    print_status "Deploying to Render..."
    print_warning "Render deployment requires manual setup in the dashboard."
    print_status "Please follow the instructions in DEPLOYMENT_GUIDE.md"
}

# Deploy to Heroku
deploy_heroku() {
    print_status "Deploying to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        print_warning "Heroku CLI not found. Installing..."
        npm install -g heroku
    fi
    
    cd server
    git add .
    git commit -m "Deploy to Heroku"
    git push heroku main
    cd ..
    
    print_status "Heroku deployment completed!"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."
    
    # Check which platform to deploy to
    if [ "$FRONTEND_PLATFORM" = "vercel" ]; then
        deploy_vercel
    elif [ "$FRONTEND_PLATFORM" = "netlify" ]; then
        deploy_netlify
    else
        print_warning "No frontend platform specified. Please set FRONTEND_PLATFORM environment variable."
        print_status "Available options: vercel, netlify"
    fi
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    cd client
    vercel --prod
    cd ..
    
    print_status "Vercel deployment completed!"
}

# Deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    print_warning "Netlify deployment requires manual setup in the dashboard."
    print_status "Please follow the instructions in DEPLOYMENT_GUIDE.md"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "YJ Child Care Plus Deployment Script"
    echo "=========================================="
    
    # Check dependencies
    check_dependencies
    
    # Install dependencies
    install_dependencies
    
    # Build application
    build_application
    
    # Deploy to Supabase
    deploy_supabase
    
    # Deploy backend
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    echo "=========================================="
    print_status "Deployment completed successfully! 🎉"
    echo "=========================================="
    print_status "Don't forget to:"
    echo "1. Set up environment variables in your hosting platforms"
    echo "2. Configure CORS settings"
    echo "3. Set up custom domains (optional)"
    echo "4. Test all functionality"
    echo "=========================================="
}

# Parse command line arguments
case "${1:-}" in
    "check")
        check_dependencies
        ;;
    "install")
        install_dependencies
        ;;
    "build")
        build_application
        ;;
    "supabase")
        deploy_supabase
        ;;
    "backend")
        deploy_backend
        ;;
    "frontend")
        deploy_frontend
        ;;
    "all"|"")
        main
        ;;
    *)
        echo "Usage: $0 {check|install|build|supabase|backend|frontend|all}"
        echo ""
        echo "Commands:"
        echo "  check     - Check if all dependencies are installed"
        echo "  install   - Install all dependencies"
        echo "  build     - Build the application"
        echo "  supabase  - Deploy to Supabase"
        echo "  backend   - Deploy backend only"
        echo "  frontend  - Deploy frontend only"
        echo "  all       - Run complete deployment (default)"
        echo ""
        echo "Environment Variables:"
        echo "  DEPLOY_PLATFORM     - Backend platform (railway|render|heroku)"
        echo "  FRONTEND_PLATFORM   - Frontend platform (vercel|netlify)"
        echo "  SUPABASE_PROJECT_REF - Your Supabase project reference"
        exit 1
        ;;
esac 