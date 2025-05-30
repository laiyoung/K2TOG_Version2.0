import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';
import Classes from './pages/Classes';
import Contact from './pages/Contact';
import ClassDetails from './pages/ClassDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfilePage from './components/profile/ProfilePage';
import './App.css';

// Protected Route component
const ProtectedRoute = React.memo(({ children }) => {
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
});

// Admin Route component
const AdminRoute = React.memo(({ children }) => {
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
});

// Header wrapper component to always render header
const HeaderWrapper = React.memo(() => {
    return <Header />;
});

// AppContent component that uses useAuth
function AppContent() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    // Memoize routes to prevent unnecessary re-renders
    const routes = useMemo(() => (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:id" element={<ClassDetails />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route path="/profile" element={
                <ProtectedRoute>
                    <ProfilePage />
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <AdminRoute>
                    <Navigate to="/admin/analytics" replace />
                </AdminRoute>
            } />
            <Route path="/admin/analytics" element={
                <AdminRoute>
                    <div className="admin-route">
                        <AdminDashboard defaultSection="analytics" />
                    </div>
                </AdminRoute>
            } />
            <Route path="/admin/users" element={
                <AdminRoute>
                    <div className="admin-route">
                        <AdminDashboard defaultSection="users" />
                    </div>
                </AdminRoute>
            } />
            <Route path="/admin/classes" element={
                <AdminRoute>
                    <div className="admin-route">
                        <AdminDashboard defaultSection="classes" />
                    </div>
                </AdminRoute>
            } />
            <Route path="/admin/enrollments" element={
                <AdminRoute>
                    <div className="admin-route">
                        <AdminDashboard defaultSection="enrollments" />
                    </div>
                </AdminRoute>
            } />
            <Route path="/admin/financial" element={
                <AdminRoute>
                    <div className="admin-route">
                        <AdminDashboard defaultSection="financial" />
                    </div>
                </AdminRoute>
            } />
            <Route path="/admin/certificates" element={
                <AdminRoute>
                    <div className="admin-route">
                        <AdminDashboard defaultSection="certificates" />
                    </div>
                </AdminRoute>
            } />
            <Route path="/admin/notifications" element={
                <AdminRoute>
                    <div className="admin-route">
                        <AdminDashboard defaultSection="notifications" />
                    </div>
                </AdminRoute>
            } />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    ), []);

    return (
        <div className="min-h-screen bg-gray-50">
            <HeaderWrapper />
            {isAdminRoute ? (
                routes
            ) : (
                <main className="container mx-auto px-4 py-8">
                    {routes}
                </main>
            )}
        </div>
    );
}

// Main App component
const App = React.memo(() => {
    return (
        <Router>
            <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </SnackbarProvider>
        </Router>
    );
});

export default App;