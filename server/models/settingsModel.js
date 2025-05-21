const pool = require('../config/db');

// Get all settings
async function getAllSettings() {
  const result = await pool.query('SELECT * FROM system_settings');
  return result.rows;
}

// Get setting by ID
async function getSettingById(id) {
  const result = await pool.query('SELECT * FROM system_settings WHERE id = $1', [id]);
  return result.rows[0];
}

// Create a new setting
async function createSetting({ category, setting_key, setting_value, description, is_encrypted }) {
  const result = await pool.query(
    `INSERT INTO system_settings (category, setting_key, setting_value, description, is_encrypted)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [category, setting_key, setting_value, description, is_encrypted]
  );
  return result.rows[0];
}

// Update a setting
async function updateSetting(id, updates) {
  const { setting_value, description, is_encrypted } = updates;
  const result = await pool.query(
    `UPDATE system_settings SET setting_value = $1, description = $2, is_encrypted = $3, updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [setting_value, description, is_encrypted, id]
  );
  return result.rows[0];
}

// Delete a setting
async function deleteSetting(id) {
  await pool.query('DELETE FROM system_settings WHERE id = $1', [id]);
}

// API Key management
async function createApiKey({ name, key_value, permissions, created_by, expires_at }) {
  const result = await pool.query(
    `INSERT INTO api_keys (name, key_value, permissions, created_by, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, key_value, permissions, created_by, expires_at]
  );
  return result.rows[0];
}

async function revokeApiKey(id, revoked_by) {
  const result = await pool.query(
    `UPDATE api_keys SET status = 'revoked', revoked_at = NOW(), revoked_by = $1 WHERE id = $2 RETURNING *`,
    [revoked_by, id]
  );
  return result.rows[0];
}

async function getAllApiKeys() {
  const result = await pool.query('SELECT * FROM api_keys ORDER BY created_at DESC');
  return result.rows;
}

async function getApiKeyUsage(keyId, startDate, endDate) {
  const result = await pool.query(
    `SELECT * FROM api_requests WHERE api_key_id = $1 AND created_at BETWEEN $2 AND $3 ORDER BY created_at DESC`,
    [keyId, startDate, endDate]
  );
  return result.rows;
}

// Get all security settings
async function getSecuritySettings() {
  const result = await pool.query(
    `SELECT * FROM system_settings WHERE category = 'security'`
  );
  return result.rows;
}

// Update security settings (expects an object of key-value pairs)
async function updateSecuritySettings(settings, updated_by) {
  const updated = [];
  for (const [key, value] of Object.entries(settings)) {
    const result = await pool.query(
      `UPDATE system_settings SET setting_value = $1, updated_at = NOW() WHERE setting_key = $2 AND category = 'security' RETURNING *`,
      [value, key]
    );
    if (result.rows[0]) updated.push(result.rows[0]);
  }
  return updated;
}

// Get all integration settings
async function getIntegrationSettings() {
  const result = await pool.query(
    `SELECT * FROM system_settings WHERE category = 'integration'`
  );
  return result.rows;
}

// Update integration settings (expects an object of key-value pairs)
async function updateIntegrationSettings(settings, updated_by) {
  const updated = [];
  for (const [key, value] of Object.entries(settings)) {
    const result = await pool.query(
      `UPDATE system_settings SET setting_value = $1, updated_at = NOW() WHERE setting_key = $2 AND category = 'integration' RETURNING *`,
      [value, key]
    );
    if (result.rows[0]) updated.push(result.rows[0]);
  }
  return updated;
}

module.exports = {
  getAllSettings,
  getSettingById,
  createSetting,
  updateSetting,
  deleteSetting,
  createApiKey,
  revokeApiKey,
  getAllApiKeys,
  getApiKeyUsage,
  getSecuritySettings,
  updateSecuritySettings,
  getIntegrationSettings,
  updateIntegrationSettings,
}; 