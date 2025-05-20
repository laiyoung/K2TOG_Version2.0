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
  adminGetPendingEnrollments,
  adminApproveEnrollment,
  adminRejectEnrollment,
  adminGetEnrollmentDetails,
  // New financial management functions
  adminGetFinancialSummary,
  adminGetRevenueByClass,
  adminGetAllPayments,
  adminGetPaymentDetails,
  adminProcessRefund,
  // New class management functions
  adminCreateClass,
  adminGetClassDetails,
  adminGetClassSessions,
  adminUpdateClassStatus,
  adminGetClassWaitlist,
  adminUpdateWaitlistStatus
} = require('../controllers/dashboardController');

const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const {
    searchUsers,
    updateUserRole,
    updateUserStatus,
    getUsersByRole,
    getUserActivity,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount,
    getUserAccountStatus
} = require('../controllers/userManagementController');

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
router.get('/enrollments/pending', adminGetPendingEnrollments);
router.get('/enrollments/:enrollmentId', adminGetEnrollmentDetails);
router.post('/enrollments/:enrollmentId/approve', adminApproveEnrollment);
router.post('/enrollments/:enrollmentId/reject', adminRejectEnrollment);

// Financial Management
router.get('/financial/summary', adminGetFinancialSummary);
router.get('/financial/revenue-by-class', adminGetRevenueByClass);
router.get('/financial/payments', adminGetAllPayments);
router.get('/financial/payments/:paymentId', adminGetPaymentDetails);
router.post('/financial/payments/:paymentId/refund', adminProcessRefund);

// Enhanced Class Management
router.post('/classes', adminCreateClass);
router.get('/classes/:classId', adminGetClassDetails);
router.get('/classes/:classId/sessions', adminGetClassSessions);
router.put('/classes/:classId/status', adminUpdateClassStatus);
router.get('/classes/:classId/waitlist', adminGetClassWaitlist);
router.put('/classes/:classId/waitlist/:waitlistId', adminUpdateWaitlistStatus);

// User Management Routes
router.get('/users/search', searchUsers);
router.get('/users/role/:role', getUsersByRole);
router.get('/users/:id/activity', getUserActivity);
router.get('/users/:id/status', getUserAccountStatus);
router.put('/users/:id/profile', updateUserProfile);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/password', changeUserPassword);
router.delete('/users/:id', deleteUserAccount);

module.exports = router;
