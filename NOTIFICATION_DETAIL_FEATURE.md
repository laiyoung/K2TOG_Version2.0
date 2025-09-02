# Notification Detail Feature

## Overview
This feature allows users to view detailed notification information and enables admins to send long messages with links to users.

## Features

### For Users
- **View Details Button**: Every notification now has a "View Details" button that opens a dedicated page
- **Detailed View**: Users can see the full notification content, timestamp, and status
- **Mark as Read**: Users can mark notifications as read from the detail page
- **Related Links**: If the notification contains links in metadata, they are displayed as clickable links

### For Admins
- **Send Detailed Messages**: Admins can send long-form messages with multiple links
- **Link Management**: Add, remove, and edit links with custom labels
- **Rich Content**: Support for detailed explanations, instructions, and resources
- **Email Integration**: Detailed notifications are also sent via email if enabled

## Implementation Details

### Frontend Changes

#### New Files
- `client/src/pages/NotificationDetail.jsx` - Main detail page component
- `NOTIFICATION_DETAIL_FEATURE.md` - This documentation

#### Modified Files
- `client/src/App.jsx` - Added route for `/notifications/:id`
- `client/src/components/profile/NotificationsSection.jsx` - Updated "View Details" button to navigate to detail page
- `client/src/services/userService.js` - Added `getNotification()` method
- `client/src/services/adminService.js` - Added `getNotification()` and `sendDetailedNotification()` methods

### Backend Changes

#### Modified Files
- `server/routes/notificationRoutes.js` - Added new routes for notification details and detailed messaging
- `server/controllers/notificationController.js` - Added `getNotification()` and `sendDetailedNotification()` controllers
- `server/models/notificationModel.js` - Added `getNotificationById()`, `markAllAsRead()`, and `getUnreadCount()` methods

## API Endpoints

### User Endpoints
- `GET /api/notifications/:id` - Get single notification (user can only access their own)
- `PUT /api/notifications/:id/read` - Mark notification as read

### Admin Endpoints
- `GET /api/notifications/admin/:id` - Get any notification (admin access)
- `POST /api/notifications/admin/detailed` - Send detailed notification with links

## Usage

### For Users
1. Navigate to your profile page
2. Click "View Details" on any notification
3. View the full notification content and any related links
4. Mark as read if needed

### For Admins
1. Navigate to any notification detail page
2. Click "Send Detailed Message" button
3. Enter your detailed message
4. Add links with custom labels (optional)
5. Click "Send Message" to deliver to the user

## Database Schema
The feature uses the existing `user_notifications` table with the following key fields:
- `metadata` - JSON field storing links and additional information
- `type` - Includes new type 'detailed_notification'
- `sender_id` - Tracks who sent the notification

## Security
- Users can only access their own notifications
- Admins can access any notification but require proper authentication
- All routes are protected with authentication middleware
- Admin routes require additional admin role verification
