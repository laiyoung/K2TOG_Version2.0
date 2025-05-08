// server/index.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();
// express.raw(); // For Stripe webhook

const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');;
const stripeWebhook = require('./routes/stripeWebhook');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const devLogger = require('./middleware/devLogger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/enrollments', enrollmentRoutes);
// app.use('/api/payments', paymentRoutes);
app.use('/api/webhook', stripeWebhook); 
app.use('/api/admin', adminRoutes);
app.use(devLogger);
app.use(errorHandler); // place this last!

// Root endpoint
app.get('/', (req, res) => {
  res.send('Education API is running...');
});

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;