const express = require('express');
const router = express.Router();

const {
  adminGetUsers,
  adminDeleteUser,
  adminGetClasses,
  adminEditClass,
  adminDeleteClass,
  adminEnrollmentStats,
  adminRemoveUserFromClass,
} = require('../controllers/dashboardController');

const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// All routes are admin-only
router.use(requireAuth, requireAdmin);

// Users
router.get('/users', adminGetUsers);
router.delete('/users/:userId', adminDeleteUser);

// Classes
router.get('/classes', adminGetClasses);
router.put('/classes/:classId', adminEditClass);
router.delete('/classes/:classId', adminDeleteClass);

// Enrollments
router.get('/enrollments/stats', adminEnrollmentStats);
router.delete('/enrollments/:userId/:classId', adminRemoveUserFromClass);

module.exports = router;
