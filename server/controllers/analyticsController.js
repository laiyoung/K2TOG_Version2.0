const Analytics = require('../models/analyticsModel');

// @desc    Get dashboard summary
// @route   GET /api/admin/analytics/summary
// @access  Private/Admin
const getDashboardSummary = async (req, res) => {
    try {
        const summary = await Analytics.getDashboardSummary();
        res.json(summary);
    } catch (error) {
        console.error('Get dashboard summary error:', error);
        res.status(500).json({ error: 'Failed to get dashboard summary' });
    }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
const getRevenueAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const analytics = await Analytics.getRevenueAnalytics({
            startDate,
            endDate,
            groupBy: groupBy || 'month'
        });
        
        res.json(analytics);
    } catch (error) {
        console.error('Get revenue analytics error:', error);
        res.status(500).json({ error: 'Failed to get revenue analytics' });
    }
};

// @desc    Get revenue by class
// @route   GET /api/admin/analytics/revenue/classes
// @access  Private/Admin
const getRevenueByClass = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const analytics = await Analytics.getRevenueByClass({
            startDate,
            endDate
        });
        
        res.json(analytics);
    } catch (error) {
        console.error('Get revenue by class error:', error);
        res.status(500).json({ error: 'Failed to get revenue by class' });
    }
};

// @desc    Get enrollment trends
// @route   GET /api/admin/analytics/enrollments/trends
// @access  Private/Admin
const getEnrollmentTrends = async (req, res) => {
    try {
        const { startDate, endDate, groupBy } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const trends = await Analytics.getEnrollmentTrends({
            startDate,
            endDate,
            groupBy: groupBy || 'month'
        });
        
        res.json(trends);
    } catch (error) {
        console.error('Get enrollment trends error:', error);
        res.status(500).json({ error: 'Failed to get enrollment trends' });
    }
};

// @desc    Get class enrollment statistics
// @route   GET /api/admin/analytics/enrollments/classes
// @access  Private/Admin
const getClassEnrollmentStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const stats = await Analytics.getClassEnrollmentStats({
            startDate,
            endDate
        });
        
        res.json(stats);
    } catch (error) {
        console.error('Get class enrollment stats error:', error);
        res.status(500).json({ error: 'Failed to get class enrollment statistics' });
    }
};

// @desc    Get user engagement metrics
// @route   GET /api/admin/analytics/users/engagement
// @access  Private/Admin
const getUserEngagementMetrics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const metrics = await Analytics.getUserEngagementMetrics({
            startDate,
            endDate
        });
        
        res.json(metrics);
    } catch (error) {
        console.error('Get user engagement metrics error:', error);
        res.status(500).json({ error: 'Failed to get user engagement metrics' });
    }
};

// @desc    Get user activity trends
// @route   GET /api/admin/analytics/users/activity
// @access  Private/Admin
const getUserActivityTrends = async (req, res) => {
    try {
        const { startDate, endDate, groupBy } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const trends = await Analytics.getUserActivityTrends({
            startDate,
            endDate,
            groupBy: groupBy || 'month'
        });
        
        res.json(trends);
    } catch (error) {
        console.error('Get user activity trends error:', error);
        res.status(500).json({ error: 'Failed to get user activity trends' });
    }
};

module.exports = {
    getDashboardSummary,
    getRevenueAnalytics,
    getRevenueByClass,
    getEnrollmentTrends,
    getClassEnrollmentStats,
    getUserEngagementMetrics,
    getUserActivityTrends
}; 