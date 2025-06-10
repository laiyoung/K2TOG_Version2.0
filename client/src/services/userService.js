import api from './apiConfig';

const userService = {
    // Get user profile with all details
    getProfile: async () => {
        return api.get('/profile/profile');
    },

    // Update user profile
    updateProfile: async (profileData) => {
        return api.put('/profile/profile', profileData);
    },

    // Get notifications
    getNotifications: async () => {
        return api.get('/notifications');
    },

    // Mark notification as read
    markNotificationAsRead: async (notificationId) => {
        return api.put(`/notifications/${notificationId}/read`);
    },

    // Mark all notifications as read
    markAllNotificationsAsRead: async () => {
        return api.put('/notifications/read-all');
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        return api.delete(`/notifications/${notificationId}`);
    },

    // Update notifications (for bulk updates)
    updateNotifications: async (notifications) => {
        // Instead of a bulk update, we'll handle each notification individually
        const updates = notifications.map(async (notification) => {
            if (notification.is_read) {
                await api.put(`/notifications/${notification.id}/read`);
            }
        });
        await Promise.all(updates);
        return { success: true };
    },

    // Update user preferences
    updatePreferences: async (preferences) => {
        return api.put('/users/preferences', preferences);
    },

    // Get user certificates
    getCertificates: async () => {
        return api.get('/users/certificates');
    },

    // Get user activity history
    getActivityHistory: async () => {
        return api.get('/users/activity-history');
    },

    // Update user avatar
    updateAvatar: async (avatarData) => {
        const formData = new FormData();
        formData.append('avatar', avatarData);
        return api.post('/users/avatar', formData, {
            customHeaders: {
                // Don't set Content-Type, let the browser set it with the boundary
                'Content-Type': undefined
            }
        });
    },

    // Delete user avatar
    deleteAvatar: async () => {
        return api.delete('/users/avatar');
    },

    // Get user dashboard data
    getDashboardData: async () => {
        return api.get('/users/dashboard');
    },

    // Get user enrolled classes
    getEnrolledClasses: async () => {
        return api.get('/users/enrolled-classes');
    },

    // Get user waitlisted classes
    getWaitlistedClasses: async () => {
        return api.get('/users/waitlisted-classes');
    },

    // Get user payment history
    getPaymentHistory: async () => {
        return api.get('/users/payment-history');
    }
};

// Helper function to handle fetch requests
const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`/api${url}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

// Get all users with a specific role
export const getUsersByRole = async (role) => {
    return fetchWithAuth(`/admin/users?role=${role}`);
};

// Get user by ID
export const getUserById = async (userId) => {
    return fetchWithAuth(`/admin/users/${userId}`);
};

// Update user
export const updateUser = async (userId, userData) => {
    return fetchWithAuth(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
};

// Delete user
export const deleteUser = async (userId) => {
    return fetchWithAuth(`/admin/users/${userId}`, {
        method: 'DELETE'
    });
};

export default userService; 