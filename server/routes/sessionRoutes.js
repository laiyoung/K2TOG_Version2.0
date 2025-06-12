const express = require('express');
const router = express.Router();
const { getClassSessionsWithStudents, updateSessionStatus } = require('../controllers/sessionController');
const { requireAuth, authorizeRole } = require('../middleware/auth');

// Debug logging for middleware and route handlers
console.log('Session route handlers:', {
  requireAuth: typeof requireAuth,
  authorizeRole: typeof authorizeRole,
  getClassSessionsWithStudents: typeof getClassSessionsWithStudents,
  updateSessionStatus: typeof updateSessionStatus
});

// Get all sessions with students for a class
router.get(
  '/class/:classId/sessions',
  requireAuth,
  authorizeRole(['admin', 'instructor']),
  getClassSessionsWithStudents
);

// Update session status
router.patch(
  '/sessions/:sessionId/status',
  requireAuth,
  authorizeRole(['admin', 'instructor']),
  updateSessionStatus
);

module.exports = router; 