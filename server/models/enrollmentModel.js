const pool = require('../config/db');

// Enroll a user in a class (now creates a pending enrollment)
const enrollUserInClass = async (userId, classId, sessionId, paymentStatus = 'paid') => {
  const result = await pool.query(
    `INSERT INTO enrollments (user_id, class_id, session_id, payment_status, enrollment_status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [userId, classId, sessionId, paymentStatus]
  );
  // Automatically convert user to student if not already
  await pool.query(
    `UPDATE users SET role = 'student' WHERE id = $1 AND role != 'student'`,
    [userId]
  );
  return result.rows[0];
};

// Approve an enrollment
const approveEnrollment = async (enrollmentId, adminId, adminNotes = null) => {
  const result = await pool.query(
    `UPDATE enrollments 
     SET enrollment_status = 'approved',
         admin_notes = $1,
         reviewed_at = CURRENT_TIMESTAMP,
         reviewed_by = $2
     WHERE id = $3
     RETURNING *`,
    [adminNotes, adminId, enrollmentId]
  );
  
  if (result.rows[0]) {
    // Increment the class enrollment count
    await pool.query(
      `UPDATE classes 
       SET enrolled_count = enrolled_count + 1 
       WHERE id = $1`,
      [result.rows[0].class_id]
    );
  }
  
  return result.rows[0];
};

// Reject an enrollment
const rejectEnrollment = async (enrollmentId, adminId, adminNotes = null) => {
  const result = await pool.query(
    `UPDATE enrollments 
     SET enrollment_status = 'rejected',
         admin_notes = $1,
         reviewed_at = CURRENT_TIMESTAMP,
         reviewed_by = $2
     WHERE id = $3
     RETURNING *`,
    [adminNotes, adminId, enrollmentId]
  );
  return result.rows[0];
};

// Set enrollment to pending
const setEnrollmentPending = async (enrollmentId, adminId, adminNotes = null) => {
  const result = await pool.query(
    `UPDATE enrollments 
     SET enrollment_status = 'pending',
         admin_notes = $1,
         reviewed_at = CURRENT_TIMESTAMP,
         reviewed_by = $2
     WHERE id = $3
     RETURNING *`,
    [adminNotes, adminId, enrollmentId]
  );
  return result.rows[0];
};

// Get pending enrollments (for admin)
const getPendingEnrollments = async () => {
  const result = await pool.query(`
    SELECT e.*, 
           u.name as user_name, u.email as user_email,
           c.title as class_title, c.date as class_date,
           a.name as reviewer_name
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    JOIN classes c ON c.id = e.class_id
    LEFT JOIN users a ON a.id = e.reviewed_by
    WHERE e.enrollment_status = 'pending'
    ORDER BY e.enrolled_at DESC
  `);
  return result.rows;
};

// Get enrollment by ID
const getEnrollmentById = async (enrollmentId) => {
  const result = await pool.query(`
    SELECT e.*, 
           u.name as user_name, u.email as user_email,
           c.title as class_title, c.date as class_date,
           a.name as reviewer_name
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    JOIN classes c ON c.id = e.class_id
    LEFT JOIN users a ON a.id = e.reviewed_by
    WHERE e.id = $1
  `, [enrollmentId]);
  return result.rows[0];
};

// Cancel a user's enrollment
const cancelEnrollment = async (userId, classId) => {
  const result = await pool.query(
    `DELETE FROM enrollments 
     WHERE user_id = $1 
     AND class_id = $2 
     AND enrollment_status = 'approved'
     RETURNING *`,
    [userId, classId]
  );
  
  if (result.rows[0]) {
    // Decrement the class enrollment count
    await pool.query(
      `UPDATE classes 
       SET enrolled_count = GREATEST(enrolled_count - 1, 0) 
       WHERE id = $1`,
      [classId]
    );
  }
  
  return result.rows[0];
};

// Get all enrollments for a specific user
const getUserEnrollments = async (userId) => {
  const result = await pool.query(
    `SELECT 
      classes.id as class_id,
      classes.title as class_title,
      TO_CHAR(classes.date, 'MM/DD/YY') as formatted_date,
      enrollments.payment_status, 
      enrollments.enrollment_status,
      enrollments.enrolled_at,
      enrollments.admin_notes,
      enrollments.reviewed_at,
      users.name as reviewer_name
     FROM enrollments
     JOIN classes ON classes.id = enrollments.class_id
     LEFT JOIN users ON users.id = enrollments.reviewed_by
     WHERE enrollments.user_id = $1
     ORDER BY classes.date`,
    [userId]
  );
  return result.rows;
};

// Check if a user is already enrolled in a specific class
const isUserAlreadyEnrolled = async (userId, classId) => {
  const result = await pool.query(
    `SELECT * FROM enrollments WHERE user_id = $1 AND class_id = $2`,
    [userId, classId]
  );
  return result.rows.length > 0;
};

// Get all enrollments (admin view)
const getAllEnrollments = async (filters = {}) => {
  const { status, class_id, user_id, start_date, end_date } = filters;
  
  let query = `
    SELECT 
      e.*,
      u.name as student_name,
      u.email as student_email,
      c.title as class_name,
      c.date as class_date,
      c.start_time,
      c.end_time,
      c.location_details,
      reviewer.name as reviewer_name,
      TO_CHAR(e.enrolled_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as enrollment_date
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    JOIN classes c ON c.id = e.class_id
    LEFT JOIN users reviewer ON reviewer.id = e.reviewed_by
    WHERE 1=1
  `;
  
  const queryParams = [];
  let paramCount = 1;

  if (status && status !== 'all') {
    query += ` AND e.enrollment_status = $${paramCount}`;
    queryParams.push(status);
    paramCount++;
  }

  if (class_id && class_id !== 'all') {
    query += ` AND e.class_id = $${paramCount}`;
    queryParams.push(class_id);
    paramCount++;
  }

  if (user_id && user_id !== 'all') {
    query += ` AND e.user_id = $${paramCount}`;
    queryParams.push(user_id);
    paramCount++;
  }

  if (start_date) {
    query += ` AND e.enrolled_at >= $${paramCount}`;
    queryParams.push(start_date);
    paramCount++;
  }

  if (end_date) {
    query += ` AND e.enrolled_at <= $${paramCount}`;
    queryParams.push(end_date);
    paramCount++;
  }

  query += ` ORDER BY e.enrolled_at DESC`;

  const result = await pool.query(query, queryParams);
  return result.rows;
};

module.exports = {
  enrollUserInClass,
  approveEnrollment,
  rejectEnrollment,
  setEnrollmentPending,
  getPendingEnrollments,
  getEnrollmentById,
  cancelEnrollment,
  getUserEnrollments,
  getAllEnrollments,
  isUserAlreadyEnrolled
};
