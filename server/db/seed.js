// server/db/seed.js

const pool = require('../config/db');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    // Drop only class-related tables
    await pool.query(`
      DROP TABLE IF EXISTS class_waitlist CASCADE;
      DROP TABLE IF EXISTS class_sessions CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS enrollments CASCADE;
      DROP TABLE IF EXISTS classes CASCADE;
    `);

    // Create only class-related tables
    await pool.query(`
      CREATE TABLE classes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        start_time TIME,
        end_time TIME,
        duration_minutes INTEGER,
        location_type VARCHAR(20) CHECK (location_type IN ('zoom', 'in-person')),
        location_details TEXT,
        price DECIMAL(10,2) NOT NULL,
        capacity INTEGER NOT NULL,
        enrolled_count INTEGER DEFAULT 0,
        is_recurring BOOLEAN DEFAULT false,
        recurrence_pattern JSONB,
        min_enrollment INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'scheduled')),
        prerequisites TEXT,
        materials_needed TEXT,
        instructor_id INTEGER REFERENCES users(id),
        waitlist_enabled BOOLEAN DEFAULT false,
        waitlist_capacity INTEGER DEFAULT 0,
        image_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE class_sessions (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
        session_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE class_waitlist (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'offered', 'accepted', 'declined')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(class_id, user_id)
      );

      CREATE TABLE enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        class_id INTEGER REFERENCES classes(id),
        session_id INTEGER REFERENCES class_sessions(id),
        payment_status VARCHAR(20),
        enrollment_status VARCHAR(20) DEFAULT 'pending' CHECK (enrollment_status IN ('pending', 'approved', 'rejected')),
        admin_notes TEXT,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        reviewed_by INTEGER REFERENCES users(id),
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        class_id INTEGER REFERENCES classes(id),
        stripe_payment_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2),
        currency VARCHAR(10),
        status VARCHAR(50),
        refund_status VARCHAR(20),
        refund_amount DECIMAL(10, 2),
        refund_reason TEXT,
        refunded_at TIMESTAMP WITH TIME ZONE,
        refunded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create updated_at trigger function if it doesn't exist
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers for updated_at
      DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
      CREATE TRIGGER update_classes_updated_at
          BEFORE UPDATE ON classes
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_class_waitlist_updated_at ON class_waitlist;
      CREATE TRIGGER update_class_waitlist_updated_at
          BEFORE UPDATE ON class_waitlist
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_class_sessions_class_id ON class_sessions(class_id);
      CREATE INDEX IF NOT EXISTS idx_class_sessions_session_date ON class_sessions(session_date);
      CREATE INDEX IF NOT EXISTS idx_class_waitlist_class_id ON class_waitlist(class_id);
      CREATE INDEX IF NOT EXISTS idx_class_waitlist_user_id ON class_waitlist(user_id);
      CREATE INDEX IF NOT EXISTS idx_class_waitlist_status ON class_waitlist(status);
      CREATE INDEX IF NOT EXISTS idx_enrollments_session_id ON enrollments(session_id);
    `);

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

    // Seed classes
    const classes = [
      {
        title: 'Child Development Associate (CDA)',
        description: 'This comprehensive course prepares you for the CDA credential, covering all aspects of early childhood education. Learn about child development, curriculum planning, and professional practices. Perfect for those seeking to advance their career in early childhood education.',
        date: new Date('2025-06-01'),
        start_time: '09:00',
        end_time: '17:00',
        duration_minutes: 480,
        location_type: 'zoom',
        location_details: 'Online via Zoom',
        price: 299.99,
        capacity: 20,
        enrolled_count: 0,
        is_recurring: true,
        recurrence_pattern: { frequency: 'weekly', interval: 1, days: ['Monday', 'Wednesday'] },
        min_enrollment: 5,
        status: 'active',
        prerequisites: 'None required',
        materials_needed: 'Computer with internet access, webcam, and microphone',
        waitlist_enabled: true,
        waitlist_capacity: 10,
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786188/class-1_mlye6d.jpg'
      },
      {
        title: 'Development and Operations',
        description: 'Master the essential skills needed to run a successful childcare program. Learn about business operations, staff management, curriculum development, and regulatory compliance. This course is ideal for current and aspiring childcare center directors.',
        date: new Date('2025-06-15'),
        start_time: '10:00',
        end_time: '16:00',
        duration_minutes: 360,
        location_type: 'in-person',
        location_details: 'Main Training Center, Room 101',
        price: 349.99,
        capacity: 15,
        enrolled_count: 0,
        is_recurring: true,
        recurrence_pattern: { frequency: 'weekly', interval: 1, days: ['Tuesday', 'Thursday'] },
        min_enrollment: 5,
        status: 'active',
        prerequisites: 'Basic childcare experience recommended',
        materials_needed: 'Notebook, laptop (optional)',
        waitlist_enabled: true,
        waitlist_capacity: 5,
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786188/class-2_vpqyct.jpg'
      },
      {
        title: 'CPR and First Aid Certification',
        description: 'Essential training for childcare providers. Learn life-saving techniques including CPR, AED use, and first aid procedures. This course meets state licensing requirements and provides certification valid for two years.',
        date: new Date('2025-06-01'),
        start_time: '08:00',
        end_time: '17:00',
        duration_minutes: 540,
        location_type: 'in-person',
        location_details: 'Training Center, Room 203',
        price: 149.99,
        capacity: 12,
        enrolled_count: 0,
        is_recurring: false,
        min_enrollment: 4,
        status: 'active',
        prerequisites: 'None required',
        materials_needed: 'Comfortable clothing for practical exercises',
        waitlist_enabled: true,
        waitlist_capacity: 8,
        image_url: 'https://res.cloudinary.com/dufbdy0z0/image/upload/v1747786180/class-3_fealxp.jpg'
      }
    ];

    // Insert classes
    for (const classData of classes) {
      await pool.query(`
        INSERT INTO classes (
          title, description, date, start_time, end_time, duration_minutes,
          location_type, location_details, price, capacity, enrolled_count,
          is_recurring, recurrence_pattern, min_enrollment, status,
          prerequisites, materials_needed, waitlist_enabled, waitlist_capacity,
          image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      `, [
        classData.title,
        classData.description,
        classData.date,
        classData.start_time,
        classData.end_time,
        classData.duration_minutes,
        classData.location_type,
        classData.location_details,
        classData.price,
        classData.capacity,
        classData.enrolled_count,
        classData.is_recurring,
        JSON.stringify(classData.recurrence_pattern || null),
        classData.min_enrollment,
        classData.status,
        classData.prerequisites,
        classData.materials_needed,
        classData.waitlist_enabled,
        classData.waitlist_capacity,
        classData.image_url
      ]);
    }

    // Insert sample class sessions for all classes
    await pool.query(`
      -- CDA Class Sessions (Class ID 1)
      INSERT INTO class_sessions (class_id, session_date, start_time, end_time)
      SELECT 
        1,
        gs::date,
        '09:00'::time,
        '17:00'::time
      FROM generate_series(
          '2025-06-01'::date,
          '2025-06-30'::date,
          '1 day'::interval
      ) AS gs
      WHERE EXTRACT(DOW FROM gs) IN (1, 3); -- Monday and Wednesday

      -- Development and Operations Class Sessions (Class ID 2)
      INSERT INTO class_sessions (class_id, session_date, start_time, end_time)
      SELECT 
        2,
        gs::date,
        '10:00'::time,
        '16:00'::time
      FROM generate_series(
          '2025-06-15'::date,
          '2025-07-15'::date,
          '1 day'::interval
      ) AS gs
      WHERE EXTRACT(DOW FROM gs) IN (2, 4); -- Tuesday and Thursday

      -- CPR and First Aid Class Sessions (Class ID 3)
      INSERT INTO class_sessions (class_id, session_date, start_time, end_time)
      VALUES
        (3, '2025-06-01', '08:00', '17:00'),
        (3, '2025-06-08', '08:00', '17:00'),
        (3, '2025-06-15', '08:00', '17:00'),
        (3, '2025-06-22', '08:00', '17:00');
    `);

    // Insert sample waitlist entries
    await pool.query(`
      INSERT INTO class_waitlist (class_id, user_id, position, status)
      VALUES
        (1, 1, 1, 'waiting'),
        (1, 2, 2, 'offered'),
        (2, 1, 1, 'accepted');
    `);

    // Insert sample enrollments with status and session IDs
    await pool.query(`
      WITH session_ids AS (
        SELECT id, class_id, ROW_NUMBER() OVER (PARTITION BY class_id ORDER BY session_date) as session_num
        FROM class_sessions
      )
      INSERT INTO enrollments (user_id, class_id, session_id, payment_status, enrollment_status, admin_notes, reviewed_at, reviewed_by)
      SELECT 
        e.user_id,
        e.class_id,
        s.id as session_id,
        e.payment_status,
        e.enrollment_status,
        e.admin_notes,
        e.reviewed_at,
        e.reviewed_by
      FROM (
        VALUES
          (1, 1, 'paid', 'approved', 'Initial enrollment approved', CURRENT_TIMESTAMP, 3),
          (1, 2, 'paid', 'approved', 'Initial enrollment approved', CURRENT_TIMESTAMP, 3),
          (2, 3, 'paid', 'approved', 'Initial enrollment approved', CURRENT_TIMESTAMP, 3),
          (2, 1, 'paid', 'pending', NULL, NULL, NULL),
          (1, 3, 'paid', 'rejected', 'Class capacity reached', CURRENT_TIMESTAMP, 3)
      ) AS e(user_id, class_id, payment_status, enrollment_status, admin_notes, reviewed_at, reviewed_by)
      JOIN session_ids s ON s.class_id = e.class_id AND s.session_num = 1;
    `);

    // Insert sample certificates
    await pool.query(`
      INSERT INTO user_certificates (user_id, class_id, certificate_name, issue_date, certificate_url)
      VALUES
        (1, 1, 'Watercolor Painting Basics', CURRENT_TIMESTAMP, 'https://example.com/certs/watercolor.pdf'),
        (1, 2, 'Yoga Fundamentals', CURRENT_TIMESTAMP, 'https://example.com/certs/yoga.pdf');
    `);

    // Insert sample payment methods
    await pool.query(`
      INSERT INTO user_payment_methods (user_id, payment_type, last_four, expiry_date, is_default)
      VALUES
        (1, 'credit_card', '4242', '2025-12-31', true),
        (2, 'credit_card', '5555', '2025-10-31', true);
    `);

    // Insert sample activity logs
    await pool.query(`
      INSERT INTO user_activity_log (user_id, action, details)
      VALUES
        (1, 'profile_update', '{"updated_fields": ["first_name", "last_name"]}'),
        (1, 'enrollment', '{"class_id": 1, "class_name": "Intro to Painting"}'),
        (2, 'payment_method_added', '{"payment_type": "credit_card", "last_four": "5555"}');
    `);

    // Insert sample notifications
    await pool.query(`
      INSERT INTO user_notifications (user_id, type, title, message, is_read, action_url)
      VALUES
        (1, 'class_reminder', 'Upcoming Class', 'Your painting class starts in 1 hour', false, '/classes/1'),
        (1, 'certificate_ready', 'Certificate Available', 'Your yoga certificate is ready to download', false, '/certificates/2'),
        (2, 'payment_due', 'Payment Reminder', 'Payment for Cooking with Spices is due soon', false, '/payments/3');
    `);

    // Insert sample payments with refunds
    await pool.query(`
      INSERT INTO payments (
        user_id, 
        class_id, 
        stripe_payment_id, 
        amount, 
        currency, 
        status,
        refund_status,
        refund_amount,
        refund_reason,
        refunded_at,
        refunded_by
      )
      VALUES
        (1, 1, 'stripe_payment_1', 30.00, 'USD', 'completed', NULL, NULL, NULL, NULL, NULL),
        (1, 2, 'stripe_payment_2', 20.00, 'USD', 'completed', 'processed', 20.00, 'Student requested refund', CURRENT_TIMESTAMP, 3),
        (2, 3, 'stripe_payment_3', 35.00, 'USD', 'completed', NULL, NULL, NULL, NULL, NULL),
        (2, 1, 'stripe_payment_4', 30.00, 'USD', 'pending', NULL, NULL, NULL, NULL, NULL),
        (1, 3, 'stripe_payment_5', 35.00, 'USD', 'completed', 'processed', 17.50, 'Partial refund due to cancellation', CURRENT_TIMESTAMP, 3);
    `);

    // Insert notification templates only if they don't exist
    await pool.query(`
      INSERT INTO notification_templates (name, type, title_template, message_template, metadata)
      SELECT * FROM (
        VALUES
          (
            'class_reminder',
            'class_reminder',
            'Upcoming Class: {{class_name}}',
            'Your class "{{class_name}}" starts in {{time_until}}. Please join at {{location}}.',
            '{"category": "class", "priority": "high"}'::jsonb
          ),
          (
            'enrollment_approved',
            'enrollment',
            'Enrollment Approved: {{class_name}}',
            'Your enrollment in "{{class_name}}" has been approved. The class starts on {{start_date}}.',
            '{"category": "enrollment", "priority": "medium"}'::jsonb
          ),
          (
            'payment_due',
            'payment',
            'Payment Due: {{class_name}}',
            'Payment of {{amount}} for "{{class_name}}" is due on {{due_date}}.',
            '{"category": "payment", "priority": "high"}'::jsonb
          ),
          (
            'certificate_ready',
            'certificate',
            'Certificate Available: {{class_name}}',
            'Your certificate for "{{class_name}}" is now available for download.',
            '{"category": "certificate", "priority": "medium"}'::jsonb
          ),
          (
            'class_cancelled',
            'class_update',
            'Class Cancelled: {{class_name}}',
            'The class "{{class_name}}" scheduled for {{class_date}} has been cancelled. {{refund_info}}',
            '{"category": "class", "priority": "high"}'::jsonb
          ),
          (
            'waitlist_offered',
            'waitlist',
            'Spot Available: {{class_name}}',
            'A spot has opened up in "{{class_name}}". You have 24 hours to accept this offer.',
            '{"category": "waitlist", "priority": "high"}'::jsonb
          )
      ) AS new_templates(name, type, title_template, message_template, metadata)
      WHERE NOT EXISTS (
        SELECT 1 FROM notification_templates WHERE name = new_templates.name
      );

      -- Update existing notifications with metadata if needed
      UPDATE user_notifications
      SET metadata = jsonb_build_object(
        'category', 
        CASE 
          WHEN type = 'class_reminder' THEN 'class'
          WHEN type = 'certificate_ready' THEN 'certificate'
          WHEN type = 'payment_due' THEN 'payment'
          ELSE 'general'
        END,
        'priority',
        CASE 
          WHEN type IN ('class_reminder', 'payment_due', 'class_cancelled') THEN 'high'
          ELSE 'medium'
        END
      )::jsonb
      WHERE metadata IS NULL;
    `);

    console.log('Database seeded successfully!');
    pool.end();
  } catch (err) {
    console.error('Error seeding database:', err);
    pool.end();
  } finally {
    process.exit();
  }
};

seed();
