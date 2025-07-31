require('dotenv').config();
const emailService = require('./utils/emailService');

async function testNotificationAlertEmails() {
    console.log('🧪 Testing Notification Alert Email Functions...\n');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set');
    console.log('CLIENT_URL:', process.env.CLIENT_URL || 'Not set');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.log('❌ Email configuration incomplete. Please check your .env file.');
        console.log('📝 Make sure EMAIL_USER and EMAIL_APP_PASSWORD are set in server/.env');
        return;
    }

    const testUser = {
        email: process.env.EMAIL_USER,
        name: 'Test User'
    };

    try {
        // Test 1: Personal Notification Alert Email
        console.log('📧 Test 1: Personal Notification Alert Email');
        await emailService.sendNotificationAlertEmail(
            testUser.email,
            testUser.name,
            'notification',
            'Class Schedule Update'
        );
        console.log('✅ Personal notification alert email sent successfully\n');

        // Test 2: Broadcast Notification Alert Email
        console.log('📧 Test 2: Broadcast Notification Alert Email');
        await emailService.sendNotificationAlertEmail(
            testUser.email,
            testUser.name,
            'broadcast',
            'Important System Maintenance Notice'
        );
        console.log('✅ Broadcast notification alert email sent successfully\n');

        console.log('🎉 All notification alert email tests completed successfully!');
        console.log('\n📋 Summary of emails sent:');
        console.log('   • Personal Notification Alert Email (when admin sends individual notification)');
        console.log('   • Broadcast Notification Alert Email (when admin sends broadcast)');
        console.log('\n📧 Check your email inbox for all test emails!');
        console.log('\n💡 These emails alert users to check their profile for new notifications');

    } catch (error) {
        console.error('❌ Error testing notification alert emails:', error);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('   • Check your .env file has EMAIL_USER and EMAIL_APP_PASSWORD set');
        console.log('   • Verify your Google App Password is correct');
        console.log('   • Ensure 2-Factor Authentication is enabled on your Google account');
    }
}

// Run the test
testNotificationAlertEmails(); 