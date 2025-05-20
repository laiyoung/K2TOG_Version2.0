const pool = require('../config/db');

class Notification {
    // Create a new notification
    static async create({ user_id, type, title, message, action_url = null, metadata = {} }) {
        const query = `
            INSERT INTO user_notifications (
                user_id, type, title, message, action_url, metadata, is_read
            )
            VALUES ($1, $2, $3, $4, $5, $6, false)
            RETURNING *
        `;
        const values = [user_id, type, title, message, action_url, metadata];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // Create bulk notifications for multiple users
    static async createBulk(notifications) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const createdNotifications = [];
            for (const notification of notifications) {
                const { rows } = await client.query(`
                    INSERT INTO user_notifications (
                        user_id, type, title, message, action_url, metadata, is_read
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, false)
                    RETURNING *
                `, [
                    notification.user_id,
                    notification.type,
                    notification.title,
                    notification.message,
                    notification.action_url || null,
                    notification.metadata || {}
                ]);
                createdNotifications.push(rows[0]);
            }
            
            await client.query('COMMIT');
            return createdNotifications;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Get notifications for a user with pagination
    static async getByUserId(user_id, { page = 1, limit = 10, includeRead = false } = {}) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT *
            FROM user_notifications
            WHERE user_id = $1
            ${includeRead ? '' : 'AND is_read = false'}
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const countQuery = `
            SELECT COUNT(*)
            FROM user_notifications
            WHERE user_id = $1
            ${includeRead ? '' : 'AND is_read = false'}
        `;

        const [notifications, count] = await Promise.all([
            pool.query(query, [user_id, limit, offset]),
            pool.query(countQuery, [user_id])
        ]);

        return {
            notifications: notifications.rows,
            total: parseInt(count.rows[0].count),
            page,
            totalPages: Math.ceil(parseInt(count.rows[0].count) / limit)
        };
    }

    // Mark notification as read
    static async markAsRead(notification_id, user_id) {
        const query = `
            UPDATE user_notifications
            SET is_read = true
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        const { rows } = await pool.query(query, [notification_id, user_id]);
        return rows[0];
    }

    // Mark all notifications as read for a user
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

    // Delete a notification
    static async delete(notification_id, user_id) {
        const query = `
            DELETE FROM user_notifications
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        const { rows } = await pool.query(query, [notification_id, user_id]);
        return rows[0];
    }

    // Get unread notification count for a user
    static async getUnreadCount(user_id) {
        const query = `
            SELECT COUNT(*)
            FROM user_notifications
            WHERE user_id = $1 AND is_read = false
        `;
        const { rows } = await pool.query(query, [user_id]);
        return parseInt(rows[0].count);
    }

    // Create notification templates
    static async createTemplate({ name, type, title_template, message_template, metadata = {} }) {
        const query = `
            INSERT INTO notification_templates (
                name, type, title_template, message_template, metadata
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [name, type, title_template, message_template, metadata];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // Get notification template by name
    static async getTemplate(name) {
        const query = `
            SELECT *
            FROM notification_templates
            WHERE name = $1
        `;
        const { rows } = await pool.query(query, [name]);
        return rows[0];
    }

    // Create notification using template
    static async createFromTemplate(template_name, user_id, variables = {}, action_url = null) {
        const template = await this.getTemplate(template_name);
        if (!template) {
            throw new Error('Notification template not found');
        }

        // Replace variables in templates
        const title = this.replaceTemplateVariables(template.title_template, variables);
        const message = this.replaceTemplateVariables(template.message_template, variables);

        return this.create({
            user_id,
            type: template.type,
            title,
            message,
            action_url,
            metadata: { ...template.metadata, template_name, variables }
        });
    }

    // Helper function to replace variables in template strings
    static replaceTemplateVariables(template, variables) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return variables[key] !== undefined ? variables[key] : match;
        });
    }

    // Create bulk notifications using template
    static async createBulkFromTemplate(template_name, user_ids, variables = {}, action_url = null) {
        const template = await this.getTemplate(template_name);
        if (!template) {
            throw new Error('Notification template not found');
        }

        const notifications = user_ids.map(user_id => ({
            user_id,
            type: template.type,
            title: this.replaceTemplateVariables(template.title_template, variables),
            message: this.replaceTemplateVariables(template.message_template, variables),
            action_url,
            metadata: { ...template.metadata, template_name, variables }
        }));

        return this.createBulk(notifications);
    }
}

module.exports = Notification; 