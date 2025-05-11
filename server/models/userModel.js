const pool = require('../config/db');

class User {
    static async create({ email, password, first_name, last_name, phone_number, profile_picture_url }) {
        const query = `
            INSERT INTO users (email, password, first_name, last_name, phone_number, profile_picture_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, first_name, last_name, phone_number, profile_picture_url, created_at
        `;
        const values = [email, password, first_name, last_name, phone_number, profile_picture_url];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async updateProfile(id, { first_name, last_name, phone_number, profile_picture_url, email_notifications, sms_notifications }) {
        const query = `
            UPDATE users 
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                phone_number = COALESCE($3, phone_number),
                profile_picture_url = COALESCE($4, profile_picture_url),
                email_notifications = COALESCE($5, email_notifications),
                sms_notifications = COALESCE($6, sms_notifications)
            WHERE id = $7
            RETURNING id, email, first_name, last_name, phone_number, profile_picture_url, 
                     email_notifications, sms_notifications, created_at, updated_at
        `;
        const values = [first_name, last_name, phone_number, profile_picture_url, 
                       email_notifications, sms_notifications, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async updatePassword(id, hashedPassword) {
        const query = 'UPDATE users SET password = $1 WHERE id = $2 RETURNING id';
        const { rows } = await pool.query(query, [hashedPassword, id]);
        return rows[0];
    }

    static async getProfileWithDetails(id) {
        const query = `
            SELECT 
                u.*,
                json_agg(DISTINCT jsonb_build_object(
                    'id', c.id,
                    'certificate_name', c.certificate_name,
                    'issue_date', c.issue_date,
                    'certificate_url', c.certificate_url
                )) FILTER (WHERE c.id IS NOT NULL) as certificates,
                json_agg(DISTINCT jsonb_build_object(
                    'id', p.id,
                    'payment_type', p.payment_type,
                    'last_four', p.last_four,
                    'expiry_date', p.expiry_date,
                    'is_default', p.is_default
                )) FILTER (WHERE p.id IS NOT NULL) as payment_methods
            FROM users u
            LEFT JOIN user_certificates c ON u.id = c.user_id
            LEFT JOIN user_payment_methods p ON u.id = p.user_id
            WHERE u.id = $1
            GROUP BY u.id
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = User;
