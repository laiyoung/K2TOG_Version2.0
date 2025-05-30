const pool = require('../config/db');

// Get all notifications for a user
async function getUserNotifications(userId) {
  const result = await pool.query('SELECT * FROM user_notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows;
}

// Mark a notification as read
async function markNotificationRead(notificationId, userId) {
  const result = await pool.query(
    'UPDATE user_notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
    [notificationId, userId]
  );
  return result.rows[0];
}

// Create a notification
async function createNotification(data) {
  const { user_id, type, title, message, action_url, metadata, sender_id } = data;
  const result = await pool.query(
    'INSERT INTO user_notifications (user_id, type, title, message, action_url, metadata, sender_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [user_id, type, title, message, action_url, metadata, sender_id]
  );
  return result.rows[0];
}

// Delete a notification
async function deleteNotification(id, userId) {
  const result = await pool.query(
    'DELETE FROM user_notifications WHERE id = $1 AND (user_id = $2 OR sender_id = $2) RETURNING *',
    [id, userId]
  );
  return result.rows[0];
}

// Get notification template by name
async function getTemplateByName(name) {
  const result = await pool.query('SELECT * FROM notification_templates WHERE name = $1', [name]);
  return result.rows[0];
}

// Create bulk notifications from template
async function createBulkFromTemplate(templateName, userIds, variables = {}, actionUrl = null, senderId = null) {
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
        metadata: template.metadata,
        sender_id: senderId
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

// Get notifications sent by an admin
async function getNotificationsSentByAdmin(adminId) {
  const result = await pool.query(`
    SELECT n.*, u.name as recipient_name 
    FROM user_notifications n
    JOIN users u ON n.user_id = u.id
    WHERE n.sender_id = $1
    ORDER BY n.created_at DESC
  `, [adminId]);
  return result.rows;
}

module.exports = {
  getUserNotifications,
  markNotificationRead,
  createNotification,
  deleteNotification,
  getTemplateByName,
  createBulkFromTemplate,
  getNotificationsSentByAdmin
}; 