import React, { useState, useEffect } from 'react';
import { mockData } from '../../mockData/adminDashboardData';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        summary: null,
        revenue: null,
        enrollments: null,
        userEngagement: null,
        userActivity: null
    });

    const fetchDashboardData = () => {
        try {
            setLoading(true);
            // Simulate API delay
            setTimeout(() => {
                setDashboardData({
                    summary: mockData.analytics.summary,
                    revenue: mockData.analytics.revenue,
                    enrollments: mockData.analytics.enrollments,
                    userEngagement: mockData.analytics.userEngagement,
                    userActivity: mockData.analytics.userActivity
                });
                setError(null);
                setLoading(false);
            }, 500);
        } catch (err) {
            setError('Failed to fetch analytics data. Please try again later.');
            console.error('Error fetching analytics data:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // Refresh data every 5 minutes
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    const { summary, revenue, enrollments, userEngagement, userActivity } = dashboardData;

    // Revenue chart data
    const revenueChartData = {
        labels: revenue?.monthly.map(item => item.month) || [],
        datasets: [
            {
                label: 'Monthly Revenue',
                data: revenue?.monthly.map(item => item.amount) || [],
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4
            }
        ]
    };

    // Enrollment trends chart data
    const enrollmentChartData = {
        labels: enrollments?.trends.map(item => item.month) || [],
        datasets: [
            {
                label: 'Enrollments',
                data: enrollments?.trends.map(item => item.count) || [],
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }
        ]
    };

    // User engagement chart data
    const userEngagementData = {
        labels: ['Active', 'Inactive', 'New'],
        datasets: [
            {
                data: [
                    userEngagement?.activeUsers || 0,
                    userEngagement?.inactiveUsers || 0,
                    userEngagement?.newUsers || 0
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.5)',
                    'rgba(245, 158, 11, 0.5)',
                    'rgba(59, 130, 246, 0.5)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(59, 130, 246, 1)'
                ],
                borderWidth: 1
            }
        ]
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
                <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Refresh Data
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        ${summary?.totalRevenue?.toLocaleString() || 0}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        {summary?.revenueGrowth > 0 ? '+' : ''}
                        {summary?.revenueGrowth || 0}% from last month
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Active Enrollments</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {summary?.activeEnrollments || 0}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        {summary?.enrollmentGrowth > 0 ? '+' : ''}
                        {summary?.enrollmentGrowth || 0}% from last month
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {summary?.totalUsers || 0}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        {summary?.newUsersThisMonth || 0} new this month
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Active Classes</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {summary?.activeClasses || 0}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        {summary?.classGrowth > 0 ? '+' : ''}
                        {summary?.classGrowth || 0}% from last month
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
                    <Line
                        data={revenueChartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: value => `$${value}`
                                    }
                                }
                            }
                        }}
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment Trends</h3>
                    <Bar
                        data={enrollmentChartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Engagement</h3>
                    <div className="h-64">
                        <Doughnut
                            data={userEngagementData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right'
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent User Activity</h3>
                    <div className="space-y-4">
                        {userActivity?.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' :
                                    activity.type === 'warning' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Classes</h3>
                    <div className="space-y-4">
                        {enrollments?.topClasses.map((cls, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{cls.name}</span>
                                <span className="text-sm font-medium text-gray-900">{cls.enrollments} enrollments</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Class</h3>
                    <div className="space-y-4">
                        {revenue?.byClass.map((cls, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{cls.name}</span>
                                <span className="text-sm font-medium text-gray-900">${cls.revenue}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity Summary</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Active Sessions</span>
                            <span className="text-sm font-medium text-gray-900">{userActivity?.activeSessions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">New Registrations</span>
                            <span className="text-sm font-medium text-gray-900">{userActivity?.newRegistrations}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Completed Classes</span>
                            <span className="text-sm font-medium text-gray-900">{userActivity?.completedClasses}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsDashboard; 