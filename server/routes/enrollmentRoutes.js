const express = require('express');
const router = express.Router();
const {
  enrollInClass,
  cancelClassEnrollment,
  getMyEnrollments,
  getAllEnrollmentsAdmin,
  getPendingEnrollmentsList,
  getEnrollmentDetails,
  approveEnrollmentRequest,
  rejectEnrollmentRequest
} = require('../controllers/enrollmentController');

const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// Public routes
// None - all enrollment routes require authentication

// Protected routes (require authentication)
router.post('/:classId', requireAuth, enrollInClass);
router.delete('/:classId', requireAuth, cancelClassEnrollment);
router.get('/my', requireAuth, getMyEnrollments);

// Admin routes
router.get('/', requireAuth, requireAdmin, getAllEnrollmentsAdmin);
router.get('/pending', requireAuth, requireAdmin, getPendingEnrollmentsList);
router.get('/:id', requireAuth, requireAdmin, getEnrollmentDetails);
router.put('/:id/approve', requireAuth, requireAdmin, approveEnrollmentRequest);
router.put('/:id/reject', requireAuth, requireAdmin, rejectEnrollmentRequest);

module.exports = router;
