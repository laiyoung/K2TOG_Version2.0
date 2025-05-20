// server/db/seed.js

const pool = require('../config/db');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    // Drop existing tables
    await pool.query(`
      DROP TABLE IF EXISTS user_notifications CASCADE;
      DROP TABLE IF EXISTS notification_templates CASCADE;
      DROP TABLE IF EXISTS user_activity_log CASCADE;
      DROP TABLE IF EXISTS user_payment_methods CASCADE;
      DROP TABLE IF EXISTS user_certificates CASCADE;
      DROP TABLE IF EXISTS class_waitlist CASCADE;
      DROP TABLE IF EXISTS class_sessions CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS enrollments CASCADE;
      DROP TABLE IF EXISTS classes CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS system_settings CASCADE;
      DROP TABLE IF EXISTS api_keys CASCADE;
      DROP TABLE IF EXISTS api_requests CASCADE;
    `);

    // Create tables
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone_number VARCHAR(20),
        profile_picture_url VARCHAR(255),
        email_notifications BOOLEAN DEFAULT true,
        sms_notifications BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE user_certificates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
        certificate_name VARCHAR(255) NOT NULL,
        issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
        certificate_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE user_payment_methods (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        payment_type VARCHAR(50) NOT NULL,
        last_four VARCHAR(4),
        expiry_date DATE,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE user_activity_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE notification_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        title_template TEXT NOT NULL,
        message_template TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE user_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        action_url VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE system_settings (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT,
        description TEXT,
        is_encrypted BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER REFERENCES users(id),
        UNIQUE(category, setting_key)
      );

      CREATE TABLE api_keys (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        key_value VARCHAR(100) NOT NULL UNIQUE,
        permissions JSONB NOT NULL DEFAULT '[]',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE,
        revoked_at TIMESTAMP WITH TIME ZONE,
        revoked_by INTEGER REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
        last_used_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE api_requests (
        id SERIAL PRIMARY KEY,
        api_key_id INTEGER REFERENCES api_keys(id),
        endpoint VARCHAR(255) NOT NULL,
        method VARCHAR(10) NOT NULL,
        status_code INTEGER NOT NULL,
        response_time INTEGER NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create updated_at trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers for updated_at
      CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_payment_methods_updated_at
          BEFORE UPDATE ON user_payment_methods
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_classes_updated_at
          BEFORE UPDATE ON classes
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_class_waitlist_updated_at
          BEFORE UPDATE ON class_waitlist
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      -- Create trigger for notification_templates updated_at
      CREATE TRIGGER update_notification_templates_updated_at
          BEFORE UPDATE ON notification_templates
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      -- Create indexes for better query performance
      CREATE INDEX idx_user_certificates_user_id ON user_certificates(user_id);
      CREATE INDEX idx_user_certificates_class_id ON user_certificates(class_id);
      CREATE INDEX idx_user_payment_methods_user_id ON user_payment_methods(user_id);
      CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
      CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
      CREATE INDEX idx_user_notifications_type ON user_notifications(type);
      CREATE INDEX idx_user_notifications_is_read ON user_notifications(is_read);
      CREATE INDEX idx_user_notifications_created_at ON user_notifications(created_at);
      CREATE INDEX idx_notification_templates_name ON notification_templates(name);
      CREATE INDEX idx_notification_templates_type ON notification_templates(type);
      CREATE INDEX idx_class_sessions_class_id ON class_sessions(class_id);
      CREATE INDEX idx_class_sessions_session_date ON class_sessions(session_date);
      CREATE INDEX idx_class_waitlist_class_id ON class_waitlist(class_id);
      CREATE INDEX idx_class_waitlist_user_id ON class_waitlist(user_id);
      CREATE INDEX idx_class_waitlist_status ON class_waitlist(status);

      -- Create indexes
      CREATE INDEX idx_system_settings_category ON system_settings(category);
      CREATE INDEX idx_api_keys_status ON api_keys(status);
      CREATE INDEX idx_api_keys_key_value ON api_keys(key_value);
      CREATE INDEX idx_api_requests_api_key_id ON api_requests(api_key_id);
      CREATE INDEX idx_api_requests_created_at ON api_requests(created_at);

      -- Create trigger for updating system_settings updated_at
      CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
      CREATE TRIGGER update_system_settings_updated_at
          BEFORE UPDATE ON system_settings
          FOR EACH ROW
          EXECUTE FUNCTION update_system_settings_updated_at();
    `);

    // Hash passwords
    const userPassword = await bcrypt.hash('user123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Insert seed users with new fields
    await pool.query(`
      INSERT INTO users (name, email, password, role, status, first_name, last_name, phone_number, email_notifications, sms_notifications) 
      VALUES
        ('Jane Doe', 'jane@example.com', $1, 'user', 'active', 'Jane', 'Doe', '555-0123', true, false),
        ('John Smith', 'john@example.com', $1, 'user', 'active', 'John', 'Smith', '555-0124', true, true),
        ('Admin User', 'admin@example.com', $2, 'admin', 'active', 'Admin', 'User', '555-0125', true, false),
        ('Instructor One', 'instructor1@example.com', $1, 'instructor', 'active', 'Instructor', 'One', '555-0126', true, true),
        ('Instructor Two', 'instructor2@example.com', $1, 'instructor', 'active', 'Instructor', 'Two', '555-0127', true, false)
    `, [userPassword, adminPassword]);

    // Insert seed classes with enhanced features
    await pool.query(`
      INSERT INTO classes (
        title, description, date, start_time, end_time, duration_minutes,
        location_type, location_details, price, capacity, is_recurring,
        recurrence_pattern, min_enrollment, prerequisites, materials_needed,
        instructor_id, waitlist_enabled, waitlist_capacity, status
      )
      VALUES 
        (
          'Intro to Painting',
          'A beginner friendly class on watercolor painting.',
          '2025-04-20 10:00:00',
          '10:00',
          '11:30',
          90,
          'in-person',
          '123 Art St, NY',
          30.00,
          10,
          false,
          NULL,
          3,
          'No prior experience needed',
          'Watercolor set, brushes, paper',
          4,
          true,
          5,
          'scheduled'
        ),
        (
          'Yoga Basics',
          'Learn the fundamentals of yoga.',
          '2025-04-21 09:00:00',
          '09:00',
          '10:00',
          60,
          'zoom',
          'https://zoom.us/yogabasics',
          20.00,
          15,
          true,
          '{"frequency": "weekly", "interval": 7, "endDate": "2025-06-30", "daysOfWeek": [2, 4]}',
          5,
          'Yoga mat required',
          'Yoga mat, comfortable clothes',
          5,
          true,
          3,
          'scheduled'
        ),
        (
          'Cooking with Spices',
          'Explore spice blends in various cuisines.',
          '2025-04-22 18:00:00',
          '18:00',
          '19:30',
          90,
          'in-person',
          '456 Culinary Ave, NY',
          35.00,
          12,
          false,
          NULL,
          4,
          'Basic cooking skills required',
          'Apron, chef knife, cutting board',
          4,
          false,
          0,
          'scheduled'
        );
    `);

    // Insert sample class sessions for recurring class
    await pool.query(`
      INSERT INTO class_sessions (class_id, session_date, start_time, end_time)
      SELECT 
        2, -- Yoga Basics class ID
        gs::date,
        '09:00'::time,
        '10:00'::time
      FROM generate_series(
          '2025-04-21'::date,
          '2025-06-30'::date,
          '1 day'::interval
      ) AS gs
      WHERE EXTRACT(DOW FROM gs) IN (2, 4); -- Tuesday and Thursday
    `);

    // Insert sample waitlist entries
    await pool.query(`
      INSERT INTO class_waitlist (class_id, user_id, position, status)
      VALUES
        (1, 1, 1, 'waiting'),
        (1, 2, 2, 'offered'),
        (2, 1, 1, 'accepted');
    `);

    // Insert sample enrollments with status
    await pool.query(`
      INSERT INTO enrollments (user_id, class_id, payment_status, enrollment_status, admin_notes, reviewed_at, reviewed_by)
      VALUES
        (1, 1, 'paid', 'approved', 'Initial enrollment approved', CURRENT_TIMESTAMP, 3),
        (1, 2, 'paid', 'approved', 'Initial enrollment approved', CURRENT_TIMESTAMP, 3),
        (2, 3, 'paid', 'approved', 'Initial enrollment approved', CURRENT_TIMESTAMP, 3),
        (2, 1, 'paid', 'pending', NULL, NULL, NULL),
        (1, 3, 'paid', 'rejected', 'Class capacity reached', CURRENT_TIMESTAMP, 3);
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

    // Insert notification templates
    await pool.query(`
      INSERT INTO notification_templates (name, type, title_template, message_template, metadata)
      VALUES
        (
          'class_reminder',
          'class_reminder',
          'Upcoming Class: {{class_name}}',
          'Your class "{{class_name}}" starts in {{time_until}}. Please join at {{location}}.',
          '{"category": "class", "priority": "high"}'
        ),
        (
          'enrollment_approved',
          'enrollment',
          'Enrollment Approved: {{class_name}}',
          'Your enrollment in "{{class_name}}" has been approved. The class starts on {{start_date}}.',
          '{"category": "enrollment", "priority": "medium"}'
        ),
        (
          'payment_due',
          'payment',
          'Payment Due: {{class_name}}',
          'Payment of {{amount}} for "{{class_name}}" is due on {{due_date}}.',
          '{"category": "payment", "priority": "high"}'
        ),
        (
          'certificate_ready',
          'certificate',
          'Certificate Available: {{class_name}}',
          'Your certificate for "{{class_name}}" is now available for download.',
          '{"category": "certificate", "priority": "medium"}'
        ),
        (
          'class_cancelled',
          'class_update',
          'Class Cancelled: {{class_name}}',
          'The class "{{class_name}}" scheduled for {{class_date}} has been cancelled. {{refund_info}}',
          '{"category": "class", "priority": "high"}'
        ),
        (
          'waitlist_offered',
          'waitlist',
          'Spot Available: {{class_name}}',
          'A spot has opened up in "{{class_name}}". You have 24 hours to accept this offer.',
          '{"category": "waitlist", "priority": "high"}'
        );

      -- Update existing notifications with metadata
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
      )
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
