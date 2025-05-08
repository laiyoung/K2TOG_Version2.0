// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';

// Mock the email sending utility
jest.mock('../utils/sendEmail');

const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Get the mocked email function
const mockSendEmail = require('../utils/sendEmail');

describe('User Routes', () => {
  let adminToken;
  let userToken;
  let testUserId;
  const testUserEmail = `testuser${Date.now()}@test.com`;
  const testUserPassword = 'password123';

  beforeAll(async () => {
    // Clean up any existing test data
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");

    // Create test admin user
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['Admin User', 'admin@test.com', hashedAdminPassword, 'admin']
    );

    // Create test regular user
    const hashedUserPassword = await bcrypt.hash(testUserPassword, 10);
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['Test User', testUserEmail, hashedUserPassword, 'user']
    );
    testUserId = userResult.rows[0].id;

    // Get tokens
    const adminLogin = await request(app)
      .post('/api/users/login')
      .send({
        email: 'admin@test.com',
        password: 'admin123'
      });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post('/api/users/login')
      .send({
        email: testUserEmail,
        password: testUserPassword
      });
    userToken = userLogin.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
    await pool.end();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'New User',
          email: `uniqueuser${Date.now()}@test.com`,
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email');
    });

    it('should fail with invalid email format', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Invalid User',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/users/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUserEmail,
          password: testUserPassword
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUserEmail,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', testUserEmail);
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Name'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated Name');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({
          name: 'Updated Name'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users', () => {
    it('should get all users when admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should fail when non-admin tries to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
}); 