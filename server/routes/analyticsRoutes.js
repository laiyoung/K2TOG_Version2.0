const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const {
    getDashboardSummary,
    getRevenueAnalytics,
    getRevenueByClass,
    getEnrollmentTrends,
    getClassEnrollmentStats,
    getUserEngagementMetrics,
    getUserActivityTrends
} = require('../controllers/analyticsController');

// All routes are protected and require admin access
router.use(requireAuth, requireAdmin);

// Dashboard summary
router.get('/summary', getDashboardSummary);

// Revenue analytics
router.get('/revenue', getRevenueAnalytics);
router.get('/revenue/classes', getRevenueByClass);

// Enrollment analytics
router.get('/enrollments/trends', getEnrollmentTrends);
router.get('/enrollments/classes', getClassEnrollmentStats);

// User analytics
router.get('/users/engagement', getUserEngagementMetrics);
router.get('/users/activity', getUserActivityTrends);

module.exports = router; 