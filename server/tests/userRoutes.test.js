// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';

const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('User Routes - Phone Number Tests', () => {
  let adminToken;
  let userToken;
  let testUserEmail;
  let testUserId;

  beforeAll(async () => {
    // Clean up any existing test data
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");

    // Create test user
    testUserEmail = `test.${Date.now()}@test.com`;
    // Use a hardcoded bcrypt hash for 'test1234'
    const hashedPassword = '$2b$10$zQf8QwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw';
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['Test User', testUserEmail, hashedPassword, 'student']
    );
    testUserId = userResult.rows[0].id;

    // Generate real JWTs for the test user and admin
    userToken = jwt.sign({ id: testUserId, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    adminToken = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    testUserEmail = `test.${Date.now()}@test.com`;
    testUserId = 2;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
    await pool.end();
  });

  describe('POST /api/users/register - Phone Number Validation', () => {
    it('should register a user with valid phone number', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: testUserEmail,
          password: 'test1234',
          first_name: 'Test',
          last_name: 'User',
          phone_number: '1234567890'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUserEmail);
    });

    it('should fail with invalid phone number format', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: testUserEmail,
          password: 'test1234',
          phone_number: '123' // Invalid phone number
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid phone number format. Please enter a 10-digit phone number.');
    });

    it('should register a user without phone number (optional field)', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User No Phone',
          email: `nophone.${Date.now()}@test.com`,
          password: 'test1234',
          first_name: 'Test',
          last_name: 'NoPhone'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
    });
  });
}); 