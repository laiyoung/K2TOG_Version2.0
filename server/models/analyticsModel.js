const pool = require('../config/db');

// Get revenue analytics
async function getRevenueAnalytics({ startDate, endDate, groupBy = 'month' }) {
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

// Get revenue by class with updated active logic
async function getRevenueByClass({ startDate, endDate }) {
    const query = `
        SELECT 
            c.id as class_id,
            c.title as class_name,
            COUNT(e.id) as enrollment_count,
            SUM(p.amount) as total_revenue,
            SUM(CASE WHEN p.refund_status = 'processed' THEN p.refund_amount ELSE 0 END) as total_refunds,
            (SUM(p.amount) - SUM(CASE WHEN p.refund_status = 'processed' THEN p.refund_amount ELSE 0 END)) as net_revenue,
            ROUND(AVG(p.amount), 2) as average_price
        FROM classes c
        LEFT JOIN enrollments e ON c.id = e.class_id 
            AND e.enrollment_status IN ('active', 'approved')
            AND e.enrolled_at BETWEEN $1 AND $2
        LEFT JOIN payments p ON c.id = p.class_id 
            AND p.status = 'completed'
            AND p.created_at BETWEEN $1 AND $2
        WHERE EXISTS (
            SELECT 1 FROM class_sessions cs 
            WHERE cs.class_id = c.id 
            AND cs.status IN ('scheduled', 'completed')
        )
        GROUP BY c.id, c.title
        ORDER BY net_revenue DESC
    `;
    const { rows } = await pool.query(query, [startDate, endDate]);
    return rows;
}

// Get enrollment trends
async function getEnrollmentTrends({ startDate, endDate, groupBy = 'month' }) {
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

// Get class enrollment statistics with updated active logic
async function getClassEnrollmentStats({ startDate, endDate }) {
    const query = `
        SELECT 
            c.id as class_id,
            c.title as class_name,
            cs.capacity,
            COUNT(DISTINCT e.id) as total_enrollments,
            COUNT(DISTINCT CASE WHEN e.enrollment_status IN ('active', 'approved') THEN e.id END) as approved_enrollments,
            COUNT(DISTINCT CASE WHEN e.enrollment_status = 'pending' THEN e.id END) as pending_enrollments,
            COUNT(DISTINCT CASE WHEN e.enrollment_status = 'rejected' THEN e.id END) as rejected_enrollments,
            COUNT(DISTINCT w.id) as waitlist_count,
            ROUND((COUNT(DISTINCT CASE WHEN e.enrollment_status IN ('active', 'approved') THEN e.id END)::numeric / 
                   NULLIF(cs.capacity, 0) * 100), 2) as enrollment_rate
        FROM classes c
        JOIN class_sessions cs ON cs.class_id = c.id
        LEFT JOIN enrollments e ON c.id = e.class_id 
            AND e.enrolled_at BETWEEN $1 AND $2
        LEFT JOIN class_waitlist w ON c.id = w.class_id 
            AND w.created_at BETWEEN $1 AND $2
        WHERE cs.status IN ('scheduled', 'completed')
        GROUP BY c.id, c.title, cs.capacity
        ORDER BY total_enrollments DESC
    `;
    const { rows } = await pool.query(query, [startDate, endDate]);
    return rows;
}

// Get user engagement metrics with updated active logic
async function getUserEngagementMetrics({ startDate, endDate }) {
    const query = `
        WITH user_activity AS (
            SELECT 
                u.id as user_id,
                u.first_name,
                u.last_name,
                COUNT(DISTINCT e.id) as enrolled_classes,
                COUNT(DISTINCT p.id) as completed_payments,
                COUNT(DISTINCT a.id) as activity_count,
                MAX(a.created_at) as last_activity
            FROM users u
            LEFT JOIN enrollments e ON u.id = e.user_id 
                AND e.enrollment_status IN ('active', 'approved')
                AND e.enrolled_at BETWEEN $1 AND $2
            LEFT JOIN payments p ON u.id = p.user_id 
                AND p.status = 'completed' 
                AND p.created_at BETWEEN $1 AND $2
            LEFT JOIN user_activity_log a ON u.id = a.user_id 
                AND a.created_at BETWEEN $1 AND $2
            WHERE u.status = 'active'
            GROUP BY u.id, u.first_name, u.last_name
        )
        SELECT 
            user_id,
            first_name,
            last_name,
            enrolled_classes,
            completed_payments,
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
async function getUserActivityTrends({ startDate, endDate, groupBy = 'month' }) {
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

// Get dashboard summary with date range
async function getDashboardSummary({ startDate, endDate }) {
    console.log('Getting dashboard summary for date range:', { startDate, endDate });
    
    const query = `
        WITH summary AS (
            SELECT 
                (SELECT COUNT(DISTINCT u.id) 
                 FROM users u 
                 WHERE u.status = 'active' 
                 AND EXISTS (
                     SELECT 1 FROM user_activity_log a 
                     WHERE a.user_id = u.id 
                     AND a.created_at BETWEEN $1 AND $2
                 )) as active_users,
                
                (SELECT COUNT(DISTINCT c.id) 
                 FROM classes c 
                 JOIN class_sessions cs ON cs.class_id = c.id
                 WHERE cs.status IN ('scheduled', 'completed') 
                 AND EXISTS (
                     SELECT 1 FROM enrollments e 
                     WHERE e.class_id = c.id 
                     AND e.enrollment_status IN ('active', 'approved')
                     AND e.enrolled_at BETWEEN $1 AND $2
                 )) as active_classes,
                
                (SELECT COUNT(*) 
                 FROM enrollments e 
                 WHERE e.enrollment_status IN ('active', 'approved') 
                 AND e.enrolled_at BETWEEN $1 AND $2) as active_enrollments,
                
                (SELECT COUNT(*) 
                 FROM payments p 
                 WHERE p.status = 'completed' 
                 AND p.created_at BETWEEN $1 AND $2) as recent_payments,
                
                (SELECT SUM(amount) 
                 FROM payments p 
                 WHERE p.status = 'completed' 
                 AND p.created_at BETWEEN $1 AND $2) as monthly_revenue,
                
                (SELECT COUNT(*) 
                 FROM class_waitlist w 
                 WHERE w.status = 'waiting' 
                 AND w.created_at BETWEEN $1 AND $2) as waitlist_count
        )
        SELECT 
            active_users,
            active_classes,
            active_enrollments,
            recent_payments,
            COALESCE(monthly_revenue, 0) as monthly_revenue,
            waitlist_count,
            ROUND((active_enrollments::numeric / NULLIF(active_users, 0) * 100), 2) as enrollment_rate
        FROM summary
    `;
    
    try {
        console.log('Executing dashboard summary query with params:', [startDate, endDate]);
        const { rows } = await pool.query(query, [startDate, endDate]);
        console.log('Dashboard summary query result:', rows[0]);
        return rows[0];
    } catch (error) {
        console.error('Error in getDashboardSummary:', error);
        throw error;
    }
}

// Get user count
async function getUserCount() {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count, 10);
}

// Get class count
async function getClassCount() {
    const result = await pool.query('SELECT COUNT(*) FROM classes');
    return parseInt(result.rows[0].count, 10);
}

// Get enrollment count
async function getEnrollmentCount() {
    const result = await pool.query('SELECT COUNT(*) FROM enrollments');
    return parseInt(result.rows[0].count, 10);
}

module.exports = {
    getRevenueAnalytics,
    getRevenueByClass,
    getEnrollmentTrends,
    getClassEnrollmentStats,
    getUserEngagementMetrics,
    getUserActivityTrends,
    getDashboardSummary,
    getUserCount,
    getClassCount,
    getEnrollmentCount
}; 