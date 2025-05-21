import api from './apiConfig';

const classService = {
    // Get all classes
    getAllClasses: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        return api.get(`/classes?${queryParams}`);
    },

    // Get a single class by ID
    getClassById: async (classId) => {
        return api.get(`/classes/${classId}`);
    },

    // Create a new class (admin only)
    createClass: async (classData) => {
        return api.post('/classes', classData);
    },

    // Update a class (admin only)
    updateClass: async (classId, classData) => {
        return api.put(`/classes/${classId}`, classData);
    },

    // Delete a class (admin only)
    deleteClass: async (classId) => {
        return api.delete(`/classes/${classId}`);
    },

    // Get class schedule
    getClassSchedule: async (classId) => {
        return api.get(`/classes/${classId}/schedule`);
    },

    // Update class schedule (admin only)
    updateClassSchedule: async (classId, scheduleData) => {
        return api.put(`/classes/${classId}/schedule`, scheduleData);
    },

    // Get class materials
    getClassMaterials: async (classId) => {
        return api.get(`/classes/${classId}/materials`);
    },

    // Add class material (admin only)
    addClassMaterial: async (classId, materialData) => {
        return api.post(`/classes/${classId}/materials`, materialData);
    },

    // Remove class material (admin only)
    removeClassMaterial: async (classId, materialId) => {
        return api.delete(`/classes/${classId}/materials/${materialId}`);
    },

    // Get class participants
    getClassParticipants: async (classId) => {
        return api.get(`/classes/${classId}/participants`);
    },

    // Get class statistics (admin only)
    getClassStats: async (classId) => {
        return api.get(`/classes/${classId}/stats`);
    }
};

export default classService; 