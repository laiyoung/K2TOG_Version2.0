// API configuration for different environments
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

    // For local development, use the Vite proxy
    if (import.meta.env.DEV) {
        return '/api';
    }

    // For production, use relative paths (will be handled by Vercel rewrites)
    // This ensures API calls go through Vercel's rewrite rules
    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API base URL for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('App URL from env:', import.meta.env.VITE_APP_URL);
console.log('Is Development:', import.meta.env.DEV);

// Additional debugging for production
if (!import.meta.env.DEV) {
    console.log('Production mode detected - API calls will use relative paths');
    console.log('Make sure Vercel rewrites are configured to proxy /api/* to your backend');
}
