const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createTemplate,
    getTemplates,
    sendBulkNotification,
    broadcastNotification,
    getSentNotifications,
    deleteTemplate,
    sendNotification
} = require('../controllers/notificationController');

// User routes
router.use(requireAuth); // All notification routes require authentication
router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin routes - combine auth and admin middleware
router.use('/admin', [requireAuth, requireAdmin]);

// Admin notification routes
router.get('/admin/sent', getSentNotifications);
router.post('/admin/send', sendNotification);
router.post('/admin/templates', createTemplate);
router.get('/admin/templates', getTemplates);
router.delete('/admin/templates/:id', deleteTemplate);
router.post('/admin/bulk', sendBulkNotification);
router.post('/admin/broadcast', broadcastNotification);

module.exports = router; 