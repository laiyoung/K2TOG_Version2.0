# Supabase Seed Setup Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Create Environment File
Create a `.env` file in the `server` directory with your Supabase credentials:

```bash
# Copy the template
cp env-template.txt .env
```

Then edit the `.env` file and replace the placeholder values with your actual Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Get the URL**: Go to Settings > API > Project URL
4. **Get the Service Role Key**: Go to Settings > API > Project API keys > `service_role` key

⚠️ **Important**: Use the `service_role` key, NOT the `anon` key. The service role key has admin privileges needed for seeding.

### 4. Run the Seed Script

#### Option A: Using the shell script (Recommended)
```bash
cd server
./seed-supabase.sh
```

#### Option B: Using npm script
```bash
cd server
npm run seed:supabase
```

#### Option C: Direct execution
```bash
cd server
node db/seedSupabase.js
```

## 🔑 Test Accounts Created

After successful seeding, you'll have these working accounts:

**Regular Users:**
- `jane@example.com` / `user123`
- `john@example.com` / `user123`

**Admins:**
- `admin@example.com` / `admin123`
- `admin@yjchildcare.com` / `admin123`

**Instructors:**
- `instructor1@example.com` / `user123`
- `instructor2@example.com` / `user123`

## 🛠️ Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure you have a `.env` file in the `server` directory
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly
- Verify there are no extra spaces or quotes around the values

### Error: "Cannot find module 'bcrypt'"
- Run `npm install` to install dependencies

### Error: "Permission denied" when running shell script
- Make the script executable: `chmod +x seed-supabase.sh`

### Error: "Invalid API key" or "Unauthorized"
- Double-check that you're using the `service_role` key, not the `anon` key
- Verify your Supabase URL is correct

## 📊 What Gets Created

The seed script creates:
- ✅ 6 test users (2 regular users, 2 admins, 2 instructors)
- ✅ 3 classes (CDA, Development & Operations, CPR)
- ✅ 18 class sessions (past, current, and future)
- ✅ 10 enrollments with various statuses
- ✅ 9 waitlist entries
- ✅ 3 certificates
- ✅ 5 payment records
- ✅ 4 notification templates
- ✅ 8 user notifications
- ✅ 3 activity logs
- ✅ 3 historical sessions
- ✅ 6 historical enrollments

## 🔄 Re-running the Seed

The script automatically cleans up old test data before inserting new data, so you can run it multiple times safely.

## 🎯 Next Steps

After successful seeding:
1. Test login with the provided accounts
2. Explore the admin dashboard
3. Check class enrollments and waitlists
4. Verify notifications and certificates work 