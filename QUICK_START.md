# Quick Start Deployment Guide

This is a simplified guide to get your YJ Child Care Plus application deployed quickly.

**Important**: Supabase only provides the database, authentication, and storage. You need to deploy your frontend and backend separately.

## Prerequisites

- Supabase account
- GitHub account
- Node.js 16+ installed

## Step 1: Set Up Supabase Database

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and API keys

2. **Apply Database Schema**:
   ```bash
   # Link to your project (replace with your project ref)
   npx supabase link --project-ref your_project_ref
   
   # Apply migrations
   npm run supabase:migration:up
   ```

## Step 2: Deploy Backend (Railway - Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy Backend**:
   ```bash
   cd server
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables** in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - Other required variables

## Step 3: Deploy Frontend (Vercel - Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**:
   ```bash
   cd client
   vercel
   ```

3. **Set Environment Variables** in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your Railway backend URL)

## Step 4: Configure Supabase Auth

In your Supabase dashboard:
1. Go to **Authentication > Settings**
2. Set **Site URL** to your Vercel frontend URL
3. Add your frontend URL to **Redirect URLs**

## Step 5: Test Your Application

1. Visit your frontend URL
2. Test user registration/login
3. Test all major features

## Alternative: Use the Deployment Script

You can also use the automated deployment script:

```bash
# Set environment variables
export DEPLOY_PLATFORM=railway
export FRONTEND_PLATFORM=vercel
export SUPABASE_PROJECT_REF=your_project_ref

# Run deployment
./deploy.sh
```

## Troubleshooting

- **CORS Errors**: Update your backend CORS configuration
- **Environment Variables**: Double-check all variables are set correctly
- **Database Issues**: Verify Supabase connection in dashboard

## Next Steps

- Set up custom domains
- Configure monitoring
- Set up CI/CD pipelines
- Optimize performance

Your application should now be live! 🚀 