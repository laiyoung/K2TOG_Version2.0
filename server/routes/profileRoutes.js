const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const {
    getProfileWithDetails,
    updateProfile,
    updatePassword,
    getCertificates,
    getPaymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    getActivityLog,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} = require('../controllers/profileController');

// Profile routes
router.get('/profile', authenticateToken, getProfileWithDetails);
router.put('/profile', authenticateToken, updateProfile);
router.put('/profile/password', authenticateToken, updatePassword);

// Certificate routes
router.get('/certificates', authenticateToken, getCertificates);

// Payment method routes
router.get('/payment-methods', authenticateToken, getPaymentMethods);
router.post('/payment-methods', authenticateToken, addPaymentMethod);
router.put('/payment-methods/:id/default', authenticateToken, setDefaultPaymentMethod);
router.delete('/payment-methods/:id', authenticateToken, deletePaymentMethod);

// Activity log routes
router.get('/activity', authenticateToken, getActivityLog);

// Notification routes
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationAsRead);
router.put('/notifications/read-all', authenticateToken, markAllNotificationsAsRead);

module.exports = router; 