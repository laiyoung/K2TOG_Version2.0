#!/bin/bash

echo "🚀 Deploying Frontend to Vercel..."
echo "📁 Current directory: $(pwd)"

# Navigate to client directory
cd client

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the project..."
npm run build

echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your frontend should be live at the URL provided above"
