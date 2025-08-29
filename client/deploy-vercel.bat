@echo off
REM Vercel Deployment Script for YJ Child Care Plus (Windows)
REM This script helps deploy the frontend to Vercel with proper configuration

echo 🚀 Starting Vercel deployment process...
echo =====================================

REM Check if we're in the right directory
if not exist "vercel.json" (
    echo ❌ Error: vercel.json not found. Please run this script from the client directory.
    pause
    exit /b 1
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if we're logged in to Vercel
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please log in to Vercel...
    vercel login
)

REM Build the project
echo 📦 Building the project...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)

echo ✅ Build completed successfully!

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
call vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo 🎉 Deployment completed successfully!
    echo.
    echo 📋 Next steps:
    echo 1. Check your Vercel dashboard for the deployment URL
    echo 2. Verify environment variables are set correctly
    echo 3. Test the API proxy endpoint: /api/test-proxy
    echo 4. Try user registration to ensure 504 errors are resolved
    echo.
    echo 🔧 If you still get 504 errors:
    echo    - Check Vercel function logs for timeout details
    echo    - Verify Railway backend is responding quickly
    echo    - Ensure VITE_APP_URL is set correctly
) else (
    echo ❌ Deployment failed. Please check the error messages above.
    pause
    exit /b 1
)

pause
