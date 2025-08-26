import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Search as SearchIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
    Payment as PaymentIcon,
    ExpandMore as ExpandMoreIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import classService from '../../services/classService';
import { useNotifications } from '../../utils/notificationUtils';
import adminService from '../../services/adminService';
import './ClassStudents.css';

const ClassStudents = ({ classId, className }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showSuccess, showError } = useNotifications();

    useEffect(() => {
        fetchSessionsWithStudents();
    }, [classId]);

    const fetchSessionsWithStudents = async () => {
        try {
            console.log(`=== ClassStudents: Fetching sessions for class ${classId} ===`);
            setLoading(true);
            const data = await adminService.getClassSessionsWithStudents(classId);
            console.log(`=== ClassStudents: Received data:`, data);
            setSessions(data);
        } catch (err) {
            console.error(`=== ClassStudents: Error fetching sessions:`, err);
            setError(err.message || 'Failed to fetch sessions and students');
        } finally {
            setLoading(false);
        }
    };

    const handleSessionStatusChange = async (sessionId, newStatus) => {
        try {
            await adminService.updateSessionStatus(sessionId, newStatus);
            // Refresh the data
            await fetchSessionsWithStudents();
        } catch (err) {
            setError(err.message || 'Failed to update session status');
        }
    };

    // Helper to format time in a user-friendly way
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hour, minute] = timeStr.split(':');
        const date = new Date();
        date.setHours(Number(hour), Number(minute), 0, 0);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    if (loading) {
        return (
            <Box className="class-students-container" sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="class-students-container" sx={{ p: 2 }}>
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box className="class-students-container">
            <Typography variant="h6" gutterBottom>
                Students for {className}
            </Typography>

            {sessions.map((session, sessionIndex) => (
                <Accordion key={`session-${session.session_id}-${session.session_type}-${sessionIndex}`}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <ScheduleIcon color="action" />
                            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                                {new Date(session.session_date).toLocaleDateString('en-US', {
                                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                })}
                                {` - ${formatTime(session.start_time)} to ${formatTime(session.end_time)}`}
                                {session.session_type === 'historical' && (
                                    <Chip
                                        label="Removed"
                                        color="error"
                                        size="small"
                                        sx={{ ml: 1 }}
                                    />
                                )}
                            </Typography>
                            <Chip
                                label={session.status || 'Scheduled'}
                                color={session.status === 'completed' ? 'success' : session.status === 'cancelled' ? 'error' : 'primary'}
                                size="small"
                            />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        {session.session_type === 'historical' && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    This session was removed. Students shown below were enrolled when the session was active.
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{ mb: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Session Status</InputLabel>
                                <Select
                                    value={session.status}
                                    onChange={(e) => handleSessionStatusChange(session.session_id, e.target.value)}
                                    label="Session Status"
                                    disabled={session.session_type === 'historical'}
                                >
                                    <MenuItem value="scheduled">Scheduled</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Enrollment Status</TableCell>
                                        <TableCell>Payment Status</TableCell>
                                        {session.session_type === 'historical' && (
                                            <TableCell>Completed/Archived Info</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(() => {
                                        const filteredStudents = (session.students || []).filter(Boolean);
                                        return filteredStudents.length > 0 ? (
                                            filteredStudents.map((student, index) => (
                                                <TableRow key={`${student.id}-${student.email}-${index}`}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <PersonIcon color="action" fontSize="small" />
                                                            {student.name}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{student.email}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={student.enrollment_status}
                                                            color={
                                                                student.enrollment_status === 'approved' ? 'success' :
                                                                    student.enrollment_status === 'rejected' ? 'error' :
                                                                        'warning'
                                                            }
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={student.payment_status}
                                                            color={
                                                                student.payment_status === 'paid' ? 'success' :
                                                                    student.payment_status === 'pending' ? 'warning' :
                                                                        'error'
                                                            }
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    {session.session_type === 'historical' && (
                                                        <TableCell>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {student.completed_at ? new Date(student.completed_at).toLocaleDateString() :
                                                                    student.archived_at ? new Date(student.archived_at).toLocaleDateString() : 'N/A'}
                                                            </Typography>
                                                            {(student.completion_reason || student.archived_reason) && (
                                                                <Typography variant="caption" display="block" color="text.secondary">
                                                                    {student.completion_reason || student.archived_reason}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow key="no-students">
                                                <TableCell colSpan={session.session_type === 'historical' ? 5 : 4} align="center">
                                                    No students enrolled in this session
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })()}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default ClassStudents; 