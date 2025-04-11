const express = require('express');
const router = express.Router();
const {
  enrollInClass,
  cancelClassEnrollment,
  getMyEnrollments,
  getAllEnrollmentsAdmin
} = require('../controllers/enrollmentController');

const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// Authenticated user routes
router.post('/:classId', requireAuth, enrollInClass);
router.delete('/:classId', requireAuth, cancelClassEnrollment);
router.get('/my', requireAuth, getMyEnrollments);

// Admin route
router.get('/', requireAuth, requireAdmin, getAllEnrollmentsAdmin);

module.exports = router;
