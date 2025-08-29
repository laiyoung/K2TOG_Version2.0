const express = require('express');
const router = express.Router();
const {
  getClassSessionsWithStudents,
  updateSessionStatus,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  archiveCompletedSessionEnrollments
} = require('../controllers/sessionController');
const { requireAuth, authorizeRole } = require('../middleware/auth');

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

// Archive enrollments for completed session (admin only)
router.post(
  '/sessions/:sessionId/archive-enrollments',
  requireAuth,
  authorizeRole(['admin']),
  archiveCompletedSessionEnrollments
);

// Get a single session (admin/instructor)
router.get(
  '/sessions/:sessionId',
  requireAuth,
  authorizeRole(['admin', 'instructor']),
  getSessionById
);

// Create a session (admin/instructor)
router.post(
  '/sessions',
  requireAuth,
  authorizeRole(['admin', 'instructor']),
  createSession
);

// Update a session (admin/instructor)
router.put(
  '/sessions/:sessionId',
  requireAuth,
  authorizeRole(['admin', 'instructor']),
  updateSession
);

// Delete a session (admin/instructor)
router.delete(
  '/sessions/:sessionId',
  requireAuth,
  authorizeRole(['admin', 'instructor']),
  deleteSession
);

module.exports = router;  