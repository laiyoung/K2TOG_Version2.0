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
        return api.get(`/admin/analytics/${type}?${queryParams}`);
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
    }
};

export default adminService; 