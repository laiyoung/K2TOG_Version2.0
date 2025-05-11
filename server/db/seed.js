// server/db/seed.js

const pool = require('../config/db');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    // Drop existing tables
    await pool.query(`
      DROP TABLE IF EXISTS user_notifications CASCADE;
      DROP TABLE IF EXISTS user_activity_log CASCADE;
      DROP TABLE IF EXISTS user_payment_methods CASCADE;
      DROP TABLE IF EXISTS user_certificates CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS enrollments CASCADE;
      DROP TABLE IF EXISTS classes CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create tables
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
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
        location_type VARCHAR(20) CHECK (location_type IN ('zoom', 'in-person')),
        location_details TEXT,
        price DECIMAL(10,2) NOT NULL,
        capacity INTEGER NOT NULL,
        enrolled_count INTEGER DEFAULT 0
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

      CREATE TABLE user_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        action_url VARCHAR(255),
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

      -- Create indexes for better query performance
      CREATE INDEX idx_user_certificates_user_id ON user_certificates(user_id);
      CREATE INDEX idx_user_certificates_class_id ON user_certificates(class_id);
      CREATE INDEX idx_user_payment_methods_user_id ON user_payment_methods(user_id);
      CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
      CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
      CREATE INDEX idx_user_notifications_is_read ON user_notifications(is_read);
    `);

    // Hash passwords
    const userPassword = await bcrypt.hash('user123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Insert seed users with new fields
    await pool.query(`
      INSERT INTO users (name, email, password, role, first_name, last_name, phone_number, email_notifications, sms_notifications) 
      VALUES
        ('Jane Doe', 'jane@example.com', $1, 'user', 'Jane', 'Doe', '555-0123', true, false),
        ('John Smith', 'john@example.com', $1, 'user', 'John', 'Smith', '555-0124', true, true),
        ('Admin User', 'admin@example.com', $2, 'admin', 'Admin', 'User', '555-0125', true, false)
    `, [userPassword, adminPassword]);

    // Insert seed classes
    await pool.query(`
      INSERT INTO classes (title, description, date, location_type, location_details, price, capacity)
      VALUES 
        ('Intro to Painting', 'A beginner friendly class on watercolor painting.', '2025-04-20 10:00:00', 'in-person', '123 Art St, NY', 30.00, 10),
        ('Yoga Basics', 'Learn the fundamentals of yoga.', '2025-04-21 09:00:00', 'zoom', 'https://zoom.us/yogabasics', 20.00, 15),
        ('Cooking with Spices', 'Explore spice blends in various cuisines.', '2025-04-22 18:00:00', 'in-person', '456 Culinary Ave, NY', 35.00, 12);
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
