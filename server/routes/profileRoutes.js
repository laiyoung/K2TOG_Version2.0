const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');

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
router.get('/profile', requireAuth, getProfileWithDetails);
router.put('/profile', requireAuth, updateProfile);
router.put('/profile/password', requireAuth, updatePassword);

// Certificate routes
router.get('/certificates', requireAuth, getCertificates);

// Payment method routes
router.get('/payment-methods', requireAuth, getPaymentMethods);
router.post('/payment-methods', requireAuth, addPaymentMethod);
router.put('/payment-methods/:id/default', requireAuth, setDefaultPaymentMethod);
router.delete('/payment-methods/:id', requireAuth, deletePaymentMethod);

// Activity log routes
router.get('/activity', requireAuth, getActivityLog);

// Notification routes
router.get('/notifications', requireAuth, getNotifications);
router.put('/notifications/:id/read', requireAuth, markNotificationAsRead);
router.put('/notifications/read-all', requireAuth, markAllNotificationsAsRead);

module.exports = router; 