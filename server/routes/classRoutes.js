// Import Express Router to create modular route handlers
const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

// Import controller functions that handle the business logic for each route
const classController = require('../controllers/classController');

// Import middleware functions for authentication and authorization
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Define routes and their handlers:

// GET /api/classes
// Public route - anyone can view all classes
router.get('/', classController.getAllClasses);

// GET /api/classes/:id
// Public route - anyone can view a specific class
router.get('/:id', classController.getSingleClass);

// GET /api/classes/:id/sessions
// Public route - anyone can view sessions for a specific class
router.get('/:id/sessions', classController.getClassSessionsList);

// POST /api/classes
// Protected route - only authenticated admins can create new classes
// Middleware chain: requireAuth -> requireAdmin -> createNewClass
router.post('/', requireAuth, requireAdmin, classController.createNewClass);

// POST /api/classes/:id/waitlist
// Protected route - only authenticated users can add themselves to the waitlist for a class
// Middleware chain: requireAuth -> addUserToWaitlist
router.post('/:id/waitlist', requireAuth, classController.addUserToWaitlist);

// PUT /api/classes/:id
// Protected route - only authenticated admins can update class details
// Middleware chain: requireAuth -> requireAdmin -> updateClassDetails
router.put('/:id', requireAuth, requireAdmin, classController.updateClassDetails);

// DELETE /api/classes/:id
// Protected route - only authenticated admins can delete a class
// Middleware chain: requireAuth -> requireAdmin -> deleteClassById
router.delete('/:id', requireAuth, requireAdmin, classController.deleteClassById);

// PUT /api/classes/:id/status
// Protected route - only authenticated admins can update class status
// Middleware chain: requireAuth -> requireAdmin -> updateClassStatusById
router.put('/:id/status', requireAuth, requireAdmin, classController.updateClassStatusById);

// GET /api/classes/:id/waitlist
// Protected route - only authenticated admins can view waitlist entries for a class
// Middleware chain: requireAuth -> requireAdmin -> getClassWaitlistEntries
router.get('/:id/waitlist', requireAuth, requireAdmin, classController.getClassWaitlistEntries);

// PUT /api/classes/:classId/waitlist/:waitlistId
// Protected route - only authenticated admins can update a waitlist entry status
// Middleware chain: requireAuth -> requireAdmin -> updateWaitlistEntryStatus
router.put('/:classId/waitlist/:waitlistId', requireAuth, requireAdmin, classController.updateWaitlistEntryStatus);

// Upload class image (admin only)
router.post('/:id/image', requireAuth, requireAdmin, upload.single('image'), classController.uploadClassImage);

// GET /api/classes/:id/participants
// Protected route - only authenticated admins can view class participants
router.get('/:id/participants', requireAuth, requireAdmin, classController.getClassParticipantsList);

// Export the router to be used in the main Express app
module.exports = router;
