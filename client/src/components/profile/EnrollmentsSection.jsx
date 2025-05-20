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
            case 'accepted':
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
            case 'accepted':
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

            {enrollments.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No class enrollments found
                    </Typography>
                </Paper>
            ) : (
                <Grid container>
                    {enrollments.map((enrollment) => (
                        <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 2,
                                    height: '100%',
                                    '&:hover': {
                                        boxShadow: 2
                                    }
                                }}
                            >
                                <Box className="enrollment-content">
                                    <Box className="enrollment-header">
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="h6" component="h3" noWrap>
                                                    {enrollment.class_name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
                                                    {enrollment.class_description}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                icon={getStatusIcon(enrollment.status)}
                                                label={enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                                                color={getStatusColor(enrollment.status)}
                                                size="small"
                                            />
                                        </Box>
                                    </Box>

                                    <Box className="enrollment-details">
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <TeacherIcon color="action" fontSize="small" />
                                                <Typography variant="body2" noWrap>
                                                    Teacher: {enrollment.teacher_name}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ScheduleIcon color="action" fontSize="small" />
                                                <Typography variant="body2" noWrap>
                                                    Schedule: {enrollment.schedule}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LocationIcon color="action" fontSize="small" />
                                                <Typography variant="body2" noWrap>
                                                    Location: {enrollment.location}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CalendarIcon color="action" fontSize="small" />
                                                <Typography variant="body2" noWrap>
                                                    {formatDate(enrollment.start_date)} - {formatDate(enrollment.end_date)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <GroupIcon color="action" fontSize="small" />
                                                <Box sx={{ width: '100%' }}>
                                                    <Typography variant="body2" sx={{ mb: 0.5 }} noWrap>
                                                        Class Capacity: {enrollment.current_students}/{enrollment.capacity} students
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={calculateCapacityPercentage(enrollment.current_students, enrollment.capacity)}
                                                        sx={{ height: 6, borderRadius: 3 }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box className="enrollment-footer">
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Enrolled: {formatDate(enrollment.enrollment_date)}
                                        </Typography>

                                        {enrollment.status === 'declined' && enrollment.decline_reason && (
                                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                                Reason: {enrollment.decline_reason}
                                            </Typography>
                                        )}

                                        {enrollment.status === 'pending' && (
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