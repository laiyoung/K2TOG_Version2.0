// API configuration for different environments
const getApiBaseUrl = () => {
    // Use the existing VITE_API_URL environment variable
    if (import.meta.env.VITE_API_URL) {
        let url = import.meta.env.VITE_API_URL;

        // Ensure the URL has a protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Add /api prefix for Railway backend
        return url + '/api';
    }

    // Fallback to relative paths for local development
    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API base URL for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('API URL from env:', import.meta.env.VITE_API_URL);
