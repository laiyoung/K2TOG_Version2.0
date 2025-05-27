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

// Get notification template by name
async function getTemplateByName(name) {
  const result = await pool.query('SELECT * FROM notification_templates WHERE name = $1', [name]);
  return result.rows[0];
}

// Create bulk notifications from template
async function createBulkFromTemplate(templateName, userIds, variables = {}, actionUrl = null) {
  // Get the template
  const template = await getTemplateByName(templateName);
  if (!template) {
    throw new Error('Notification template not found');
  }

  // Process template variables
  let title = template.title_template;
  let message = template.message_template;
  
  // Replace variables in templates
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    title = title.replace(regex, value);
    message = message.replace(regex, value);
  });

  // Create notifications for each user
  const notifications = [];
  const failedUsers = [];
  
  for (const userId of userIds) {
    try {
      const notification = await createNotification({
        user_id: userId,
        type: template.type,
        title,
        message,
        action_url: actionUrl,
        metadata: template.metadata
      });
      notifications.push(notification);
    } catch (error) {
      console.error(`Failed to create notification for user ${userId}:`, error);
      failedUsers.push(userId);
    }
  }

  return {
    sent_count: notifications.length,
    failed_count: failedUsers.length,
    failed_users: failedUsers
  };
}

module.exports = {
  getUserNotifications,
  markNotificationRead,
  createNotification,
  deleteNotification,
  getTemplateByName,
  createBulkFromTemplate
}; 