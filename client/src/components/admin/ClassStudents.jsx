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
    Alert
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Search as SearchIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
    Payment as PaymentIcon
} from '@mui/icons-material';
import classService from '../../services/classService';
import { useNotifications } from '../../utils/notificationUtils';
import './ClassStudents.css';

const ClassStudents = ({ classId, className }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showSuccess, showError } = useNotifications();

    useEffect(() => {
        fetchStudents();
    }, [classId]);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await classService.getClassParticipants(classId);
            setStudents(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('Failed to load students. Please try again.');
            showError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (studentToDelete) {
            try {
                // TODO: Implement API call to remove student from class
                // await classService.removeStudentFromClass(classId, studentToDelete.enrollment_id);
                setStudents(students.filter(s => s.enrollment_id !== studentToDelete.enrollment_id));
                showSuccess('Student removed from class successfully');
            } catch (error) {
                console.error('Error removing student:', error);
                showError('Failed to remove student from class');
            }
            setDeleteDialogOpen(false);
            setStudentToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusChip = (status) => {
        const statusConfig = {
            'approved': { color: 'success', icon: <ActiveIcon />, label: 'Active' },
            'pending': { color: 'warning', icon: <CalendarIcon />, label: 'Pending' },
            'rejected': { color: 'error', icon: <InactiveIcon />, label: 'Rejected' }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <Chip
                icon={config.icon}
                label={config.label}
                color={config.color}
                size="small"
                variant="outlined"
            />
        );
    };

    const getPaymentChip = (status) => {
        const statusConfig = {
            'paid': { color: 'success', icon: <PaymentIcon />, label: 'Paid' },
            'pending': { color: 'warning', icon: <PaymentIcon />, label: 'Pending' },
            'failed': { color: 'error', icon: <PaymentIcon />, label: 'Failed' }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <Chip
                icon={config.icon}
                label={config.label}
                color={config.color}
                size="small"
                variant="outlined"
            />
        );
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
            <Box className="class-students-header">
                <Typography variant="h6" component="h2">
                    Students in {className}
                </Typography>
                <TextField
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <TableContainer component={Paper} className="students-table">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Enrollment Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Payment</TableCell>
                            <TableCell>Session</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.map((student) => (
                            <TableRow key={student.enrollment_id || student.id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon color="action" fontSize="small" />
                                        {student.name}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EmailIcon color="action" fontSize="small" />
                                        {student.email}
                                    </Box>
                                </TableCell>
                                <TableCell>{student.phone_number || 'N/A'}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarIcon color="action" fontSize="small" />
                                        {new Date(student.enrolled_at).toLocaleDateString()}
                                    </Box>
                                </TableCell>
                                <TableCell>{getStatusChip(student.enrollment_status)}</TableCell>
                                <TableCell>{getPaymentChip(student.payment_status)}</TableCell>
                                <TableCell>
                                    {student.session_date ? (
                                        `${new Date(student.session_date).toLocaleDateString()} ${student.start_time.substring(0, 5)
                                        }-${student.end_time.substring(0, 5)}`
                                    ) : 'Not assigned'}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteClick(student)}
                                        size="small"
                                        title="Remove Student"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredStudents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No students found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Remove Student</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove {studentToDelete?.name} from {className}?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Remove Student
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClassStudents; 