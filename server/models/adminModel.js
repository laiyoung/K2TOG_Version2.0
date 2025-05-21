const pool = require('../config/db');

const adminModel = {
  async getWaitlist() {
    const query = `
      SELECT w.*, c.name as class_name, c.location, u.name as user_name, u.email
      FROM waitlist w
      JOIN classes c ON w.class_id = c.class_id
      JOIN users u ON w.user_id = u.user_id
      ORDER BY w.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async updateWaitlistStatus(waitlistId, status) {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const query = `
      UPDATE waitlist
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE waitlist_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, waitlistId]);
    return result.rows[0];
  },

  async getClassStats() {
    const query = `
      SELECT 
        COUNT(*) as total_classes,
        COUNT(CASE WHEN status = 'scheduled' OR status = 'in_progress' THEN 1 END) as active_classes,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_classes,
        json_object_agg(
          status,
          COUNT(*)
        ) as classes_by_status
      FROM classes
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  async getEnrollmentStats() {
    const query = `
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_enrollments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_enrollments,
        json_object_agg(
          status,
          COUNT(*)
        ) as enrollments_by_status
      FROM enrollments
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  async getRevenueStats() {
    const query = `
      SELECT 
        SUM(amount) as total_revenue,
        json_object_agg(
          to_char(payment_date, 'YYYY-MM'),
          SUM(amount)
        ) as revenue_by_month,
        json_object_agg(
          c.name,
          SUM(p.amount)
        ) as revenue_by_class
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.enrollment_id
      JOIN classes c ON e.class_id = c.class_id
      GROUP BY c.name
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
};

module.exports = adminModel; 