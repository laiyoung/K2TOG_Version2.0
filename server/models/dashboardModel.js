const pool = require('../config/db');

const getDashboardStats = async () => {
  try {
    // Get total enrollments from classes with future/current sessions only
    const totalEnrollmentsResult = await pool.query(`
      SELECT COUNT(*) as total_enrollments 
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      LEFT JOIN class_sessions cs ON e.session_id = cs.id AND cs.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      AND e.enrollment_status IN ('approved', 'active')
      AND (
        -- Session is scheduled and hasn't ended yet
        (cs.status = 'scheduled' AND (
          (cs.end_date IS NOT NULL AND cs.end_date > CURRENT_DATE) OR
          (cs.end_date IS NULL AND cs.session_date > CURRENT_DATE)
        ))
        OR
        -- Session is today (ongoing)
        (cs.status = 'scheduled' AND (
          (cs.end_date IS NOT NULL AND cs.end_date >= CURRENT_DATE) OR
          (cs.end_date IS NULL AND cs.session_date >= CURRENT_DATE)
        ))
      )
    `);

    // Get pending enrollments from classes with future/current sessions only
    const pendingEnrollmentsResult = await pool.query(`
      SELECT COUNT(*) as pending_enrollments 
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      LEFT JOIN class_sessions cs ON e.session_id = cs.id AND cs.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      AND e.enrollment_status = 'pending'
      AND (
        -- Session is scheduled and hasn't ended yet
        (cs.status = 'scheduled' AND (
          (cs.end_date IS NOT NULL AND cs.end_date > CURRENT_DATE) OR
          (cs.end_date IS NULL AND cs.session_date > CURRENT_DATE)
        ))
        OR
        -- Session is today (ongoing)
        (cs.status = 'scheduled' AND (
          (cs.end_date IS NOT NULL AND cs.end_date >= CURRENT_DATE) OR
          (cs.end_date IS NULL AND cs.session_date >= CURRENT_DATE)
        ))
      )
    `);

    // Get active students (users with approved enrollments from classes with future/current sessions)
    const activeStudentsResult = await pool.query(`
      SELECT COUNT(DISTINCT e.user_id) as active_students 
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      LEFT JOIN class_sessions cs ON e.session_id = cs.id AND cs.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      AND e.enrollment_status = 'approved'
      AND (
        -- Session is scheduled and hasn't ended yet
        (cs.status = 'scheduled' AND (
          (cs.end_date IS NOT NULL AND cs.end_date > CURRENT_DATE) OR
          (cs.end_date IS NULL AND cs.session_date > CURRENT_DATE)
        ))
        OR
        -- Session is today (ongoing)
        (cs.status = 'scheduled' AND (
          (cs.end_date IS NOT NULL AND cs.end_date >= CURRENT_DATE) OR
          (cs.end_date IS NULL AND cs.session_date >= CURRENT_DATE)
        ))
      )
    `);

    // Get enrollment rate (approved enrollments from classes with future/current sessions / total enrollments from classes with future/current sessions)
    const enrollmentRateResult = await pool.query(`
      SELECT 
        ROUND(
          (COUNT(CASE WHEN e.enrollment_status = 'approved' THEN 1 END)::float / 
          NULLIF(COUNT(*), 0) * 100)::numeric, 
          2
        ) as enrollment_rate
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      LEFT JOIN class_sessions cs ON e.session_id = cs.id AND cs.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      AND (
        -- Session is scheduled and hasn't ended yet
        (cs.status = 'scheduled' AND (
          (cs.end_date IS NOT NULL AND cs.end_date > CURRENT_DATE) OR
          (cs.end_date IS NULL AND cs.session_date > CURRENT_DATE)
        ))
        OR
        -- Session is today (ongoing)
        (cs.status = 'scheduled' AND (
          (cs.end_date IS NOT NULL AND cs.end_date >= CURRENT_DATE) OR
          (cs.end_date IS NULL AND cs.session_date >= CURRENT_DATE)
        ))
      )
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