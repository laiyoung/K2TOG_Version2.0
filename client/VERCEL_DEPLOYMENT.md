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
- An API proxy function (`client/api/api-proxy.js`) that forwards requests to your backend
- Environment variable-based configuration for security
- **60-second timeout** for API proxy functions to prevent 504 Gateway Timeout errors

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
- **25-second timeout** with proper error handling to prevent hanging requests

## Deployment Steps

1. **Set environment variables** in Vercel dashboard (including `VITE_APP_URL`)
2. **Push your code** to GitHub (including the new `vercel.json` and API proxy)
3. **Deploy** - Vercel will automatically build and deploy
4. **Verify** - Check browser console for API Base URL logs
5. **Test** - Use the verification script: `node verify-deployment.js`

## Troubleshooting

### 504 Gateway Timeout Error
**Symptoms**: Console shows "POST /api/users/register 504 (Gateway Timeout)"
**Causes**: 
- Backend is slow to respond (common during user registration)
- Network latency between Vercel and Railway
- Database operations taking too long

**Solutions**:
1. ✅ **Updated timeout settings** - API proxy now has 60-second limit
2. ✅ **Better error handling** - 25-second timeout with clear error messages
3. Check Railway backend performance and database queries
4. Verify environment variables are set correctly in Vercel

### API Calls Returning HTML Instead of JSON
**Symptoms**: Console shows "Expected JSON but got: <!DOCTYPE html>"
**Cause**: API calls are hitting the frontend instead of the backend
**Solutions**:
1. Ensure `vercel.json` is in the client directory
2. Verify the API proxy function exists at `client/api/api-proxy.js`
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
4. Run the verification script: `node verify-deployment.js`

## Performance Optimizations

### Timeout Settings
- **API Proxy**: 60 seconds (Vercel limit for hobby plans)
- **Request Timeout**: 25 seconds (prevents hanging requests)
- **Test Proxy**: 30 seconds (for quick endpoint testing)

### Error Handling
- Clear timeout error messages with status code 504
- Detailed logging for debugging
- Graceful fallbacks for different response types

## Security Notes

- ✅ **Never commit `.env` files to Git**
- ✅ **Use Vercel's environment variable system for production secrets**
- ✅ **No backend URLs are exposed in public files**
- ✅ **25-second request timeout prevents resource exhaustion**
