const pool = require('../config/db');

// Get all users
async function getAllUsers() {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
}

// Get user by ID
async function getUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

// Create user
async function createUser(data) {
  const { name, email, password, role, status, first_name, last_name, phone_number, email_notifications, sms_notifications } = data;
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role, status, first_name, last_name, phone_number, email_notifications, sms_notifications) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
    [name, email, password, role, status, first_name, last_name, phone_number, email_notifications, sms_notifications]
  );
  return result.rows[0];
}

// Delete user
async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

// Search users
async function searchUsers({ searchTerm = '', role = null, sortBy = 'created_at', sortOrder = 'DESC', limit = 50, offset = 0, includeInactive = false }) {
  let query = `SELECT * FROM users WHERE 1=1`;
  const params = [];
  let idx = 1;
  if (searchTerm) {
    query += ` AND (email ILIKE $${idx} OR first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR phone_number ILIKE $${idx})`;
    params.push(`%${searchTerm}%`);
    idx++;
  }
  if (role) {
    query += ` AND role = $${idx}`;
    params.push(role);
    idx++;
  }
  if (!includeInactive) {
    query += ` AND status = 'active'`;
  }
  query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${idx} OFFSET $${idx + 1}`;
  params.push(limit, offset);
  const result = await pool.query(query, params);
  return { users: result.rows, total: result.rows.length };
}

// Update user role
async function updateUserRole(userId, newRole) {
  const result = await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [newRole, userId]);
  return result.rows[0];
}

// Update user status
async function updateUserStatus(userId, status) {
  const result = await pool.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING *', [status, userId]);
  return result.rows[0];
}

// Get users by role
async function getUsersByRole(role) {
  const result = await pool.query('SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC', [role]);
  return result.rows;
}

// Log user activity
async function logUserActivity(userId, action, details = {}) {
  const result = await pool.query('INSERT INTO user_activity_log (user_id, action, details) VALUES ($1, $2, $3) RETURNING *', [userId, action, details]);
  return result.rows[0];
}

// Get user activity
async function getUserActivity(userId, { limit = 50, offset = 0 } = {}) {
  const result = await pool.query('SELECT * FROM user_activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [userId, limit, offset]);
  return result.rows;
}

// Update user profile
async function updateProfile(id, updates) {
  const { first_name, last_name, phone_number, email_notifications, sms_notifications } = updates;
  const result = await pool.query(
    `UPDATE users SET first_name = $1, last_name = $2, phone_number = $3, email_notifications = $4, sms_notifications = $5 WHERE id = $6 RETURNING *`,
    [first_name, last_name, phone_number, email_notifications, sms_notifications, id]
  );
  return result.rows[0];
}

// Get users by IDs
async function getUsersByIds(ids) {
  const result = await pool.query('SELECT * FROM users WHERE id = ANY($1)', [ids]);
  return result.rows;
}

// Get users by status
async function getUsersByStatus(status) {
  const result = await pool.query('SELECT * FROM users WHERE status = $1', [status]);
  return result.rows;
}

// Get user by email
async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  searchUsers,
  updateUserRole,
  updateUserStatus,
  getUsersByRole,
  logUserActivity,
  getUserActivity,
  updateProfile,
  getUsersByIds,
  getUsersByStatus,
  getUserByEmail
};
