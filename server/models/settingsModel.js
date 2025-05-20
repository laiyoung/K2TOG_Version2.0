const pool = require('../config/db');

class Settings {
    // Security Settings Methods

    // Get all security settings
    static async getSecuritySettings() {
        const query = `
            SELECT 
                category,
                setting_key,
                setting_value,
                description,
                updated_at,
                updated_by
            FROM system_settings
            WHERE category IN ('password_policy', 'session_management', 'access_control')
            ORDER BY category, setting_key
        `;
        const { rows } = await pool.query(query);
        return this.groupSettingsByCategory(rows);
    }

    // Update security settings
    static async updateSecuritySettings(settings, updatedBy) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const [key, value] of Object.entries(settings)) {
                const query = `
                    UPDATE system_settings
                    SET setting_value = $1,
                        updated_at = NOW(),
                        updated_by = $2
                    WHERE setting_key = $3
                    RETURNING *
                `;
                await client.query(query, [value, updatedBy, key]);
            }

            await client.query('COMMIT');
            return await this.getSecuritySettings();
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Integration Settings Methods

    // Get all integration settings
    static async getIntegrationSettings() {
        const query = `
            SELECT 
                category,
                setting_key,
                setting_value,
                description,
                is_encrypted,
                updated_at,
                updated_by
            FROM system_settings
            WHERE category IN ('api_keys', 'third_party_services')
            ORDER BY category, setting_key
        `;
        const { rows } = await pool.query(query);
        return this.groupSettingsByCategory(rows);
    }

    // Update integration settings
    static async updateIntegrationSettings(settings, updatedBy) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const [key, value] of Object.entries(settings)) {
                const query = `
                    UPDATE system_settings
                    SET setting_value = $1,
                        updated_at = NOW(),
                        updated_by = $2
                    WHERE setting_key = $3
                    RETURNING *
                `;
                await client.query(query, [value, updatedBy, key]);
            }

            await client.query('COMMIT');
            return await this.getIntegrationSettings();
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // API Key Management

    // Generate new API key
    static async generateApiKey(name, permissions, createdBy) {
        const apiKey = this.generateSecureKey();
        const query = `
            INSERT INTO api_keys (
                name,
                key_value,
                permissions,
                created_by,
                status
            ) VALUES ($1, $2, $3, $4, 'active')
            RETURNING id, name, key_value, permissions, created_at, expires_at
        `;
        const { rows } = await pool.query(query, [name, apiKey, permissions, createdBy]);
        return rows[0];
    }

    // Revoke API key
    static async revokeApiKey(keyId, revokedBy) {
        const query = `
            UPDATE api_keys
            SET status = 'revoked',
                revoked_at = NOW(),
                revoked_by = $1
            WHERE id = $2
            RETURNING *
        `;
        const { rows } = await pool.query(query, [revokedBy, keyId]);
        return rows[0];
    }

    // Get API key usage
    static async getApiKeyUsage(keyId, startDate, endDate) {
        const query = `
            SELECT 
                DATE_TRUNC('hour', created_at) as time_period,
                COUNT(*) as request_count,
                COUNT(DISTINCT endpoint) as unique_endpoints,
                COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
            FROM api_requests
            WHERE api_key_id = $1
            AND created_at BETWEEN $2 AND $3
            GROUP BY DATE_TRUNC('hour', created_at)
            ORDER BY time_period DESC
        `;
        const { rows } = await pool.query(query, [keyId, startDate, endDate]);
        return rows;
    }

    // Helper Methods

    // Group settings by category
    static groupSettingsByCategory(settings) {
        return settings.reduce((acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push(setting);
            return acc;
        }, {});
    }

    // Generate secure API key
    static generateSecureKey() {
        const crypto = require('crypto');
        return `sk_${crypto.randomBytes(32).toString('hex')}`;
    }

    // Initialize default settings
    static async initializeDefaultSettings() {
        const defaultSettings = [
            // Password Policy
            {
                category: 'password_policy',
                setting_key: 'min_length',
                setting_value: '8',
                description: 'Minimum password length'
            },
            {
                category: 'password_policy',
                setting_key: 'require_uppercase',
                setting_value: 'true',
                description: 'Require uppercase letters'
            },
            {
                category: 'password_policy',
                setting_key: 'require_numbers',
                setting_value: 'true',
                description: 'Require numbers'
            },
            {
                category: 'password_policy',
                setting_key: 'require_special_chars',
                setting_value: 'true',
                description: 'Require special characters'
            },
            {
                category: 'password_policy',
                setting_key: 'expiry_days',
                setting_value: '90',
                description: 'Password expiration in days'
            },
            {
                category: 'password_policy',
                setting_key: 'max_attempts',
                setting_value: '5',
                description: 'Maximum failed login attempts'
            },

            // Session Management
            {
                category: 'session_management',
                setting_key: 'timeout_minutes',
                setting_value: '30',
                description: 'Session timeout in minutes'
            },
            {
                category: 'session_management',
                setting_key: 'max_concurrent_sessions',
                setting_value: '3',
                description: 'Maximum concurrent sessions'
            },
            {
                category: 'session_management',
                setting_key: 'remember_me_days',
                setting_value: '30',
                description: 'Remember me duration in days'
            },

            // Access Control
            {
                category: 'access_control',
                setting_key: 'enable_2fa',
                setting_value: 'false',
                description: 'Enable two-factor authentication'
            },
            {
                category: 'access_control',
                setting_key: 'ip_whitelist',
                setting_value: '',
                description: 'Comma-separated list of allowed IPs'
            },
            {
                category: 'access_control',
                setting_key: 'rate_limit_requests',
                setting_value: '100',
                description: 'API rate limit per minute'
            },

            // Third-party Services
            {
                category: 'third_party_services',
                setting_key: 'stripe_public_key',
                setting_value: '',
                description: 'Stripe public key',
                is_encrypted: true
            },
            {
                category: 'third_party_services',
                setting_key: 'stripe_secret_key',
                setting_value: '',
                description: 'Stripe secret key',
                is_encrypted: true
            },
            {
                category: 'third_party_services',
                setting_key: 'email_service',
                setting_value: 'smtp',
                description: 'Email service provider'
            },
            {
                category: 'third_party_services',
                setting_key: 'smtp_host',
                setting_value: '',
                description: 'SMTP host',
                is_encrypted: true
            },
            {
                category: 'third_party_services',
                setting_key: 'smtp_port',
                setting_value: '587',
                description: 'SMTP port'
            },
            {
                category: 'third_party_services',
                setting_key: 'smtp_username',
                setting_value: '',
                description: 'SMTP username',
                is_encrypted: true
            },
            {
                category: 'third_party_services',
                setting_key: 'smtp_password',
                setting_value: '',
                description: 'SMTP password',
                is_encrypted: true
            }
        ];

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const setting of defaultSettings) {
                const query = `
                    INSERT INTO system_settings (
                        category,
                        setting_key,
                        setting_value,
                        description,
                        is_encrypted,
                        created_at,
                        updated_at
                    ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                    ON CONFLICT (category, setting_key) DO NOTHING
                `;
                await client.query(query, [
                    setting.category,
                    setting.setting_key,
                    setting.setting_value,
                    setting.description,
                    setting.is_encrypted || false
                ]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = Settings; 