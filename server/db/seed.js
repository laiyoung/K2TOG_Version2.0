// server/db/seed.js

const pool = require('../config/db');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    console.log('Starting database seeding...');

    // Clean up old data to prevent duplicates
    await pool.query('DELETE FROM enrollments');
    await pool.query('DELETE FROM class_sessions');
    await pool.query('DELETE FROM class_waitlist');
    await pool.query('DELETE FROM certificates');
    await pool.query('DELETE FROM payments');
    await pool.query('DELETE FROM classes');

    // Create test users only if they don't exist
    const userPassword = await bcrypt.hash('user123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password, role, status, first_name, last_name, phone_number, email_notifications, sms_notifications)
      SELECT * FROM (
        VALUES
          ('Jane Doe', 'jane@example.com', $1, 'user', 'active', 'Jane', 'Doe', '555-0123', true, false),
          ('John Smith', 'john@example.com', $1, 'user', 'active', 'John', 'Smith', '555-0124', true, true),
          ('Admin User', 'admin@example.com', $2, 'admin', 'active', 'Admin', 'User', '555-0125', true, false),
          ('Instructor One', 'instructor1@example.com', $1, 'instructor', 'active', 'Instructor', 'One', '555-0126', true, true),
          ('Instructor Two', 'instructor2@example.com', $1, 'instructor', 'active', 'Instructor', 'Two', '555-0127', true, false)
      ) AS new_users(name, email, password, role, status, first_name, last_name, phone_number, email_notifications, sms_notifications)
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = new_users.email
      )
    `, [userPassword, adminPassword]);

    // Get instructor IDs
    const { rows: instructorRows } = await pool.query(`
      SELECT id, email FROM users WHERE role = 'instructor'
    `);
    const instructorOneId = instructorRows.find(u => u.email === 'instructor1@example.com')?.id;
    const instructorTwoId = instructorRows.find(u => u.email === 'instructor2@example.com')?.id;

    if (!instructorOneId || !instructorTwoId) {
      console.error('Failed to find instructor IDs');
      return;
    }

    // Get student user IDs
    const { rows: studentRows } = await pool.query(`
      SELECT id, email FROM users WHERE email IN ('jane@example.com', 'john@example.com')
    `);
    const janeId = studentRows.find(u => u.email === 'jane@example.com')?.id;
    const johnId = studentRows.find(u => u.email === 'john@example.com')?.id;

    // Seed classes (general info only)
    const classes = [
      {
        title: 'Child Development Associate (CDA)',
        description: 'This comprehensive course prepares you for the CDA credential, covering all aspects of early childhood education. This 2-month program runs Monday through Friday from 7:00 PM to 10:00 PM.',
        location_type: 'zoom',
        location_details: 'Online via Zoom',
        price: 299.99,
        recurrence_pattern: { 
          frequency: 'weekly', 
          interval: 1, 
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          endDate: '2025-07-31' // 2 months from start date
        },
        prerequisites: 'None required',
        materials_needed: 'Computer with internet access, webcam, and microphone',
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786188/class-1_mlye6d.jpg'
      },
      {
        title: 'Development and Operations',
        description: 'Master the essential skills needed to run a successful childcare program. Choose between our 2-week evening program (Monday-Friday, 7:00 PM - 10:00 PM) or our 5-day Saturday intensive (9:00 AM - 3:00 PM).',
        location_type: 'in-person',
        location_details: 'Main Training Center, Room 101',
        price: 349.99,
        recurrence_pattern: { 
          frequency: 'weekly', 
          interval: 1, 
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          endDate: '2025-06-14' // 2 weeks from start date
        },
        prerequisites: 'Basic childcare experience recommended',
        materials_needed: 'Notebook, laptop (optional)',
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786188/class-2_vpqyct.jpg'
      },
      {
        title: 'CPR and First Aid Certification',
        description: 'Essential training for childcare providers. Learn life-saving techniques including CPR, AED use, and first aid procedures. This one-day Saturday program runs from 9:00 AM to 2:00 PM.',
        location_type: 'in-person',
        location_details: 'Training Center, Room 203',
        price: 149.99,
        recurrence_pattern: null,
        prerequisites: 'None required',
        materials_needed: 'Comfortable clothing for practical exercises',
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786180/class-3_fealxp.jpg'
      }
    ];

    // Insert classes
    for (const classData of classes) {
      await pool.query(`
        INSERT INTO classes (
          title, description, price, location_type, location_details, recurrence_pattern, prerequisites, materials_needed, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (title) DO NOTHING
      `, [
        classData.title,
        classData.description,
        classData.price,
        classData.location_type,
        classData.location_details,
        JSON.stringify(classData.recurrence_pattern || null),
        classData.prerequisites,
        classData.materials_needed,
        classData.image_url
      ]);
    }

    // Get class IDs for seeding related data
    const { rows: classRows } = await pool.query('SELECT id, title FROM classes');
    const classMap = new Map(classRows.map(c => [c.title, c.id]));

    // Seed class sessions with instructors
    await pool.query(`
      INSERT INTO class_sessions (
        class_id, 
        session_date, 
        start_time, 
        end_time, 
        capacity, 
        enrolled_count, 
        min_enrollment, 
        waitlist_enabled, 
        waitlist_capacity, 
        instructor_id, 
        status
      )
      VALUES
        -- Child Development Associate (CDA) sessions with Instructor One
        ($1, '2025-06-02', '19:00', '22:00', 20, 0, 5, true, 10, $2, 'scheduled'),
        ($1, '2025-07-01', '19:00', '22:00', 20, 0, 5, true, 10, $2, 'scheduled'),
        
        -- Development and Operations sessions with Instructor Two
        ($3, '2025-06-03', '19:00', '22:00', 15, 0, 5, true, 5, $4, 'scheduled'),
        ($3, '2025-06-10', '19:00', '22:00', 15, 0, 5, true, 5, $4, 'scheduled'),
        
        -- CPR and First Aid Certification sessions with Instructor One
        ($5, '2025-06-07', '09:00', '14:00', 12, 0, 4, true, 8, $2, 'scheduled'),
        ($5, '2025-06-14', '09:00', '14:00', 12, 0, 4, true, 8, $2, 'scheduled')
      ON CONFLICT DO NOTHING;
    `, [
      classMap.get('Child Development Associate (CDA)'),
      instructorOneId,
      classMap.get('Development and Operations'),
      instructorTwoId,
      classMap.get('CPR and First Aid Certification')
    ]);

    // Seed waitlist entries
    await pool.query(`
      INSERT INTO class_waitlist (class_id, user_id, position, status)
      VALUES
        ($1, 1, 1, 'pending'),
        ($1, 2, 2, 'approved'),
        ($2, 1, 1, 'rejected')
      ON CONFLICT (class_id, user_id) DO NOTHING;
    `, [
      classMap.get('Child Development Associate (CDA)'),
      classMap.get('Development and Operations')
    ]);

    // Seed enrollments - only users who are not admin or instructor can be enrolled
    await pool.query(`
      WITH session_ids AS (
        SELECT id, class_id, ROW_NUMBER() OVER (PARTITION BY class_id ORDER BY session_date) as session_num
        FROM class_sessions
      ),
      enrollable_users AS (
        SELECT id FROM users WHERE role NOT IN ('admin', 'instructor')
      )
      INSERT INTO enrollments (user_id, class_id, session_id, payment_status, enrollment_status, admin_notes, reviewed_at, reviewed_by)
      SELECT 
        e.user_id,
        e.class_id::integer,
        s.id as session_id,
        e.payment_status,
        e.enrollment_status,
        e.admin_notes,
        e.reviewed_at,
        e.reviewed_by
      FROM (
        VALUES
          (${janeId}, $1::integer, 'paid', 'approved', 'Initial enrollment approved', CURRENT_TIMESTAMP, 3),
          (${janeId}, $2::integer, 'paid', 'approved', 'Initial enrollment approved', CURRENT_TIMESTAMP, 3),
          (${johnId}, $3::integer, 'paid', 'approved', 'Initial enrollment approved', CURRENT_TIMESTAMP, 3),
          (${johnId}, $1::integer, 'paid', 'pending', NULL, NULL, NULL),
          (${janeId}, $3::integer, 'paid', 'rejected', 'Class capacity reached', CURRENT_TIMESTAMP, 3)
      ) AS e(user_id, class_id, payment_status, enrollment_status, admin_notes, reviewed_at, reviewed_by)
      JOIN session_ids s ON s.class_id = e.class_id AND s.session_num = 1
      JOIN enrollable_users eu ON eu.id = e.user_id  -- Only allow enrollable users
      ON CONFLICT DO NOTHING
    `, [
      classMap.get('Child Development Associate (CDA)'),
      classMap.get('Development and Operations'),
      classMap.get('CPR and First Aid Certification')
    ]);

    // Then, update user roles for users with approved enrollments
    await pool.query(`
      UPDATE users u
      SET role = 'student'
      WHERE EXISTS (
        SELECT 1 
        FROM enrollments e 
        WHERE e.user_id = u.id 
        AND e.enrollment_status = 'approved'
      )
      AND u.role = 'user'  -- Only update users who are not already instructors or admins
    `);

    // Seed certificates
    await pool.query(`
      INSERT INTO certificates (
        user_id, 
        class_id, 
        certificate_name, 
        certificate_url, 
        verification_code,
        status,
        uploaded_by
      )
      VALUES
        (1, $1, 'CDA Certificate', 'https://example.com/certs/cda.pdf', 'CDA-2025-001', 'approved', 3),
        (1, $2, 'Development and Operations Certificate', 'https://example.com/certs/devops.pdf', 'DO-2025-001', 'approved', 3),
        (2, $3, 'CPR and First Aid Certificate', 'https://example.com/certs/cpr.pdf', 'CPR-2025-001', 'pending', 3)
      ON CONFLICT (verification_code) DO NOTHING;
    `, [
      classMap.get('Child Development Associate (CDA)'),
      classMap.get('Development and Operations'),
      classMap.get('CPR and First Aid Certification')
    ]);

    // Seed payments
    await pool.query(`
      INSERT INTO payments (
        user_id, 
        class_id, 
        stripe_payment_id, 
        amount, 
        currency, 
        status,
        due_date,
        payment_method,
        last_four,
        refund_status,
        refund_amount,
        refund_reason,
        refunded_at,
        refunded_by
      )
      VALUES
        (1, $1, 'stripe_payment_1', 299.99, 'USD', 'completed', CURRENT_TIMESTAMP, 'credit_card', '4242', NULL, NULL, NULL, NULL, NULL),
        (1, $2, 'stripe_payment_2', 349.99, 'USD', 'completed', CURRENT_TIMESTAMP, 'credit_card', '4242', 'processed', 349.99, 'Student requested refund', CURRENT_TIMESTAMP, 3),
        (2, $3, 'stripe_payment_3', 149.99, 'USD', 'completed', CURRENT_TIMESTAMP, 'credit_card', '5555', NULL, NULL, NULL, NULL, NULL),
        (2, $1, 'stripe_payment_4', 299.99, 'USD', 'pending', CURRENT_TIMESTAMP, 'credit_card', '5555', NULL, NULL, NULL, NULL, NULL),
        (1, $3, 'stripe_payment_5', 149.99, 'USD', 'completed', CURRENT_TIMESTAMP, 'credit_card', '4242', 'processed', 74.99, 'Partial refund due to cancellation', CURRENT_TIMESTAMP, 3)
      ON CONFLICT (stripe_payment_id) DO NOTHING;
    `, [
      classMap.get('Child Development Associate (CDA)'),
      classMap.get('Development and Operations'),
      classMap.get('CPR and First Aid Certification')
    ]);

    // Seed notification templates
    await pool.query(`
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
    `);

    // Seed notifications
    await pool.query(`
      INSERT INTO user_notifications (user_id, type, title, message, is_read, action_url, sender_id, metadata)
      VALUES
        (1, 'class_reminder', 'Upcoming Class', 'Your CDA class starts in 1 hour', false, '/classes/1', NULL, '{"category": "class", "priority": "high"}'::jsonb),
        (1, 'certificate_ready', 'Certificate Available', 'Your CDA certificate is ready to download', false, '/certificates/1', NULL, '{"category": "certificate", "priority": "medium"}'::jsonb),
        (2, 'payment_due', 'Payment Due', 'Payment for CPR class is due tomorrow', false, '/payments/3', 3, '{"category": "payment", "priority": "high"}'::jsonb)
      ON CONFLICT DO NOTHING;
    `);

    // Seed activity logs
    await pool.query(`
      INSERT INTO user_activity_log (user_id, action, details)
      VALUES
        (1, 'profile_update', '{"updated_fields": ["first_name", "last_name"]}'::jsonb),
        (1, 'enrollment', '{"class_id": 1, "class_name": "CDA"}'::jsonb),
        (2, 'payment', '{"amount": 149.99, "class_name": "CPR"}'::jsonb)
      ON CONFLICT DO NOTHING;
    `);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  } finally {
    await pool.end();
  }
};

// Only run if this file is being run directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error in seed script:', err);
      process.exit(1);
    });
}

module.exports = seed;
