const pool = require('../config/db');

class ActivityLog {
    static async create({ user_id, action, details }) {
        const query = `
            INSERT INTO user_activity_log (user_id, action, details)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [user_id, action, details];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async getByUserId(user_id, limit = 50, offset = 0) {
        const query = `
            SELECT * FROM user_activity_log 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
        `;
        const { rows } = await pool.query(query, [user_id, limit, offset]);
        return rows;
    }

    static async getRecentActivity(user_id, days = 7) {
        const query = `
            SELECT * FROM user_activity_log 
            WHERE user_id = $1 
            AND created_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
            ORDER BY created_at DESC
        `;
        const { rows } = await pool.query(query, [user_id]);
        return rows;
    }
}

module.exports = ActivityLog; 