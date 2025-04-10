const pool = require('../config/db');

// Enroll a user in a class
const enrollUserInClass = async (userId, classId, paymentStatus = 'paid') => {
  const result = await pool.query(
    `INSERT INTO enrollments (user_id, class_id, payment_status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, classId, paymentStatus]
  );
  return result.rows[0];
};

// Cancel a user's enrollment
const cancelEnrollment = async (userId, classId) => {
  const result = await pool.query(
    `DELETE FROM enrollments WHERE user_id = $1 AND class_id = $2 RETURNING *`,
    [userId, classId]
  );
  return result.rows[0];
};

// Get all enrollments for a specific user
const getUserEnrollments = async (userId) => {
  const result = await pool.query(
    `SELECT classes.*, enrollments.payment_status, enrollments.enrolled_at
     FROM enrollments
     JOIN classes ON classes.id = enrollments.class_id
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
const getAllEnrollments = async () => {
  const result = await pool.query(`
    SELECT users.name AS user_name, users.email, classes.title AS class_title,
           enrollments.payment_status, enrollments.enrolled_at
    FROM enrollments
    JOIN users ON users.id = enrollments.user_id
    JOIN classes ON classes.id = enrollments.class_id
    ORDER BY enrollments.enrolled_at DESC
  `);
  return result.rows;
};

module.exports = {
  enrollUserInClass,
  cancelEnrollment,
  getUserEnrollments,
  isUserAlreadyEnrolled,
  getAllEnrollments,
};
