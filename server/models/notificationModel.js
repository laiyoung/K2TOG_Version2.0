const pool = require('../config/db');

class Notification {
    static async create({ user_id, type, title, message, action_url = null }) {
        const query = `
            INSERT INTO user_notifications (user_id, type, title, message, action_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [user_id, type, title, message, action_url];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async getByUserId(user_id, limit = 50, offset = 0) {
        const query = `
            SELECT * FROM user_notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
        `;
        const { rows } = await pool.query(query, [user_id, limit, offset]);
        return rows;
    }

    static async getUnreadCount(user_id) {
        const query = `
            SELECT COUNT(*) as count 
            FROM user_notifications 
            WHERE user_id = $1 AND is_read = false
        `;
        const { rows } = await pool.query(query, [user_id]);
        return parseInt(rows[0].count);
    }

    static async markAsRead(id, user_id) {
        const query = `
            UPDATE user_notifications 
            SET is_read = true 
            WHERE id = $1 AND user_id = $2 
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id, user_id]);
        return rows[0];
    }

    static async markAllAsRead(user_id) {
        const query = `
            UPDATE user_notifications 
            SET is_read = true 
            WHERE user_id = $1 AND is_read = false 
            RETURNING *
        `;
        const { rows } = await pool.query(query, [user_id]);
        return rows;
    }

    static async delete(id, user_id) {
        const query = 'DELETE FROM user_notifications WHERE id = $1 AND user_id = $2 RETURNING *';
        const { rows } = await pool.query(query, [id, user_id]);
        return rows[0];
    }
}

module.exports = Notification; 