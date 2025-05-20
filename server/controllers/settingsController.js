const Settings = require('../models/settingsModel');
const { logUserActivity } = require('../models/userModel');

// @desc    Get all security settings
// @route   GET /api/admin/settings/security
// @access  Private/Admin
const getSecuritySettings = async (req, res) => {
    try {
        const settings = await Settings.getSecuritySettings();
        res.json(settings);
    } catch (error) {
        console.error('Get security settings error:', error);
        res.status(500).json({ error: 'Failed to get security settings' });
    }
};

// @desc    Update security settings
// @route   PUT /api/admin/settings/security
// @access  Private/Admin
const updateSecuritySettings = async (req, res) => {
    try {
        const settings = req.body;
        const updatedSettings = await Settings.updateSecuritySettings(settings, req.user.id);
        
        // Log the activity
        await logUserActivity(req.user.id, 'security_settings_updated', {
            updated_settings: Object.keys(settings)
        });

        res.json(updatedSettings);
    } catch (error) {
        console.error('Update security settings error:', error);
        res.status(500).json({ error: 'Failed to update security settings' });
    }
};

// @desc    Get all integration settings
// @route   GET /api/admin/settings/integrations
// @access  Private/Admin
const getIntegrationSettings = async (req, res) => {
    try {
        const settings = await Settings.getIntegrationSettings();
        res.json(settings);
    } catch (error) {
        console.error('Get integration settings error:', error);
        res.status(500).json({ error: 'Failed to get integration settings' });
    }
};

// @desc    Update integration settings
// @route   PUT /api/admin/settings/integrations
// @access  Private/Admin
const updateIntegrationSettings = async (req, res) => {
    try {
        const settings = req.body;
        const updatedSettings = await Settings.updateIntegrationSettings(settings, req.user.id);
        
        // Log the activity
        await logUserActivity(req.user.id, 'integration_settings_updated', {
            updated_settings: Object.keys(settings)
        });

        res.json(updatedSettings);
    } catch (error) {
        console.error('Update integration settings error:', error);
        res.status(500).json({ error: 'Failed to update integration settings' });
    }
};

// @desc    Generate new API key
// @route   POST /api/admin/settings/api-keys
// @access  Private/Admin
const generateApiKey = async (req, res) => {
    try {
        const { name, permissions } = req.body;

        if (!name || !permissions) {
            return res.status(400).json({ 
                error: 'Name and permissions are required' 
            });
        }

        const apiKey = await Settings.generateApiKey(name, permissions, req.user.id);
        
        // Log the activity
        await logUserActivity(req.user.id, 'api_key_generated', {
            key_name: name,
            permissions: permissions
        });

        res.json(apiKey);
    } catch (error) {
        console.error('Generate API key error:', error);
        res.status(500).json({ error: 'Failed to generate API key' });
    }
};

// @desc    Revoke API key
// @route   DELETE /api/admin/settings/api-keys/:keyId
// @access  Private/Admin
const revokeApiKey = async (req, res) => {
    try {
        const { keyId } = req.params;
        const revokedKey = await Settings.revokeApiKey(keyId, req.user.id);
        
        // Log the activity
        await logUserActivity(req.user.id, 'api_key_revoked', {
            key_id: keyId,
            key_name: revokedKey.name
        });

        res.json({ 
            message: 'API key revoked successfully',
            key: revokedKey
        });
    } catch (error) {
        console.error('Revoke API key error:', error);
        res.status(500).json({ error: 'Failed to revoke API key' });
    }
};

// @desc    Get API key usage
// @route   GET /api/admin/settings/api-keys/:keyId/usage
// @access  Private/Admin
const getApiKeyUsage = async (req, res) => {
    try {
        const { keyId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ 
                error: 'Start date and end date are required' 
            });
        }

        const usage = await Settings.getApiKeyUsage(keyId, startDate, endDate);
        res.json(usage);
    } catch (error) {
        console.error('Get API key usage error:', error);
        res.status(500).json({ error: 'Failed to get API key usage' });
    }
};

// @desc    Get all API keys
// @route   GET /api/admin/settings/api-keys
// @access  Private/Admin
const getAllApiKeys = async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                name,
                permissions,
                created_at,
                expires_at,
                status,
                last_used_at,
                created_by,
                revoked_at,
                revoked_by
            FROM api_keys
            ORDER BY created_at DESC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Get all API keys error:', error);
        res.status(500).json({ error: 'Failed to get API keys' });
    }
};

// @desc    Get system usage statistics
// @route   GET /api/admin/settings/usage-stats
// @access  Private/Admin
const getSystemUsageStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ 
                error: 'Start date and end date are required' 
            });
        }

        const query = `
            WITH api_stats AS (
                SELECT 
                    DATE_TRUNC('hour', created_at) as time_period,
                    COUNT(*) as total_requests,
                    COUNT(DISTINCT api_key_id) as active_keys,
                    COUNT(DISTINCT endpoint) as unique_endpoints,
                    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
                    AVG(response_time) as avg_response_time
                FROM api_requests
                WHERE created_at BETWEEN $1 AND $2
                GROUP BY DATE_TRUNC('hour', created_at)
            ),
            user_stats AS (
                SELECT 
                    DATE_TRUNC('hour', created_at) as time_period,
                    COUNT(DISTINCT user_id) as active_users,
                    COUNT(*) as total_actions
                FROM user_activity_log
                WHERE created_at BETWEEN $1 AND $2
                GROUP BY DATE_TRUNC('hour', created_at)
            )
            SELECT 
                COALESCE(a.time_period, u.time_period) as time_period,
                a.total_requests,
                a.active_keys,
                a.unique_endpoints,
                a.error_count,
                a.avg_response_time,
                u.active_users,
                u.total_actions
            FROM api_stats a
            FULL OUTER JOIN user_stats u ON a.time_period = u.time_period
            ORDER BY time_period DESC
        `;
        const { rows } = await pool.query(query, [startDate, endDate]);
        res.json(rows);
    } catch (error) {
        console.error('Get system usage stats error:', error);
        res.status(500).json({ error: 'Failed to get system usage statistics' });
    }
};

module.exports = {
    getSecuritySettings,
    updateSecuritySettings,
    getIntegrationSettings,
    updateIntegrationSettings,
    generateApiKey,
    revokeApiKey,
    getApiKeyUsage,
    getAllApiKeys,
    getSystemUsageStats
}; 