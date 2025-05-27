import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import enrollmentService from '../../services/enrollmentService';
import { Box, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Paper, Grid, Card, CardContent, Typography, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Visibility as VisibilityIcon, Check as CheckIcon, Block, Download as DownloadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNotifications } from '../../utils/notificationUtils';

function EnrollmentManagement() {
    const { showSuccess, showError } = useNotifications();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        classId: 'all',
        dateRange: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            end: new Date()
        }
    });

    useEffect(() => {
        fetchEnrollments();
        fetchDashboardStats();
        fetchAnalytics();
    }, [filters]);

    const fetchDashboardStats = async () => {
        try {
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (error) {
            handleError(error, 'Failed to fetch dashboard statistics');
        }
    };

    const fetchAnalytics = async () => {
        try {
            const data = await adminService.getAnalytics('enrollments', {
                startDate: filters.dateRange.start.toISOString(),
                endDate: filters.dateRange.end.toISOString()
            });
            setAnalytics(data);
        } catch (error) {
            handleError(error, 'Failed to fetch analytics data');
        }
    };

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const data = await enrollmentService.getEnrollments(filters);
            setEnrollments(data);
        } catch (error) {
            handleError(error, 'Failed to fetch enrollments');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (enrollmentId, newStatus) => {
        try {
            setLoading(true);
            await enrollmentService.updateEnrollmentStatus(enrollmentId, newStatus);
            await fetchEnrollments();
            showSuccess('Enrollment status updated successfully');
        } catch (error) {
            handleError(error, 'Failed to update enrollment status');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setEnrollmentDialogOpen(true);
    };

    const handleCloseEnrollmentDialog = () => {
        setEnrollmentDialogOpen(false);
        // Don't clear selectedEnrollment immediately to avoid flicker
        setTimeout(() => setSelectedEnrollment(null), 150);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleExportEnrollments = async () => {
        try {
            setLoading(true);
            const data = await enrollmentService.exportEnrollments(filters);
            // Create and download CSV file
            const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `enrollments-${filters.dateRange.start.toISOString().split('T')[0]}-to-${filters.dateRange.end.toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showSuccess('Enrollments exported successfully');
        } catch (error) {
            handleError(error, 'Failed to export enrollments');
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error, message) => {
        setError(message);
        console.error(error);
        showError(message);
        // Auto-clear error after 5 seconds
        setTimeout(() => setError(null), 5000);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <CircularProgress />
            </div>
        );
    }

    return (
        <Box className="enrollment-management p-4">
            {error && (
                <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {/* Dashboard Stats Section */}
            <Grid container spacing={3} className="mb-6">
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Enrollments
                            </Typography>
                            <Typography variant="h4">
                                {stats?.totalEnrollments || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Pending Approvals
                            </Typography>
                            <Typography variant="h4">
                                {stats?.pendingEnrollments || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Active Students
                            </Typography>
                            <Typography variant="h4">
                                {stats?.activeStudents || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Enrollment Rate
                            </Typography>
                            <Typography variant="h4">
                                {analytics?.enrollmentRate ? `${analytics.enrollmentRate}%` : '0%'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Analytics Summary */}
            {analytics && (
                <Box className="mb-6">
                    <Typography variant="h6" className="mb-2">Enrollment Analytics</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Paper className="p-3">
                                <Typography variant="subtitle2" color="textSecondary">
                                    Average Processing Time
                                </Typography>
                                <Typography variant="h6">
                                    {analytics.avgProcessingTime || '0'} days
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper className="p-3">
                                <Typography variant="subtitle2" color="textSecondary">
                                    Most Popular Class
                                </Typography>
                                <Typography variant="h6">
                                    {analytics.mostPopularClass || 'N/A'}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper className="p-3">
                                <Typography variant="subtitle2" color="textSecondary">
                                    Completion Rate
                                </Typography>
                                <Typography variant="h6">
                                    {analytics.completionRate ? `${analytics.completionRate}%` : '0%'}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Filter Section */}
            <Box className="mb-4">
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.status}
                                label="Status"
                                onChange={(e) => handleFilterChange({ status: e.target.value })}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportEnrollments}
                            disabled={loading}
                        >
                            Export
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Class</TableCell>
                            <TableCell>Enrollment Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {enrollments.map((enrollment) => (
                            <TableRow key={enrollment.id}>
                                <TableCell>{enrollment.studentName}</TableCell>
                                <TableCell>{enrollment.className}</TableCell>
                                <TableCell>
                                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={enrollment.status}
                                        color={getStatusColor(enrollment.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleViewDetails(enrollment)}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                    {enrollment.status === 'pending' && (
                                        <>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleStatusUpdate(enrollment.id, 'approved')}
                                            >
                                                <CheckIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleStatusUpdate(enrollment.id, 'rejected')}
                                                color="error"
                                            >
                                                <Block />
                                            </IconButton>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Enrollment Details Dialog */}
            {enrollmentDialogOpen && selectedEnrollment && (
                <Dialog
                    open={enrollmentDialogOpen}
                    onClose={handleCloseEnrollmentDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Enrollment Details</Typography>
                            <IconButton onClick={handleCloseEnrollmentDialog} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">User</Typography>
                                <Typography variant="body1">{selectedEnrollment.studentName}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Class</Typography>
                                <Typography variant="body1">{selectedEnrollment.className}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                                <Typography variant="body1">{selectedEnrollment.status}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                                <Typography variant="body1">
                                    {new Date(selectedEnrollment.enrollmentDate).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            {selectedEnrollment.notes && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                                    <Typography variant="body1">{selectedEnrollment.notes}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEnrollmentDialog}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}

export default EnrollmentManagement; 