const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');

const {
  createCheckoutSession,
  getUserPayments,
} = require('../controllers/paymentController');

// Authenticated user starts Stripe checkout
router.post('/checkout', requireAuth, createCheckoutSession);

// Get logged-in user's payment history
router.get('/my-payments', requireAuth, getUserPayments);

module.exports = router;
