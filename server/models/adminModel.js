const pool = require('../config/db');

const adminModel = {
  async getWaitlist() {
    const query = `
      SELECT w.*, c.title as class_name, c.location_details, u.name as user_name, u.email
      FROM class_waitlist w
      JOIN classes c ON w.class_id = c.id
      JOIN users u ON w.user_id = u.id
      WHERE c.deleted_at IS NULL
      ORDER BY w.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async updateWaitlistStatus(waitlistId, status) {
    const validStatuses = ['waiting', 'pending', 'approved', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const query = `
      UPDATE class_waitlist
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, waitlistId]);
    return result.rows[0];
  },

  async getClassStats() {
    const query = `
      SELECT 
        COUNT(*) as total_classes,
        COUNT(CASE WHEN cs.status = 'scheduled' THEN 1 END) as active_sessions,
        COUNT(CASE WHEN cs.status = 'completed' THEN 1 END) as completed_sessions
      FROM classes c
      LEFT JOIN class_sessions cs ON cs.class_id = c.id AND cs.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  async getEnrollmentStats() {
    const query = `
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(CASE WHEN e.enrollment_status = 'approved' THEN 1 END) as approved_enrollments,
        COUNT(CASE WHEN e.enrollment_status = 'pending' THEN 1 END) as pending_enrollments,
        COUNT(CASE WHEN e.enrollment_status = 'rejected' THEN 1 END) as rejected_enrollments
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      LEFT JOIN class_sessions cs ON e.session_id = cs.id AND cs.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      AND (
        cs.status = 'scheduled' AND (
          (cs.end_date IS NOT NULL AND cs.end_date > CURRENT_DATE) OR
          (cs.end_date IS NULL AND cs.session_date > CURRENT_DATE)
        )
      )
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  async getRevenueStats() {
    const query = `
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
      FROM payments p
      JOIN classes c ON p.class_id = c.id
      WHERE c.deleted_at IS NULL
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
};

module.exports = adminModel; 