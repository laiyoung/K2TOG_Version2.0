// Base API configuration and utility functions

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Common headers for all requests
const getHeaders = (includeAuth = true) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

// Generic fetch wrapper with error handling
const fetchApi = async (endpoint, options = {}) => {
    const {
        method = 'GET',
        body,
        includeAuth = true,
        customHeaders = {},
    } = options;

    const headers = {
        ...getHeaders(includeAuth),
        ...customHeaders,
    };

    const config = {
        method,
        headers,
        credentials: 'include', // Include cookies in requests
    };

    if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            // Handle specific error cases
            if (response.status === 401) {
                // Handle unauthorized access
                localStorage.removeItem('token');
                window.location.href = '/login';
                throw new Error('Unauthorized access');
            }
            throw new Error(data.error || data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Utility methods for common HTTP methods
export const api = {
    get: (endpoint, options = {}) => 
        fetchApi(endpoint, { ...options, method: 'GET' }),
    
    post: (endpoint, body, options = {}) => 
        fetchApi(endpoint, { ...options, method: 'POST', body }),
    
    put: (endpoint, body, options = {}) => 
        fetchApi(endpoint, { ...options, method: 'PUT', body }),
    
    patch: (endpoint, body, options = {}) => 
        fetchApi(endpoint, { ...options, method: 'PATCH', body }),
    
    delete: (endpoint, options = {}) => 
        fetchApi(endpoint, { ...options, method: 'DELETE' }),
};

export default api; 