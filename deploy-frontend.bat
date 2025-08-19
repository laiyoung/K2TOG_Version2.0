@echo off
echo 🚀 Deploying Frontend to Vercel...
echo 📁 Current directory: %CD%

REM Navigate to client directory
cd client

echo 📦 Installing dependencies...
call npm install

echo 🔨 Building the project...
call npm run build

echo 🚀 Deploying to Vercel...
call vercel --prod

echo ✅ Deployment complete!
echo 🌐 Your frontend should be live at the URL provided above
pause
