// Set up test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';

// Mock the database pool
jest.mock('../config/db', () => ({
  query: jest.fn()
}));

// Mock the email sending utility
jest.mock('../utils/sendEmail');

// Import required testing and application dependencies
const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const enrollmentModel = require('../models/enrollmentModel');
const classModel = require('../models/classModel');

// Get the mocked email function
const mockSendEmail = require('../utils/sendEmail');

// Mock environment variables
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';

// Mock the authentication middleware to bypass it during testing
jest.mock('../middleware/auth', () => (req, res, next) => {
  // Add a mock user to the request for testing
  req.user = { id: 1, name: 'Test User', email: 'test@example.com' };
  next();
});
jest.mock('../middleware/requireAdmin', () => (req, res, next) => next());

// Mock the models to avoid actual database calls
jest.mock('../models/enrollmentModel');
jest.mock('../models/classModel');

describe('Enrollment Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test suite for POST /api/enrollments/:classId (enroll in class)
  describe('POST /api/enrollments/:classId', () => {
    it('should successfully enroll a user in a class', async () => {
      // Mock data
      const mockEnrollment = {
        id: 1,
        user_id: 1,
        class_id: 1,
        session_id: 1,
        payment_status: 'paid',
        enrolled_at: new Date().toISOString()
      };

      const mockClass = {
        id: 1,
        title: 'Yoga Class',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow's date
      };

      const mockSession = {
        id: 1,
        class_id: 1,
        session_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '11:00'
      };

      // Mock the database calls
      enrollmentModel.isUserAlreadyEnrolled.mockResolvedValue(false);
      enrollmentModel.enrollUserInClass.mockResolvedValue(mockEnrollment);
      classModel.getClassWithDetails.mockResolvedValue(mockClass);
      classModel.incrementEnrolledCount.mockResolvedValue();
      pool.query.mockResolvedValue({ rows: [mockSession] });

      // Make the enrollment request
      const response = await request(app)
        .post('/api/enrollments/1')
        .send({ sessionId: 1 });

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockEnrollment);
      expect(enrollmentModel.enrollUserInClass).toHaveBeenCalledWith(1, '1', 1, 'paid');
      expect(classModel.incrementEnrolledCount).toHaveBeenCalledWith('1');
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Class Enrollment Confirmation',
        html: expect.stringContaining('Yoga Class')
      });
    });

    it('should return 400 if user is already enrolled', async () => {
      // Mock that user is already enrolled
      enrollmentModel.isUserAlreadyEnrolled.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/enrollments/1')
        .send({ sessionId: 1 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User already enrolled in this class');
    });

    it('should return 400 if class has already started', async () => {
      // Mock data
      const mockClass = {
        id: 1,
        title: 'Yoga Class',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0] // Yesterday's date
      };

      const mockSession = {
        id: 1,
        class_id: 1,
        session_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '11:00'
      };

      // Mock the database calls
      enrollmentModel.isUserAlreadyEnrolled.mockResolvedValue(false);
      classModel.getClassWithDetails.mockResolvedValue(mockClass);
      pool.query.mockResolvedValue({ rows: [mockSession] });

      const response = await request(app)
        .post('/api/enrollments/1')
        .send({ sessionId: 1 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Session has already started or ended');
    });

    it('should return 404 if class does not exist', async () => {
      // Mock that class doesn't exist
      enrollmentModel.isUserAlreadyEnrolled.mockResolvedValue(false);
      classModel.getClassWithDetails.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/enrollments/999')
        .send({ sessionId: 1 });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Class not found');
    });

    it('should handle email sending failure gracefully', async () => {
      // Mock data
      const mockEnrollment = {
        id: 1,
        user_id: 1,
        class_id: 1,
        session_id: 1,
        payment_status: 'paid',
        enrolled_at: new Date().toISOString()
      };

      const mockClass = {
        id: 1,
        title: 'Yoga Class',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow's date
      };

      const mockSession = {
        id: 1,
        class_id: 1,
        session_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '11:00'
      };

      // Mock successful enrollment but failed email
      enrollmentModel.isUserAlreadyEnrolled.mockResolvedValue(false);
      enrollmentModel.enrollUserInClass.mockResolvedValue(mockEnrollment);
      classModel.getClassWithDetails.mockResolvedValue(mockClass);
      classModel.incrementEnrolledCount.mockResolvedValue();
      pool.query.mockResolvedValue({ rows: [mockSession] });
      mockSendEmail.mockRejectedValueOnce(new Error('Email failed'));

      const response = await request(app)
        .post('/api/enrollments/1')
        .send({ sessionId: 1 });

      // Should still return success even if email fails
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockEnrollment);
    });
  });

  // Test suite for DELETE /api/enrollments/:classId (cancel enrollment)
  describe('DELETE /api/enrollments/:classId', () => {
    it('should successfully cancel an enrollment', async () => {
      // Mock data
      const mockClass = {
        id: 1,
        title: 'Yoga Class',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow's date
      };

      // Mock the database calls
      classModel.getClassById.mockResolvedValue(mockClass);
      enrollmentModel.cancelEnrollment.mockResolvedValue({ id: 1 });
      classModel.decrementEnrolledCount.mockResolvedValue();

      const response = await request(app)
        .delete('/api/enrollments/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Enrollment cancelled successfully' });
      expect(enrollmentModel.cancelEnrollment).toHaveBeenCalledWith(1, '1');
      expect(classModel.decrementEnrolledCount).toHaveBeenCalledWith('1');
    });

    it('should return 404 if enrollment not found', async () => {
      // Mock data
      const mockClass = {
        id: 1,
        title: 'Yoga Class',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow's date
      };

      // Mock the database calls
      classModel.getClassById.mockResolvedValue(mockClass);
      enrollmentModel.cancelEnrollment.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/enrollments/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Enrollment not found');
    });
  });

  // Test suite for GET /api/enrollments/my (get user's enrollments)
  describe('GET /api/enrollments/my', () => {
    it('should return all enrollments for the current user', async () => {
      // Mock data
      const mockEnrollments = [
        {
          id: 1,
          title: 'Yoga Class',
          date: '2024-03-20',
          payment_status: 'paid',
          enrolled_at: new Date().toISOString()
        }
      ];

      // Mock the database call
      enrollmentModel.getUserEnrollments.mockResolvedValue(mockEnrollments);

      const response = await request(app)
        .get('/api/enrollments/my');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockEnrollments);
      expect(enrollmentModel.getUserEnrollments).toHaveBeenCalledWith(1);
    });
  });

  // Test suite for GET /api/enrollments (admin view)
  describe('GET /api/enrollments', () => {
    it('should return all enrollments for admin', async () => {
      // Mock data
      const mockAllEnrollments = [
        {
          user_name: 'Test User',
          email: 'test@example.com',
          class_title: 'Yoga Class',
          payment_status: 'paid',
          enrolled_at: new Date().toISOString()
        }
      ];

      // Mock the database call
      enrollmentModel.getAllEnrollments.mockResolvedValue(mockAllEnrollments);

      const response = await request(app)
        .get('/api/enrollments');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAllEnrollments);
      expect(enrollmentModel.getAllEnrollments).toHaveBeenCalled();
    });
  });
}); 