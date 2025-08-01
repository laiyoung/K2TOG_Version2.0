-- =====================================================
-- YJ Child Care Plus - Test Data Setup
-- =====================================================
-- Run this in your Supabase SQL Editor to add test data
-- =====================================================

-- Step 1: Create test admin user
-- =====================================================
INSERT INTO users (name, email, password, role, first_name, last_name, status)
VALUES (
  'Admin User',
  'admin@yjchildcare.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
  'admin',
  'Admin',
  'User',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Step 2: Create test students
-- =====================================================
INSERT INTO users (name, email, password, role, first_name, last_name, status, phone_number)
VALUES 
  ('John Smith', 'john.smith@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'John', 'Smith', 'active', '555-0101'),
  ('Sarah Johnson', 'sarah.johnson@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Sarah', 'Johnson', 'active', '555-0102'),
  ('Michael Brown', 'michael.brown@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Michael', 'Brown', 'active', '555-0103'),
  ('Emily Davis', 'emily.davis@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Emily', 'Davis', 'active', '555-0104'),
  ('David Wilson', 'david.wilson@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'David', 'Wilson', 'active', '555-0105'),
  ('Lisa Anderson', 'lisa.anderson@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Lisa', 'Anderson', 'active', '555-0106'),
  ('Robert Taylor', 'robert.taylor@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Robert', 'Taylor', 'active', '555-0107'),
  ('Jennifer Martinez', 'jennifer.martinez@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Jennifer', 'Martinez', 'active', '555-0108'),
  ('Christopher Garcia', 'christopher.garcia@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Christopher', 'Garcia', 'active', '555-0109'),
  ('Amanda Rodriguez', 'amanda.rodriguez@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'Amanda', 'Rodriguez', 'active', '555-0110')
ON CONFLICT (email) DO NOTHING;

-- Step 3: Create test instructor
-- =====================================================
INSERT INTO users (name, email, password, role, first_name, last_name, status, phone_number)
VALUES (
  'Dr. Maria Thompson',
  'maria.thompson@yjchildcare.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'instructor',
  'Maria',
  'Thompson',
  'active',
  '555-0201'
) ON CONFLICT (email) DO NOTHING;

-- Step 4: Create test classes
-- =====================================================
INSERT INTO classes (title, description, price, location_type, location_details, prerequisites, materials_needed)
VALUES 
  (
    'Early Childhood Development',
    'Comprehensive course covering the fundamentals of early childhood development, including cognitive, social, and emotional growth.',
    299.99,
    'zoom',
    'Zoom Meeting - Link will be provided',
    'None',
    'Notebook, pen, internet connection'
  ),
  (
    'Child Safety and First Aid',
    'Essential training for child safety, emergency procedures, and basic first aid techniques.',
    199.99,
    'in-person',
    'YJ Child Care Center - Main Classroom',
    'None',
    'Comfortable clothing, closed-toe shoes'
  ),
  (
    'Creative Arts for Children',
    'Learn how to incorporate creative arts, music, and movement into early childhood education.',
    249.99,
    'zoom',
    'Zoom Meeting - Link will be provided',
    'Basic understanding of child development',
    'Art supplies, musical instruments (optional)'
  ),
  (
    'Nutrition and Meal Planning',
    'Understanding child nutrition needs and how to plan healthy, balanced meals for children.',
    179.99,
    'in-person',
    'YJ Child Care Center - Kitchen Lab',
    'None',
    'Recipe notebook, apron'
  ),
  (
    'Behavior Management Strategies',
    'Effective strategies for managing challenging behaviors and promoting positive discipline.',
    329.99,
    'zoom',
    'Zoom Meeting - Link will be provided',
    'Early Childhood Development course recommended',
    'Case study materials will be provided'
  )
ON CONFLICT (title) DO NOTHING;

-- Step 5: Create test class sessions
-- =====================================================
-- Get the instructor ID
DO $$
DECLARE
    instructor_id UUID;
    class_id INTEGER;
BEGIN
    -- Get instructor ID
    SELECT id INTO instructor_id FROM users WHERE email = 'maria.thompson@yjchildcare.com' LIMIT 1;
    
    -- Get class ID
    SELECT id INTO class_id FROM classes WHERE title = 'Early Childhood Development' LIMIT 1;
    
    -- Create session for Early Childhood Development
    IF instructor_id IS NOT NULL AND class_id IS NOT NULL THEN
        INSERT INTO class_sessions (class_id, session_date, start_time, end_time, capacity, instructor_id, status)
        VALUES (class_id, CURRENT_DATE + INTERVAL '7 days', '09:00:00', '12:00:00', 15, instructor_id, 'scheduled')
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Get class ID for Child Safety
    SELECT id INTO class_id FROM classes WHERE title = 'Child Safety and First Aid' LIMIT 1;
    
    -- Create session for Child Safety
    IF instructor_id IS NOT NULL AND class_id IS NOT NULL THEN
        INSERT INTO class_sessions (class_id, session_date, start_time, end_time, capacity, instructor_id, status)
        VALUES (class_id, CURRENT_DATE + INTERVAL '14 days', '10:00:00', '16:00:00', 12, instructor_id, 'scheduled')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Step 6: Create some test enrollments
-- =====================================================
DO $$
DECLARE
    student_id UUID;
    class_id INTEGER;
    session_id INTEGER;
BEGIN
    -- Enroll John Smith in Early Childhood Development
    SELECT id INTO student_id FROM users WHERE email = 'john.smith@email.com' LIMIT 1;
    SELECT id INTO class_id FROM classes WHERE title = 'Early Childhood Development' LIMIT 1;
    SELECT id INTO session_id FROM class_sessions WHERE class_id = class_id LIMIT 1;
    
    IF student_id IS NOT NULL AND class_id IS NOT NULL AND session_id IS NOT NULL THEN
        INSERT INTO enrollments (user_id, class_id, session_id, enrollment_status)
        VALUES (student_id, class_id, session_id, 'approved')
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Enroll Sarah Johnson in Child Safety
    SELECT id INTO student_id FROM users WHERE email = 'sarah.johnson@email.com' LIMIT 1;
    SELECT id INTO class_id FROM classes WHERE title = 'Child Safety and First Aid' LIMIT 1;
    SELECT id INTO session_id FROM class_sessions WHERE class_id = class_id LIMIT 1;
    
    IF student_id IS NOT NULL AND class_id IS NOT NULL AND session_id IS NOT NULL THEN
        INSERT INTO enrollments (user_id, class_id, session_id, enrollment_status)
        VALUES (student_id, class_id, session_id, 'approved')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Step 7: Create some test certificates
-- =====================================================
DO $$
DECLARE
    student_id UUID;
    class_id INTEGER;
    admin_id UUID;
BEGIN
    -- Get admin ID
    SELECT id INTO admin_id FROM users WHERE email = 'admin@yjchildcare.com' LIMIT 1;
    
    -- Create certificate for John Smith
    SELECT id INTO student_id FROM users WHERE email = 'john.smith@email.com' LIMIT 1;
    SELECT id INTO class_id FROM classes WHERE title = 'Early Childhood Development' LIMIT 1;
    
    IF student_id IS NOT NULL AND class_id IS NOT NULL AND admin_id IS NOT NULL THEN
        INSERT INTO certificates (user_id, class_id, certificate_name, certificate_url, status, uploaded_by, verification_code)
        VALUES (
            student_id, 
            class_id, 
            'Early Childhood Development Certificate', 
            'https://example.com/certificates/john-smith-ecd.pdf',
            'approved',
            admin_id,
            'CERT-' || substr(md5(random()::text), 1, 8)
        ) ON CONFLICT DO NOTHING;
    END IF;
    
    -- Create certificate for Sarah Johnson
    SELECT id INTO student_id FROM users WHERE email = 'sarah.johnson@email.com' LIMIT 1;
    SELECT id INTO class_id FROM classes WHERE title = 'Child Safety and First Aid' LIMIT 1;
    
    IF student_id IS NOT NULL AND class_id IS NOT NULL AND admin_id IS NOT NULL THEN
        INSERT INTO certificates (user_id, class_id, certificate_name, certificate_url, status, uploaded_by, verification_code)
        VALUES (
            student_id, 
            class_id, 
            'Child Safety and First Aid Certificate', 
            'https://example.com/certificates/sarah-johnson-safety.pdf',
            'approved',
            admin_id,
            'CERT-' || substr(md5(random()::text), 1, 8)
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =====================================================
-- Test Data Setup Complete!
-- =====================================================
-- You now have:
-- ✅ 1 Admin user (admin@yjchildcare.com / password)
-- ✅ 10 Test students
-- ✅ 1 Instructor
-- ✅ 5 Classes
-- ✅ 2 Class sessions
-- ✅ 2 Test enrollments
-- ✅ 2 Test certificates
-- ===================================================== 