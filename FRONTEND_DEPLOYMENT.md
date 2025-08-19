# 🚀 Frontend Deployment Guide - Vercel

## 📋 **Prerequisites**
- ✅ Backend successfully deployed on Railway (20+ minutes stable)
- ✅ GitHub repository connected to Vercel
- ✅ Vercel account (free tier available)

## 🎯 **Deployment Options**

### **Option 1: Vercel Dashboard (Recommended)**
1. **Visit [vercel.com](https://vercel.com)**
2. **Sign in with GitHub** (deniseosoria04@gmail.com)
3. **Click "New Project"**
4. **Import Repository**: `yjchildcareplus`
5. **Configure Settings**:
   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### **Option 2: Vercel CLI**
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Build project
npm run build

# Deploy to Vercel
vercel --prod
```

### **Option 3: Automated Scripts**
- **Linux/Mac**: `./deploy-frontend.sh`
- **Windows**: `deploy-frontend.bat`

## 🔧 **Environment Variables**

### **Required for Production:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://your-railway-backend.railway.app
```

### **How to Set in Vercel:**
1. **Project Settings** → **Environment Variables**
2. **Add each variable** with production values
3. **Redeploy** after adding variables

## 📁 **Project Structure**
```
client/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   └── main.jsx                 # Entry point
├── package.json                 # Dependencies
├── vercel.json                  # Vercel configuration
└── vite.config.js               # Vite configuration
```

## 🚀 **Deployment Steps**

### **Step 1: Prepare Environment**
```bash
cd client
npm install
npm run build
```

### **Step 2: Deploy**
```bash
vercel --prod
```

### **Step 3: Configure Environment Variables**
- Set `VITE_SUPABASE_URL`
- Set `VITE_SUPABASE_ANON_KEY`
- Set `VITE_API_URL` (your Railway backend URL)

### **Step 4: Test Deployment**
- Visit your Vercel URL
- Test login/signup
- Test API calls to backend
- Test file uploads

## 🔍 **Troubleshooting**

### **Build Errors**
- Check `package.json` dependencies
- Ensure Node.js version compatibility
- Check for missing environment variables

### **Runtime Errors**
- Verify environment variables are set
- Check browser console for errors
- Ensure backend is accessible

### **CORS Issues**
- Backend CORS should allow Vercel domain
- Check Railway CORS configuration

## 📊 **Post-Deployment Checklist**

- [ ] Frontend loads without errors
- [ ] User authentication works
- [ ] API calls to backend succeed
- [ ] File uploads work
- [ ] All pages render correctly
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable

## 🌐 **URLs to Test**

### **Frontend (Vercel)**
- Main page: `https://your-project.vercel.app`
- Login: `https://your-project.vercel.app/login`
- Dashboard: `https://your-project.vercel.app/dashboard`

### **Backend (Railway)**
- Health check: `https://your-backend.railway.app/health`
- API test: `https://your-backend.railway.app/api/classes`

## 💰 **Costs**
- **Vercel**: Free tier (unlimited deployments)
- **Railway**: Free tier (limited usage)
- **Supabase**: Free tier (50,000 monthly active users)

## 🎉 **Success Indicators**
- ✅ Frontend accessible via Vercel URL
- ✅ Backend responding from Railway
- ✅ Database operations working
- ✅ User authentication functional
- ✅ File uploads successful

---

**Need Help?** Check the main `DEPLOYMENT_GUIDE.md` for comprehensive deployment information.
