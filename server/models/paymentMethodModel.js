const pool = require('../config/db');

// Get all payment methods for a user, default first
async function getUserPaymentMethods(userId) {
    const result = await pool.query(
        'SELECT * FROM user_payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
        [userId]
    );
    return result.rows;
}

// Add a payment method
async function addPaymentMethod(data) {
    const { user_id, payment_type, last_four, expiry_date, is_default } = data;
    const result = await pool.query(
        'INSERT INTO user_payment_methods (user_id, payment_type, last_four, expiry_date, is_default) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user_id, payment_type, last_four, expiry_date, is_default]
    );
    return result.rows[0];
}

// Delete a payment method
async function deletePaymentMethod(id) {
    await pool.query('DELETE FROM user_payment_methods WHERE id = $1', [id]);
}

// Set a payment method as default for a user
async function setDefaultPaymentMethod(id, user_id) {
    // Unset any existing default
    await pool.query('UPDATE user_payment_methods SET is_default = false WHERE user_id = $1', [user_id]);
    // Set the new default
    const result = await pool.query(
        'UPDATE user_payment_methods SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, user_id]
    );
    return result.rows[0];
}

// Update a payment method
async function updatePaymentMethod(id, user_id, updates) {
    const { payment_type, last_four, expiry_date, is_default } = updates;
    const result = await pool.query(
        `UPDATE user_payment_methods
         SET payment_type = $1, last_four = $2, expiry_date = $3, is_default = $4
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [payment_type, last_four, expiry_date, is_default, id, user_id]
    );
    return result.rows[0];
}

module.exports = {
    getUserPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    updatePaymentMethod,
}; 