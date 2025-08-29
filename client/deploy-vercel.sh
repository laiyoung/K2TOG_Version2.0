#!/bin/bash

# Vercel Deployment Script for YJ Child Care Plus
# This script helps deploy the frontend to Vercel with proper configuration

echo "🚀 Starting Vercel deployment process..."
echo "====================================="

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please run this script from the client directory."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Check your Vercel dashboard for the deployment URL"
    echo "2. Verify environment variables are set correctly"
    echo "3. Test the API proxy endpoint: /api/test-proxy"
    echo "4. Try user registration to ensure 504 errors are resolved"
    echo ""
    echo "🔧 If you still get 504 errors:"
    echo "   - Check Vercel function logs for timeout details"
    echo "   - Verify Railway backend is responding quickly"
    echo "   - Ensure VITE_APP_URL is set correctly"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
