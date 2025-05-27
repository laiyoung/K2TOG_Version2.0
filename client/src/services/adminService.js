import api from './apiConfig';

const adminService = {
    // Get dashboard statistics
    getDashboardStats: async () => {
        return api.get('/admin/dashboard/stats');
    },

    // Get all users
    getAllUsers: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return api.get(`/admin/users?${queryParams}`);
    },

    // Get user details
    getUserDetails: async (userId) => {
        return api.get(`/admin/users/${userId}`);
    },

    // Update user role
    updateUserRole: async (userId, role) => {
        return api.patch(`/admin/users/${userId}/role`, { role });
    },

    // Get system settings
    getSystemSettings: async () => {
        return api.get('/admin/settings');
    },

    // Update system settings
    updateSystemSettings: async (settings) => {
        return api.put('/admin/settings', settings);
    },

    // Get audit logs
    getAuditLogs: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return api.get(`/admin/audit-logs?${queryParams}`);
    },

    // Get analytics data
    getAnalytics: async (type, filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        switch (type) {
            case 'summary':
                return api.get(`/admin/analytics/summary${queryParams ? `?${queryParams}` : ''}`);
            case 'revenue':
                return api.get(`/admin/analytics/revenue${queryParams ? `?${queryParams}` : ''}`);
            case 'revenue-by-class':
                return api.get(`/admin/analytics/revenue/classes${queryParams ? `?${queryParams}` : ''}`);
            case 'enrollments':
                return api.get(`/admin/analytics/enrollments/trends${queryParams ? `?${queryParams}` : ''}`);
            case 'class-enrollments':
                return api.get(`/admin/analytics/enrollments/classes${queryParams ? `?${queryParams}` : ''}`);
            case 'user-engagement':
                return api.get(`/admin/analytics/users/engagement${queryParams ? `?${queryParams}` : ''}`);
            case 'user-activity':
                return api.get(`/admin/analytics/users/activity${queryParams ? `?${queryParams}` : ''}`);
            default:
                return api.get(`/admin/analytics/summary${queryParams ? `?${queryParams}` : ''}`);
        }
    },

    // Manage class schedules
    manageClassSchedules: async (action, data) => {
        return api.post('/admin/class-schedules', { action, ...data });
    },

    // Get system health status
    getSystemHealth: async () => {
        return api.get('/admin/system-health');
    },

    // Manage notifications
    manageNotifications: async (action, data) => {
        return api.post('/admin/notifications', { action, ...data });
    },

    // Get user activity logs
    getUserActivityLogs: async (userId) => {
        return api.get(`/admin/users/${userId}/activity-logs`);
    },

    // Manage certificates
    manageCertificates: async (action, data) => {
        return api.post('/admin/certificates', { action, ...data });
    },

    getOutstandingPayments: async (dateRange) => {
        const params = new URLSearchParams();
        if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
        return api.get(`/admin/financial/payments/outstanding?${params.toString()}`);
    },

    // Export analytics report
    exportAnalyticsReport: async (type, filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/admin/analytics/export/${type}${params ? `?${params}` : ''}`, {
            responseType: 'blob' // Important for file downloads
        });
        return response.data;
    },

    // Get user profile with details
    getUserProfile: async (userId) => {
        return api.get(`/admin/users/${userId}/profile`);
    },

    // Get user activity
    getUserActivity: async (userId, page = 1) => {
        return api.get(`/admin/users/${userId}/activity?page=${page}`);
    },

    // Get user enrollments
    getUserEnrollments: async (userId) => {
        return api.get(`/admin/users/${userId}/enrollments`);
    },

    // Notification management
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },

    markNotificationAsRead: async (notificationId) => {
        const response = await api.put(`/notifications/${notificationId}/read`);
        return response.data;
    },

    markAllNotificationsAsRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data;
    },

    deleteNotification: async (notificationId) => {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response.data;
    },

    sendNotification: async (notificationData) => {
        const response = await api.post('/notifications/admin/bulk', {
            template_name: 'custom_notification',
            user_ids: [Number(notificationData.recipient)],
            variables: {
                title: notificationData.title,
                message: notificationData.message
            }
        });
        return response.data;
    },

    sendBroadcast: async (broadcastData) => {
        const response = await api.post('/notifications/admin/broadcast', {
            template_name: 'broadcast_notification',
            variables: {
                message: broadcastData.message
            }
        });
        return response.data;
    }
};

export default adminService; 