require('dotenv').config();
const emailService = require('./utils/emailService');

async function testSimpleWaitlistEmails() {
    console.log('🧪 Testing Simple Waitlist Email Functions...\n');
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
        start_date: '2024-03-15',
        end_date: '2024-03-15',
        location_details: '123 Main Street, Suite 100, City, State 12345'
    };

    try {
        // Test 1: Waitlist Confirmation Email
        console.log('📧 Test 1: Waitlist Confirmation Email');
        await emailService.sendWaitlistConfirmationEmail(
            testUser.email,
            testUser.name,
            testClass.title,
            {
                start_date: testClass.start_date,
                end_date: testClass.end_date,
                location_details: testClass.location_details
            },
            5 // position
        );
        console.log('✅ Waitlist confirmation email sent successfully\n');

        // Test 2: Waitlist Acceptance Email
        console.log('📧 Test 2: Waitlist Acceptance Email');
        await emailService.sendWaitlistAcceptanceEmail(
            testUser.email,
            testUser.name,
            testClass.title,
            {
                start_date: testClass.start_date,
                end_date: testClass.end_date,
                location_details: testClass.location_details
            }
        );
        console.log('✅ Waitlist acceptance email sent successfully\n');

        // Test 3: Waitlist Rejection Email
        console.log('📧 Test 3: Waitlist Rejection Email');
        await emailService.sendWaitlistRejectionEmail(
            testUser.email,
            testUser.name,
            testClass.title,
            'Class capacity has been reached'
        );
        console.log('✅ Waitlist rejection email sent successfully\n');

        console.log('🎉 All simple waitlist email tests completed successfully!');
        console.log('\n📋 Summary of emails sent:');
        console.log('   • Waitlist Confirmation Email (when user joins waitlist)');
        console.log('   • Waitlist Acceptance Email (when user is approved)');
        console.log('   • Waitlist Rejection Email (when user is rejected)');
        console.log('\n📧 Check your email inbox for all test emails!');

    } catch (error) {
        console.error('❌ Error testing waitlist emails:', error);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('   • Check your .env file has EMAIL_USER and EMAIL_APP_PASSWORD set');
        console.log('   • Verify your Google App Password is correct');
        console.log('   • Ensure 2-Factor Authentication is enabled on your Google account');
        console.log('   • Check that TEST_EMAIL is set in your .env file');
    }
}

// Run the test
testSimpleWaitlistEmails(); 