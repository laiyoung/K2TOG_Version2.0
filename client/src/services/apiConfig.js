// Base API configuration and utility functions

const API_BASE_URL = '/api'; // Remove the environment variable since we're using a proxy

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
        console.log('Making API request to:', `${API_BASE_URL}${endpoint}`); // Add logging
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        console.log('API response status:', response.status); // Add logging

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Suppress logging for 404 'Not on waitlist'
            if (!(response.status === 404 && (errorData.error === 'Not on waitlist' || errorData.message === 'Not on waitlist'))) {
                console.error('API Error Response:', errorData); // Only log unexpected errors
            }
            throw new Error(errorData.error || errorData.message || 'Something went wrong');
        }

        const data = await response.json();
        console.log('API response data:', data); // Add logging
        return data;
    } catch (error) {
        // Suppress logging for 404 'Not on waitlist'
        if (!(error.message === 'Not on waitlist')) {
            console.error('API Error:', error);
        }
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