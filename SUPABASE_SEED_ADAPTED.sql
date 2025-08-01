-- =====================================================
-- YJ Child Care Plus - Supabase Seed Data (Adapted)
-- =====================================================
-- This is an adapted version of your existing seed.js file
-- =====================================================

-- Clean up old data to prevent duplicates
DELETE FROM enrollments;
DELETE FROM class_sessions;
DELETE FROM class_waitlist;
DELETE FROM certificates;
DELETE FROM payments;
DELETE FROM classes;
DELETE FROM user_notifications;
DELETE FROM user_activity_log;
DELETE FROM historical_enrollments;
DELETE FROM historical_sessions;
DELETE FROM users WHERE email NOT IN ('admin@yjchildcare.com');

-- Create test users
INSERT INTO users (name, email, password, role, status, first_name, last_name, phone_number, email_notifications)
VALUES 
  ('Jane Doe', 'jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', 'Jane', 'Doe', '555-0123', true),
  ('John Smith', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', 'John', 'Smith', '555-0124', true),
  ('Instructor One', 'instructor1@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', 'active', 'Instructor', 'One', '555-0126', true),
  ('Instructor Two', 'instructor2@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', 'active', 'Instructor', 'Two', '555-0127', true)
ON CONFLICT (email) DO NOTHING;

-- Get instructor IDs
DO $$
DECLARE
    instructor_one_id UUID;
    instructor_two_id UUID;
    jane_id UUID;
    john_id UUID;
    admin_id UUID;
BEGIN
    -- Get instructor IDs
    SELECT id INTO instructor_one_id FROM users WHERE email = 'instructor1@example.com';
    SELECT id INTO instructor_two_id FROM users WHERE email = 'instructor2@example.com';
    
    -- Get student IDs
    SELECT id INTO jane_id FROM users WHERE email = 'jane@example.com';
    SELECT id INTO john_id FROM users WHERE email = 'john@example.com';
    
    -- Get admin ID
    SELECT id INTO admin_id FROM users WHERE email = 'admin@yjchildcare.com';

    -- Seed classes
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

    -- Get class IDs
    DECLARE
        cda_class_id INTEGER;
        devops_class_id INTEGER;
        cpr_class_id INTEGER;
    BEGIN
        SELECT id INTO cda_class_id FROM classes WHERE title = 'Child Development Associate (CDA)';
        SELECT id INTO devops_class_id FROM classes WHERE title = 'Development and Operations';
        SELECT id INTO cpr_class_id FROM classes WHERE title = 'CPR and First Aid Certification';

        -- Seed class sessions
        INSERT INTO class_sessions (class_id, session_date, end_date, start_time, end_time, capacity, enrolled_count, min_enrollment, waitlist_enabled, waitlist_capacity, instructor_id, status)
        VALUES
          -- Child Development Associate (CDA) sessions with Instructor One
          (cda_class_id, '2025-06-02', '2025-06-06', '19:00', '22:00', 20, 18, 5, true, 10, instructor_one_id, 'completed'),
          (cda_class_id, '2025-06-09', '2025-06-13', '19:00', '22:00', 20, 15, 5, true, 10, instructor_one_id, 'completed'),
          (cda_class_id, '2025-07-07', '2025-07-11', '19:00', '22:00', 20, 12, 5, true, 10, instructor_one_id, 'scheduled'),
          (cda_class_id, '2025-07-14', '2025-07-18', '19:00', '22:00', 20, 8, 5, true, 10, instructor_one_id, 'scheduled'),
          (cda_class_id, '2025-08-04', '2025-08-08', '19:00', '22:00', 20, 5, 5, true, 10, instructor_one_id, 'scheduled'),
          (cda_class_id, '2025-08-11', '2025-08-15', '19:00', '22:00', 20, 3, 5, true, 10, instructor_one_id, 'scheduled'),
          
          -- Development and Operations sessions with Instructor Two
          (devops_class_id, '2025-06-03', '2025-06-07', '19:00', '22:00', 15, 12, 5, true, 5, instructor_two_id, 'completed'),
          (devops_class_id, '2025-06-10', '2025-06-14', '19:00', '22:00', 15, 10, 5, true, 5, instructor_two_id, 'completed'),
          (devops_class_id, '2025-07-08', '2025-07-12', '19:00', '22:00', 15, 8, 5, true, 5, instructor_two_id, 'scheduled'),
          (devops_class_id, '2025-07-15', '2025-07-19', '19:00', '22:00', 15, 6, 5, true, 5, instructor_two_id, 'scheduled'),
          (devops_class_id, '2025-08-05', '2025-08-09', '19:00', '22:00', 15, 4, 5, true, 5, instructor_two_id, 'scheduled'),
          (devops_class_id, '2025-08-12', '2025-08-16', '19:00', '22:00', 15, 2, 5, true, 5, instructor_two_id, 'scheduled'),
          
          -- CPR and First Aid Certification sessions with Instructor One
          (cpr_class_id, '2025-06-07', NULL, '09:00', '14:00', 12, 10, 4, true, 8, instructor_one_id, 'completed'),
          (cpr_class_id, '2025-06-14', NULL, '09:00', '14:00', 12, 8, 4, true, 8, instructor_one_id, 'completed'),
          (cpr_class_id, '2025-07-12', NULL, '09:00', '14:00', 12, 6, 4, true, 8, instructor_one_id, 'scheduled'),
          (cpr_class_id, '2025-07-19', NULL, '09:00', '14:00', 12, 4, 4, true, 8, instructor_one_id, 'scheduled'),
          (cpr_class_id, '2025-08-09', NULL, '09:00', '14:00', 12, 3, 4, true, 8, instructor_one_id, 'scheduled'),
          (cpr_class_id, '2025-08-16', NULL, '09:00', '14:00', 12, 1, 4, true, 8, instructor_one_id, 'scheduled')
        ON CONFLICT DO NOTHING;

        -- Get session IDs for enrollment seeding
        DECLARE
            cda_past_session INTEGER;
            devops_past_session INTEGER;
            cpr_past_session INTEGER;
            cda_current_session INTEGER;
            devops_current_session INTEGER;
            cpr_current_session INTEGER;
            cda_future_session INTEGER;
            devops_future_session INTEGER;
            cpr_future_session INTEGER;
        BEGIN
            -- Get past sessions (completed)
            SELECT id INTO cda_past_session FROM class_sessions WHERE class_id = cda_class_id AND status = 'completed' ORDER BY session_date LIMIT 1;
            SELECT id INTO devops_past_session FROM class_sessions WHERE class_id = devops_class_id AND status = 'completed' ORDER BY session_date LIMIT 1;
            SELECT id INTO cpr_past_session FROM class_sessions WHERE class_id = cpr_class_id AND status = 'completed' ORDER BY session_date LIMIT 1;
            
            -- Get current sessions
            SELECT id INTO cda_current_session FROM class_sessions WHERE class_id = cda_class_id AND status = 'scheduled' ORDER BY session_date LIMIT 1;
            SELECT id INTO devops_current_session FROM class_sessions WHERE class_id = devops_class_id AND status = 'scheduled' ORDER BY session_date LIMIT 1;
            SELECT id INTO cpr_current_session FROM class_sessions WHERE class_id = cpr_class_id AND status = 'scheduled' ORDER BY session_date LIMIT 1;
            
            -- Get future sessions
            SELECT id INTO cda_future_session FROM class_sessions WHERE class_id = cda_class_id AND status = 'scheduled' ORDER BY session_date DESC LIMIT 1;
            SELECT id INTO devops_future_session FROM class_sessions WHERE class_id = devops_class_id AND status = 'scheduled' ORDER BY session_date DESC LIMIT 1;
            SELECT id INTO cpr_future_session FROM class_sessions WHERE class_id = cpr_class_id AND status = 'scheduled' ORDER BY session_date DESC LIMIT 1;

            -- Seed enrollments
            INSERT INTO enrollments (user_id, class_id, session_id, payment_status, enrollment_status, admin_notes, reviewed_at, reviewed_by, enrolled_at)
            VALUES
              -- Past session enrollments (completed)
              (jane_id, cda_class_id, cda_past_session, 'paid', 'approved', 'Past session completed', '2025-06-18T00:38:08.603Z'::timestamptz, admin_id, '2025-06-18 00:38:08'::timestamp),
              (jane_id, devops_class_id, devops_past_session, 'paid', 'approved', 'Past session completed', '2025-06-18T00:38:08.603Z'::timestamptz, admin_id, '2025-06-18 00:38:08'::timestamp),
              (john_id, cpr_class_id, cpr_past_session, 'paid', 'approved', 'Past session completed', '2025-06-18T00:38:08.603Z'::timestamptz, admin_id, '2025-06-18 00:38:08'::timestamp),
              
              -- Current session enrollments
              (jane_id, cda_class_id, cda_current_session, 'paid', 'approved', 'Current session enrollment', '2025-06-18T00:38:08.603Z'::timestamptz, admin_id, '2025-06-18 00:38:08'::timestamp),
              (john_id, devops_class_id, devops_current_session, 'paid', 'approved', 'Current session enrollment', '2025-06-18T00:38:08.603Z'::timestamptz, admin_id, '2025-06-18 00:38:08'::timestamp),
              (john_id, cpr_class_id, cpr_current_session, 'paid', 'pending', NULL, NULL::timestamptz, NULL, '2025-06-18 00:38:08'::timestamp),
              (jane_id, cpr_class_id, cpr_current_session, 'paid', 'rejected', 'Class capacity reached', '2025-06-18T00:38:08.603Z'::timestamptz, admin_id, '2025-06-18 00:38:08'::timestamp),
              
              -- Future session enrollments
              (jane_id, cda_class_id, cda_future_session, 'paid', 'approved', 'Future session enrollment', '2025-06-18T00:38:08.603Z'::timestamptz, admin_id, '2025-06-18 00:38:08'::timestamp),
              (john_id, devops_class_id, devops_future_session, 'paid', 'approved', 'Future session enrollment', '2025-06-18T00:38:08.603Z'::timestamptz, admin_id, '2025-06-18 00:38:08'::timestamp),
              (john_id, cpr_class_id, cpr_future_session, 'paid', 'pending', NULL, NULL::timestamptz, NULL, '2025-06-18 00:38:08'::timestamp)
            ON CONFLICT DO NOTHING;

            -- Seed certificates
            INSERT INTO certificates (user_id, class_id, certificate_name, certificate_url, verification_code, status, uploaded_by)
            VALUES
              (jane_id, cda_class_id, 'CDA Certificate', 'https://example.com/certs/cda.pdf', 'CDA-2025-001', 'approved', admin_id),
              (jane_id, devops_class_id, 'Development and Operations Certificate', 'https://example.com/certs/devops.pdf', 'DO-2025-001', 'approved', admin_id),
              (john_id, cpr_class_id, 'CPR and First Aid Certificate', 'https://example.com/certs/cpr.pdf', 'CPR-2025-001', 'pending', admin_id)
            ON CONFLICT (verification_code) DO NOTHING;

            -- Seed payments
            INSERT INTO payments (user_id, class_id, stripe_payment_id, amount, currency, status, due_date, payment_method, last_four, refund_status, refund_amount, refund_reason, refunded_at, refunded_by, created_at)
            VALUES
              (jane_id, cda_class_id, 'stripe_payment_1', 299.99, 'USD', 'completed', '2025-06-20T00:00:00.000Z'::timestamptz, 'credit_card', '4242', NULL, NULL, NULL, NULL, NULL, '2025-06-18 00:38:08'::timestamp),
              (jane_id, devops_class_id, 'stripe_payment_2', 349.99, 'USD', 'completed', '2025-06-20T00:00:00.000Z'::timestamptz, 'credit_card', '4242', 'processed', 349.99, 'Student requested refund', '2025-06-25T00:00:00.000Z'::timestamptz, admin_id, '2025-06-18 00:38:08'::timestamp),
              (john_id, cpr_class_id, 'stripe_payment_3', 149.99, 'USD', 'completed', '2025-06-20T00:00:00.000Z'::timestamptz, 'credit_card', '5555', NULL, NULL, NULL, NULL, NULL, '2025-06-18 00:38:08'::timestamp),
              (john_id, cda_class_id, 'stripe_payment_4', 299.99, 'USD', 'pending', '2025-06-20T00:00:00.000Z'::timestamptz, 'credit_card', '5555', NULL, NULL, NULL, NULL, NULL, '2025-06-18 00:38:08'::timestamp),
              (jane_id, cpr_class_id, 'stripe_payment_5', 149.99, 'USD', 'completed', '2025-06-20T00:00:00.000Z'::timestamptz, 'credit_card', '4242', 'processed', 74.99, 'Partial refund due to cancellation', '2025-06-25T00:00:00.000Z'::timestamptz, admin_id, '2025-06-18 00:38:08'::timestamp)
            ON CONFLICT (stripe_payment_id) DO NOTHING;

            -- Seed waitlist entries
            INSERT INTO class_waitlist (class_id, user_id, position, status, created_at)
            VALUES
              (cda_class_id, john_id, 1, 'approved', '2025-06-18T00:38:08.603Z'::timestamptz),
              (devops_class_id, jane_id, 1, 'approved', '2025-06-18T00:38:08.603Z'::timestamptz),
              (cpr_class_id, john_id, 1, 'approved', '2025-06-18T00:38:08.603Z'::timestamptz),
              (cda_class_id, jane_id, 1, 'pending', '2025-06-18T00:38:08.603Z'::timestamptz),
              (devops_class_id, john_id, 1, 'pending', '2025-06-18T00:38:08.603Z'::timestamptz),
              (cpr_class_id, jane_id, 1, 'rejected', '2025-06-18T00:38:08.603Z'::timestamptz),
              (cda_class_id, john_id, 1, 'pending', '2025-06-18T00:38:08.603Z'::timestamptz),
              (cpr_class_id, jane_id, 1, 'pending', '2025-06-18T00:38:08.603Z'::timestamptz),
              (cpr_class_id, john_id, 2, 'approved', '2025-06-18T00:38:08.603Z'::timestamptz)
            ON CONFLICT (class_id, user_id) DO NOTHING;

        END;
    END;
END $$;

-- Seed notification templates
INSERT INTO notification_templates (name, type, title_template, message_template, metadata)
VALUES
  (
    'class_reminder',
    'class_notification',
    'Upcoming Class: {{class_name}}',
    'Your class "{{class_name}}" starts in {{time_until}}. Please join at {{location}}.',
    '{"category": "class", "priority": "high"}'::jsonb
  ),
  (
    'enrollment_approved',
    'user_notification',
    'Enrollment Approved: {{class_name}}',
    'Your enrollment in "{{class_name}}" has been approved. The class starts on {{start_date}}.',
    '{"category": "enrollment", "priority": "medium"}'::jsonb
  ),
  (
    'payment_due',
    'user_notification',
    'Payment Due: {{class_name}}',
    'Payment of {{amount}} for "{{class_name}}" is due on {{due_date}}.',
    '{"category": "payment", "priority": "high"}'::jsonb
  ),
  (
    'certificate_ready',
    'user_notification',
    'Certificate Available: {{class_name}}',
    'Your certificate for "{{class_name}}" is now available for download.',
    '{"category": "certificate", "priority": "medium"}'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- Seed notifications
DO $$
DECLARE
    jane_id UUID;
    john_id UUID;
    admin_id UUID;
BEGIN
    SELECT id INTO jane_id FROM users WHERE email = 'jane@example.com';
    SELECT id INTO john_id FROM users WHERE email = 'john@example.com';
    SELECT id INTO admin_id FROM users WHERE email = 'admin@yjchildcare.com';

    INSERT INTO user_notifications (user_id, type, title, message, is_read, action_url, sender_id, metadata)
    VALUES
      -- Past session notifications
      (jane_id, 'certificate_ready', 'Certificate Available: CDA', 'Your CDA certificate from June session is ready to download', false, '/certificates/1', NULL, '{"category": "certificate", "priority": "medium"}'::jsonb),
      (jane_id, 'certificate_ready', 'Certificate Available: DevOps', 'Your Development and Operations certificate is ready to download', false, '/certificates/2', NULL, '{"category": "certificate", "priority": "medium"}'::jsonb),
      (john_id, 'certificate_ready', 'Certificate Available: CPR', 'Your CPR and First Aid certificate is ready to download', false, '/certificates/3', NULL, '{"category": "certificate", "priority": "medium"}'::jsonb),
      
      -- Current session notifications
      (jane_id, 'class_reminder', 'Upcoming Class: CDA', 'Your CDA class starts in 1 hour', false, '/classes/1', NULL, '{"category": "class", "priority": "high"}'::jsonb),
      (john_id, 'payment_due', 'Payment Due', 'Payment for CPR class is due tomorrow', false, '/payments/3', admin_id, '{"category": "payment", "priority": "high"}'::jsonb),
      
      -- Future session notifications
      (jane_id, 'class_reminder', 'Upcoming Class: CDA (Aug)', 'Your CDA class starts in 3 weeks', false, '/classes/1', NULL, '{"category": "class", "priority": "medium"}'::jsonb),
      (john_id, 'enrollment_approved', 'Enrollment Approved: DevOps', 'Your enrollment in Development and Operations has been approved', false, '/classes/2', admin_id, '{"category": "enrollment", "priority": "medium"}'::jsonb),
      (john_id, 'class_reminder', 'Upcoming Class: CPR (Aug)', 'Your CPR class starts in 4 weeks', false, '/classes/3', NULL, '{"category": "class", "priority": "medium"}'::jsonb)
    ON CONFLICT DO NOTHING;

    -- Seed activity logs
    INSERT INTO user_activity_log (user_id, action, details, created_at)
    VALUES
      (jane_id, 'profile_update', '{"updated_fields": ["first_name", "last_name"]}'::jsonb, '2025-06-18T00:38:08.603Z'::timestamptz),
      (jane_id, 'enrollment', '{"class_id": 1, "class_name": "CDA"}'::jsonb, '2025-06-18T00:38:08.603Z'::timestamptz),
      (john_id, 'payment', '{"amount": 149.99, "class_name": "CPR"}'::jsonb, '2025-06-18T00:38:08.603Z'::timestamptz)
    ON CONFLICT DO NOTHING;
END $$;

-- Update user roles for users with approved enrollments
UPDATE users u
SET role = 'student'
WHERE EXISTS (
  SELECT 1 
  FROM enrollments e 
  WHERE e.user_id = u.id 
  AND e.enrollment_status = 'approved'
)
AND u.role = 'user';

-- Update enrollment counts in class_sessions based on approved enrollments
UPDATE class_sessions cs
SET enrolled_count = (
  SELECT COUNT(*)
  FROM enrollments e
  WHERE e.session_id = cs.id
  AND e.enrollment_status = 'approved'
);

-- =====================================================
-- Seed Data Setup Complete!
-- =====================================================
-- You now have all the data from your original seed.js file
-- ===================================================== 