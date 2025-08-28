// API configuration for different environments
import { PRODUCTION_API_URL } from './production.js';

const getApiBaseUrl = () => {
    // Use the existing VITE_APP_URL environment variable if set
    if (import.meta.env.VITE_APP_URL) {
        let url = import.meta.env.VITE_APP_URL;

        // Remove trailing slash if present
        url = url.replace(/\/$/, '');

        // Ensure the URL has a protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Add /api prefix for backend
        return url + '/api';
    }

    // For production builds (when not in development)
    if (import.meta.env.PROD) {
        // Use the production configuration
        if (PRODUCTION_API_URL && PRODUCTION_API_URL !== 'yjchildcareplus-nodeenv.up.railway.app') {
            return PRODUCTION_API_URL + '/api';
        }

        // If production URL is not configured, show warning
        console.warn('Production API URL not configured. Please update src/config/production.js');
        console.warn('API calls will fail in production.');
        return '/api'; // This will fail in production, but provides a clear error
    }

    // For local development, use the Vite proxy
    if (import.meta.env.DEV) {
        return '/api';
    }

    // Fallback to relative paths
    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API base URL for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('App URL from env:', import.meta.env.VITE_APP_URL);
console.log('Is Development:', import.meta.env.DEV);
