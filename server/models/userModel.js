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
async function updateUserRole(userId, newRole, updatedBy) {
  const result = await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [newRole, userId]);
  if (result.rows[0]) {
    await logUserActivity(userId, 'role_update', {
      old_role: result.rows[0].role,
      new_role: newRole,
      updated_by: updatedBy
    });
  }
  return result.rows[0];
}

// Update user status
async function updateUserStatus(userId, status, updatedBy) {
  const result = await pool.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING *', [status, userId]);
  if (result.rows[0]) {
    await logUserActivity(userId, 'status_update', {
      old_status: result.rows[0].status,
      new_status: status,
      updated_by: updatedBy
    });
  }
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
async function getUserActivity(userId, { action, startDate, endDate, limit = 50, offset = 0 } = {}) {
  try {
    let query = 'SELECT * FROM user_activity_log WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (action) {
      query += ` AND action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error in getUserActivity:', error);
    throw error;
  }
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
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('Invalid user IDs provided');
  }

  // Convert all IDs to integers and filter out any invalid values
  const numericIds = ids
    .map(id => {
      const num = parseInt(id, 10);
      return isNaN(num) ? null : num;
    })
    .filter(id => id !== null);

  if (numericIds.length === 0) {
    throw new Error('No valid user IDs provided');
  }

  const result = await pool.query('SELECT * FROM users WHERE id = ANY($1)', [numericIds]);
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

// Get user profile with all details
async function getProfileWithDetails(userId) {
  try {
    // Get user details
    const userResult = await pool.query(`
      SELECT 
        u.*,
        u.last_login,
        COUNT(DISTINCT e.id) as total_enrollments,
        COUNT(DISTINCT CASE WHEN e.enrollment_status = 'approved' THEN e.id END) as active_enrollments,
        COUNT(DISTINCT p.id) as total_payments,
        COUNT(DISTINCT CASE WHEN p.status = 'pending' THEN p.id END) as pending_payments
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.user_id
      LEFT JOIN payments p ON u.id = p.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);

    if (!userResult.rows[0]) {
      return null;
    }

    const user = userResult.rows[0];

    // Initialize empty arrays for optional data
    const profile = {
      ...user,
      certificates: [],
      payment_methods: [],
      recent_activity: [],
      notifications: [],
      enrollments: []
    };

    // Try to get user's enrollments if the table exists
    try {
      const enrollmentsResult = await pool.query(`
        SELECT e.id as enrollment_id,
               e.enrollment_status,
               e.payment_status,
               e.enrolled_at,
               c.title as class_name,
               c.description as class_description,
               c.location_details as location,
               c.capacity,
               COALESCE(cs.session_date, c.date) as start_date,
               COALESCE(cs.start_time, c.start_time) as start_time,
               COALESCE(cs.end_time, c.end_time) as end_time,
               u.name as instructor_name
        FROM enrollments e
        JOIN classes c ON c.id = e.class_id
        LEFT JOIN class_sessions cs ON cs.id = e.session_id
        LEFT JOIN users u ON u.id = c.instructor_id
        WHERE e.user_id = $1
        ORDER BY e.enrolled_at DESC
      `, [userId]);
      profile.enrollments = enrollmentsResult.rows;
    } catch (err) {
      console.log('Enrollments table not available:', err.message);
    }

    // Try to get user's payment methods if the table exists
    try {
      const paymentMethodsResult = await pool.query(`
        SELECT * FROM user_payment_methods
        WHERE user_id = $1
        ORDER BY is_default DESC, created_at DESC
      `, [userId]);
      profile.payment_methods = paymentMethodsResult.rows;
    } catch (err) {
      console.log('Payment methods table not available:', err.message);
    }

    // Try to get user's recent activity if the table exists
    try {
      const activityResult = await pool.query(`
        SELECT * FROM user_activity_log
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `, [userId]);
      profile.recent_activity = activityResult.rows;
    } catch (err) {
      console.log('Activity log table not available:', err.message);
    }

    // Try to get user's recent notifications if the table exists
    try {
      const notificationsResult = await pool.query(`
        SELECT * FROM user_notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `, [userId]);
      profile.notifications = notificationsResult.rows;
    } catch (err) {
      console.log('Notifications table not available:', err.message);
    }

    return profile;
  } catch (error) {
    console.error('Error in getProfileWithDetails:', error);
    throw error;
  }
}

// Update user password
async function updatePassword(userId, hashedPassword) {
  const result = await pool.query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, role',
    [hashedPassword, userId]
  );
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
  getUserByEmail,
  getProfileWithDetails,
  updatePassword
};
