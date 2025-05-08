// Import required testing and application dependencies
const request = require('supertest'); // HTTP assertion library for testing API endpoints
const express = require('express'); // Web framework
const classRoutes = require('../routes/classRoutes'); // Our class routes
const classModel = require('../models/classModel'); // Database model for classes
const requireAuth = require('../middleware/auth'); // Authentication middleware
const requireAdmin = require('../middleware/requireAdmin'); // Admin authorization middleware

// Mock the authentication middleware to bypass it during testing
// This allows us to test routes without needing real authentication
jest.mock('../middleware/auth', () => (req, res, next) => next());
jest.mock('../middleware/requireAdmin', () => (req, res, next) => next());

// Mock the class model to avoid actual database calls during testing
jest.mock('../models/classModel');

// Set up a test Express application
const app = express();
app.use(express.json()); // Enable JSON body parsing
app.use('/api/classes', classRoutes); // Mount our class routes

// Main test suite for Class Routes
describe('Class Routes', () => {
  // Clear all mocks before each test to ensure a clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test suite for GET /api/classes endpoint
  describe('GET /api/classes', () => {
    it('should return all classes', async () => {
      // Mock data that would be returned from the database
      const mockClasses = [
        {
          id: 1,
          title: 'Yoga for Kids',
          description: 'Fun yoga class for children',
          date: '2024-03-20',
          location_type: 'online',
          location_details: 'Zoom',
          price: 25,
          capacity: 20,
          enrolled_count: 5
        }
      ];

      // Mock the database call to return our test data
      classModel.getAllClassesFromDB.mockResolvedValue(mockClasses);

      // Make the actual HTTP request to our test server
      const response = await request(app).get('/api/classes');
      
      // Assertions to verify the response
      expect(response.status).toBe(200); // Check if status code is 200 (OK)
      expect(response.body).toEqual(mockClasses); // Verify response body matches our mock data
      expect(classModel.getAllClassesFromDB).toHaveBeenCalledTimes(1); // Verify database was called once
    });
  });

  // Test suite for GET /api/classes/:id endpoint
  describe('GET /api/classes/:id', () => {
    it('should return a single class by id', async () => {
      // Mock data for a single class
      const mockClass = {
        id: 1,
        title: 'Yoga for Kids',
        description: 'Fun yoga class for children',
        date: '2024-03-20',
        location_type: 'online',
        location_details: 'Zoom',
        price: 25,
        capacity: 20,
        enrolled_count: 5
      };

      // Mock the database call to return our test class
      classModel.getClassById.mockResolvedValue(mockClass);

      // Make the HTTP request with a specific ID
      const response = await request(app).get('/api/classes/1');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockClass);
      expect(classModel.getClassById).toHaveBeenCalledWith('1'); // Note: Express params are strings
    });

    it('should return 404 when class is not found', async () => {
      // Mock the database to return null (class not found)
      classModel.getClassById.mockResolvedValue(null);

      // Make request with non-existent ID
      const response = await request(app).get('/api/classes/999');
      
      // Verify 404 response
      expect(response.status).toBe(404);
    });
  });

  // Test suite for POST /api/classes endpoint
  describe('POST /api/classes', () => {
    it('should create a new class', async () => {
      // Test data for creating a new class
      const newClass = {
        title: 'New Yoga Class',
        description: 'A new yoga class for kids',
        date: '2024-03-25',
        location_type: 'online',
        location_details: 'Zoom',
        price: 30,
        capacity: 15
      };

      // Mock the database to return the created class with an ID
      const createdClass = { id: 1, ...newClass, enrolled_count: 0 };
      classModel.createClass.mockResolvedValue(createdClass);

      // Make POST request with new class data
      const response = await request(app)
        .post('/api/classes')
        .send(newClass);
      
      // Assertions
      expect(response.status).toBe(201); // 201 Created
      expect(response.body).toEqual(createdClass);
      expect(classModel.createClass).toHaveBeenCalledWith(newClass);
    });

    it('should return 400 when required fields are missing', async () => {
      // Test data with missing required fields
      const incompleteClass = {
        title: 'Incomplete Class'
      };

      // Mock the database to reject the request
      classModel.createClass.mockRejectedValue(new Error('Missing required fields'));

      // Make POST request with incomplete data
      const response = await request(app)
        .post('/api/classes')
        .send(incompleteClass);
      
      // Assertions
      expect(response.status).toBe(400); // 400 Bad Request
      expect(response.body).toHaveProperty('error'); // Should have error message
    });
  });
}); 