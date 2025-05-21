// Mock bcrypt before any imports so all uses are mocked
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';

// Mock the email sending utility
jest.mock('../utils/sendEmail');

const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Get the mocked email function
const mockSendEmail = require('../utils/sendEmail');

// Mock the user model
jest.mock('../models/userModel', () => ({
  getUserByEmail: jest.fn(),
  comparePassword: jest.fn(),
  createUser: jest.fn(),
  getProfileWithDetails: jest.fn(),
  updateProfile: jest.fn(),
  getAllUsers: jest.fn(),
  getUserById: jest.fn()
}));

// Mock the authentication middleware
// jest.mock('../middleware/auth', () => (req, res, next) => {
//   if (!req.headers.authorization) {
//     return res.status(401).json({ error: 'No token provided' });
//   }
//   const token = req.headers.authorization.split(' ')[1];
//   if (token === 'admin-token') {
//     req.user = { id: 1, role: 'admin' };
//   } else if (token === 'user-token') {
//     req.user = { id: 2, role: 'student' };
//   } else {
//     return res.status(401).json({ error: 'Invalid token' });
//   }
//   next();
// });

jest.mock('../middleware/requireAdmin', () => (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
});

describe('User Routes', () => {
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
    jest.clearAllMocks();
    testUserEmail = `test.${Date.now()}@test.com`;
    testUserId = 2;

    // Mock bcrypt hash and compare
    bcrypt.hash.mockResolvedValue('hashed_password');
    bcrypt.compare.mockResolvedValue(true);

    // Remove getUserById mock for profile tests
    // Instead, mock getProfileWithDetails for GET and updateProfile for PUT
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
    await pool.end();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      // Mock user data
      const mockUser = {
        id: testUserId,
        name: 'Test User',
        email: testUserEmail,
        role: 'user',
        created_at: new Date().toISOString()
      };

      // Mock the database calls
      userModel.getUserByEmail.mockResolvedValue(null);
      userModel.createUser.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: testUserEmail,
          password: 'test1234'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUserEmail);
      expect(userModel.createUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: testUserEmail,
        password: 'hashed_password',
        role: 'student',
        status: 'active',
        email_notifications: true,
        sms_notifications: false,
        phone_number: null,
        first_name: undefined,
        last_name: undefined
      });
    });

    it('should fail with existing email', async () => {
      // Mock existing user
      userModel.getUserByEmail.mockResolvedValue({
        id: 1,
        email: testUserEmail
      });

      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: testUserEmail,
          password: 'test1234'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Mock user data
      const mockUser = {
        id: testUserId,
        name: 'Test User',
        email: testUserEmail,
        role: 'user',
        password: 'hashed_password'
      };

      // Mock the database calls
      userModel.getUserByEmail.mockResolvedValue(mockUser);
      userModel.comparePassword.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUserEmail,
          password: 'test1234'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUserEmail);
    });

    it('should fail with invalid credentials', async () => {
      // Mock user data
      const mockUser = {
        id: testUserId,
        email: testUserEmail,
        password: 'hashed_password',
        role: 'student',
        status: 'active',
        email_notifications: true,
        sms_notifications: false,
        phone_number: null,
        first_name: undefined,
        last_name: undefined
      };

      // Mock the database calls
      userModel.getUserByEmail.mockResolvedValue(mockUser);
      require('bcrypt').compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUserEmail,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid email or password');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      // Mock user profile data
      const mockProfile = {
        id: testUserId,
        name: 'Test User',
        email: testUserEmail,
        role: 'student',
        status: 'active',
        email_notifications: true,
        sms_notifications: false,
        phone_number: null,
        first_name: undefined,
        last_name: undefined
      };

      // Mock the database call
      userModel.getProfileWithDetails.mockResolvedValue(mockProfile);

      const res = await request(app)
        .get('/api/profile/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', testUserEmail);
      // Check the actual call argument for debugging
      // console.log(userModel.getProfileWithDetails.mock.calls);
      expect(userModel.getProfileWithDetails).toHaveBeenCalled();
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/profile/profile');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      // Mock updated profile data
      const updatedProfile = {
        id: testUserId,
        name: 'Updated Name',
        email: testUserEmail,
        role: 'student',
        status: 'active',
        email_notifications: true,
        sms_notifications: false,
        phone_number: null,
        first_name: undefined,
        last_name: undefined
      };

      // Mock the database call
      userModel.updateProfile.mockResolvedValue(updatedProfile);

      const res = await request(app)
        .put('/api/profile/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Name',
          phone_number: null,
          email_notifications: true,
          sms_notifications: false
        });

      // Log the full response for debugging
      console.log('Response status:', res.status);
      console.log('Response body:', JSON.stringify(res.body, null, 2));
      console.log('Response error:', res.error);
      
      if (res.error) {
        console.log('Error details:', {
          message: res.error.message,
          status: res.error.status,
          text: res.error.text
        });
      }

      expect(res.status).toBeLessThan(500);
      expect(res.body).toHaveProperty('name', 'Updated Name');
      expect(userModel.updateProfile).toHaveBeenCalled();
    });
  });

  describe('GET /api/users', () => {
    it('should get all users when admin', async () => {
      // Mock users data
      const mockUsers = [
        { id: 1, name: 'Admin User', email: 'admin@test.com', role: 'admin' },
        { id: 2, name: 'Test User', email: testUserEmail, role: 'user' }
      ];

      // Mock the database call
      userModel.getAllUsers.mockResolvedValue(mockUsers);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(userModel.getAllUsers).toHaveBeenCalled();
    });

    it('should fail when non-admin tries to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'Admin access required');
    });
  });
}); 