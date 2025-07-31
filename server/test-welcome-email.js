const emailService = require('./utils/emailService');
require('dotenv').config();

async function testWelcomeEmail() {
  console.log('🧪 Testing Welcome Email Functionality...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set');
  console.log('CLIENT_URL:', process.env.CLIENT_URL || 'Not set');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('❌ Email configuration incomplete. Please check your .env file.');
    console.log('📝 Make sure EMAIL_USER and EMAIL_APP_PASSWORD are set in server/.env');
    return;
  }

  try {
    // Test sending a welcome email
    const testEmail = process.env.EMAIL_USER; // Send to yourself for testing
    const testUserName = 'Test User';
    
    console.log(`📧 Sending welcome email to: ${testEmail}`);
    console.log(`👤 Test user name: ${testUserName}`);
    
    await emailService.sendWelcomeEmail(testEmail, testUserName);
    
    console.log('✅ Welcome email sent successfully!');
    console.log('📬 Check your inbox (and spam folder) for the welcome email.');
    console.log('🎨 The email should have a beautiful, professional design with:');
    console.log('   - Personalized greeting with the user\'s name');
    console.log('   - Professional development focus for childcare providers');
    console.log('   - Information about training programs and certifications');
    console.log('   - Call-to-action button to access the dashboard');
    console.log('   - Contact information for support');
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    console.log('🔧 Please check your email configuration and try again.');
    console.log('📋 Common issues:');
    console.log('   - Invalid Google App Password');
    console.log('   - 2-Factor Authentication not enabled');
    console.log('   - Gmail account restrictions');
  }
}

// Run the test
testWelcomeEmail(); 