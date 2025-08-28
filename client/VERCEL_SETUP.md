# Vercel Deployment Setup Guide

## Overview
This guide explains how to properly configure your Vercel deployment to work with your backend API.

## Current Configuration
Your Vercel configuration (`vercel.json`) is set up to:
1. Proxy all `/api/*` requests to the API proxy function
2. Serve the React app for all other routes
3. Handle CORS headers properly

## Required Environment Variables

You need to set these environment variables in your Vercel dashboard:

### Option 1: Set VITE_APP_URL (Recommended)
- **Name**: `VITE_APP_URL`
- **Value**: Your backend server URL (e.g., `https://your-app.railway.app`)
- **Description**: This should point to your Railway backend server

### Option 2: Set RAILWAY_BACKEND_URL (Alternative)
- **Name**: `RAILWAY_BACKEND_URL`
- **Value**: Your backend server URL (e.g., `https://your-app.railway.app`)
- **Description**: Fallback environment variable for the backend URL

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (`client`)
3. Go to **Settings** → **Environment Variables**
4. Add the environment variable:
   - **Name**: `VITE_APP_URL`
   - **Value**: Your actual backend URL (e.g., `https://your-app.railway.app`)
   - **Environment**: Production (and Preview if you want)
5. Click **Save**
6. Redeploy your application

## How It Works

1. **Frontend Request**: Your React app makes a request to `/api/users/login`
2. **Vercel Rewrite**: Vercel catches this request and forwards it to `/api-proxy/users/login`
3. **API Proxy Function**: The proxy function receives the request and forwards it to your backend
4. **Backend Response**: Your backend processes the request and returns a response
5. **Proxy Response**: The proxy function forwards the response back to your React app

## Troubleshooting

### Error: "Backend URL not configured"
- **Cause**: Environment variables are not set in Vercel
- **Solution**: Set `VITE_APP_URL` or `RAILWAY_BACKEND_URL` in Vercel dashboard

### Error: "Failed to proxy request to backend"
- **Cause**: Backend server is unreachable or URL is incorrect
- **Solution**: Verify your backend URL is correct and accessible

### Error: "Expected JSON but got HTML"
- **Cause**: Request is not being proxied correctly
- **Solution**: Check that your Vercel configuration is correct and redeploy

## Testing the Setup

1. Deploy your changes to Vercel
2. Check the browser console for the API configuration logs
3. Try to log in with valid credentials
4. Check the Network tab to see if API requests are being made to `/api/*`

## Important Notes

- **Never commit sensitive URLs** to your repository
- **Always use environment variables** for configuration
- **Redeploy after changing environment variables**
- **Check Vercel function logs** if you encounter issues

## Support

If you continue to have issues:
1. Check the Vercel function logs in your dashboard
2. Verify your backend server is running and accessible
3. Ensure your environment variables are set correctly
4. Check that your backend API endpoints are working
