const pool = require('../config/db');

class PaymentMethod {
    static async create({ user_id, payment_type, last_four, expiry_date, is_default = false }) {
        // If this is set as default, unset any existing default
        if (is_default) {
            await pool.query(
                'UPDATE user_payment_methods SET is_default = false WHERE user_id = $1',
                [user_id]
            );
        }

        const query = `
            INSERT INTO user_payment_methods (user_id, payment_type, last_four, expiry_date, is_default)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [user_id, payment_type, last_four, expiry_date, is_default];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async getByUserId(user_id) {
        const query = 'SELECT * FROM user_payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC';
        const { rows } = await pool.query(query, [user_id]);
        return rows;
    }

    static async setDefault(id, user_id) {
        // First unset any existing default
        await pool.query(
            'UPDATE user_payment_methods SET is_default = false WHERE user_id = $1',
            [user_id]
        );

        // Set the new default
        const query = `
            UPDATE user_payment_methods 
            SET is_default = true 
            WHERE id = $1 AND user_id = $2 
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id, user_id]);
        return rows[0];
    }

    static async delete(id, user_id) {
        const query = 'DELETE FROM user_payment_methods WHERE id = $1 AND user_id = $2 RETURNING *';
        const { rows } = await pool.query(query, [id, user_id]);
        return rows[0];
    }
}

module.exports = PaymentMethod; 