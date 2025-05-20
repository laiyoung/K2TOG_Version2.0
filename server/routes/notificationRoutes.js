const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createTemplate,
    getTemplates,
    sendBulkNotification,
    broadcastNotification
} = require('../controllers/notificationController');

// User routes
router.use(requireAuth); // All notification routes require authentication
router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin routes
router.use('/admin', requireAdmin); // Admin routes require admin privileges
router.post('/admin/templates', createTemplate);
router.get('/admin/templates', getTemplates);
router.post('/admin/bulk', sendBulkNotification);
router.post('/admin/broadcast', broadcastNotification);

module.exports = router; 