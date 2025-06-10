import api from './apiConfig';

const adminService = {
    // Get dashboard statistics
    getDashboardStats: async () => {
        return api.get('/admin/dashboard/stats');
    },

    // Get all users
    getAllUsers: async (params = {}) => {
        try {
            let url = '/admin/users';
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.search) queryParams.append('search', params.search);
            if (params.role && params.role !== 'all') queryParams.append('role', params.role);
            if ([...queryParams].length > 0) url += `?${queryParams.toString()}`;
            console.log('Fetching users from', url); // Add logging
            const response = await api.get(url);
            console.log('getAllUsers response:', response); // Add logging
            if (!Array.isArray(response)) {
                // If the response is paginated, use response.users
                if (response && Array.isArray(response.users)) {
                    return response.users;
                }
                console.error('Invalid response format:', response);
                throw new Error('Invalid response format from server');
            }
            return response;
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            throw error;
        }
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

    // Update transaction status
    updateTransactionStatus: async (transactionId, status) => {
        const response = await api.patch(`/admin/financial/transactions/${transactionId}`, { status });
        return response.data;
    },

    // Export transactions to CSV
    exportTransactions: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/admin/financial/transactions/export?${params}`, {
            responseType: 'blob' // Important for file downloads
        });
        return response.data;
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
        try {
            const response = await api.get('/notifications');
            // Return the notifications array from the response
            return response.notifications || response.data || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    getSentNotifications: async () => {
        try {
            const notifications = await api.get('/notifications/admin/sent');
            console.log('Sent notifications response:', notifications);
            return notifications;
        } catch (error) {
            console.error('Error fetching sent notifications:', error);
            throw error;
        }
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
        const { recipientType, recipient, title, message } = notificationData;
        
        if (recipientType === 'class') {
            // Send notification to all users in a class
            const response = await api.post('/notifications/admin/class', {
                template_name: 'class_notification',
                class_id: Number(recipient),
                variables: {
                    title,
                    message
                }
            });
            return response.data;
        } else {
            // Send notification to specific user(s)
            const response = await api.post('/notifications/admin/bulk', {
                template_name: 'custom_notification', // Use custom notification type
                user_ids: [Number(recipient)],
                variables: {
                    title,
                    message
                }
            });
            return response.data;
        }
    },

    sendBroadcast: async (broadcastData) => {
        const response = await api.post('/notifications/admin/broadcast', {
            title: 'Broadcast Message',
            message: broadcastData.message,
            type: 'broadcast'  // Specify this is a direct broadcast
        });
        return response.data;
    },

    // Send payment reminder email
    sendPaymentReminderEmail: async (paymentId) => {
        const response = await api.post('/admin/financial/payments/reminder', {
            payment_id: paymentId
        });
        return response.data;
    },

    // Send payment notification to user's profile
    sendPaymentNotification: async (paymentId, notificationData) => {
        const response = await api.post('/admin/financial/payments/notify', {
            payment_id: paymentId,
            title: notificationData.title,
            message: notificationData.message,
            user_id: notificationData.userId
        });
        return response.data;
    },

    // Get outstanding payments
    getOutstandingPayments: async (dateRange) => {
        const params = new URLSearchParams();
        if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
        return api.get(`/admin/financial/payments/outstanding?${params.toString()}`);
    },

    updateUserStatus: async (userId, status) => {
        return api.patch(`/admin/users/${userId}/status`, { status });
    },

    resetUserPassword: async (userId, newPassword) => {
        return api.put(`/admin/users/${userId}/password`, { newPassword });
    },

    deleteUser: async (userId) => {
        return api.delete(`/admin/users/${userId}`);
    },

    // Get class sessions
    getClassSessions: async (classId) => {
        return api.get(`/classes/${classId}/sessions`);
    },

    // Get class waitlist
    getClassWaitlist: async (classId) => {
        return api.get(`/admin/classes/${classId}/waitlist`);
    },

    // Get all instructors
    getInstructors: async () => {
        return api.get('/admin/instructors');
    },

    // Get class details with sessions
    getClassDetails: async (classId) => {
        return api.get(`/admin/classes/${classId}`);
    },

    // Get transactions
    getTransactions: async (dateRange) => {
        const params = new URLSearchParams();
        if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
        const response = await api.get(`/admin/financial/transactions?${params.toString()}`);
        return response.data || [];
    },

    // Get financial summary
    getFinancialSummary: async (dateRange) => {
        const params = new URLSearchParams();
        if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
        const response = await api.get(`/admin/financial/summary?${params.toString()}`);
        return response.data || {
            totalRevenue: 0,
            pendingPayments: 0,
            monthlyRevenue: 0,
            outstandingBalance: 0
        };
    },

    getTemplates: async () => {
        try {
            const response = await api.get('/notifications/admin/templates');
            return response.data;
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw error;
        }
    },

    createTemplate: async (templateData) => {
        try {
            const response = await api.post('/notifications/admin/templates', templateData);
            return response.data;
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }
    },

    getAllClasses: async () => {
        try {
            const response = await api.get('/admin/classes');
            return response.data;
        } catch (error) {
            console.error('Error fetching classes:', error);
            throw error;
        }
    }
};

export default adminService; 