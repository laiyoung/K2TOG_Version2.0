import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

const AuthContext = createContext(null);

// Helper function for fetch requests
const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`/api${url}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    // Add a ref to track if we're in the middle of a login
    const isLoggingIn = useRef(false);

    // Check auth status on mount
    const checkAuthStatus = useCallback(async () => {
        // Don't check auth status if we're in the middle of logging in
        if (isLoggingIn.current) {
            console.log('Skipping auth check during login'); // Debug log
            return;
        }

        const storedToken = localStorage.getItem('token');
        const storedUser = sessionStorage.getItem('user');

        console.log('Checking auth status:', {
            hasStoredToken: !!storedToken,
            hasStoredUser: !!storedUser
        }); // Debug log

        if (!storedToken || !storedUser) {
            console.log('No stored auth data, clearing state'); // Debug log
            setUser(null);
            setToken(null);
            setInitialized(true);
            setLoading(false);
            return;
        }

        try {
            // Only verify the token if we have both token and user data
            const response = await fetch('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('Auth check successful, setting user:', userData); // Debug log
                setUser(userData);
                setToken(storedToken);
            } else {
                console.log('Auth check failed, clearing state'); // Debug log
                // Only clear if the token is invalid (401) or server error (500)
                if (response.status === 401 || response.status === 500) {
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                    setUser(null);
                    setToken(null);
                }
            }
        } catch (err) {
            console.error('Auth check error:', err); // Debug log
            // Don't clear state on network errors
            if (err.name === 'TypeError') {
                console.log('Network error during auth check, keeping state'); // Debug log
            } else {
                localStorage.removeItem('token');
                sessionStorage.removeItem('user');
                setUser(null);
                setToken(null);
            }
        } finally {
            setInitialized(true);
            setLoading(false);
        }
    }, []);

    // Run checkAuthStatus on mount
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = useCallback(async (email, password) => {
        try {
            isLoggingIn.current = true; // Set flag before login
            setLoading(true);
            setError(null);
            console.log('Starting login process...'); // Debug log

            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const responseText = await response.text();
            console.log('Raw login response:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse login response:', e);
                throw new Error('Invalid server response');
            }

            console.log('Parsed login response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            const { token: newToken, user: userData } = data;

            if (!newToken || !userData) {
                console.error('Invalid login response:', { newToken, userData });
                throw new Error('Invalid login response');
            }

            console.log('Setting auth state with:', { newToken, userData });

            // Set token and user data
            setToken(newToken);
            localStorage.setItem('token', newToken);
            setUser(userData);
            sessionStorage.setItem('user', JSON.stringify(userData));

            // Verify the user data by fetching profile
            try {
                console.log('Fetching profile with token:', newToken);
                const profileResponse = await fetch('/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                const profileText = await profileResponse.text();
                console.log('Raw profile response:', profileText);

                let profileData;
                try {
                    profileData = JSON.parse(profileText);
                } catch (e) {
                    console.error('Failed to parse profile response:', e);
                    throw new Error('Invalid profile response');
                }

                console.log('Parsed profile data:', profileData);

                if (profileData) {
                    const updatedUserData = profileData;
                    console.log('Setting updated user data:', updatedUserData);
                    setUser(updatedUserData);
                    sessionStorage.setItem('user', JSON.stringify(updatedUserData));
                }
            } catch (profileErr) {
                console.error('Profile fetch after login failed:', profileErr);
                // If profile fetch fails, we still want to keep the user logged in
                // with the initial user data from login
            }

            // Double check the state after all operations
            console.log('Final auth state:', {
                token: localStorage.getItem('token'),
                user: sessionStorage.getItem('user'),
                stateUser: user
            });

            return userData;
        } catch (err) {
            console.error('Login error:', err);
            const message = err.message || 'Login failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
            isLoggingIn.current = false; // Reset flag after login
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            setLoading(true);
            if (token) {
                try {
                    await fetchWithAuth('/users/logout', { method: 'POST' });
                } catch (err) {
                    console.warn('Logout request failed:', err);
                }
            }
        } finally {
            setToken(null);
            localStorage.removeItem('token');
            setUser(null);
            sessionStorage.removeItem('user');
            setLoading(false);
        }
    }, [token]);

    const register = useCallback(async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            const { token: newToken, user: newUser } = await response.json();

            if (!newToken || !newUser) {
                throw new Error('Invalid registration response');
            }

            // Set token and user data
            setToken(newToken);
            localStorage.setItem('token', newToken);
            setUser(newUser);
            sessionStorage.setItem('user', JSON.stringify(newUser));

            // Verify the user data by fetching profile
            try {
                const profileData = await fetchWithAuth('/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${newToken}`
                    }
                });

                if (profileData?.user) {
                    const updatedUserData = profileData.user;
                    setUser(updatedUserData);
                    sessionStorage.setItem('user', JSON.stringify(updatedUserData));
                }
            } catch (profileErr) {
                console.warn('Profile fetch after registration failed:', profileErr);
            }

            return newUser;
        } catch (err) {
            const message = err.message || 'Registration failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = useCallback(async (profileData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetchWithAuth('/users/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            if (response?.user) {
                setUser(response.user);
                return response.user;
            }
            throw new Error('Invalid profile update response');
        } catch (err) {
            const message = err.message || 'Profile update failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        error,
        initialized,
        token,
        login,
        logout,
        register,
        updateProfile,
        checkAuthStatus,
        clearError: () => {
            setError(null);
        }
    }), [user, loading, error, initialized, token, login, logout, register, updateProfile, checkAuthStatus]);

    // Don't render children until auth is initialized
    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};