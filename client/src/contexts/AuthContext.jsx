import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

// Create and export the context directly
export const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export the provider as a named export
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Try to get user from sessionStorage first (faster than localStorage)
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(false); // Start with false since we have cached user
    const [error, setError] = useState(null);

    // Memoize checkAuthStatus to prevent unnecessary recreations
    const checkAuthStatus = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const userData = await authService.getCurrentUser();
            setUser(userData);
            // Cache user data in sessionStorage for faster subsequent loads
            sessionStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Auth status check failed:', error);
            setError(error.message);
            // Clear invalid token and cached user
            localStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Only check auth status if we don't have a cached user
    useEffect(() => {
        if (!user) {
            checkAuthStatus();
        }
    }, [user, checkAuthStatus]);

    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authService.login({ email, password });
            setUser(response.user);
            // Cache user data
            sessionStorage.setItem('user', JSON.stringify(response.user));
            return response.user;
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await authService.logout();
        } catch (error) {
            console.error('Logout request failed:', error);
            setError(error.message);
        } finally {
            // Clear all storage and state
            localStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setUser(null);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);
            const response = await authService.register(userData);
            setUser(response.user);
            // Cache user data
            sessionStorage.setItem('user', JSON.stringify(response.user));
            return response.user;
        } catch (error) {
            console.error('Registration failed:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            setError(null);
            setLoading(true);
            const updatedUser = await authService.updateProfile(profileData);
            setUser(updatedUser);
            // Update cached user data
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (error) {
            console.error('Profile update failed:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        register,
        updateProfile,
        clearError: () => setError(null)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 