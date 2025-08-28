# Vercel Deployment Guide

## Overview
This guide explains how to deploy the YJ Child Care Plus frontend to Vercel while connecting it to your Railway backend using a secure API proxy.

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

**Note**: `VITE_APP_URL` should be your Railway backend URL without the `https://` prefix (e.g., `your-railway-backend-url.railway.app`)

### 2. API URL
- Replace `your-railway-backend-url.railway.app` with your actual Railway backend URL
- This should be the full URL where your backend is accessible (without the protocol)

## Vercel Configuration

The project now includes:
- A `vercel.json` file in the client directory that routes API calls to a secure proxy
- An API proxy function (`client/api/api-proxy/[...path].js`) that forwards requests to your backend
- Environment variable-based configuration for security

**✅ SECURE**: No backend URLs are exposed in public files - everything is configured via environment variables.

## How It Works

### Development Mode
- Uses relative API paths (`/api/classes`, `/api/users`, etc.)
- Assumes backend is running locally on the same port

### Production Mode (Vercel)
- Uses relative API paths (`/api/classes`, `/api/users`, etc.)
- Vercel routes `/api/*` requests to the API proxy function
- The proxy function reads your backend URL from environment variables
- Requests are securely forwarded to your Railway backend

## Deployment Steps

1. **Set environment variables** in Vercel dashboard (including `VITE_APP_URL`)
2. **Push your code** to GitHub (including the new `vercel.json` and API proxy)
3. **Deploy** - Vercel will automatically build and deploy
4. **Verify** - Check browser console for API Base URL logs

## Troubleshooting

### API Calls Returning HTML Instead of JSON
**Symptoms**: Console shows "Expected JSON but got: <!DOCTYPE html>"
**Cause**: API calls are hitting the frontend instead of the backend
**Solutions**:
1. Ensure `vercel.json` is in the client directory
2. Verify the API proxy function exists at `client/api/api-proxy/[...path].js`
3. Check that `VITE_APP_URL` environment variable is set correctly in Vercel

### API Calls Returning 404
- Check that `VITE_APP_URL` is set correctly in Vercel dashboard
- Verify your Railway backend is running and accessible
- Check browser console for API Base URL logs

### CORS Issues
- The API proxy function handles CORS headers automatically
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
3. Verify API calls are going through the proxy function

## Security Notes

- ✅ **Never commit `.env` files to Git**
- ✅ **Use Vercel's environment variable system for production secrets**
- ✅ **No backend URLs are exposed in public files**
- ✅ **API proxy function reads backend URL from environment variables**
- Railway backend should have proper authentication and CORS configured
- The API proxy includes CORS headers for development, but production should restrict origins

## Common Issues and Solutions

### Issue: Footer shows "Error fetching classes for footer"
**Solution**: This usually means the API proxy isn't working. Check:
1. `vercel.json` is in the client directory
2. API proxy function exists at `client/api/api-proxy/[...path].js`
3. `VITE_APP_URL` environment variable is set in Vercel
4. Railway backend is accessible

### Issue: API calls return HTML instead of JSON
**Solution**: This indicates the proxy isn't working. Verify:
1. The `vercel.json` file is properly formatted
2. The API proxy function is deployed
3. Environment variables are set correctly
4. Your Railway backend is responding to the proxied requests
