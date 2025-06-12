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
  rejectEnrollmentRequest,
  setEnrollmentToPending,
  getWaitlistStatus
} = require('../controllers/enrollmentController');

const { requireAuth, requireAdmin } = require('../middleware/auth');

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
router.post('/:id/approve', requireAuth, requireAdmin, approveEnrollmentRequest);
router.post('/:id/reject', requireAuth, requireAdmin, rejectEnrollmentRequest);
router.post('/:id/pending', requireAuth, requireAdmin, setEnrollmentToPending);

// Add waitlist status route
router.get('/waitlist/:classId', requireAuth, getWaitlistStatus);

module.exports = router;
