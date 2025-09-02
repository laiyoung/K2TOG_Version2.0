import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/adminService';
import userService from '../services/userService';
import { useNotifications } from '../utils/notificationUtils';

const NotificationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showSuccess, showError } = useNotifications();
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Admin state for sending detailed notifications
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [adminMessage, setAdminMessage] = useState('');
    const [adminLinks, setAdminLinks] = useState([{ label: '', url: '' }]);
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        const checkUserRole = () => {
            if (user && (user.role === 'admin' || user.role === 'instructor')) {
                setIsAdmin(true);
            }
        };

        checkUserRole();
    }, [user]);

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                setLoading(true);
                let notificationData;

                if (isAdmin) {
                    // Admin can fetch any notification
                    notificationData = await adminService.getNotification(id);
                } else {
                    // Regular users can only fetch their own notifications
                    notificationData = await userService.getNotification(id);
                }

                setNotification(notificationData);
            } catch (error) {
                console.error('Error fetching notification:', error);
                setError('Failed to load notification details');
                // Don't call showError here to avoid infinite re-renders
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNotification();
        }
    }, [id, isAdmin]); // Removed showError from dependencies

    const handleMarkAsRead = async () => {
        if (!notification || notification.is_read) return;

        try {
            if (isAdmin) {
                await adminService.markNotificationAsRead(id);
            } else {
                await userService.markNotificationAsRead(id);
            }

            setNotification(prev => ({ ...prev, is_read: true }));
            showSuccess('Notification marked as read');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            showError('Failed to mark notification as read');
        }
    };

    const handleAddLink = () => {
        setAdminLinks(prev => [...prev, { label: '', url: '' }]);
    };

    const handleRemoveLink = (index) => {
        setAdminLinks(prev => prev.filter((_, i) => i !== index));
    };

    const handleLinkChange = (index, field, value) => {
        setAdminLinks(prev => prev.map((link, i) =>
            i === index ? { ...link, [field]: value } : link
        ));
    };

    const handleSendDetailedMessage = async () => {
        if (!adminMessage.trim()) {
            showError('Please enter a message');
            return;
        }

        try {
            setSendingMessage(true);

            // Filter out empty links
            const validLinks = adminLinks.filter(link => link.label.trim() && link.url.trim());

            const detailedMessage = {
                originalNotificationId: id,
                message: adminMessage,
                links: validLinks,
                timestamp: new Date().toISOString()
            };

            // Send detailed message to the notification recipient
            await adminService.sendDetailedNotification(detailedMessage);

            showSuccess('Detailed message sent successfully');
            setShowAdminForm(false);
            setAdminMessage('');
            setAdminLinks([{ label: '', url: '' }]);
        } catch (error) {
            console.error('Error sending detailed message:', error);
            showError('Failed to send detailed message');
        } finally {
            setSendingMessage(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !notification) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
                    <p className="text-red-600">{error || 'Notification not found'}</p>
                    <button
                        onClick={() => navigate('/profile?section=notifications')}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/profile?section=notifications')}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Notifications
                </button>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {notification.title}
                            </h1>
                            <p className="text-gray-600">
                                {new Date(notification.created_at || notification.timestamp).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {!notification.is_read && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    New
                                </span>
                            )}
                            {notification.type && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {notification.type}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="prose max-w-none mb-6">
                        <p className="text-gray-700 text-lg leading-relaxed">
                            {notification.message}
                        </p>

                        {/* Display links if they exist in metadata */}
                        {notification.metadata?.links && notification.metadata.links.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-md font-semibold text-gray-900 mb-2">Related Links:</h4>
                                <div className="space-y-2">
                                    {notification.metadata.links.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-blue-600 hover:text-blue-800 underline"
                                        >
                                            {link.label || link.url}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                        <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Admin Actions</h3>
                                <button
                                    onClick={() => setShowAdminForm(!showAdminForm)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {showAdminForm ? 'Cancel' : 'Send Detailed Message'}
                                </button>
                            </div>

                            {showAdminForm && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-md font-semibold mb-3">Send Detailed Message</h4>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Detailed Message
                                        </label>
                                        <textarea
                                            value={adminMessage}
                                            onChange={(e) => setAdminMessage(e.target.value)}
                                            placeholder="Enter a detailed message with any additional information, links, or instructions..."
                                            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Links (Optional)
                                        </label>
                                        {adminLinks.map((link, index) => (
                                            <div key={index} className="flex items-center space-x-2 mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="Link label"
                                                    value={link.label}
                                                    onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <input
                                                    type="url"
                                                    placeholder="URL"
                                                    value={link.url}
                                                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                {adminLinks.length > 1 && (
                                                    <button
                                                        onClick={() => handleRemoveLink(index)}
                                                        className="px-3 py-2 text-red-600 hover:text-red-800"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={handleAddLink}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            <i className="fas fa-plus mr-1"></i>
                                            Add Another Link
                                        </button>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowAdminForm(false)}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSendDetailedMessage}
                                            disabled={sendingMessage || !adminMessage.trim()}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {sendingMessage ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Actions */}
                    <div className="border-t pt-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {notification.is_read ? 'Read' : 'Unread'}
                            </div>
                            <div className="flex space-x-3">
                                {!notification.is_read && (
                                    <button
                                        onClick={handleMarkAsRead}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate('/profile?section=notifications')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDetail;
