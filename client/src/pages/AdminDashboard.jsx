import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import UserManagement from '../components/admin/UserManagement';
import ClassManagement from '../components/admin/ClassManagement';
import CertificateManagement from '../components/admin/CertificateManagement';
import EnrollmentManagement from '../components/admin/EnrollmentManagement';
import FinancialManagement from '../components/admin/FinancialManagement';
import NotificationCenter from '../components/admin/NotificationCenter';
// import SystemSettings from '../components/admin/SystemSettings';
import mockData from '../mock/adminDashboardData.json';

function AdminDashboard() {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('analytics');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        setDashboardData(mockData);
        setLoading(false);
    }, []);

    const renderSection = () => {
        switch (activeSection) {
            case 'analytics':
                return <AnalyticsDashboard data={dashboardData} />;
            case 'users':
                return <UserManagement />;
            case 'classes':
                return <ClassManagement />;
            case 'enrollments':
                return <EnrollmentManagement />;
            case 'financial':
                return <FinancialManagement />;
            case 'certificates':
                return <CertificateManagement />;
            case 'notifications':
                return <NotificationCenter />;
            // case 'settings':
            //     return <SystemSettings />;
            default:
                return <div>Select a section from the sidebar</div>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Welcome, {user?.name || 'Admin'}
                    </p>
                </div>
                <div className="flex gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            {[
                                { id: 'analytics', label: 'Analytics', icon: '📊' },
                                { id: 'users', label: 'User Management', icon: '👥' },
                                { id: 'classes', label: 'Class Management', icon: '🏫' },
                                { id: 'enrollments', label: 'Enrollment Management', icon: '📝' },
                                { id: 'financial', label: 'Financial Management', icon: '💵' },
                                { id: 'certificates', label: 'Certificate Management', icon: '🎓' },
                                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                                // { id: 'settings', label: 'System Settings', icon: '⚙️' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${activeSection === item.id
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <div className="bg-white shadow rounded-lg">
                            <div className="p-6">
                                {renderSection()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard; 