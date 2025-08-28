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
VITE_APP_URL = your-railway-backend-url.railway.app
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
```

### 2. API URL
- Replace `your-railway-backend-url.railway.app` with your actual Railway backend URL
- This should be the full URL where your backend is accessible

## Vercel Configuration

The project now includes a root-level `vercel.json` file that:
- Proxies all `/api/*` requests to your Railway backend
- Handles CORS headers properly
- Falls back to the frontend for non-API routes

**⚠️ IMPORTANT**: Before deploying, you must edit the `vercel.json` file and replace `your-railway-backend-url.railway.app` with your actual Railway backend URL.

## How It Works

### Development Mode
- Uses relative API paths (`/api/classes`, `/api/users`, etc.)
- Assumes backend is running locally on the same port

### Production Mode (Vercel)
- Uses relative API paths (`/api/classes`, `/api/users`, etc.)
- Vercel rewrites proxy these requests to your Railway backend
- Example: `/api/classes` → `https://your-railway-backend-url.railway.app/api/classes`

## Deployment Steps

1. **Edit the `vercel.json` file** and replace `your-railway-backend-url.railway.app` with your actual Railway backend URL
2. **Push your code** to GitHub (including the updated `vercel.json`)
3. **Set environment variables** in Vercel dashboard
4. **Deploy** - Vercel will automatically build and deploy
5. **Verify** - Check browser console for API Base URL logs

## Troubleshooting

### API Calls Returning HTML Instead of JSON
**Symptoms**: Console shows "Expected JSON but got: <!DOCTYPE html>"
**Cause**: API calls are hitting the frontend instead of the backend
**Solutions**:
1. Ensure `vercel.json` is in the root directory (not in client/)
2. Verify Vercel rewrites are working by checking the Functions tab in Vercel dashboard
3. Check that your Railway backend is accessible at the configured URL

### API Calls Returning 404
- Check that `VITE_APP_URL` is set correctly
- Verify your Railway backend is running and accessible
- Check browser console for API Base URL logs

### CORS Issues
- The `vercel.json` includes CORS headers for API routes
- Ensure your Railway backend also has CORS configured for your Vercel domain
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
   API Base URL: /api
   Environment: production
   Production mode detected - API calls will use relative paths
   Make sure Vercel rewrites are configured to proxy /api/* to your backend
   ```
3. Verify API calls are going through Vercel's rewrite rules

## Security Notes

- Never commit `.env` files to Git
- Use Vercel's environment variable system for production secrets
- Railway backend should have proper authentication and CORS configured
- The `vercel.json` includes CORS headers for development, but production should restrict origins
- **Never commit the actual backend URL to version control** - always use placeholders in templates
- The `vercel.json` file contains a placeholder URL that must be replaced with your actual backend URL before deployment

## Common Issues and Solutions

### Issue: Footer shows "Error fetching classes for footer"
**Solution**: This usually means the API rewrite isn't working. Check:
1. `vercel.json` is in the root directory
2. Railway backend is accessible
3. Vercel deployment completed successfully

### Issue: API calls return HTML instead of JSON
**Solution**: This indicates the rewrite rule isn't working. Verify:
1. The `vercel.json` file is properly formatted
2. Vercel has processed the configuration
3. Your Railway backend is responding to the proxied requests
