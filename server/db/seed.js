// server/db/seed.js

const pool = require('../config/db');

const seed = async () => {
  try {
    // Drop existing tables
    await pool.query(`
      DROP TABLE IF EXISTS enrollments;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS classes;
    `);

    // Create tables
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user'
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

    `);

    // Insert seed users
    await pool.query(`
      INSERT INTO users (name, email, password, role) VALUES
        ('Jane Doe', 'jane@example.com', 'hashedpassword1', 'user'),
        ('John Smith', 'john@example.com', 'hashedpassword2', 'user'),
        ('Admin User', 'admin@example.com', 'hashedpassword', 'admin');
    `);

    // Insert seed classes
    await pool.query(`
      INSERT INTO classes (title, description, date, location_type, location_details, price, capacity)
      VALUES 
        ('Intro to Painting', 'A beginner friendly class on watercolor painting.', '2025-04-20 10:00:00', 'in-person', '123 Art St, NY', 30.00, 10),
        ('Yoga Basics', 'Learn the fundamentals of yoga.', '2025-04-21 09:00:00', 'zoom', 'https://zoom.us/yogabasics', 20.00, 15),
        ('Cooking with Spices', 'Explore spice blends in various cuisines.', '2025-04-22 18:00:00', 'in-person', '456 Culinary Ave, NY', 35.00, 12);
    `);

    // Insert sample enrollments
    await pool.query(`
      INSERT INTO enrollments (user_id, class_id, payment_status)
      VALUES
        (1, 1, 'paid'),
        (1, 2, 'paid'),
        (2, 3, 'paid');
    `);

    console.log('Database seeded successfully!');
    pool.end();
  } catch (err) {
    console.error('Error seeding database:', err);
    pool.end();
  }
};

seed();
