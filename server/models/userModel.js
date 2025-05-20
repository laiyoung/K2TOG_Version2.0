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

    // Role Management Functions
    static async updateUserRole(userId, newRole, updatedBy) {
        const validRoles = ['user', 'admin', 'instructor'];
        if (!validRoles.includes(newRole)) {
            throw new Error('Invalid role specified');
        }

        const query = `
            UPDATE users 
            SET role = $1 
            WHERE id = $2 
            RETURNING id, email, role, first_name, last_name
        `;
        const { rows } = await pool.query(query, [newRole, userId]);

        // Log the role change
        await this.logUserActivity(userId, 'role_update', {
            previous_role: rows[0]?.role,
            new_role: newRole,
            updated_by: updatedBy
        });

        return rows[0];
    }

    static async getUsersByRole(role) {
        const query = `
            SELECT id, email, role, first_name, last_name, phone_number, 
                   created_at, updated_at
            FROM users 
            WHERE role = $1
            ORDER BY created_at DESC
        `;
        const { rows } = await pool.query(query, [role]);
        return rows;
    }

    // Activity Tracking Functions
    static async logUserActivity(userId, action, details = {}) {
        const query = `
            INSERT INTO user_activity_log (user_id, action, details)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [userId, action, details]);
        return rows[0];
    }

    static async getUserActivity(userId, options = {}) {
        const { limit = 50, offset = 0, action = null, startDate = null, endDate = null } = options;
        
        let query = `
            SELECT * FROM user_activity_log
            WHERE user_id = $1
        `;
        const queryParams = [userId];
        let paramCount = 1;

        if (action) {
            paramCount++;
            query += ` AND action = $${paramCount}`;
            queryParams.push(action);
        }

        if (startDate) {
            paramCount++;
            query += ` AND created_at >= $${paramCount}`;
            queryParams.push(startDate);
        }

        if (endDate) {
            paramCount++;
            query += ` AND created_at <= $${paramCount}`;
            queryParams.push(endDate);
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        queryParams.push(limit, offset);

        const { rows } = await pool.query(query, queryParams);
        return rows;
    }

    // Search and Filter Functions
    static async searchUsers(searchParams = {}) {
        const {
            searchTerm = '',
            role = null,
            sortBy = 'created_at',
            sortOrder = 'DESC',
            limit = 50,
            offset = 0,
            includeInactive = false
        } = searchParams;

        let query = `
            SELECT 
                u.id, u.email, u.role, u.first_name, u.last_name, 
                u.phone_number, u.created_at, u.updated_at,
                COUNT(*) OVER() as total_count
            FROM users u
            WHERE 1=1
        `;
        const queryParams = [];
        let paramCount = 0;

        if (searchTerm) {
            paramCount += 1;
            query += `
                AND (
                    u.email ILIKE $${paramCount} OR
                    u.first_name ILIKE $${paramCount} OR
                    u.last_name ILIKE $${paramCount} OR
                    u.phone_number ILIKE $${paramCount}
                )
            `;
            queryParams.push(`%${searchTerm}%`);
        }

        if (role) {
            paramCount += 1;
            query += ` AND u.role = $${paramCount}`;
            queryParams.push(role);
        }

        if (!includeInactive) {
            query += ` AND u.status = 'active'`;
        }

        // Validate sort parameters
        const validSortColumns = ['created_at', 'email', 'first_name', 'last_name', 'role'];
        const validSortOrders = ['ASC', 'DESC'];
        
        const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        query += ` ORDER BY u.${finalSortBy} ${finalSortOrder}`;
        query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        queryParams.push(limit, offset);

        const { rows } = await pool.query(query, queryParams);
        return {
            users: rows,
            total: rows.length > 0 ? parseInt(rows[0].total_count) : 0
        };
    }

    // User Status Management
    static async updateUserStatus(userId, status, updatedBy) {
        const validStatuses = ['active', 'inactive', 'suspended'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status specified');
        }

        const query = `
            UPDATE users 
            SET status = $1 
            WHERE id = $2 
            RETURNING id, email, status, first_name, last_name
        `;
        const { rows } = await pool.query(query, [status, userId]);

        // Log the status change
        await this.logUserActivity(userId, 'status_update', {
            previous_status: rows[0]?.status,
            new_status: status,
            updated_by: updatedBy
        });

        return rows[0];
    }
}

module.exports = User;
