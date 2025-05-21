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

    // Update user preferences
    updatePreferences: async (preferences) => {
        return api.put('/users/preferences', preferences);
    },

    // Get user notifications
    getNotifications: async () => {
        return api.get('/users/notifications');
    },

    // Mark notification as read
    markNotificationAsRead: async (notificationId) => {
        return api.patch(`/users/notifications/${notificationId}/read`);
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

export default userService; 