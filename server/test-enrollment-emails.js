require('dotenv').config();
const emailService = require('./utils/emailService');

async function testEnrollmentEmails() {
    console.log('🧪 Testing Enrollment Email Functions...\n');
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

    const testClass = {
        title: 'Advanced Child Care Techniques',
        location_details: '123 Main Street, Suite 100, City, State 12345'
    };

    const testSession = {
        session_date: '2024-03-15',
        start_time: '10:00 AM',
        end_time: '2:00 PM'
    };

    try {
        // Test 1: Enrollment Confirmation Email
        console.log('📧 Test 1: Enrollment Confirmation Email');
        await emailService.sendEnrollmentConfirmationEmail(
            testUser.email,
            testUser.name,
            testClass.title,
            testClass,
            testSession
        );
        console.log('✅ Enrollment confirmation email sent successfully\n');

        // Test 2: Enrollment Approval Email
        console.log('📧 Test 2: Enrollment Approval Email');
        await emailService.sendEnrollmentApprovalEmail(
            testUser.email,
            testUser.name,
            testClass.title,
            testClass,
            testSession,
            'Welcome to the class! Please bring your certification documents.'
        );
        console.log('✅ Enrollment approval email sent successfully\n');

        // Test 3: Enrollment Rejection Email
        console.log('📧 Test 3: Enrollment Rejection Email');
        await emailService.sendEnrollmentRejectionEmail(
            testUser.email,
            testUser.name,
            testClass.title,
            testClass,
            testSession,
            'Class capacity has been reached and we are unable to accommodate additional students at this time.'
        );
        console.log('✅ Enrollment rejection email sent successfully\n');

        console.log('🎉 All enrollment email tests completed successfully!');
        console.log('\n📋 Summary of emails sent:');
        console.log('   • Enrollment Confirmation Email (when user enrolls in class)');
        console.log('   • Enrollment Approval Email (when admin approves enrollment)');
        console.log('   • Enrollment Rejection Email (when admin rejects enrollment)');
        console.log('\n📧 Check your email inbox for all test emails!');

    } catch (error) {
        console.error('❌ Error testing enrollment emails:', error);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('   • Check your .env file has EMAIL_USER and EMAIL_APP_PASSWORD set');
        console.log('   • Verify your Google App Password is correct');
        console.log('   • Ensure 2-Factor Authentication is enabled on your Google account');
    }
}

// Run the test
testEnrollmentEmails(); 