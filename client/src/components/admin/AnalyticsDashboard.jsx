import React, { useState, useEffect, useMemo, useCallback } from 'react';
import adminService from '../../services/adminService';
import { useNotifications } from '../../utils/notificationUtils';
import { API_BASE_URL } from '../../config/apiConfig.js';
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
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Box, Grid, Paper, Typography, Select, MenuItem, FormControl, InputLabel, Button, Alert, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Download } from '@mui/icons-material';
import { parseISO, isValid, format, subYears, startOfDay, endOfDay } from 'date-fns';

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

// Feature flag for export functionality
const ENABLE_EXPORT = false;

// Add this utility function at the top of the file, after imports
const parseNumericValue = (value) => {
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }
    return value || 0;
};

// Helper to ensure value is a Date object or null
const toDateOrNull = (val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    const parsed = parseISO(val);
    return isValid(parsed) ? parsed : null;
};

// Helper to format date for API calls
const formatDateForAPI = (date) => {
    if (!date) return '';
    if (typeof date === 'string') {
        const parsed = parseISO(date);
        return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : '';
    }
    return format(date, 'yyyy-MM-dd');
};

// Helper to get default date range (last year to today)
const getDefaultDateRange = () => {
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subYears(endDate, 1));
    return { startDate, endDate };
};

function AnalyticsDashboard() {
    const { showSuccess, showError } = useNotifications();
    const [analyticsData, setAnalyticsData] = useState({
        summary: {
            totalRevenue: 0,
            totalEnrollments: 0,
            activeUsers: 0,
            averageAttendance: 0
        },
        revenue: [],
        revenueByClass: [],
        enrollmentTrends: [],
        classEnrollments: [],
        userEngagement: [],
        userActivity: []
    });
    const [loadingStates, setLoadingStates] = useState({
        summary: true,
        revenue: true,
        revenueByClass: true,
        enrollmentTrends: true,
        classEnrollments: true,
        userEngagement: true,
        userActivity: true
    });
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState(getDefaultDateRange());
    const [selectedMetric, setSelectedMetric] = useState('revenue');

    // Memoize the date range string to prevent unnecessary re-renders
    const dateRangeString = useMemo(() => ({
        startDate: formatDateForAPI(dateRange.startDate),
        endDate: formatDateForAPI(dateRange.endDate)
    }), [dateRange.startDate, dateRange.endDate]);

    // Memoize the updateLoadingState function
    const updateLoadingState = useCallback((key, isLoading) => {
        setLoadingStates(prev => ({
            ...prev,
            [key]: isLoading
        }));
    }, []);

    // Memoize the fetchAnalyticsData function
    const fetchAnalyticsData = useCallback(async () => {
        try {
            setLoadingStates(prev => ({
                ...prev,
                summary: true,
                revenue: true,
                revenueByClass: true,
                enrollmentTrends: true,
                classEnrollments: true,
                userEngagement: true,
                userActivity: true
            }));

            // Log the date range being sent
            console.log('Fetching analytics with date range:', {
                startDate: formatDateForAPI(dateRange.startDate),
                endDate: formatDateForAPI(dateRange.endDate)
            });

            // Fetch all analytics data in parallel
            const [
                summaryRes,
                revenueByClassRes,
                classEnrollmentsRes,
                userEngagementRes
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/analytics/summary?startDate=${formatDateForAPI(dateRange.startDate)}&endDate=${formatDateForAPI(dateRange.endDate)}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch(`${API_BASE_URL}/admin/analytics/revenue/classes?startDate=${formatDateForAPI(dateRange.startDate)}&endDate=${formatDateForAPI(dateRange.endDate)}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch(`${API_BASE_URL}/admin/analytics/enrollments/classes?startDate=${formatDateForAPI(dateRange.startDate)}&endDate=${formatDateForAPI(dateRange.endDate)}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch(`${API_BASE_URL}/admin/analytics/users/engagement?startDate=${formatDateForAPI(dateRange.startDate)}&endDate=${formatDateForAPI(dateRange.endDate)}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            if (!summaryRes.ok) throw new Error('Failed to fetch summary');
            if (!revenueByClassRes.ok) throw new Error('Failed to fetch revenue by class');
            if (!classEnrollmentsRes.ok) throw new Error('Failed to fetch class enrollments');
            if (!userEngagementRes.ok) throw new Error('Failed to fetch user engagement');

            const summary = await summaryRes.json();
            const revenueByClass = await revenueByClassRes.json();
            const classEnrollments = await classEnrollmentsRes.json();
            const userEngagement = await userEngagementRes.json();

            setAnalyticsData({
                summary: {
                    monthlyRevenue: Number(summary.monthly_revenue) || 0,
                    activeEnrollments: Number(summary.active_enrollments) || 0,
                    activeUsers: Number(summary.active_users) || 0,
                    activeClasses: Number(summary.active_classes) || 0,
                    recentPayments: Number(summary.recent_payments) || 0,
                    recentCertificates: Number(summary.recent_certificates) || 0,
                    waitlistCount: Number(summary.waitlist_count) || 0,
                    enrollmentRate: Number(summary.enrollment_rate) || 0,
                },
                revenue: [], // Not used in these cards
                revenueByClass: Array.isArray(revenueByClass) ? revenueByClass : [],
                enrollmentTrends: [], // Not used in these cards
                classEnrollments: Array.isArray(classEnrollments) ? classEnrollments : [],
                userEngagement: Array.isArray(userEngagement) ? userEngagement : [],
                userActivity: []
            });
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err.message);
            showError('Failed to load analytics data');
        } finally {
            setLoadingStates(prev => ({
                ...prev,
                summary: false,
                revenue: false,
                revenueByClass: false,
                enrollmentTrends: false,
                classEnrollments: false,
                userEngagement: false,
                userActivity: false
            }));
        }
    }, [dateRange, showError]);

    // Memoize the handleDateRangeChange function with validation
    const handleDateRangeChange = useCallback((newDateRange) => {
        setDateRange(prev => {
            const updated = { ...prev, ...newDateRange };

            // Validate dates
            if (updated.startDate && updated.endDate) {
                if (updated.startDate > updated.endDate) {
                    showError('Start date cannot be after end date');
                    return prev;
                }
            }

            return updated;
        });
    }, [showError]);

    // Memoize the handleExportReport function
    const handleExportReport = useCallback(async () => {
        if (!ENABLE_EXPORT) {
            showError('Export functionality is not yet available');
            return;
        }

        try {
            const filters = {
                startDate: dateRangeString.startDate,
                endDate: dateRangeString.endDate
            };
            const data = await adminService.exportAnalyticsReport(selectedMetric, filters);
            const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-report-${selectedMetric}-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showSuccess('Analytics report exported successfully');
        } catch (error) {
            handleError(error, 'Failed to export analytics report');
        }
    }, [dateRange, dateRangeString, selectedMetric, showError, showSuccess]);

    // Memoize the handleError function
    const handleError = useCallback((error, customMessage = 'An error occurred') => {
        console.error(error);
        setError(error.message || customMessage);
        showError(error.message || customMessage);
    }, [showError]);

    // Effect to fetch data when component mounts with default dates
    useEffect(() => {
        fetchAnalyticsData();
    }, []); // Empty dependency array means this runs once on mount

    // Memoize the summary cards to prevent unnecessary re-renders
    const summaryCards = useMemo(() => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
                {loadingStates.summary ? (
                    <CircularProgress size={24} className="mt-2" />
                ) : (
                    <>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                            ${parseNumericValue(analyticsData.summary?.monthlyRevenue).toLocaleString()}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            {parseNumericValue(analyticsData.summary?.recentPayments)} recent payments
                        </p>
                    </>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Active Enrollments</h3>
                {loadingStates.summary ? (
                    <CircularProgress size={24} className="mt-2" />
                ) : (
                    <>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                            {parseNumericValue(analyticsData.summary?.activeEnrollments)}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            {parseNumericValue(analyticsData.summary?.enrollmentRate)}% enrollment rate
                        </p>
                    </>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                {loadingStates.summary ? (
                    <CircularProgress size={24} className="mt-2" />
                ) : (
                    <>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                            {parseNumericValue(analyticsData.summary?.activeUsers)}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            {parseNumericValue(analyticsData.summary?.recentCertificates)} recent certificates
                        </p>
                    </>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Active Classes</h3>
                {loadingStates.summary ? (
                    <CircularProgress size={24} className="mt-2" />
                ) : (
                    <>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                            {parseNumericValue(analyticsData.summary?.activeClasses)}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            {parseNumericValue(analyticsData.summary?.waitlistCount)} on waitlist
                        </p>
                    </>
                )}
            </div>
        </div>
    ), [analyticsData.summary, loadingStates.summary]);

    // Memoize the charts to prevent unnecessary re-renders
    const charts = useMemo(() => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper className="p-4">
                    <Typography variant="h6" gutterBottom>
                        Enrollment Trends
                    </Typography>
                    {loadingStates.enrollmentTrends ? (
                        <div className="flex justify-center items-center h-64">
                            <CircularProgress />
                        </div>
                    ) : (
                        <Line
                            data={{
                                labels: analyticsData.enrollmentTrends?.map(item => new Date(item.period).toLocaleDateString()) || [],
                                datasets: [{
                                    label: 'Total Enrollments',
                                    data: analyticsData.enrollmentTrends?.map(item => parseNumericValue(item.total_enrollments)) || [],
                                    borderColor: 'rgba(16, 185, 129, 1)',
                                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                    tension: 0.4
                                }, {
                                    label: 'Approved Enrollments',
                                    data: analyticsData.enrollmentTrends?.map(item => parseNumericValue(item.approved_enrollments)) || [],
                                    borderColor: 'rgba(59, 130, 246, 1)',
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    tension: 0.4
                                }]
                            }}
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
                    )}
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper className="p-4">
                    <Typography variant="h6" gutterBottom>
                        Revenue Overview
                    </Typography>
                    {loadingStates.revenue ? (
                        <div className="flex justify-center items-center h-64">
                            <CircularProgress />
                        </div>
                    ) : (
                        <Bar
                            data={{
                                labels: analyticsData.revenue?.map(item => new Date(item.period).toLocaleDateString()) || [],
                                datasets: [{
                                    label: 'Net Revenue',
                                    data: analyticsData.revenue?.map(item => parseNumericValue(item.net_revenue)) || [],
                                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                    borderColor: 'rgba(59, 130, 246, 1)',
                                    borderWidth: 1
                                }]
                            }}
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
                    )}
                </Paper>
            </Grid>
        </Grid>
    ), [analyticsData.enrollmentTrends, analyticsData.revenue, loadingStates.enrollmentTrends, loadingStates.revenue]);

    return (
        <Box className="analytics-dashboard">
            {error && (
                <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
                <div className="flex gap-4 items-center">
                    <FormControl>
                        <InputLabel>Metric</InputLabel>
                        <Select
                            value={selectedMetric}
                            label="Metric"
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="summary">Summary</MenuItem>
                            <MenuItem value="revenue">Revenue</MenuItem>
                            <MenuItem value="revenue-by-class">Revenue by Class</MenuItem>
                            <MenuItem value="enrollments">Enrollments</MenuItem>
                            <MenuItem value="class-enrollments">Class Enrollments</MenuItem>
                            <MenuItem value="user-engagement">User Engagement</MenuItem>
                            <MenuItem value="user-activity">User Activity</MenuItem>
                        </Select>
                    </FormControl>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={toDateOrNull(dateRange.startDate)}
                            onChange={(date) => handleDateRangeChange({ startDate: date })}
                            maxDate={dateRange.endDate || undefined}
                            slotProps={{
                                textField: {
                                    error: !dateRange.startDate,
                                    helperText: !dateRange.startDate ? 'Start date is required' : ''
                                }
                            }}
                        />
                        <DatePicker
                            label="End Date"
                            value={toDateOrNull(dateRange.endDate)}
                            onChange={(date) => handleDateRangeChange({ endDate: date })}
                            minDate={dateRange.startDate || undefined}
                            slotProps={{
                                textField: {
                                    error: !dateRange.endDate,
                                    helperText: !dateRange.endDate ? 'End date is required' : ''
                                }
                            }}
                        />
                    </LocalizationProvider>
                    <button
                        onClick={fetchAnalyticsData}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Refresh Data
                    </button>
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={handleExportReport}
                        disabled={!ENABLE_EXPORT}
                        title={!ENABLE_EXPORT ? "Export functionality coming soon" : "Export Report"}
                    >
                        Export Report
                    </Button>
                </div>
            </div>

            {summaryCards}
            {charts}

            {/* Additional Metrics */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Top Performing Classes
                        </Typography>
                        {loadingStates.classEnrollments ? (
                            <div className="flex justify-center items-center h-32">
                                <CircularProgress />
                            </div>
                        ) : (
                            <List>
                                {analyticsData.classEnrollments && analyticsData.classEnrollments.length > 0 ? (
                                    analyticsData.classEnrollments.map((cls, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={cls.class_name || cls.className}
                                                secondary={`${Number(cls.total_enrollments || cls.enrollment_count || 0)} enrollments (${Number(cls.enrollment_rate || 0).toFixed(2)}% rate)`}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No data available" />
                                    </ListItem>
                                )}
                            </List>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Revenue by Class
                        </Typography>
                        {loadingStates.revenueByClass ? (
                            <div className="flex justify-center items-center h-32">
                                <CircularProgress />
                            </div>
                        ) : (
                            <List>
                                {analyticsData.revenueByClass && analyticsData.revenueByClass.length > 0 ? (
                                    analyticsData.revenueByClass.map((cls, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={cls.class_name}
                                                secondary={`$${Number(cls.net_revenue || 0).toLocaleString()} (${Number(cls.enrollment_count || 0)} enrollments)`}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No data available" />
                                    </ListItem>
                                )}
                            </List>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            User Engagement Summary
                        </Typography>
                        {loadingStates.userEngagement ? (
                            <div className="flex justify-center items-center h-32">
                                <CircularProgress />
                            </div>
                        ) : (
                            <List>
                                {analyticsData.userEngagement && analyticsData.userEngagement.length > 0 ? (
                                    analyticsData.userEngagement.map((user, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={`${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`}
                                                secondary={`${Number(user.enrolled_classes || user.enrolledClasses || 0)} classes, ${Number(user.activity_count || user.activityCount || 0)} activities`}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No data available" />
                                    </ListItem>
                                )}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

// Export the memoized component
const MemoizedAnalyticsDashboard = React.memo(AnalyticsDashboard);
export default MemoizedAnalyticsDashboard; 