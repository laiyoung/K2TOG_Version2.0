const pool = require('../config/db');

// Get all activity logs for a user
async function getUserActivityLogs(userId) {
  const result = await pool.query('SELECT * FROM user_activity_log WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows;
}

// Create an activity log
async function createActivityLog(userId, action, details = {}) {
  const result = await pool.query(
    'INSERT INTO user_activity_log (user_id, action, details) VALUES ($1, $2, $3) RETURNING *',
    [userId, action, details]
  );
  return result.rows[0];
}

module.exports = {
  getUserActivityLogs,
  createActivityLog,
}; 