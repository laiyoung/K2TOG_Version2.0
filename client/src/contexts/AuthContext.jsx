import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

    useEffect(() => {
        // Check if user is logged in on mount
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Set default authorization header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Fetch user data
                const response = await axios.get('/api/users/profile');
                setUser(response.data);
            }
        } catch (error) {
            console.error('Auth status check failed:', error);
            // Clear invalid token
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/users/login', { email, password });
            const { token, user } = response.data;

            // Store token
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            return user;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Call logout endpoint if needed
            await axios.post('/api/users/logout');
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            // Clear local storage and state regardless of server response
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/users/register', userData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            return user;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put('/api/users/profile', profileData);
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        register,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 