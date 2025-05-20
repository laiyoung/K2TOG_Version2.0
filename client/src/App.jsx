import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';
import Classes from './pages/Classes';
import UserAccount from './pages/UserAccount';
import Contact from './pages/Contact';
import ClassDetails from './pages/ClassDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfilePage from './components/profile/ProfilePage';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
    }

    return children;
};

// Admin Route component
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

// AppContent component that uses useAuth
function AppContent() {
    const { user } = useAuth();
    const isAdminRoute = window.location.pathname.startsWith('/admin');

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                {!isAdminRoute && <Header />}
                <main className={`container mx-auto px-4 py-8 ${isAdminRoute ? 'p-0' : ''}`}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/classes" element={<Classes />} />
                        <Route path="/classes/:id" element={<ClassDetails />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        {/* Make profile route public for development */}
                        <Route path="/profile" element={<ProfilePage />} />

                        {/* Protected Routes */}
                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute>
                                    <UserAccount />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminDashboard />} />

                        {/* Fallback Route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

// Main App component
function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;