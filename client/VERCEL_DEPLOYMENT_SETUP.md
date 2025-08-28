# Vercel Deployment Setup

## Issue
The footer is trying to fetch classes from `/api/classes` but receiving HTML instead of JSON. This happens because Vercel doesn't have a backend API running.

## Solutions

### Solution 1: Set Environment Variable (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add a new environment variable:
   - **Name**: `VITE_APP_URL`
   - **Value**: Your backend server URL (e.g., `https://your-app.railway.app`)
4. Redeploy your application

### Solution 2: Update Production Configuration
1. Edit `src/config/production.js`
2. Replace `https://your-backend-server.com` with your actual backend URL
3. Redeploy your application

### Solution 3: Use Vercel Functions (Advanced)
If you want to keep everything on Vercel, you can create API routes using Vercel Functions.

## Backend Hosting Options
- **Railway**: `https://your-app-name.railway.app`
- **Render**: `https://your-app-name.onrender.com`
- **Heroku**: `https://your-app-name.herokuapp.com`
- **DigitalOcean**: `https://your-app-name.ondigitalocean.app`

## Current Status
The footer now gracefully handles API failures and won't break the page. However, the class links in the footer won't work until you configure the backend URL.

## Testing
After deployment, check the browser console for:
- API Base URL logs
- Any warnings about production configuration
- Successful API calls to your backend
