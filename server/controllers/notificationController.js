const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10, includeRead = false } = req.query;
        const result = await Notification.getByUserId(req.user.id, {
            page: parseInt(page),
            limit: parseInt(limit),
            includeRead: includeRead === 'true'
        });
        res.json(result);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.user.id);
        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.markAsRead(req.params.id, req.user.id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json(notification);
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        const notifications = await Notification.markAllAsRead(req.user.id);
        res.json({ message: 'All notifications marked as read', count: notifications.length });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.delete(req.params.id, req.user.id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};

// @desc    Create notification template
// @route   POST /api/admin/notifications/templates
// @access  Private/Admin
const createTemplate = async (req, res) => {
    try {
        const { name, type, title_template, message_template, metadata } = req.body;
        
        if (!name || !type || !title_template || !message_template) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const template = await Notification.createTemplate({
            name,
            type,
            title_template,
            message_template,
            metadata
        });

        res.status(201).json(template);
    } catch (error) {
        console.error('Create template error:', error);
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Template name already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create template' });
        }
    }
};

// @desc    Get all notification templates
// @route   GET /api/admin/notifications/templates
// @access  Private/Admin
const getTemplates = async (req, res) => {
    try {
        const templates = await Notification.getAllTemplates();
        res.json(templates);
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: 'Failed to get templates' });
    }
};

// @desc    Send bulk notification using template
// @route   POST /api/admin/notifications/bulk
// @access  Private/Admin
const sendBulkNotification = async (req, res) => {
    try {
        const { template_name, user_ids, variables, action_url } = req.body;

        if (!template_name || !user_ids || !Array.isArray(user_ids)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate that all user IDs exist
        const users = await User.getUsersByIds(user_ids);
        if (users.length !== user_ids.length) {
            return res.status(400).json({ error: 'One or more user IDs are invalid' });
        }

        const result = await Notification.createBulkFromTemplate(
            template_name,
            user_ids,
            variables,
            action_url
        );

        res.status(201).json({
            success: true,
            sent_count: result.sent_count,
            failed_count: result.failed_count || 0,
            message: 'Bulk notification sent successfully'
        });
    } catch (error) {
        console.error('Send bulk notification error:', error);
        if (error.message === 'Notification template not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to send bulk notification' });
        }
    }
};

// @desc    Send notification to all users
// @route   POST /api/admin/notifications/broadcast
// @access  Private/Admin
const broadcastNotification = async (req, res) => {
    try {
        const { template_name, variables, action_url } = req.body;

        if (!template_name) {
            return res.status(400).json({ error: 'Template name is required' });
        }

        // Get all active users
        const users = await User.getUsersByStatus('active');
        const user_ids = users.map(user => user.id);

        const result = await Notification.createBulkFromTemplate(
            template_name,
            user_ids,
            variables,
            action_url
        );

        res.status(201).json({
            success: true,
            sent_count: result.sent_count,
            message: 'Broadcast notification sent successfully'
        });
    } catch (error) {
        console.error('Broadcast notification error:', error);
        if (error.message === 'Notification template not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to send broadcast notification' });
        }
    }
};

module.exports = {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createTemplate,
    getTemplates,
    sendBulkNotification,
    broadcastNotification
}; 