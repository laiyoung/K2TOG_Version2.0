import api from './apiConfig';

const enrollmentService = {
    // Get all enrollments for the current user
    getUserEnrollments: async () => {
        return api.get('/enrollments/my');
    },

    // Get enrollment details
    getEnrollmentById: async (enrollmentId) => {
        return api.get(`/enrollments/${enrollmentId}`);
    },

    // Enroll in a class
    enrollInClass: async (classId, enrollmentData = {}) => {
        return api.post(`/enrollments/${classId}`, enrollmentData);
    },

    // Cancel enrollment
    cancelEnrollment: async (enrollmentId) => {
        return api.delete(`/enrollments/${enrollmentId}`);
    },

    // Update enrollment status (admin only)
    updateEnrollmentStatus: async (enrollmentId, status) => {
        return api.patch(`/enrollments/${enrollmentId}/status`, { status });
    },

    // Get enrollment history
    getEnrollmentHistory: async (enrollmentId) => {
        return api.get(`/enrollments/${enrollmentId}/history`);
    },

    // Get class enrollments (admin only)
    getClassEnrollments: async (classId) => {
        return api.get(`/enrollments/classes/${classId}`);
    },

    // Get enrollment statistics (admin only)
    getEnrollmentStats: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return api.get(`/enrollments/stats?${queryParams}`);
    },

    // Check enrollment eligibility
    checkEnrollmentEligibility: async (classId) => {
        return api.get(`/enrollments/check-eligibility/${classId}`);
    },

    // Get enrollment waitlist status
    getWaitlistStatus: async (classId) => {
        return api.get(`/enrollments/waitlist/${classId}`);
    },

    // Join waitlist
    joinWaitlist: async (classId) => {
        return api.post(`/enrollments/waitlist/${classId}`);
    },

    // Leave waitlist
    leaveWaitlist: async (classId) => {
        return api.delete(`/enrollments/waitlist/${classId}`);
    }
};

export default enrollmentService; 