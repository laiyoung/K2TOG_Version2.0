const pool = require('../config/db');

// Get all notifications for a user
async function getUserNotifications(userId) {
  const result = await pool.query('SELECT * FROM user_notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows;
}

// Mark a notification as read
async function markNotificationRead(notificationId) {
  const result = await pool.query('UPDATE user_notifications SET is_read = true WHERE id = $1 RETURNING *', [notificationId]);
  return result.rows[0];
}

// Create a notification
async function createNotification(data) {
  const { user_id, type, title, message, action_url, metadata } = data;
  const result = await pool.query(
    'INSERT INTO user_notifications (user_id, type, title, message, action_url, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [user_id, type, title, message, action_url, metadata]
  );
  return result.rows[0];
}

// Delete a notification
async function deleteNotification(id) {
  await pool.query('DELETE FROM user_notifications WHERE id = $1', [id]);
}

module.exports = {
  getUserNotifications,
  markNotificationRead,
  createNotification,
  deleteNotification,
}; 