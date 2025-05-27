const pool = require('../config/db');

// Save a Stripe payment record
const savePayment = async ({
  userId,
  classId,
  stripePaymentId,
  amount,
  currency,
  status,
  refundStatus = null,
  refundAmount = null,
  refundReason = null
}) => {
  const result = await pool.query(
    `INSERT INTO payments (
      user_id, 
      class_id, 
      stripe_payment_id, 
      amount, 
      currency, 
      status,
      refund_status,
      refund_amount,
      refund_reason,
      refunded_at
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      userId, 
      classId, 
      stripePaymentId, 
      amount, 
      currency, 
      status,
      refundStatus,
      refundAmount,
      refundReason,
      refundStatus ? new Date() : null
    ]
  );
  return result.rows[0];
};

// Process a refund
const processRefund = async (paymentId, {
  refundAmount,
  refundReason,
  adminId
}) => {
  const result = await pool.query(
    `UPDATE payments 
     SET refund_status = 'processed',
         refund_amount = $1,
         refund_reason = $2,
         refunded_at = CURRENT_TIMESTAMP,
         refunded_by = $3
     WHERE id = $4 AND refund_status IS NULL
     RETURNING *`,
    [refundAmount, refundReason, adminId, paymentId]
  );
  return result.rows[0];
};

// Get payment by ID
const getPaymentById = async (paymentId) => {
  const result = await pool.query(`
    SELECT p.*, 
           u.name as user_name, 
           u.email as user_email,
           c.title as class_title,
           a.name as refunded_by_name
    FROM payments p
    JOIN users u ON u.id = p.user_id
    JOIN classes c ON c.id = p.class_id
    LEFT JOIN users a ON a.id = p.refunded_by
    WHERE p.id = $1
  `, [paymentId]);
  return result.rows[0];
};

// Get all payments with filters
const getAllPayments = async ({
  startDate,
  endDate,
  status,
  refundStatus,
  userId,
  classId
} = {}) => {
  let query = `
    SELECT p.*, 
           u.name as user_name, 
           u.email as user_email,
           c.title as class_title,
           a.name as refunded_by_name
    FROM payments p
    JOIN users u ON u.id = p.user_id
    JOIN classes c ON c.id = p.class_id
    LEFT JOIN users a ON a.id = p.refunded_by
    WHERE 1=1
  `;
  const values = [];
  let valueIndex = 1;

  if (startDate) {
    query += ` AND p.created_at >= $${valueIndex}`;
    values.push(startDate);
    valueIndex++;
  }
  if (endDate) {
    query += ` AND p.created_at <= $${valueIndex}`;
    values.push(endDate);
    valueIndex++;
  }
  if (status) {
    query += ` AND p.status = $${valueIndex}`;
    values.push(status);
    valueIndex++;
  }
  if (refundStatus) {
    query += ` AND p.refund_status = $${valueIndex}`;
    values.push(refundStatus);
    valueIndex++;
  }
  if (userId) {
    query += ` AND p.user_id = $${valueIndex}`;
    values.push(userId);
    valueIndex++;
  }
  if (classId) {
    query += ` AND p.class_id = $${valueIndex}`;
    values.push(classId);
    valueIndex++;
  }

  query += ` ORDER BY p.created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

// Get financial summary
const getFinancialSummary = async (startDate, endDate) => {
  const result = await pool.query(`
    SELECT 
      COUNT(*) as total_transactions,
      SUM(amount) as total_revenue,
      SUM(CASE WHEN refund_status = 'processed' THEN refund_amount ELSE 0 END) as total_refunds,
      COUNT(CASE WHEN refund_status = 'processed' THEN 1 END) as refund_count,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
    FROM payments
    WHERE created_at BETWEEN $1 AND $2
  `, [startDate, endDate]);
  return result.rows[0];
};

// Get revenue by class
const getRevenueByClass = async (startDate, endDate) => {
  const result = await pool.query(`
    SELECT 
      c.id as class_id,
      c.title as class_title,
      COUNT(p.id) as total_transactions,
      SUM(p.amount) as total_revenue,
      SUM(CASE WHEN p.refund_status = 'processed' THEN p.refund_amount ELSE 0 END) as total_refunds
    FROM classes c
    LEFT JOIN payments p ON p.class_id = c.id 
      AND p.created_at BETWEEN $1 AND $2
    GROUP BY c.id, c.title
    ORDER BY total_revenue DESC
  `, [startDate, endDate]);
  return result.rows;
};

// Get all payments for a specific user
const getPaymentsByUser = async (userId) => {
  const result = await pool.query(`
    SELECT p.*, 
           c.title as class_title,
           a.name as refunded_by_name
    FROM payments p
    JOIN classes c ON c.id = p.class_id
    LEFT JOIN users a ON a.id = p.refunded_by
    WHERE p.user_id = $1 
    ORDER BY p.created_at DESC
  `, [userId]);
  return result.rows;
};

// Get a specific payment by Stripe payment ID
const getPaymentByStripeId = async (stripePaymentId) => {
  const result = await pool.query(`
    SELECT p.*, 
           u.name as user_name,
           c.title as class_title,
           a.name as refunded_by_name
    FROM payments p
    JOIN users u ON u.id = p.user_id
    JOIN classes c ON c.id = p.class_id
    LEFT JOIN users a ON a.id = p.refunded_by
    WHERE p.stripe_payment_id = $1
  `, [stripePaymentId]);
  return result.rows[0];
};

// Get all payments (simple version)
async function getAllPaymentsSimple() {
  const result = await pool.query('SELECT * FROM payments');
  return result.rows;
}

// Get payment by ID (simple version)
async function getPaymentByIdSimple(id) {
  const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
  return result.rows[0];
}

// Create payment
async function createPayment(data) {
  const { user_id, class_id, stripe_payment_id, amount, currency, status, refund_status, refund_amount, refund_reason, refunded_at, refunded_by } = data;
  const result = await pool.query(
    'INSERT INTO payments (user_id, class_id, stripe_payment_id, amount, currency, status, refund_status, refund_amount, refund_reason, refunded_at, refunded_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
    [user_id, class_id, stripe_payment_id, amount, currency, status, refund_status, refund_amount, refund_reason, refunded_at, refunded_by]
  );
  return result.rows[0];
}

// Delete payment
async function deletePayment(id) {
  await pool.query('DELETE FROM payments WHERE id = $1', [id]);
}

// Get outstanding payments with statistics
const getOutstandingPayments = async ({ startDate, endDate } = {}) => {
  // Get outstanding payments
  const paymentsQuery = `
    SELECT 
      p.id,
      p.user_id,
      u.name as student_name,
      u.email as student_email,
      p.class_id,
      c.title as class_name,
      p.amount,
      p.due_date,
      CASE 
        WHEN p.due_date < CURRENT_DATE THEN 'overdue'
        WHEN p.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'upcoming'
      END as status,
      CASE 
        WHEN p.due_date < CURRENT_DATE THEN CURRENT_DATE - p.due_date
        ELSE p.due_date - CURRENT_DATE
      END as days_difference,
      p.payment_method,
      p.last_four
    FROM payments p
    JOIN users u ON u.id = p.user_id
    JOIN classes c ON c.id = p.class_id
    WHERE p.status = 'pending'
    AND p.due_date IS NOT NULL
    ${startDate ? 'AND p.due_date >= $1' : ''}
    ${endDate ? 'AND p.due_date <= $2' : ''}
    ORDER BY p.due_date ASC
  `;

  // Get payment statistics
  const statsQuery = `
    SELECT 
      SUM(amount) as total_outstanding,
      SUM(CASE WHEN due_date < CURRENT_DATE THEN amount ELSE 0 END) as overdue_amount,
      COUNT(CASE WHEN due_date < CURRENT_DATE THEN 1 END) as overdue_count,
      SUM(CASE WHEN due_date <= CURRENT_DATE + INTERVAL '7 days' AND due_date >= CURRENT_DATE THEN amount ELSE 0 END) as due_soon_amount,
      COUNT(CASE WHEN due_date <= CURRENT_DATE + INTERVAL '7 days' AND due_date >= CURRENT_DATE THEN 1 END) as due_soon_count
    FROM payments
    WHERE status = 'pending'
    AND due_date IS NOT NULL
    ${startDate ? 'AND due_date >= $1' : ''}
    ${endDate ? 'AND due_date <= $2' : ''}
  `;

  const values = [];
  if (startDate) values.push(startDate);
  if (endDate) values.push(endDate);

  const [paymentsResult, statsResult] = await Promise.all([
    pool.query(paymentsQuery, values),
    pool.query(statsQuery, values)
  ]);

  const payments = paymentsResult.rows.map(payment => ({
    ...payment,
    days_overdue: payment.status === 'overdue' ? payment.days_difference : null,
    days_until_due: payment.status !== 'overdue' ? payment.days_difference : null
  }));

  return {
    payments,
    stats: statsResult.rows[0] || {
      total_outstanding: 0,
      overdue_amount: 0,
      overdue_count: 0,
      due_soon_amount: 0,
      due_soon_count: 0
    }
  };
};

module.exports = {
  savePayment,
  processRefund,
  getPaymentById,
  getAllPayments,
  getFinancialSummary,
  getRevenueByClass,
  getPaymentsByUser,
  getPaymentByStripeId,
  getAllPaymentsSimple,
  getPaymentByIdSimple,
  createPayment,
  deletePayment,
  getOutstandingPayments
};
