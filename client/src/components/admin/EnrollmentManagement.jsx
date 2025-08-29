import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import enrollmentService from '../../services/enrollmentService';
import { Box, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Paper, Grid, Card, CardContent, Typography, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Pagination } from '@mui/material';
import { Visibility as VisibilityIcon, Check as CheckIcon, Block, Download as DownloadIcon, Close as CloseIcon, Pending as PendingIcon } from '@mui/icons-material';
import { useNotifications } from '../../utils/notificationUtils';

function EnrollmentManagement() {
    const { showSuccess, showError } = useNotifications();
    const [enrollments, setEnrollments] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
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
    }, [filters, page, pageSize]);

    const fetchDashboardStats = async () => {
        try {
            console.log('Fetching dashboard stats...');
            const data = await adminService.getDashboardStats();
            console.log('Dashboard stats received:', data);
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            handleError(error, 'Failed to fetch dashboard statistics');
        }
    };

    const fetchAnalytics = async () => {
        try {
            console.log('Fetching analytics...');

            // Format dates as YYYY-MM-DD to avoid timezone issues and future date validation errors
            const formatLocalDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const data = await adminService.getAnalytics('enrollments', {
                startDate: formatLocalDate(filters.dateRange.start),
                endDate: formatLocalDate(filters.dateRange.end)
            });
            console.log('Analytics data received:', data);
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            handleError(error, 'Failed to fetch analytics data');
        }
    };

    const fetchEnrollments = async () => {
        try {
            setLoading(true);

            // Format dates as YYYY-MM-DD to avoid timezone issues
            const formatLocalDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const formattedFilters = {
                ...filters,
                startDate: formatLocalDate(filters.dateRange.start),
                endDate: formatLocalDate(filters.dateRange.end),
                page,
                limit: pageSize
            };
            // Remove the dateRange object as we've extracted its values
            delete formattedFilters.dateRange;

            console.log('Fetching enrollments with filters:', formattedFilters);
            const { enrollments: data, total } = await enrollmentService.getEnrollments(formattedFilters);
            console.log('Enrollments data received:', data, 'Total:', total);
            setEnrollments(data);
            setTotal(total);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            handleError(error, 'Failed to fetch enrollments');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (enrollmentId, newStatus) => {
        try {
            setLoading(true);
            const response = await enrollmentService.updateEnrollmentStatus(enrollmentId, newStatus);
            if (response.error) {
                throw new Error(response.error);
            }
            await fetchEnrollments();
            showSuccess(`Enrollment ${newStatus} successfully`);
        } catch (error) {
            handleError(error, `Failed to ${newStatus} enrollment`);
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
            // Format dates for export filename
            const formatLocalDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const data = await enrollmentService.exportEnrollments(filters);
            // Create and download CSV file
            const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `enrollments-${formatLocalDate(filters.dateRange.start)}-to-${formatLocalDate(filters.dateRange.end)}.csv`;
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
            <Box className="mb-6">
                <Typography variant="h5" className="mb-4" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Enrollment Overview
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem', mb: 1 }}>
                                    Active Enrollments
                                </Typography>
                                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 600 }}>
                                    {stats?.totalEnrollments || 0}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                                    From active classes only
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem', mb: 1 }}>
                                    Pending Approvals
                                </Typography>
                                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 600, color: 'warning.main' }}>
                                    {stats?.pendingEnrollments || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem', mb: 1 }}>
                                    Active Students
                                </Typography>
                                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 600, color: 'success.main' }}>
                                    {stats?.activeStudents || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem', mb: 1 }}>
                                    Enrollment Rate
                                </Typography>
                                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 600, color: 'info.main' }}>
                                    {analytics?.enrollmentRate ? `${analytics.enrollmentRate}%` : '0%'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>



            {/* Filter Section */}
            <Box className="mb-4">
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth size="small">
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
                </Grid>
            </Box>

            {/* Enrollments Table */}
            <Box className="mb-4">
                <Typography variant="h6" className="mb-3" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                    Enrollment Records
                </Typography>
                <TableContainer component={Paper} sx={{
                    overflowX: 'auto',
                    '& .MuiTable-root': {
                        minWidth: { xs: '600px', sm: 'auto' }
                    }
                }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    backgroundColor: 'grey.50'
                                }}>
                                    Student
                                </TableCell>
                                <TableCell sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    backgroundColor: 'grey.50'
                                }}>
                                    Class
                                </TableCell>
                                <TableCell sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    backgroundColor: 'grey.50'
                                }}>
                                    Session Date
                                </TableCell>
                                <TableCell sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    backgroundColor: 'grey.50'
                                }}>
                                    Enrollment Date
                                </TableCell>
                                <TableCell sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    backgroundColor: 'grey.50'
                                }}>
                                    Status
                                </TableCell>
                                <TableCell sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    backgroundColor: 'grey.50'
                                }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {enrollments.map((enrollment) => (
                                <TableRow key={enrollment.id} hover>
                                    <TableCell sx={{
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        py: 2
                                    }}>
                                        {enrollment.student_name}
                                    </TableCell>
                                    <TableCell sx={{
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        py: 2
                                    }}>
                                        {enrollment.class_name}
                                    </TableCell>
                                    <TableCell sx={{
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        py: 2
                                    }}>
                                        {new Date(enrollment.session_date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell sx={{
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        py: 2
                                    }}>
                                        {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <Chip
                                            label={enrollment.enrollment_status}
                                            color={getStatusColor(enrollment.enrollment_status)}
                                            size="small"
                                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Tooltip title="View Details" placement="top" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewDetails(enrollment)}
                                                    sx={{
                                                        p: 1,
                                                        '&:hover': { backgroundColor: 'primary.50' }
                                                    }}
                                                >
                                                    <VisibilityIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                                                </IconButton>
                                            </Tooltip>
                                            {enrollment.enrollment_status !== 'pending' && (
                                                <Tooltip title="Set Pending" placement="top" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleStatusUpdate(enrollment.id, 'pending')}
                                                        color="warning"
                                                        sx={{
                                                            p: 1,
                                                            '&:hover': { backgroundColor: 'warning.50' }
                                                        }}
                                                    >
                                                        <PendingIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {enrollment.enrollment_status !== 'approved' && (
                                                <Tooltip title="Approve Enrollment" placement="top" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleStatusUpdate(enrollment.id, 'approved')}
                                                        color="success"
                                                        sx={{
                                                            p: 1,
                                                            '&:hover': { backgroundColor: 'success.50' }
                                                        }}
                                                    >
                                                        <CheckIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {enrollment.enrollment_status !== 'rejected' && (
                                                <Tooltip title="Reject Enrollment" placement="top" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleStatusUpdate(enrollment.id, 'rejected')}
                                                        color="error"
                                                        sx={{
                                                            p: 1,
                                                            '&:hover': { backgroundColor: 'error.50' }
                                                        }}
                                                    >
                                                        <Block sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Pagination Controls */}
            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                    count={Math.ceil(total / pageSize)}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                    size="small"
                    showFirstButton
                    showLastButton
                />
            </Box>

            {/* Enrollment Details Dialog */}
            {enrollmentDialogOpen && selectedEnrollment && (
                <Dialog
                    open={enrollmentDialogOpen}
                    onClose={handleCloseEnrollmentDialog}
                    maxWidth="md"
                    fullWidth
                    sx={{ zIndex: 1450 }}
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
                                <Typography variant="subtitle2" color="textSecondary">Student</Typography>
                                <Typography variant="body1">{selectedEnrollment.student_name}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Class</Typography>
                                <Typography variant="body1">{selectedEnrollment.class_name}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                                <Typography variant="body1">{selectedEnrollment.enrollment_status}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                                <Typography variant="body1">
                                    {new Date(selectedEnrollment.enrollment_date).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            {selectedEnrollment.admin_notes && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                                    <Typography variant="body1">{selectedEnrollment.admin_notes}</Typography>
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