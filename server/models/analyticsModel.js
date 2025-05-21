const pool = require('../config/db');

class Analytics {
    // Get revenue analytics
    static async getRevenueAnalytics({ startDate, endDate, groupBy = 'month' }) {
        const dateTrunc = groupBy === 'day' ? 'day' : 'month';
        const query = `
            WITH revenue_data AS (
                SELECT 
                    DATE_TRUNC($1, p.created_at) as period,
                    SUM(p.amount) as total_revenue,
                    COUNT(*) as transaction_count,
                    SUM(CASE WHEN p.refund_status = 'processed' THEN p.refund_amount ELSE 0 END) as total_refunds,
                    COUNT(CASE WHEN p.refund_status = 'processed' THEN 1 END) as refund_count
                FROM payments p
                WHERE p.status = 'completed'
                AND p.created_at BETWEEN $2 AND $3
                GROUP BY DATE_TRUNC($1, p.created_at)
            )
            SELECT 
                period,
                total_revenue,
                transaction_count,
                total_refunds,
                refund_count,
                (total_revenue - total_refunds) as net_revenue,
                ROUND((total_refunds::numeric / NULLIF(total_revenue, 0) * 100), 2) as refund_rate
            FROM revenue_data
            ORDER BY period DESC
        `;
        const { rows } = await pool.query(query, [dateTrunc, startDate, endDate]);
        return rows;
    }

    // Get revenue by class
    static async getRevenueByClass({ startDate, endDate }) {
        const query = `
            SELECT 
                c.id as class_id,
                c.title as class_name,
                COUNT(p.id) as enrollment_count,
                SUM(p.amount) as total_revenue,
                SUM(CASE WHEN p.refund_status = 'processed' THEN p.refund_amount ELSE 0 END) as total_refunds,
                (SUM(p.amount) - SUM(CASE WHEN p.refund_status = 'processed' THEN p.refund_amount ELSE 0 END)) as net_revenue,
                ROUND(AVG(p.amount), 2) as average_price
            FROM classes c
            LEFT JOIN payments p ON c.id = p.class_id
            WHERE p.status = 'completed'
            AND p.created_at BETWEEN $1 AND $2
            GROUP BY c.id, c.title
            ORDER BY net_revenue DESC
        `;
        const { rows } = await pool.query(query, [startDate, endDate]);
        return rows;
    }

    // Get enrollment trends
    static async getEnrollmentTrends({ startDate, endDate, groupBy = 'month' }) {
        const dateTrunc = groupBy === 'day' ? 'day' : 'month';
        const query = `
            WITH enrollment_data AS (
                SELECT 
                    DATE_TRUNC($1, e.enrolled_at) as period,
                    COUNT(*) as total_enrollments,
                    COUNT(CASE WHEN e.enrollment_status = 'approved' THEN 1 END) as approved_enrollments,
                    COUNT(CASE WHEN e.enrollment_status = 'pending' THEN 1 END) as pending_enrollments,
                    COUNT(CASE WHEN e.enrollment_status = 'rejected' THEN 1 END) as rejected_enrollments
                FROM enrollments e
                WHERE e.enrolled_at BETWEEN $2 AND $3
                GROUP BY DATE_TRUNC($1, e.enrolled_at)
            )
            SELECT 
                period,
                total_enrollments,
                approved_enrollments,
                pending_enrollments,
                rejected_enrollments,
                ROUND((approved_enrollments::numeric / NULLIF(total_enrollments, 0) * 100), 2) as approval_rate
            FROM enrollment_data
            ORDER BY period DESC
        `;
        const { rows } = await pool.query(query, [dateTrunc, startDate, endDate]);
        return rows;
    }

    // Get class enrollment statistics
    static async getClassEnrollmentStats({ startDate, endDate }) {
        const query = `
            SELECT 
                c.id as class_id,
                c.title as class_name,
                c.capacity,
                COUNT(e.id) as total_enrollments,
                COUNT(CASE WHEN e.enrollment_status = 'approved' THEN 1 END) as approved_enrollments,
                COUNT(CASE WHEN e.enrollment_status = 'pending' THEN 1 END) as pending_enrollments,
                COUNT(CASE WHEN e.enrollment_status = 'rejected' THEN 1 END) as rejected_enrollments,
                COUNT(w.id) as waitlist_count,
                ROUND((COUNT(CASE WHEN e.enrollment_status = 'approved' THEN 1 END)::numeric / NULLIF(c.capacity, 0) * 100), 2) as enrollment_rate
            FROM classes c
            LEFT JOIN enrollments e ON c.id = e.class_id
            LEFT JOIN class_waitlist w ON c.id = w.class_id
            WHERE c.created_at BETWEEN $1 AND $2
            GROUP BY c.id, c.title, c.capacity
            ORDER BY total_enrollments DESC
        `;
        const { rows } = await pool.query(query, [startDate, endDate]);
        return rows;
    }

    // Get user engagement metrics
    static async getUserEngagementMetrics({ startDate, endDate }) {
        const query = `
            WITH user_activity AS (
                SELECT 
                    u.id as user_id,
                    u.first_name,
                    u.last_name,
                    COUNT(DISTINCT e.id) as enrolled_classes,
                    COUNT(DISTINCT p.id) as completed_payments,
                    COUNT(DISTINCT c.id) as certificates_earned,
                    COUNT(DISTINCT a.id) as activity_count,
                    MAX(a.created_at) as last_activity
                FROM users u
                LEFT JOIN enrollments e ON u.id = e.user_id
                LEFT JOIN payments p ON u.id = p.user_id AND p.status = 'completed'
                LEFT JOIN user_certificates c ON u.id = c.user_id
                LEFT JOIN user_activity_log a ON u.id = a.user_id
                WHERE u.created_at BETWEEN $1 AND $2
                GROUP BY u.id, u.first_name, u.last_name
            )
            SELECT 
                user_id,
                first_name,
                last_name,
                enrolled_classes,
                completed_payments,
                certificates_earned,
                activity_count,
                last_activity,
                CASE 
                    WHEN enrolled_classes > 0 AND completed_payments > 0 THEN 'active'
                    WHEN last_activity > NOW() - INTERVAL '30 days' THEN 'recent'
                    ELSE 'inactive'
                END as engagement_status
            FROM user_activity
            ORDER BY activity_count DESC
        `;
        const { rows } = await pool.query(query, [startDate, endDate]);
        return rows;
    }

    // Get user activity trends
    static async getUserActivityTrends({ startDate, endDate, groupBy = 'month' }) {
        const dateTrunc = groupBy === 'day' ? 'day' : 'month';
        const query = `
            WITH activity_data AS (
                SELECT 
                    DATE_TRUNC($1, a.created_at) as period,
                    a.action,
                    COUNT(*) as action_count
                FROM user_activity_log a
                WHERE a.created_at BETWEEN $2 AND $3
                GROUP BY DATE_TRUNC($1, a.created_at), a.action
            )
            SELECT 
                period,
                action,
                action_count,
                ROUND((action_count::numeric / SUM(action_count) OVER (PARTITION BY period) * 100), 2) as action_percentage
            FROM activity_data
            ORDER BY period DESC, action_count DESC
        `;
        const { rows } = await pool.query(query, [dateTrunc, startDate, endDate]);
        return rows;
    }

    // Get dashboard summary
    static async getDashboardSummary() {
        const query = `
            WITH summary AS (
                SELECT 
                    (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
                    (SELECT COUNT(*) FROM classes WHERE status = 'active') as active_classes,
                    (SELECT COUNT(*) FROM enrollments WHERE enrollment_status = 'approved') as active_enrollments,
                    (SELECT COUNT(*) FROM payments WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days') as recent_payments,
                    (SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days') as monthly_revenue,
                    (SELECT COUNT(*) FROM user_certificates WHERE created_at >= NOW() - INTERVAL '30 days') as recent_certificates,
                    (SELECT COUNT(*) FROM class_waitlist WHERE status = 'waiting') as waitlist_count
            )
            SELECT 
                active_users,
                active_classes,
                active_enrollments,
                recent_payments,
                COALESCE(monthly_revenue, 0) as monthly_revenue,
                recent_certificates,
                waitlist_count,
                ROUND((active_enrollments::numeric / NULLIF(active_users, 0) * 100), 2) as enrollment_rate
            FROM summary
        `;
        const { rows } = await pool.query(query);
        return rows[0];
    }
}

// Example: Get user count
async function getUserCount() {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count, 10);
}

// Example: Get class count
async function getClassCount() {
    const result = await pool.query('SELECT COUNT(*) FROM classes');
    return parseInt(result.rows[0].count, 10);
}

// Example: Get enrollment count
async function getEnrollmentCount() {
    const result = await pool.query('SELECT COUNT(*) FROM enrollments');
    return parseInt(result.rows[0].count, 10);
}



module.exports = {
    getUserCount,
    getClassCount,
    getEnrollmentCount,
    Analytics,
}; 