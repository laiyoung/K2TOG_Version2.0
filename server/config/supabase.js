const { createClient } = require('@supabase/supabase-js')
const path = require('path');
const dotenv = require('dotenv');

// Load .env file from the server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Storage bucket configuration
const STORAGE_BUCKETS = {
  CERTIFICATES: 'certificates',
  USER_UPLOADS: 'user-uploads'
}

// File upload configuration
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png']
}

module.exports = {
  supabase,
  STORAGE_BUCKETS,
  UPLOAD_CONFIG
} 