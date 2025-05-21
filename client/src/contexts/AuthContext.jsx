import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is logged in on mount
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth status check failed:', error);
            setError(error.message);
            // Clear invalid token
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authService.login({ email, password });
            setUser(response.user);
            return response.user;
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.message);
            throw error;
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
            // Clear local storage and state regardless of server response
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authService.register(userData);
            setUser(response.user);
            return response.user;
        } catch (error) {
            console.error('Registration failed:', error);
            setError(error.message);
            throw error;
        }
    };

    const updateProfile = async (profileData) => {
        try {
            setError(null);
            const updatedUser = await authService.updateProfile(profileData);
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Profile update failed:', error);
            setError(error.message);
            throw error;
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
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 