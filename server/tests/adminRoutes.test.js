// Set up test environment variables
process.env.JWT_SECRET = 'test_jwt_secret';

const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const bcrypt = require('bcrypt');

describe('Admin Routes', () => {
  let adminToken;
  let userToken;
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
      `INSERT INTO classes (title, description, date, location_type, location_details, price, capacity, enrolled_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [`Test Class ${Date.now()}`, 'Test Description', new Date(), 'in-person', 'Test Location', 50.00, 20, 0]
    );
    testClassId = classResult.rows[0].id;

    // Get tokens for testing
    const adminLogin = await request(app)
      .post('/api/users/login')
      .send({ 
        email: adminEmail, 
        password: 'admin123' 
      });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post('/api/users/login')
      .send({ 
        email: userEmail, 
        password: 'admin123' 
      });
    userToken = userLogin.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM enrollments WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM classes WHERE id = $1', [testClassId]);
    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [adminEmail, userEmail]);
    await pool.end();
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
          `INSERT INTO classes (title, description, date, location_type, location_details, price, capacity, enrolled_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [`Test Class ${Date.now()}`, 'Test Description', new Date(), 'in-person', 'Test Location', 50.00, 20, 0]
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
          `INSERT INTO classes (title, description, date, location_type, location_details, price, capacity, enrolled_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [`Test Class ${Date.now()}`, 'Test Description', new Date(), 'in-person', 'Test Location', 50.00, 20, 0]
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
          `INSERT INTO classes (title, description, date, location_type, location_details, price, capacity, enrolled_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [`Test Class ${Date.now()}`, 'Test Description', new Date(), 'in-person', 'Test Location', 50.00, 20, 0]
        );
        testClassId = classResult.rows[0].id;
      }

      // Then enroll the user in the class
      await pool.query(
        `INSERT INTO enrollments (user_id, class_id, payment_status)
         VALUES ($1, $2, $3)`,
        [testUserId, testClassId, 'paid']
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
}); 