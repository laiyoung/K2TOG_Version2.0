import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Grid,
    Divider,
    IconButton,
    Tooltip,
    LinearProgress,
    Tabs,
    Tab,
    Button,
    CircularProgress,
    Alert
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
    Group as GroupIcon,
    History as HistoryIcon,
    School as SchoolIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import './EnrollmentsSection.css';

const EnrollmentsSection = ({ enrollments, historicalEnrollments, loading = false, error = null, onRefresh }) => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
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
            case 'rejected':
                return <DeclinedIcon />;
            case 'declined':
                return <DeclinedIcon />;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'N/A';
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        try {
            const [hour, minute] = timeString.split(':');
            const date = new Date();
            date.setHours(Number(hour), Number(minute));
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } catch (error) {
            console.error('Error formatting time:', timeString, error);
            return timeString || 'N/A';
        }
    };

    const calculateCapacityPercentage = (current, total) => {
        if (!current || !total || total === 0) return 0;
        return Math.min((current / total) * 100, 100);
    };

    const renderEnrollmentCard = (enrollment, isHistorical = false) => (
        <Grid
            key={enrollment.enrollment_id || enrollment.historical_enrollment_id || `enrollment-${enrollment.class_name || enrollment.class_title}-${isHistorical ? 'historical' : 'active'}`}
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
                    },
                    border: isHistorical ? '2px solid #f0f0f0' : 'none',
                    backgroundColor: isHistorical ? '#fafafa' : 'white'
                }}
            >
                <Box className="enrollment-content">
                    <Box className="enrollment-header">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="h6" component="h3">
                                    {enrollment.class_name || enrollment.class_title || 'N/A'}
                                </Typography>
                                {isHistorical && (
                                    <Chip
                                        label="Historical"
                                        size="small"
                                        color="default"
                                        sx={{ mt: 0.5, fontSize: '0.7rem' }}
                                    />
                                )}
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
                                    Schedule: {enrollment.start_time && enrollment.end_time
                                        ? `${formatTime(enrollment.start_time)} - ${formatTime(enrollment.end_time)}`
                                        : 'N/A'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationIcon color="action" fontSize="small" />
                                <Typography variant="body2" noWrap>
                                    Location: {enrollment.location || enrollment.location_details || 'N/A'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon color="action" fontSize="small" />
                                <Typography variant="body2" noWrap>
                                    {enrollment.display_date || (enrollment.start_date ? formatDate(enrollment.start_date) : 'N/A')}
                                </Typography>
                            </Box>
                            {!isHistorical && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <GroupIcon color="action" fontSize="small" />
                                    <Box sx={{ width: '100%' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5 }} noWrap>
                                            Class Capacity: {(enrollment.current_students ?? 0)}/{(enrollment.capacity ?? 0)} students
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={calculateCapacityPercentage(enrollment.current_students, enrollment.capacity)}
                                            sx={{ height: 6, borderRadius: 3 }}
                                        />
                                    </Box>
                                </Box>
                            )}
                        </Box>
                        {enrollment.sessions && enrollment.sessions.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Sessions:</Typography>
                                {enrollment.sessions.map((session, index) => (
                                    <Box key={session.session_id || `session-${index}`} sx={{ pl: 2, mb: 0.5 }}>
                                        <Typography variant="body2">
                                            {session.date ? formatDate(session.date) : ''} {session.start_time} - {session.end_time}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    <Box className="enrollment-footer">
                        <Typography variant="caption" color="text.secondary" display="block">
                            Enrolled: {enrollment.enrollment_date || enrollment.enrolled_at ? formatDate(enrollment.enrollment_date || enrollment.enrolled_at) : 'N/A'}
                        </Typography>

                        {isHistorical && (enrollment.completed_at || enrollment.archived_at) && (
                            <Typography variant="caption" color="text.secondary" display="block">
                                {enrollment.completed_at ? 'Completed' : 'Archived'}: {formatDate(enrollment.completed_at || enrollment.archived_at)}
                            </Typography>
                        )}

                        {isHistorical && (enrollment.completion_reason || enrollment.archived_reason) && (
                            <Tooltip title={enrollment.completion_reason || enrollment.archived_reason}>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    Reason: {enrollment.completion_reason || enrollment.archived_reason}
                                </Typography>
                            </Tooltip>
                        )}

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
    );

    const hasActiveEnrollments = enrollments && enrollments.length > 0;
    const hasHistoricalEnrollments = historicalEnrollments && historicalEnrollments.length > 0;

    // Show loading state
    if (loading) {
        return (
            <Box className="enrollments-section">
                <Typography variant="h6" component="h2" gutterBottom>
                    Class Enrollments
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    // Show error state
    if (error) {
        return (
            <Box className="enrollments-section">
                <Typography variant="h6" component="h2" gutterBottom>
                    Class Enrollments
                </Typography>
                <Alert
                    severity="error"
                    action={
                        onRefresh && (
                            <Button color="inherit" size="small" onClick={onRefresh} startIcon={<RefreshIcon />}>
                                Retry
                            </Button>
                        )
                    }
                >
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box className="enrollments-section">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    Class Enrollments
                </Typography>
                {onRefresh && (
                    <IconButton onClick={onRefresh} size="small">
                        <RefreshIcon />
                    </IconButton>
                )}
            </Box>

            {/* Tabs for Active vs Historical Enrollments */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab
                        label={`Current Enrollments (${hasActiveEnrollments ? enrollments.length : 0})`}
                        icon={<SchoolIcon />}
                        iconPosition="start"
                    />
                    <Tab
                        label={`Past Enrollments (${hasHistoricalEnrollments ? historicalEnrollments.length : 0})`}
                        icon={<HistoryIcon />}
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {/* Active Enrollments Tab */}
            {tabValue === 0 && (
                <>
                    {!hasActiveEnrollments ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                No current class enrollments found
                            </Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={3} sx={{ flexWrap: 'wrap' }} alignItems="stretch">
                            {(enrollments || []).map((enrollment, index) => renderEnrollmentCard(enrollment, false))}
                        </Grid>
                    )}
                </>
            )}

            {/* Historical Enrollments Tab */}
            {tabValue === 1 && (
                <>
                    {!hasHistoricalEnrollments ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                No past class enrollments found
                            </Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={3} sx={{ flexWrap: 'wrap' }} alignItems="stretch">
                            {(historicalEnrollments || []).map((enrollment, index) => renderEnrollmentCard(enrollment, true))}
                        </Grid>
                    )}
                </>
            )}
        </Box>
    );
};

export default EnrollmentsSection;