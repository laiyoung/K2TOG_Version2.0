const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  validateRegistration,
  requestPasswordReset,
  verifyResetToken,
  resetPassword
} = require('../controllers/authController');
const {
  getUserProfile,
  getAllUserAccounts,
  updateUserProfile
} = require('../controllers/userController');

const { requireAuth, requireAdmin } = require('../middleware/auth');

// Auth routes
router.post('/register', validateRegistration, registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.get('/reset-password/:token', verifyResetToken);
router.post('/reset-password', resetPassword);

// User profile routes
router.get('/profile', requireAuth, getUserProfile);
router.put('/profile', requireAuth, updateUserProfile);

// Admin-only route to get all users
router.get('/', requireAuth, requireAdmin, getAllUserAccounts);

module.exports = router;

