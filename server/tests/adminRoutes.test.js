// Set up test environment variables
process.env.JWT_SECRET = 'test_jwt_secret';

const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const adminModel = require('../models/adminModel');

// Mock the admin model
jest.mock('../models/adminModel', () => ({
  getWaitlist: jest.fn(),
  updateWaitlistStatus: jest.fn(),
  getClassStats: jest.fn(),
  getEnrollmentStats: jest.fn(),
  getRevenueStats: jest.fn()
}));

// Mock the authentication middleware
jest.mock('../middleware/auth', () => (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = req.headers.authorization.split(' ')[1];
  if (token === 'admin-token') {
    req.user = { id: 1, role: 'admin' };
  } else if (token === 'user-token') {
    req.user = { id: 2, role: 'user' };
  } else {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
});

jest.mock('../middleware/requireAdmin', () => (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
});

describe('Admin Routes', () => {
  let adminToken = 'admin-token';
  let userToken = 'user-token';
  let testUserId;
  let testClassId;
  let adminEmail;
  let userEmail;

  beforeAll(async () => {
    // Clean up any existing test data first
    await pool.query('DELETE FROM enrollments WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test.com']);
    await pool.query('DELETE FROM classes WHERE title LIKE $1', ['Test Class%']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%test.com']);

    // Create test admin user with unique email
    adminEmail = `admin.${Date.now()}@test.com`;
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['Admin User', adminEmail, hashedPassword, 'admin']
    );

    // Create test regular user with unique email
    userEmail = `user.${Date.now()}@test.com`;
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['Test User', userEmail, hashedPassword, 'user']
    );
    testUserId = userResult.rows[0].id;

    // Create test class with unique title
    const classResult = await pool.query(
      `INSERT INTO classes (title, description, date, location_type, location_details, price, capacity, enrolled_count, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [`Test Class ${Date.now()}`, 'Test Description', new Date(), 'in-person', 'Test Location', 50.00, 20, 0, 'scheduled']
    );
    testClassId = classResult.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM enrollments WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM classes WHERE id = $1', [testClassId]);
    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [adminEmail, userEmail]);
    await pool.end();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('should get all users when admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should fail when non-admin tries to get all users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/admin/users/:userId', () => {
    it('should delete user when admin', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should fail when non-admin tries to delete user', async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/classes', () => {
    it('should get all classes when admin', async () => {
      const res = await request(app)
        .get('/api/admin/classes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should fail when non-admin tries to get all classes', async () => {
      const res = await request(app)
        .get('/api/admin/classes')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/admin/classes/:classId', () => {
    it('should update class when admin', async () => {
      // Ensure class exists
      const classCheck = await pool.query('SELECT id FROM classes WHERE id = $1', [testClassId]);
      if (classCheck.rows.length === 0) {
        // Recreate the class if it was deleted
        const classResult = await pool.query(
          `INSERT INTO classes (title, description, date, location_type, location_details, price, capacity, enrolled_count, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [`Test Class ${Date.now()}`, 'Test Description', new Date(), 'in-person', 'Test Location', 50.00, 20, 0, 'scheduled']
        );
        testClassId = classResult.rows[0].id;
      }

      const updateData = {
        title: 'Updated Class Title',
        description: 'Updated Description',
        date: new Date().toISOString(),
        location_type: 'in-person',
        location_details: 'Updated Location',
        price: 75.00,
        capacity: 25,
        enrolled_count: 0
      };

      const res = await request(app)
        .put(`/api/admin/classes/${testClassId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', 'Updated Class Title');
    });

    it('should fail when non-admin tries to update class', async () => {
      const res = await request(app)
        .put(`/api/admin/classes/${testClassId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Class Title'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/admin/classes/:classId', () => {
    it('should delete class when admin', async () => {
      // Ensure class exists
      const classCheck = await pool.query('SELECT id FROM classes WHERE id = $1', [testClassId]);
      if (classCheck.rows.length === 0) {
        // Recreate the class if it was deleted
        const classResult = await pool.query(
          `INSERT INTO classes (title, description, date, location_type, location_details, price, capacity, enrolled_count, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [`Test Class ${Date.now()}`, 'Test Description', new Date(), 'in-person', 'Test Location', 50.00, 20, 0, 'scheduled']
        );
        testClassId = classResult.rows[0].id;
      }

      // First ensure no enrollments exist for this class
      await pool.query('DELETE FROM enrollments WHERE class_id = $1', [testClassId]);

      const res = await request(app)
        .delete(`/api/admin/classes/${testClassId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should fail when non-admin tries to delete class', async () => {
      const res = await request(app)
        .delete(`/api/admin/classes/${testClassId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/enrollments/stats', () => {
    it('should get enrollment stats when admin', async () => {
      const res = await request(app)
        .get('/api/admin/enrollments/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalEnrollments');
    });

    it('should fail when non-admin tries to get enrollment stats', async () => {
      const res = await request(app)
        .get('/api/admin/enrollments/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/admin/enrollments/:userId/:classId', () => {
    it('should remove user from class when admin', async () => {
      // First ensure the user exists
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [testUserId]);
      if (userCheck.rows.length === 0) {
        // Recreate the user if it was deleted
        const userResult = await pool.query(
          `INSERT INTO users (name, email, password, role)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          ['Test User', userEmail, await bcrypt.hash('admin123', 10), 'user']
        );
        testUserId = userResult.rows[0].id;
      }

      // Ensure the class exists
      const classCheck = await pool.query('SELECT id FROM classes WHERE id = $1', [testClassId]);
      if (classCheck.rows.length === 0) {
        // Recreate the class if it was deleted
        const classResult = await pool.query(
          `INSERT INTO classes (title, description, date, location_type, location_details, price, capacity, enrolled_count, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [`Test Class ${Date.now()}`, 'Test Description', new Date(), 'in-person', 'Test Location', 50.00, 20, 0, 'scheduled']
        );
        testClassId = classResult.rows[0].id;
      }

      // Then enroll the user in the class
      await pool.query(
        `INSERT INTO enrollments (user_id, class_id, session_id, payment_status)
         VALUES ($1, $2, $3, $4)`,
        [testUserId, testClassId, 1, 'paid']
      );

      // Create a test session for the class
      await pool.query(
        `INSERT INTO class_sessions (class_id, session_date, start_time, end_time)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [testClassId, new Date(Date.now() + 86400000), '10:00', '11:00']
      );

      const res = await request(app)
        .delete(`/api/admin/enrollments/${testUserId}/${testClassId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should fail when non-admin tries to remove user from class', async () => {
      const res = await request(app)
        .delete(`/api/admin/enrollments/${testUserId}/${testClassId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/waitlist', () => {
    it('should get waitlist entries when admin', async () => {
      // Mock waitlist data
      const mockWaitlist = [
        {
          waitlist_id: 1,
          class_id: 1,
          user_id: 2,
          status: 'pending',
          created_at: new Date().toISOString(),
          class: {
            name: 'Test Class',
            location: 'Test Location'
          },
          user: {
            name: 'Test User',
            email: 'test@test.com'
          }
        }
      ];

      // Mock the database call
      adminModel.getWaitlist.mockResolvedValue(mockWaitlist);

      const res = await request(app)
        .get('/api/admin/waitlist')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('waitlist_id', 1);
    });

    it('should fail when non-admin tries to get waitlist', async () => {
      const res = await request(app)
        .get('/api/admin/waitlist')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/admin/waitlist/:waitlistId', () => {
    it('should update waitlist status when admin', async () => {
      // Mock updated waitlist entry
      const mockUpdatedWaitlist = {
        waitlist_id: 1,
        class_id: 1,
        user_id: 2,
        status: 'approved',
        updated_at: new Date().toISOString()
      };

      // Mock the database call
      adminModel.updateWaitlistStatus.mockResolvedValue(mockUpdatedWaitlist);

      const res = await request(app)
        .put('/api/admin/waitlist/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'approved');
    });

    it('should fail with invalid status', async () => {
      const res = await request(app)
        .put('/api/admin/waitlist/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/admin/stats/classes', () => {
    it('should get class statistics when admin', async () => {
      // Mock class statistics
      const mockClassStats = {
        total_classes: 5,
        active_classes: 3,
        completed_classes: 2,
        classes_by_status: {
          scheduled: 3,
          in_progress: 1,
          completed: 1
        }
      };

      // Mock the database call
      adminModel.getClassStats.mockResolvedValue(mockClassStats);

      const res = await request(app)
        .get('/api/admin/stats/classes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total_classes', 5);
      expect(res.body).toHaveProperty('active_classes', 3);
    });
  });

  describe('GET /api/admin/stats/enrollments', () => {
    it('should get enrollment statistics when admin', async () => {
      // Mock enrollment statistics
      const mockEnrollmentStats = {
        total_enrollments: 20,
        active_enrollments: 15,
        completed_enrollments: 5,
        enrollments_by_status: {
          active: 15,
          completed: 5
        }
      };

      // Mock the database call
      adminModel.getEnrollmentStats.mockResolvedValue(mockEnrollmentStats);

      const res = await request(app)
        .get('/api/admin/stats/enrollments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total_enrollments', 20);
      expect(res.body).toHaveProperty('active_enrollments', 15);
    });
  });

  describe('GET /api/admin/stats/revenue', () => {
    it('should get revenue statistics when admin', async () => {
      // Mock revenue statistics
      const mockRevenueStats = {
        total_revenue: 5000,
        revenue_by_month: {
          '2024-01': 1000,
          '2024-02': 2000,
          '2024-03': 2000
        },
        revenue_by_class: {
          'Class 1': 2000,
          'Class 2': 3000
        }
      };

      // Mock the database call
      adminModel.getRevenueStats.mockResolvedValue(mockRevenueStats);

      const res = await request(app)
        .get('/api/admin/stats/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total_revenue', 5000);
      expect(res.body).toHaveProperty('revenue_by_month');
      expect(res.body).toHaveProperty('revenue_by_class');
    });
  });
}); 