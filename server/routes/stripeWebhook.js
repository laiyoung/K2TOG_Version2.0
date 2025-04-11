// routes/stripeWebhook.js
const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const { savePayment } = require('../models/paymentModel');
const { enrollUserInClass } = require('../models/enrollmentModel');

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, classId } = session.metadata;

      // Save payment to DB
      await savePayment({
        userId,
        classId,
        stripePaymentId: session.payment_intent,
        amount: session.amount_total / 100,
        currency: session.currency,
        status: session.payment_status
      });

      // Enroll user
      await enrollUserInClass(userId, classId, session.payment_status);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
