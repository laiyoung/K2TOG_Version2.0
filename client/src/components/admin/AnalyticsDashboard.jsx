import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useNotifications } from '../../utils/notificationUtils';
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
import { Box, Grid, Paper, Typography, Select, MenuItem, FormControl, InputLabel, Button, Alert, List, ListItem, ListItemText } from '@mui/material';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Download } from '@mui/icons-material';

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
const ENABLE_EXPORT = false; // Set to true when backend endpoint is implemented

function AnalyticsDashboard() {
    const { showSuccess, showError } = useNotifications();
    const [analyticsData, setAnalyticsData] = useState({
        summary: null,
        revenue: null,
        revenueByClass: null,
        enrollmentTrends: null,
        classEnrollments: null,
        userEngagement: null,
        userActivity: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        end: new Date()
    });
    const [selectedMetric, setSelectedMetric] = useState('summary');

    useEffect(() => {
        fetchAnalyticsData();
    }, [dateRange, selectedMetric]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const filters = {
                startDate: dateRange.start.toISOString(),
                endDate: dateRange.end.toISOString()
            };

            // Fetch all analytics data in parallel
            const [
                summaryData,
                revenueData,
                revenueByClassData,
                enrollmentTrendsData,
                classEnrollmentsData,
                userEngagementData,
                userActivityData
            ] = await Promise.all([
                adminService.getAnalytics('summary', filters),
                adminService.getAnalytics('revenue', filters),
                adminService.getAnalytics('revenue-by-class', filters),
                adminService.getAnalytics('enrollments', filters),
                adminService.getAnalytics('class-enrollments', filters),
                adminService.getAnalytics('user-engagement', filters),
                adminService.getAnalytics('user-activity', filters)
            ]);

            setAnalyticsData({
                summary: summaryData,
                revenue: revenueData,
                revenueByClass: revenueByClassData,
                enrollmentTrends: enrollmentTrendsData,
                classEnrollments: classEnrollmentsData,
                userEngagement: userEngagementData,
                userActivity: userActivityData
            });
        } catch (error) {
            handleError(error, 'Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (newDateRange) => {
        setDateRange(newDateRange);
    };

    const handleExportReport = async () => {
        if (!ENABLE_EXPORT) {
            showError('Export functionality is not yet available');
            return;
        }

        try {
            setLoading(true);
            const filters = {
                startDate: dateRange.start.toISOString(),
                endDate: dateRange.end.toISOString()
            };
            const data = await adminService.exportAnalyticsReport(selectedMetric, filters);
            // Create and download CSV file
            const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-report-${selectedMetric}-${dateRange.start.toISOString().split('T')[0]}-to-${dateRange.end.toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showSuccess('Analytics report exported successfully');
        } catch (error) {
            handleError(error, 'Failed to export analytics report');
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error, customMessage = 'An error occurred') => {
        console.error(error);
        setError(error.message || customMessage);
        showError(error.message || customMessage);
    };

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
                            value={dateRange.start}
                            onChange={(date) => handleDateRangeChange({ ...dateRange, start: date })}
                        />
                        <DatePicker
                            label="End Date"
                            value={dateRange.end}
                            onChange={(date) => handleDateRangeChange({ ...dateRange, end: date })}
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
                        disabled={loading || !ENABLE_EXPORT}
                        title={!ENABLE_EXPORT ? "Export functionality coming soon" : "Export Report"}
                    >
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        ${analyticsData.summary?.monthly_revenue?.toLocaleString() || 0}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        {analyticsData.summary?.recent_payments || 0} recent payments
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Active Enrollments</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {analyticsData.summary?.active_enrollments || 0}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        {analyticsData.summary?.enrollment_rate || 0}% enrollment rate
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {analyticsData.summary?.active_users || 0}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        {analyticsData.summary?.recent_certificates || 0} recent certificates
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Active Classes</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {analyticsData.summary?.active_classes || 0}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        {analyticsData.summary?.waitlist_count || 0} on waitlist
                    </p>
                </div>
            </div>

            {/* Charts */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Enrollment Trends
                        </Typography>
                        <Line
                            data={{
                                labels: analyticsData.enrollmentTrends?.map(item => new Date(item.period).toLocaleDateString()) || [],
                                datasets: [{
                                    label: 'Total Enrollments',
                                    data: analyticsData.enrollmentTrends?.map(item => item.total_enrollments) || [],
                                    borderColor: 'rgba(16, 185, 129, 1)',
                                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                    tension: 0.4
                                }, {
                                    label: 'Approved Enrollments',
                                    data: analyticsData.enrollmentTrends?.map(item => item.approved_enrollments) || [],
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
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Revenue Overview
                        </Typography>
                        <Bar
                            data={{
                                labels: analyticsData.revenue?.map(item => new Date(item.period).toLocaleDateString()) || [],
                                datasets: [{
                                    label: 'Net Revenue',
                                    data: analyticsData.revenue?.map(item => item.net_revenue) || [],
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
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Class Performance
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Class</TableCell>
                                        <TableCell>Enrollments</TableCell>
                                        <TableCell>Attendance Rate</TableCell>
                                        <TableCell>Revenue</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {analyticsData?.classStats?.performance?.map((classData) => (
                                        <TableRow key={classData.id}>
                                            <TableCell>{classData.name}</TableCell>
                                            <TableCell>{classData.enrollments}</TableCell>
                                            <TableCell>{classData.attendanceRate}%</TableCell>
                                            <TableCell>${classData.revenue}</TableCell>
                                        </TableRow>
                                    )) || (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No class performance data available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Attendance Analysis
                        </Typography>
                        {analyticsData?.attendanceStats?.byClass ? (
                            <Pie
                                data={{
                                    labels: analyticsData.attendanceStats.byClass.map(item => item.class),
                                    datasets: [{
                                        data: analyticsData.attendanceStats.byClass.map(item => item.attendance),
                                        backgroundColor: [
                                            'rgba(255, 99, 132, 0.5)',
                                            'rgba(54, 162, 235, 0.5)',
                                            'rgba(255, 206, 86, 0.5)',
                                            'rgba(75, 192, 192, 0.5)',
                                            'rgba(153, 102, 255, 0.5)'
                                        ],
                                        borderColor: [
                                            'rgba(255, 99, 132, 1)',
                                            'rgba(54, 162, 235, 1)',
                                            'rgba(255, 206, 86, 1)',
                                            'rgba(75, 192, 192, 1)',
                                            'rgba(153, 102, 255, 1)'
                                        ],
                                        borderWidth: 1
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'right'
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <Typography align="center" color="textSecondary">
                                No attendance data available
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Additional Metrics */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Top Performing Classes
                        </Typography>
                        <List>
                            {analyticsData?.classEnrollments?.map((cls, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={cls.class_name}
                                        secondary={`${cls.total_enrollments} enrollments (${cls.enrollment_rate}% rate)`}
                                    />
                                </ListItem>
                            )) || (
                                    <ListItem>
                                        <ListItemText primary="No data available" />
                                    </ListItem>
                                )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Revenue by Class
                        </Typography>
                        <List>
                            {analyticsData?.revenueByClass?.map((cls, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={cls.class_name}
                                        secondary={`$${cls.net_revenue.toLocaleString()} (${cls.enrollment_count} enrollments)`}
                                    />
                                </ListItem>
                            )) || (
                                    <ListItem>
                                        <ListItemText primary="No data available" />
                                    </ListItem>
                                )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            User Engagement Summary
                        </Typography>
                        <List>
                            {analyticsData?.userEngagement?.map((user, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={`${user.first_name} ${user.last_name}`}
                                        secondary={`${user.enrolled_classes} classes, ${user.activity_count} activities`}
                                    />
                                </ListItem>
                            )) || (
                                    <ListItem>
                                        <ListItemText primary="No data available" />
                                    </ListItem>
                                )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default AnalyticsDashboard; 