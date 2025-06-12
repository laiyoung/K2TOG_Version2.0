/**
 * Utility function to make authenticated fetch requests
 * Automatically includes the auth token in the request headers
 */
export const fetchWithAuth = async (url, options = {}) => {
  // Get the auth token from localStorage
  const token = localStorage.getItem('token');
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // Get the base URL from environment variable using Vite's import.meta.env
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Remove leading slash from url if it exists to prevent double slashes
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;

  // Make the fetch request with the auth token
  const response = await fetch(`${baseUrl}/${cleanUrl}`, {
    ...options,
    headers
  });

  // If the response is 401 (Unauthorized), clear the token and redirect to login
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  return response;
}; 