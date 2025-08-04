# YJ Child Care Plus - Fullstack Deployment Guide

This guide will walk you through deploying your fullstack application using Supabase for the database and separate hosting platforms for your React frontend and Express.js backend.

## Prerequisites

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **Supabase CLI** - Already installed in your project
3. **Git Repository** - Your code should be in a Git repository
4. **Node.js** - Version 16 or higher
5. **Environment Variables** - You'll need your Supabase project credentials

## Step 1: Set Up Supabase Database

### 1.1 Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `yj-child-care-plus`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Your Project Credentials

Once your project is created, go to **Settings > API** and copy:
- **Project URL**
- **Anon public key**
- **Service role key** (keep this secret!)

**Note**: Supabase provides the database, authentication, and storage. You'll need to deploy your frontend and backend separately.

## Step 2: Configure Environment Variables

### 2.1 Backend Environment Variables

Create a `.env` file in your `server/` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database Configuration (if using Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Email Configuration (if using email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Server Configuration
PORT=3001
NODE_ENV=production
```

### 2.2 Frontend Environment Variables

Create a `.env` file in your `client/` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# API Configuration
VITE_API_URL=https://your-backend-domain.com
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Step 3: Database Setup

### 3.1 Apply Database Migrations

```bash
# Link to your remote Supabase project
npx supabase link --project-ref your_project_ref

# Apply all migrations to your remote database
npm run supabase:migration:up
```

**What Supabase Provides:**
- PostgreSQL database
- Authentication system
- File storage
- Real-time subscriptions
- Auto-generated APIs

### 3.2 Set Up Storage Buckets

In your Supabase dashboard, go to **Storage** and create these buckets:

1. **certificates** - For certificate uploads
   - Set to private
   - File size limit: 5MB
   - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`

2. **user-uploads** - For general user uploads
   - Set to private
   - File size limit: 5MB
   - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`

### 3.3 Configure Row Level Security (RLS)

Enable RLS on your tables and create appropriate policies. Here are some example policies:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Enable RLS on certificates table
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own certificates
CREATE POLICY "Users can view own certificates" ON certificates
    FOR SELECT USING (auth.uid() = user_id);

-- Policy for admins to view all certificates
CREATE POLICY "Admins can view all certificates" ON certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );
```

## Step 4: Deploy Backend (Express.js API)

**Why deploy backend separately?** Supabase provides the database, but your Express.js API server needs to be hosted on a platform that can run Node.js applications.

### 4.1 Option A: Deploy to Railway (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Railway Project**:
   ```bash
   cd server
   railway init
   ```

4. **Configure Environment Variables**:
   ```bash
   railway variables set SUPABASE_URL=your_supabase_url
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   # Add all other environment variables
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

### 4.2 Option B: Deploy to Render

1. **Create a Render Account** at [render.com](https://render.com)

2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Set root directory: `server`

3. **Configure Environment Variables** in the Render dashboard

4. **Deploy**

### 4.3 Option C: Deploy to Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**:
   ```bash
   cd server
   heroku create your-app-name
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set SUPABASE_URL=your_supabase_url
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   # Add all other environment variables
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## Step 5: Deploy Frontend (React App)

**Why deploy frontend separately?** Supabase doesn't host React applications. You need to deploy your frontend to a platform that can serve static files.

### 5.1 Build the Frontend

```bash
cd client
npm run build
```

### 5.2 Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd client
   vercel
   ```

3. **Configure Environment Variables** in Vercel dashboard

### 5.2 Option B: Deploy to Netlify

1. **Create a Netlify Account** at [netlify.com](https://netlify.com)

2. **Deploy from Git**:
   - Connect your repository
   - Set build command: `cd client && npm install && npm run build`
   - Set publish directory: `client/dist`

3. **Configure Environment Variables** in Netlify dashboard

### 5.3 Option C: Deploy to GitHub Pages

1. **Add GitHub Pages configuration** to your `client/vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',
  // ... other config
})
```

2. **Deploy**:
   ```bash
   cd client
   npm run build
   # Push to GitHub and enable GitHub Pages
   ```

## Step 6: Configure CORS and Domains

### 6.1 Update Supabase Auth Settings

In your Supabase dashboard, go to **Authentication > Settings**:

1. **Site URL**: Set to your frontend URL (e.g., `https://your-app.vercel.app`)
2. **Redirect URLs**: Add your frontend URL and callback URLs

### 6.2 Update Backend CORS

Make sure your backend CORS configuration includes your frontend domain:

```javascript
// In server/index.js
app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'http://localhost:3000' // for development
  ],
  credentials: true
}));
```

## Step 7: Set Up Custom Domain (Optional)

### 7.1 Frontend Domain

1. **Vercel**: Go to your project settings and add a custom domain
2. **Netlify**: Go to domain settings and add a custom domain
3. **Update DNS**: Point your domain to the hosting provider

### 7.2 Backend Domain

1. **Railway**: Add custom domain in project settings
2. **Render**: Add custom domain in service settings
3. **Update CORS**: Add your custom domain to CORS configuration

## Step 8: Testing and Verification

### 8.1 Test Database Connection

```bash
# Test local connection
npm run supabase:status

# Test remote connection
npx supabase db remote commit
```

### 8.2 Test API Endpoints

```bash
# Test your backend API
curl https://your-backend-domain.com/api/health
```

### 8.3 Test Frontend

1. Visit your frontend URL
2. Test user registration/login
3. Test file uploads
4. Test all major features

## Step 9: Monitoring and Maintenance

### 9.1 Set Up Logging

- **Railway**: Built-in logging
- **Vercel**: Built-in analytics
- **Supabase**: Built-in logging in dashboard

### 9.2 Set Up Alerts

- Monitor API response times
- Set up error alerts
- Monitor database performance

### 9.3 Regular Maintenance

- Keep dependencies updated
- Monitor Supabase usage
- Regular security audits

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check your backend CORS configuration
2. **Environment Variables**: Ensure all variables are set correctly
3. **Database Connection**: Verify Supabase connection strings
4. **Build Errors**: Check for missing dependencies

### Getting Help

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [railway.app/docs](https://railway.app/docs)

## Security Checklist

- [ ] Environment variables are properly set
- [ ] RLS policies are configured
- [ ] CORS is properly configured
- [ ] JWT secrets are secure
- [ ] API keys are not exposed in client code
- [ ] HTTPS is enabled
- [ ] Regular security updates

## Performance Optimization

- [ ] Enable Supabase caching
- [ ] Optimize database queries
- [ ] Use CDN for static assets
- [ ] Implement proper indexing
- [ ] Monitor and optimize bundle size

Your application should now be successfully deployed to Supabase! 🚀 