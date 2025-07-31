# Email Setup Guide for YJ Child Care Plus

This guide will help you set up nodemailer with Google App Password for sending emails from your application.

## Prerequisites

1. A Gmail account
2. 2-Factor Authentication enabled on your Gmail account
3. Node.js and npm installed

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

## Step 2: Generate Google App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Under "2-Step Verification", click on "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Click "Generate"
6. Copy the 16-character password that appears

## Step 3: Create Environment File

Create a `.env` file in the `server` directory with the following content:

```env
# Email Configuration for Google App Password
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-digit-app-password

# Other environment variables
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yjchildcareplus
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Step 4: Replace Placeholder Values

Replace the following placeholders in your `.env` file:

- `your-email@gmail.com` - Your Gmail address
- `your-16-digit-app-password` - The 16-character app password from Step 2
- `your_db_user` - Your database username
- `your_db_password` - Your database password
- `your-jwt-secret-key` - A secure random string for JWT signing
- `your_cloudinary_cloud_name` - Your Cloudinary cloud name
- `your_cloudinary_api_key` - Your Cloudinary API key
- `your_cloudinary_api_secret` - Your Cloudinary API secret
- `your_stripe_secret_key` - Your Stripe secret key
- `your_stripe_webhook_secret` - Your Stripe webhook secret

## Step 5: Test Email Configuration

1. Start your server: `npm run start:dev`
2. Check the console output for email configuration status
3. You should see: "Email server is ready to send messages"

## Step 6: Test Email Sending

The application will automatically send emails for:
- Welcome emails to new users
- Password reset emails
- Waitlist notifications
- Appointment confirmations

### Test Welcome Email Specifically

To test the welcome email functionality:

```bash
cd server
node test-welcome-email.js
```

This will send a sample welcome email to your configured email address with a beautiful, professional design.

### Test Password Reset Email

To test the password reset email functionality:

```bash
cd server
node test-password-reset.js
```

This will send a sample password reset email with security-focused design and clear instructions.

### Test Simple Waitlist Notification Emails

To test the simplified waitlist notification emails:

```bash
cd server
node test-simple-waitlist-emails.js
```

This will send samples of the three main waitlist notification emails:
- Waitlist confirmation (when user joins waitlist)
- Waitlist acceptance (when user is approved)
- Waitlist rejection (when user is rejected)

### Test Enrollment Notification Emails

To test the enrollment notification emails:

```bash
cd server
node test-enrollment-emails.js
```

This will send samples of the three main enrollment notification emails:
- Enrollment confirmation (when user enrolls in class)
- Enrollment approval (when admin approves enrollment)
- Enrollment rejection (when admin rejects enrollment)

### Test Notification Alert Emails

To test the notification alert emails:

```bash
cd server
node test-notification-alert-emails.js
```

This will send samples of notification alert emails:
- Personal notification alert (when admin sends individual notification)
- Broadcast notification alert (when admin sends broadcast message)

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**
   - Make sure you're using the App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Less secure app access" error**
   - This is expected and normal with App Passwords
   - The App Password bypasses this restriction

3. **"Email service is disabled" message**
   - Check that your `.env` file is in the correct location (`server/.env`)
   - Verify that `EMAIL_USER` and `EMAIL_APP_PASSWORD` are set correctly

4. **"Email server is ready" but emails not sending**
   - Check the recipient email address
   - Verify your Gmail account isn't blocked
   - Check spam folder

### Security Notes:

- Never commit your `.env` file to version control
- Keep your App Password secure
- Consider using environment-specific email accounts for production

## Email Templates Available

The application includes the following email templates:
- Welcome emails
- Password reset emails
- Waitlist confirmation emails
- Waitlist acceptance emails
- Waitlist rejection emails
- Enrollment confirmation emails
- Enrollment approval emails
- Enrollment rejection emails
- Notification alert emails
- Appointment confirmations

All templates are HTML-formatted and include proper styling. 