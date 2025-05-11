const pool = require('../config/db');

class Certificate {
    static async create({ user_id, class_id, certificate_name, certificate_url }) {
        const query = `
            INSERT INTO user_certificates (user_id, class_id, certificate_name, certificate_url, issue_date)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const values = [user_id, class_id, certificate_name, certificate_url];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async getByUserId(user_id) {
        const query = `
            SELECT c.*, cl.name as class_name
            FROM user_certificates c
            LEFT JOIN classes cl ON c.class_id = cl.id
            WHERE c.user_id = $1
            ORDER BY c.issue_date DESC
        `;
        const { rows } = await pool.query(query, [user_id]);
        return rows;
    }

    static async getById(id) {
        const query = 'SELECT * FROM user_certificates WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async delete(id, user_id) {
        const query = 'DELETE FROM user_certificates WHERE id = $1 AND user_id = $2 RETURNING *';
        const { rows } = await pool.query(query, [id, user_id]);
        return rows[0];
    }
}

module.exports = Certificate; 