const emailService = require('./utils/emailService');
require('dotenv').config();

async function testEmailConfiguration() {
  console.log('Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('❌ Email configuration incomplete. Please check your .env file.');
    return;
  }

  try {
    // Test sending a simple email
    const testEmail = process.env.EMAIL_USER; // Send to yourself for testing
    console.log(`Sending test email to: ${testEmail}`);
    
    await emailService.sendEmail({
      to: testEmail,
      subject: 'Test Email - YJ Child Care Plus',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify your nodemailer configuration with Google App Password.</p>
        <p>If you received this email, your email service is working correctly!</p>
        <br>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Check your inbox (and spam folder) for the test email.');
    
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    console.log('Please check your email configuration and try again.');
  }
}

// Run the test
testEmailConfiguration(); 