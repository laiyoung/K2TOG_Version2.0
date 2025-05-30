const pool = require('../config/db');

const getDashboardStats = async () => {
  try {
    // Get total enrollments
    const totalEnrollmentsResult = await pool.query(`
      SELECT COUNT(*) as total_enrollments 
      FROM enrollments
    `);

    // Get pending enrollments
    const pendingEnrollmentsResult = await pool.query(`
      SELECT COUNT(*) as pending_enrollments 
      FROM enrollments 
      WHERE enrollment_status = 'pending'
    `);

    // Get active students (users with approved enrollments)
    const activeStudentsResult = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as active_students 
      FROM enrollments 
      WHERE enrollment_status = 'approved'
    `);

    // Get enrollment rate (approved enrollments / total enrollments)
    const enrollmentRateResult = await pool.query(`
      SELECT 
        ROUND(
          (COUNT(CASE WHEN enrollment_status = 'approved' THEN 1 END)::float / 
          NULLIF(COUNT(*), 0) * 100)::numeric, 
          2
        ) as enrollment_rate
      FROM enrollments
    `);

    return {
      totalEnrollments: parseInt(totalEnrollmentsResult.rows[0].total_enrollments) || 0,
      pendingEnrollments: parseInt(pendingEnrollmentsResult.rows[0].pending_enrollments) || 0,
      activeStudents: parseInt(activeStudentsResult.rows[0].active_students) || 0,
      enrollmentRate: parseFloat(enrollmentRateResult.rows[0].enrollment_rate) || 0
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

module.exports = {
  getDashboardStats
}; 