const express = require('express');
const router = express.Router();
const { getUserEnrollments } = require('../models/enrollmentModel');
const { getInstructors } = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

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
    adminUpdateWaitlistStatus,
    adminAddToWaitlist,
    adminGetAllWaitlistEntries,
    adminGetOutstandingPayments,
    getStats,
    adminGetClassStudents,
    adminGetAllEnrollments,
    adminGetHistoricalEnrollments,
} = require('../controllers/dashboardController');

const {
    searchUsers,
    updateUserRole,
    updateUserStatus,
    getUsersByRole,
    getUserActivity,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount,
    getUserAccountStatus,
    getUserProfile,
} = require('../controllers/userManagementController');

// Apply authentication and admin middleware to ALL routes
router.use(requireAuth);
router.use(requireAdmin);

// Users
router.get('/users', adminGetUsers);

// Classes
router.get('/classes', adminGetClasses);
router.put('/classes/:classId', adminEditClass);
router.delete('/classes/:classId', adminDeleteClass);

// Enrollments
router.get('/enrollments/stats', adminEnrollmentStats);
router.get('/enrollments/pending', adminGetPendingEnrollments);
router.get('/enrollments/:enrollmentId', adminGetEnrollmentDetails);

// Financial Management
router.get('/financial/summary', adminGetFinancialSummary);
router.get('/financial/transactions', adminGetAllPayments);
router.get('/financial/revenue-by-class', adminGetRevenueByClass);
router.get('/financial/payments', adminGetAllPayments);
router.get('/financial/payments/outstanding', adminGetOutstandingPayments);
router.get('/financial/payments/:paymentId', adminGetPaymentDetails);
router.post('/financial/payments/:paymentId/refund', adminProcessRefund);

// Enhanced Class Management
router.post('/classes', adminCreateClass);
router.get('/classes/:classId', adminGetClassDetails);
router.get('/classes/:classId/sessions', adminGetClassSessions);
router.put('/classes/:classId/status', adminUpdateClassStatus);
router.post('/classes/:classId/waitlist', adminAddToWaitlist);
router.put('/classes/:classId/waitlist/:waitlistId', adminUpdateWaitlistStatus);
router.get('/classes/:classId/students', adminGetClassStudents);
router.get('/classes/:classId/enrollments', adminGetAllEnrollments);
router.get('/classes/:classId/enrollments/historical', adminGetHistoricalEnrollments);

// Waitlist Management
router.get('/waitlist', adminGetAllWaitlistEntries);

// Class-specific waitlist (must come after general waitlist route)
router.get('/classes/:classId/waitlist', adminGetClassWaitlist);

// User Management Routes
router.get('/users/search', searchUsers);
router.get('/users/role/:role', getUsersByRole);
router.get('/users/:id/profile', getUserProfile);
router.get('/users/:id/status', getUserAccountStatus);
router.get('/users/:id/enrollments', async (req, res) => {
    try {
        const enrollments = await getUserEnrollments(req.params.id);
        res.json(enrollments);
    } catch (error) {
        console.error('Get user enrollments error:', error);
        res.status(500).json({ error: 'Failed to fetch user enrollments' });
    }
});
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.get('/users/:id/activity', getUserActivity);
router.put('/users/:id/profile', updateUserProfile);
router.put('/users/:id/password', changeUserPassword);
router.delete('/users/:id', deleteUserAccount);

router.get('/instructors', getInstructors);

// Dashboard routes
router.get('/dashboard/stats', getStats);

module.exports = router;
