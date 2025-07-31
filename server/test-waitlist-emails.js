const emailService = require('./utils/emailService');
require('dotenv').config();

async function testWaitlistEmails() {
  console.log('📋 Testing Waitlist Email Functionality...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set');
  console.log('CLIENT_URL:', process.env.CLIENT_URL || 'Not set');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('❌ Email configuration incomplete. Please check your .env file.');
    console.log('📝 Make sure EMAIL_USER and EMAIL_APP_PASSWORD are set in server/.env');
    return;
  }

  const testEmail = process.env.EMAIL_USER;
  const testUserName = 'Test User';
  const testClassName = 'Advanced Child Development';
  const testClassDetails = {
    start_date: '2024-03-15',
    end_date: '2024-04-15',
    location_details: 'Online via Zoom'
  };

  try {
    console.log('\n📧 Testing Waitlist Confirmation Email...');
    await emailService.sendWaitlistConfirmationEmail(
      testEmail, 
      testUserName, 
      testClassName, 
      testClassDetails, 
      5
    );
    console.log('✅ Waitlist confirmation email sent!');

    console.log('\n🎉 Testing Waitlist Offer Email...');
    await emailService.sendWaitlistOfferEmail(
      testEmail, 
      testUserName, 
      testClassName, 
      testClassDetails
    );
    console.log('✅ Waitlist offer email sent!');

    console.log('\n✅ Testing Waitlist Acceptance Email...');
    await emailService.sendWaitlistAcceptanceEmail(
      testEmail, 
      testUserName, 
      testClassName, 
      testClassDetails
    );
    console.log('✅ Waitlist acceptance email sent!');

    console.log('\n❌ Testing Waitlist Rejection Email...');
    await emailService.sendWaitlistRejectionEmail(
      testEmail, 
      testUserName, 
      testClassName, 
      'Class capacity has been reached'
    );
    console.log('✅ Waitlist rejection email sent!');

    console.log('\n📊 Testing Waitlist Position Update Email...');
    await emailService.sendWaitlistPositionUpdateEmail(
      testEmail, 
      testUserName, 
      testClassName, 
      3, 
      7
    );
    console.log('✅ Waitlist position update email sent!');

    console.log('\n⏰ Testing Waitlist Expired Email...');
    await emailService.sendWaitlistExpiredEmail(
      testEmail, 
      testUserName, 
      testClassName
    );
    console.log('✅ Waitlist expired email sent!');

    console.log('\n🎉 All waitlist emails sent successfully!');
    console.log('📬 Check your inbox (and spam folder) for the test emails.');
    console.log('\n📋 Email Types Sent:');
    console.log('   1. 📋 Waitlist Confirmation - When user joins waitlist');
    console.log('   2. 🎉 Waitlist Offer - When spot becomes available');
    console.log('   3. ✅ Waitlist Acceptance - When user accepts spot');
    console.log('   4. ❌ Waitlist Rejection - When user is rejected');
    console.log('   5. 📊 Position Update - When waitlist position changes');
    console.log('   6. ⏰ Offer Expired - When offer expires');
    
    console.log('\n🎨 Each email features:');
    console.log('   - Professional, responsive design');
    console.log('   - Clear call-to-action buttons');
    console.log('   - Relevant information and next steps');
    console.log('   - Contact information for support');
    console.log('   - Branded styling with appropriate colors');
    
  } catch (error) {
    console.error('❌ Error sending waitlist emails:', error.message);
    console.log('🔧 Please check your email configuration and try again.');
    console.log('📋 Common issues:');
    console.log('   - Invalid Google App Password');
    console.log('   - 2-Factor Authentication not enabled');
    console.log('   - Gmail account restrictions');
  }
}

// Run the test
testWaitlistEmails(); 