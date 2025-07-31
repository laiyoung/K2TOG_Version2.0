const emailService = require('./utils/emailService');
require('dotenv').config();

async function testPasswordResetEmail() {
  console.log('🔐 Testing Password Reset Email Functionality...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set');
  console.log('CLIENT_URL:', process.env.CLIENT_URL || 'Not set');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('❌ Email configuration incomplete. Please check your .env file.');
    console.log('📝 Make sure EMAIL_USER and EMAIL_APP_PASSWORD are set in server/.env');
    return;
  }

  try {
    // Test sending a password reset email
    const testEmail = process.env.EMAIL_USER; // Send to yourself for testing
    const testResetToken = 'test-reset-token-123456789';
    
    console.log(`📧 Sending password reset email to: ${testEmail}`);
    console.log(`🔑 Test reset token: ${testResetToken}`);
    
    await emailService.sendPasswordResetEmail(testEmail, testResetToken);
    
    console.log('✅ Password reset email sent successfully!');
    console.log('📬 Check your inbox (and spam folder) for the password reset email.');
    console.log('🎨 The email should have a beautiful, professional design with:');
    console.log('   - Security-focused messaging');
    console.log('   - Important security notice section');
    console.log('   - Clear call-to-action button');
    console.log('   - Fallback link for manual copying');
    console.log('   - Contact information for support');
    console.log('   - Professional styling with security-themed colors');
    
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    console.log('🔧 Please check your email configuration and try again.');
    console.log('📋 Common issues:');
    console.log('   - Invalid Google App Password');
    console.log('   - 2-Factor Authentication not enabled');
    console.log('   - Gmail account restrictions');
  }
}

// Run the test
testPasswordResetEmail(); 