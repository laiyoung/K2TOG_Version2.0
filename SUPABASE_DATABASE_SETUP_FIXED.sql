-- =====================================================
-- YJ Child Care Plus - Supabase Database Setup (FIXED)
-- =====================================================
-- Run this entire file in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create initial tables
-- =====================================================

-- Create users table (modified for Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'instructor', 'user', 'student')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  email_notifications BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create trigger for users updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  location_type VARCHAR(20) CHECK (location_type IN ('zoom', 'in-person')),
  location_details TEXT,
  recurrence_pattern JSONB,
  prerequisites TEXT,
  materials_needed TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create class sessions table
CREATE TABLE IF NOT EXISTS class_sessions (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  end_date DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL,
  enrolled_count INTEGER DEFAULT 0,
  min_enrollment INTEGER DEFAULT 1,
  waitlist_enabled BOOLEAN DEFAULT false,
  waitlist_capacity INTEGER DEFAULT 0,
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create class waitlist table
CREATE TABLE IF NOT EXISTS class_waitlist (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, user_id)
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  class_id INTEGER REFERENCES classes(id),
  session_id INTEGER REFERENCES class_sessions(id),
  payment_status VARCHAR(20),
  enrollment_status VARCHAR(20) DEFAULT 'pending' CHECK (enrollment_status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  class_id INTEGER REFERENCES classes(id),
  stripe_payment_id VARCHAR(255) NOT NULL UNIQUE,
  amount DECIMAL(10, 2),
  currency VARCHAR(10),
  status VARCHAR(50),
  due_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  last_four VARCHAR(4),
  refund_status VARCHAR(20),
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refunded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user activity log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_class_sessions_class_id ON class_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_session_date ON class_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_class_waitlist_class_id ON class_waitlist(class_id);
CREATE INDEX IF NOT EXISTS idx_class_waitlist_user_id ON class_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_class_waitlist_status ON class_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_session_id ON enrollments(session_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_sender_id ON user_notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_waitlist_updated_at
    BEFORE UPDATE ON class_waitlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notifications_updated_at
    BEFORE UPDATE ON user_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 2: Create certificates table
-- =====================================================

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
  certificate_name VARCHAR(255) NOT NULL,
  certificate_url VARCHAR(255),
  cloudinary_id VARCHAR(255),
  supabase_path VARCHAR(255),
  file_type VARCHAR(50),
  file_size INTEGER,
  verification_code VARCHAR(50) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  metadata JSONB,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for certificates table
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_class_id ON certificates(class_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at);
CREATE INDEX IF NOT EXISTS idx_certificates_supabase_path ON certificates(supabase_path);

-- Create trigger for certificates updated_at
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 3: Create historical tables
-- =====================================================

-- Add soft delete columns to existing tables
ALTER TABLE classes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create historical sessions table to preserve data
CREATE TABLE IF NOT EXISTS historical_sessions (
  id SERIAL PRIMARY KEY,
  original_session_id INTEGER,
  class_id INTEGER,
  session_date DATE NOT NULL,
  end_date DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL,
  enrolled_count INTEGER DEFAULT 0,
  instructor_id UUID,
  status VARCHAR(20) DEFAULT 'completed',
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  archived_reason VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create historical enrollments table
CREATE TABLE IF NOT EXISTS historical_enrollments (
  id SERIAL PRIMARY KEY,
  original_enrollment_id INTEGER,
  user_id UUID,
  class_id INTEGER,
  session_id INTEGER,
  historical_session_id INTEGER REFERENCES historical_sessions(id),
  payment_status VARCHAR(20),
  enrollment_status VARCHAR(20),
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  enrolled_at TIMESTAMP,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  archived_reason VARCHAR(100)
);

-- Add indexes for historical tables
CREATE INDEX IF NOT EXISTS idx_classes_deleted_at ON classes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_class_sessions_deleted_at ON class_sessions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_historical_sessions_class_id ON historical_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_historical_sessions_original_id ON historical_sessions(original_session_id);
CREATE INDEX IF NOT EXISTS idx_historical_enrollments_class_id ON historical_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_historical_enrollments_user_id ON historical_enrollments(user_id);

-- Add comments for historical tables
COMMENT ON TABLE historical_sessions IS 'Preserves session data when sessions are deleted or modified';
COMMENT ON TABLE historical_enrollments IS 'Preserves enrollment data when sessions are deleted or modified';
COMMENT ON COLUMN classes.deleted_at IS 'Soft delete timestamp - records are not actually deleted';
COMMENT ON COLUMN class_sessions.deleted_at IS 'Soft delete timestamp - records are not actually deleted';

-- Step 4: Create storage buckets
-- =====================================================

-- Create the certificates bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Create the user-uploads bucket  
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Create storage policies (FIXED for UUID)
-- =====================================================

-- Certificates Bucket Policies
CREATE POLICY "Allow authenticated users to upload certificates" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'certificates' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to view their own certificates" ON storage.objects
FOR SELECT USING (
  bucket_id = 'certificates' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow admins to view all certificates" ON storage.objects
FOR SELECT USING (
  bucket_id = 'certificates' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Allow users to delete their own certificates" ON storage.objects
FOR DELETE USING (
  bucket_id = 'certificates' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- User Uploads Bucket Policies
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-uploads' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Step 6: Add comments for documentation
-- =====================================================

COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE classes IS 'Stores class information and scheduling details';
COMMENT ON TABLE class_sessions IS 'Stores individual sessions for recurring classes';
COMMENT ON TABLE class_waitlist IS 'Manages waitlist entries for classes';
COMMENT ON TABLE enrollments IS 'Tracks student enrollments in classes';
COMMENT ON TABLE payments IS 'Records payment transactions for classes';
COMMENT ON TABLE user_notifications IS 'Stores user notifications and messages';
COMMENT ON TABLE user_activity_log IS 'Tracks user actions and system events';
COMMENT ON TABLE notification_templates IS 'Stores templates for different types of notifications';
COMMENT ON TABLE certificates IS 'Stores user certificates and their verification details';
COMMENT ON COLUMN certificates.verification_code IS 'Unique code for verifying certificate authenticity';
COMMENT ON COLUMN certificates.cloudinary_id IS 'Cloudinary storage ID for the certificate file';
COMMENT ON COLUMN certificates.supabase_path IS 'Supabase storage path for the certificate file';
COMMENT ON COLUMN certificates.metadata IS 'Additional certificate metadata in JSON format';

-- Step 7: Create a default admin user (optional)
-- =====================================================
-- Uncomment and modify the password if you want to create a default admin user
/*
INSERT INTO users (name, email, password, role, first_name, last_name)
VALUES (
  'Admin User',
  'admin@yjchildcare.com',
  '$2b$10$your_hashed_password_here', -- Replace with actual hashed password
  'admin',
  'Admin',
  'User'
) ON CONFLICT (email) DO NOTHING;
*/

-- =====================================================
-- Setup Complete!
-- =====================================================
-- Your database is now ready for the YJ Child Care Plus application
-- ===================================================== 