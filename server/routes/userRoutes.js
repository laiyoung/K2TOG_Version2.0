const express = require('express');
const router = express.Router();

const { registerUser, loginUser, validateRegistration } = require('../controllers/authController');
const {
  getUserProfile,
  getAllUserAccounts,
  updateUserProfile
} = require('../controllers/userController');

const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// Auth routes
router.post('/register', validateRegistration, registerUser);
router.post('/login', loginUser);

// User profile routes
router.get('/profile', requireAuth, getUserProfile);
router.put('/profile', requireAuth, updateUserProfile);

// Admin-only route to get all users
router.get('/', requireAuth, requireAdmin, getAllUserAccounts);

module.exports = router;

