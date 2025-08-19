# Vercel Deployment Guide

## Overview
This guide explains how to deploy the YJ Child Care Plus frontend to Vercel while connecting it to your Railway backend.

## Prerequisites
- Railway backend deployed and running
- Vercel account
- GitHub repository connected to Vercel

## Environment Variables Setup

### 1. In Vercel Dashboard
1. Go to your project in Vercel
2. Navigate to Settings → Environment Variables
3. Add the following environment variables:

```
VITE_API_URL = yjchildcareplus-nodeenv.up.railway.app
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
```

### 2. API URL
- Replace `https://your-railway-app.railway.app` with your actual Railway backend URL
- This should be the full URL where your backend is accessible

## How It Works

### Development Mode
- Uses relative API paths (`/api/classes`, `/api/users`, etc.)
- Assumes backend is running locally on the same port

### Production Mode (Vercel)
- Uses the `VITE_API_URL` environment variable for all API calls
- Automatically adds `https://` protocol and `/api` prefix if needed
- Example: `https://yjchildcareplus-nodeenv.up.railway.app/api/classes`

## Deployment Steps

1. **Push your code** to GitHub
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy
4. **Verify** - Check browser console for API Base URL logs

## Troubleshooting

### API Calls Returning 404
- Check that `VITE_API_URL` is set correctly
- Verify your Railway backend is running and accessible
- Check browser console for API Base URL logs

### CORS Issues
- Ensure your Railway backend has CORS configured for your Vercel domain
- Add your Vercel domain to allowed origins in backend

### Environment Variables Not Working
- Verify variables are set in Vercel dashboard
- Check that variable names start with `VITE_`
- Redeploy after setting environment variables

## Testing

After deployment:
1. Open browser console
2. Look for these log messages:
   ```
   API Base URL: https://your-railway-app.railway.app
   Environment: production
   API URL from env: https://your-railway-app.railway.app
   ```
3. Verify API calls are going to the correct URL

## Security Notes

- Never commit `.env` files to Git
- Use Vercel's environment variable system for production secrets
- Railway backend should have proper authentication and CORS configured
