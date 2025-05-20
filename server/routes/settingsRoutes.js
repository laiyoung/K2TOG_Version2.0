const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const {
    getSecuritySettings,
    updateSecuritySettings,
    getIntegrationSettings,
    updateIntegrationSettings,
    generateApiKey,
    revokeApiKey,
    getApiKeyUsage,
    getAllApiKeys,
    getSystemUsageStats
} = require('../controllers/settingsController');

// All routes require authentication and admin privileges
router.use(requireAuth, requireAdmin);

// Security Settings Routes
router.get('/security', getSecuritySettings);
router.put('/security', updateSecuritySettings);

// Integration Settings Routes
router.get('/integrations', getIntegrationSettings);
router.put('/integrations', updateIntegrationSettings);

// API Key Management Routes
router.get('/api-keys', getAllApiKeys);
router.post('/api-keys', generateApiKey);
router.delete('/api-keys/:keyId', revokeApiKey);
router.get('/api-keys/:keyId/usage', getApiKeyUsage);

// System Usage Statistics Route
router.get('/usage-stats', getSystemUsageStats);

module.exports = router; 