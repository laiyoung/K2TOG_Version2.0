// Import Express Router to create modular route handlers
const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

// Import controller functions that handle the business logic for each route
const {
  getAllClasses,    // Handles GET / - retrieves all classes
  getSingleClass,   // Handles GET /:id - retrieves a single class
  createNewClass,    // Handles POST / - creates a new class
  updateClassDetails,
  deleteClassById,
  getClassSessionsList,
  addUserToWaitlist,
  updateWaitlistEntryStatus,
  getClassWaitlistEntries,
  updateClassStatusById,
  uploadClassImage
} = require('../controllers/classController');

// Import middleware functions for authentication and authorization
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Define routes and their handlers:

// GET /api/classes
// Public route - anyone can view all classes
router.get('/', getAllClasses);

// GET /api/classes/:id
// Public route - anyone can view a specific class
router.get('/:id', getSingleClass);

// GET /api/classes/:id/sessions
// Public route - anyone can view sessions for a specific class
router.get('/:id/sessions', getClassSessionsList);

// POST /api/classes
// Protected route - only authenticated admins can create new classes
// Middleware chain: requireAuth -> requireAdmin -> createNewClass
router.post('/', requireAuth, requireAdmin, createNewClass);

// POST /api/classes/:id/waitlist
// Protected route - only authenticated users can add themselves to the waitlist for a class
// Middleware chain: requireAuth -> addUserToWaitlist
router.post('/:id/waitlist', requireAuth, addUserToWaitlist);

// PUT /api/classes/:id
// Protected route - only authenticated admins can update class details
// Middleware chain: requireAuth -> requireAdmin -> updateClassDetails
router.put('/:id', requireAuth, requireAdmin, updateClassDetails);

// DELETE /api/classes/:id
// Protected route - only authenticated admins can delete a class
// Middleware chain: requireAuth -> requireAdmin -> deleteClassById
router.delete('/:id', requireAuth, requireAdmin, deleteClassById);

// PUT /api/classes/:id/status
// Protected route - only authenticated admins can update class status
// Middleware chain: requireAuth -> requireAdmin -> updateClassStatusById
router.put('/:id/status', requireAuth, requireAdmin, updateClassStatusById);

// GET /api/classes/:id/waitlist
// Protected route - only authenticated admins can view waitlist entries for a class
// Middleware chain: requireAuth -> requireAdmin -> getClassWaitlistEntries
router.get('/:id/waitlist', requireAuth, requireAdmin, getClassWaitlistEntries);

// PUT /api/classes/:classId/waitlist/:waitlistId
// Protected route - only authenticated admins can update a waitlist entry status
// Middleware chain: requireAuth -> requireAdmin -> updateWaitlistEntryStatus
router.put('/:classId/waitlist/:waitlistId', requireAuth, requireAdmin, updateWaitlistEntryStatus);

// Upload class image (admin only)
router.post('/:id/image', requireAuth, requireAdmin, upload.single('image'), uploadClassImage);

// Export the router to be used in the main Express app
module.exports = router;
