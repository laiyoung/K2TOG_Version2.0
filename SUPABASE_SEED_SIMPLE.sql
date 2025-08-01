-- =====================================================
-- YJ Child Care Plus - Simple Seed Data
-- =====================================================
-- This is a simplified version that won't fail if tables don't exist
-- =====================================================

-- Create test users (only if they don't exist)
INSERT INTO users (name, email, password, role, status, first_name, last_name, phone_number, email_notifications)
VALUES 
  ('Jane Doe', 'jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', 'Jane', 'Doe', '555-0123', true),
  ('John Smith', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', 'John', 'Smith', '555-0124', true),
  ('Instructor One', 'instructor1@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', 'active', 'Instructor', 'One', '555-0126', true),
  ('Instructor Two', 'instructor2@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', 'active', 'Instructor', 'Two', '555-0127', true)
ON CONFLICT (email) DO NOTHING;

-- Create test classes
INSERT INTO classes (title, description, price, location_type, location_details, recurrence_pattern, prerequisites, materials_needed, image_url)
VALUES 
  (
    'Child Development Associate (CDA)',
    'This comprehensive course prepares you for the CDA credential, covering all aspects of early childhood education. This 2-month program runs Monday through Friday from 7:00 PM to 10:00 PM.',
    299.99,
    'zoom',
    'Online via Zoom',
    '{"frequency": "weekly", "interval": 1, "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "endDate": "2025-07-31"}'::jsonb,
    'None required',
    'Computer with internet access, webcam, and microphone',
    'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786188/class-1_mlye6d.jpg'
  ),
  (
    'Development and Operations',
    'Master the essential skills needed to run a successful childcare program. Choose between our 2-week evening program (Monday-Friday, 7:00 PM - 10:00 PM) or our 5-day Saturday intensive (9:00 AM - 3:00 PM).',
    349.99,
    'in-person',
    'Main Training Center, Room 101',
    '{"frequency": "weekly", "interval": 1, "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "endDate": "2025-06-14"}'::jsonb,
    'Basic childcare experience recommended',
    'Notebook, laptop (optional)',
    'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786188/class-2_vpqyct.jpg'
  ),
  (
    'CPR and First Aid Certification',
    'Essential training for childcare providers. Learn life-saving techniques including CPR, AED use, and first aid procedures. This one-day Saturday program runs from 9:00 AM to 2:00 PM.',
    149.99,
    'in-person',
    'Training Center, Room 203',
    NULL,
    'None required',
    'Comfortable clothing for practical exercises',
    'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786180/class-3_fealxp.jpg'
  )
ON CONFLICT (title) DO NOTHING;

-- =====================================================
-- Simple Seed Data Setup Complete!
-- =====================================================
-- This creates basic users and classes for testing
-- ===================================================== 