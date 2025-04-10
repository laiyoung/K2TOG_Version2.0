const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const { getUserById, getAllUsers } = require('../models/userModel');
const { getUserEnrollments } = require('../models/enrollmentModel'); // optional if you want to show enrolled classes

// Logged-in user's profile info + enrolled classes
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    const enrollments = await getUserEnrollments(req.user.id); // optional

    res.json({
      user,
      enrollments, // remove this line if you don’t want it
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// Admin dashboard: list of all users (can add stats later)
router.get('/admin-dashboard', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({
      message: 'Admin dashboard data',
      totalUsers: users.length,
      users,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

module.exports = router;
