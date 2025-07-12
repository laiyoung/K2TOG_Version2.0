import api from './apiConfig';

const enrollmentService = {
    // Get all enrollments (admin view)
    getEnrollments: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await api.get(`/enrollments?${queryParams}`);
        return {
            enrollments: response.enrollments,
            total: response.total
        };
    },

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
        if (status === 'approved') {
            return api.post(`/enrollments/${enrollmentId}/approve`);
        } else if (status === 'rejected') {
            return api.post(`/enrollments/${enrollmentId}/reject`);
        } else if (status === 'pending') {
            return api.post(`/enrollments/${enrollmentId}/pending`);
        }
        throw new Error('Invalid status');
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
    },

    getUserWaitlistEntries: async () => {
        try {
            const response = await api.get('/enrollments/waitlist');
            return response;
        } catch (error) {
            throw error;
        }
    },

    acceptWaitlistOffer: async (classId) => {
        try {
            const response = await api.post(`/enrollments/waitlist/${classId}/accept`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    declineWaitlistOffer: async (classId) => {
        try {
            const response = await api.post(`/enrollments/waitlist/${classId}/decline`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default enrollmentService; 