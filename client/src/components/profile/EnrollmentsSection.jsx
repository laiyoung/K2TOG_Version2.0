import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Grid,
    Divider,
    IconButton,
    Tooltip,
    LinearProgress
} from '@mui/material';
import {
    CheckCircle as AcceptedIcon,
    Pending as PendingIcon,
    Cancel as DeclinedIcon,
    Info as InfoIcon,
    CalendarToday as CalendarIcon,
    Person as TeacherIcon,
    AccessTime as ScheduleIcon,
    LocationOn as LocationIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import './EnrollmentsSection.css';

const EnrollmentsSection = ({ enrollments }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'declined':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <AcceptedIcon />;
            case 'pending':
                return <PendingIcon />;
            case 'declined':
                return <DeclinedIcon />;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateCapacityPercentage = (current, total) => {
        return (current / total) * 100;
    };

    return (
        <Box className="enrollments-section">
            <Typography variant="h6" component="h2" gutterBottom>
                Class Enrollments
            </Typography>

            {!enrollments || enrollments.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No class enrollments found
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3} sx={{ flexWrap: 'wrap' }} alignItems="stretch">
                    {enrollments.map((enrollment) => (
                        <Grid
                            key={enrollment.enrollment_id}
                            sx={{
                                width: 280,
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                            }}
                        >
                            <Paper
                                elevation={1}
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    mb: 2,
                                    '&:hover': {
                                        boxShadow: 2
                                    }
                                }}
                            >
                                <Box className="enrollment-content">
                                    <Box className="enrollment-header">
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="h6" component="h3">
                                                    {enrollment.class_name || 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                icon={getStatusIcon(enrollment.enrollment_status)}
                                                label={enrollment.enrollment_status ? enrollment.enrollment_status.charAt(0).toUpperCase() + enrollment.enrollment_status.slice(1) : 'N/A'}
                                                color={getStatusColor(enrollment.enrollment_status)}
                                                size="small"
                                            />
                                        </Box>
                                    </Box>

                                    <Box className="enrollment-details">
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <TeacherIcon color="action" fontSize="small" />
                                                <Typography variant="body2">
                                                    Instructor: {enrollment.instructor_name || 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ScheduleIcon color="action" fontSize="small" />
                                                <Typography variant="body2">
                                                    Schedule: {enrollment.start_time && enrollment.end_time ? `${enrollment.start_time} - ${enrollment.end_time}` : 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LocationIcon color="action" fontSize="small" />
                                                <Typography variant="body2" noWrap>
                                                    Location: {enrollment.location || 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CalendarIcon color="action" fontSize="small" />
                                                <Typography variant="body2" noWrap>
                                                    {enrollment.start_date ? formatDate(enrollment.start_date) : 'N/A'} - {enrollment.end_date ? formatDate(enrollment.end_date) : 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <GroupIcon color="action" fontSize="small" />
                                                <Box sx={{ width: '100%' }}>
                                                    <Typography variant="body2" sx={{ mb: 0.5 }} noWrap>
                                                        Class Capacity: {enrollment.current_students ?? 'N/A'}/{enrollment.capacity ?? 'N/A'} students
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={enrollment.current_students && enrollment.capacity ? calculateCapacityPercentage(enrollment.current_students, enrollment.capacity) : 0}
                                                        sx={{ height: 6, borderRadius: 3 }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box className="enrollment-footer">
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Enrolled: {enrollment.enrollment_date ? formatDate(enrollment.enrollment_date) : 'N/A'}
                                        </Typography>

                                        {enrollment.enrollment_status === 'declined' && enrollment.decline_reason && (
                                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                                Reason: {enrollment.decline_reason}
                                            </Typography>
                                        )}

                                        {enrollment.enrollment_status === 'pending' && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                Your enrollment request is being reviewed. We'll notify you once it's processed.
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default EnrollmentsSection; 