const pool = require('../config/db');

// Save a Stripe payment record
const savePayment = async ({
  userId,
  classId,
  stripePaymentId,
  amount,
  currency,
  status
}) => {
  const result = await pool.query(
    `INSERT INTO payments (user_id, class_id, stripe_payment_id, amount, currency, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, classId, stripePaymentId, amount, currency, status]
  );
  return result.rows[0];
};

// Get all payments for a specific user
const getPaymentsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

// Get a specific payment by Stripe payment ID
const getPaymentByStripeId = async (stripePaymentId) => {
  const result = await pool.query(
    `SELECT * FROM payments WHERE stripe_payment_id = $1`,
    [stripePaymentId]
  );
  return result.rows[0];
};

module.exports = {
  savePayment,
  getPaymentsByUser,
  getPaymentByStripeId,
};
