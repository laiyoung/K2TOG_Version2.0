// server/controllers/paymentController.js

const stripe = require('../config/stripe');
// const { savePayment, getPaymentsByUser } = require('../models/paymentModel');
const { getPaymentsByUser } = require('../models/paymentModel');
// const { enrollUserInClass } = require('../models/enrollmentModel');
const { getClassById } = require('../models/classModel');

// Create Stripe Checkout Session
const createCheckoutSession = async (req, res) => {
  const { classId } = req.body;
  const userId = req.user.id;

  try {
    const classInfo = await getClassById(classId);
    if (!classInfo) return res.status(404).json({ error: 'Class not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: classInfo.title,
            },
            unit_amount: Math.round(classInfo.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        classId,
      },
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

// Get user's past payments
const getUserPayments = async (req, res) => {
  const userId = req.user.id;

  try {
    const payments = await getPaymentsByUser(userId);
    res.json(payments);
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

module.exports = {
  createCheckoutSession,
  getUserPayments,
};

