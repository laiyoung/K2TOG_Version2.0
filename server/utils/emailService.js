const nodemailer = require('nodemailer');
require('dotenv').config();

// Debug logging
console.log('Email configuration check:');
console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
console.log('EMAIL_APP_PASSWORD exists:', !!process.env.EMAIL_APP_PASSWORD);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
console.log('Email service is disabled - email notifications will not be sent');

// Create a mock transporter instead of real one
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS
//   }
// });

// Verify transporter connection on startup
// transporter.verify(function (error, success) {
//   if (error) {
//     console.log('Email service error:', error);
//   } else {
//     console.log('Email server is ready to send messages');
//   }
// });

// Base email sending function (from sendEmail.js)
const sendEmail = async ({ to, subject, html }) => {
  // Mock email sending - always return success
  console.log('Email sending disabled - would have sent:', { to, subject });
  return true;
  // try {
  //   await transporter.sendMail({
  //     from: process.env.EMAIL_USER,
  //     to,
  //     subject,
  //     html
  //   });
  //   return true;
  // } catch (error) {
  //   console.error('Error sending email:', error);
  //   throw error;
  // }
};

// Email templates and functions
const emailService = {
  // Base send email function (can be used for any custom email)
  sendEmail,

  // Send a welcome email to new users
  async sendWelcomeEmail(userEmail, userName) {
    return sendEmail({
      to: userEmail,
      subject: 'Welcome to YJ Child Care Plus!',
      html: `
        <h1>Welcome to YJ Child Care Plus, ${userName}!</h1>
        <p>We're excited to have you join our community. Thank you for choosing YJ Child Care Plus for your childcare needs.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <br>
        <p>Best regards,</p>
        <p>The YJ Child Care Plus Team</p>
      `
    });
  },

  // Send appointment confirmation
  async sendAppointmentConfirmation(userEmail, appointmentDetails) {
    return sendEmail({
      to: userEmail,
      subject: 'Appointment Confirmation - YJ Child Care Plus',
      html: `
        <h1>Appointment Confirmation</h1>
        <p>Your appointment has been confirmed:</p>
        <ul>
          <li>Date: ${appointmentDetails.date}</li>
          <li>Time: ${appointmentDetails.time}</li>
          <li>Service: ${appointmentDetails.service}</li>
        </ul>
        <p>If you need to make any changes, please contact us as soon as possible.</p>
        <br>
        <p>Best regards,</p>
        <p>The YJ Child Care Plus Team</p>
      `
    });
  },

  // Send password reset email
  async sendPasswordResetEmail(userEmail, resetToken) {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    return sendEmail({
      to: userEmail,
      subject: 'Password Reset Request - YJ Child Care Plus',
      html: `
        <h1>Password Reset Request</h1>
        <p>You have requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,</p>
        <p>The YJ Child Care Plus Team</p>
      `
    });
  },

  // Send custom email (simplified version of the original sendCustomEmail)
  async sendCustomEmail(to, subject, htmlContent) {
    return sendEmail({ to, subject, html: htmlContent });
  }
};

module.exports = emailService; 