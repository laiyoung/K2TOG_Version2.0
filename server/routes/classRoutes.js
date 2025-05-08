// Import Express Router to create modular route handlers
const express = require('express');
const router = express.Router();

// Import controller functions that handle the business logic for each route
const {
  getAllClasses,    // Handles GET / - retrieves all classes
  getSingleClass,   // Handles GET /:id - retrieves a single class
  createNewClass    // Handles POST / - creates a new class
} = require('../controllers/classController');

// Import middleware functions for authentication and authorization
const requireAuth = require('../middleware/auth');      // Ensures user is logged in
const requireAdmin = require('../middleware/requireAdmin'); // Ensures user has admin privileges

// Define routes and their handlers:

// GET /api/classes
// Public route - anyone can view all classes
router.get('/', getAllClasses);

// GET /api/classes/:id
// Public route - anyone can view a specific class
router.get('/:id', getSingleClass);

// POST /api/classes
// Protected route - only authenticated admins can create new classes
// Middleware chain: requireAuth -> requireAdmin -> createNewClass
router.post('/', requireAuth, requireAdmin, createNewClass);

// Export the router to be used in the main Express app
module.exports = router;
