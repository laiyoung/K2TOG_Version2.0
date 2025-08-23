import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../utils/notificationUtils';
import enrollmentService from '../../services/enrollmentService';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    Info as InfoIcon
} from '@mui/icons-material';

function MyWaitlist() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotifications();
    const [waitlistEntries, setWaitlistEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWaitlistEntries();
    }, []);

    const fetchWaitlistEntries = async () => {
        try {
            setLoading(true);
            const entries = await enrollmentService.getUserWaitlistEntries();
            // Only show pending waitlist entries - accepted/rejected ones are now in enrollments
            const pendingEntries = entries.filter(entry =>
                entry.status === 'waiting' || entry.status === 'pending' || entry.status === 'offered'
            );
            setWaitlistEntries(pendingEntries);
        } catch (err) {
            setError(err.message || 'Failed to fetch waitlist entries');
            showError('Failed to load waitlist entries');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveWaitlist = async (classId) => {
        try {
            await enrollmentService.leaveWaitlist(classId);
            showSuccess('Removed from waitlist');
            fetchWaitlistEntries();
        } catch (err) {
            showError(err.message || 'Failed to leave waitlist');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'waiting':
                return 'warning';
            case 'offered':
                return 'info';
            case 'accepted':
                return 'success';
            case 'declined':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatWaitTime = (days) => {
        if (!days) return 'Calculating...';
        if (days < 1) return 'Less than a day';
        if (days === 1) return '1 day';
        return `${Math.ceil(days)} days`;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (waitlistEntries.length === 0) {
        return (
            <Box textAlign="center" py={4}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                    No Pending Waitlist Entries
                </Typography>
                <Typography color="textSecondary">
                    You are not currently on any pending waitlists. Check your enrollments for approved or rejected applications.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/classes')}
                    sx={{ mt: 2 }}
                >
                    Browse Classes
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                My Pending Waitlist
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Showing only pending waitlist entries. Approved or rejected applications can be found in your enrollments.
            </Typography>
            <Grid container spacing={3}>
                {waitlistEntries.map((entry) => (
                    <Grid item xs={12} key={entry.id}>
                        <Card>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={8}>
                                        <Typography variant="h6" gutterBottom>
                                            {entry.class_title}
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Chip
                                                label={entry.status.toUpperCase()}
                                                color={getStatusColor(entry.status)}
                                                size="small"
                                            />
                                            {entry.status === 'waiting' && (
                                                <Chip
                                                    icon={<AccessTimeIcon />}
                                                    label={`Position: ${entry.position}`}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                        <Grid container spacing={2} sx={{ mt: 1 }}>
                                            <Grid item xs={12} sm={6}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <CalendarIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        {formatDate(entry.start_date)} - {formatDate(entry.end_date)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <LocationIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        {entry.location_details}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            {entry.status === 'waiting' && (
                                                <Grid item xs={12}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <AccessTimeIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            Estimated wait time: {formatWaitTime(entry.estimated_wait_time)}
                                                        </Typography>
                                                        <Tooltip title="Based on historical enrollment patterns and current position">
                                                            <IconButton size="small">
                                                                <InfoIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Box display="flex" flexDirection="column" gap={1} alignItems="flex-end">
                                            {entry.status === 'waiting' && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleLeaveWaitlist(entry.class_id)}
                                                >
                                                    Leave Waitlist
                                                </Button>
                                            )}
                                            {entry.status === 'offered' && (
                                                <Box>
                                                    <Typography variant="body2" color="info.main" gutterBottom>
                                                        A spot is available! You have 24 hours to accept.
                                                    </Typography>
                                                    <Box display="flex" gap={1}>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            onClick={() => navigate(`/classes/${entry.class_id}`)}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => handleLeaveWaitlist(entry.class_id)}
                                                        >
                                                            Decline
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            )}
                                            <Button
                                                variant="text"
                                                onClick={() => navigate(`/classes/${entry.class_id}`)}
                                            >
                                                View Class Details
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default MyWaitlist; 