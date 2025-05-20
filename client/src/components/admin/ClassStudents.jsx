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
    InputAdornment
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Search as SearchIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon
} from '@mui/icons-material';
import mockData from '../../mock/adminDashboardData.json';
import './ClassStudents.css';

const ClassStudents = ({ classId, className }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call to fetch students
        const fetchStudents = () => {
            setLoading(true);
            try {
                const classData = mockData.classStudents.find(c => c.class_id === classId);
                setStudents(classData?.students || []);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
            setLoading(false);
        };

        fetchStudents();
    }, [classId]);

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (studentToDelete) {
            // In a real application, this would be an API call
            setStudents(students.filter(s => s.id !== studentToDelete.id));
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
        return status === 'active' ? (
            <Chip
                icon={<ActiveIcon />}
                label="Active"
                color="success"
                size="small"
                variant="outlined"
            />
        ) : (
            <Chip
                icon={<InactiveIcon />}
                label="Inactive"
                color="error"
                size="small"
                variant="outlined"
            />
        );
    };

    if (loading) {
        return (
            <Box className="class-students-container">
                <Typography>Loading students...</Typography>
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
                            <TableCell>Enrollment Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Attendance</TableCell>
                            <TableCell>Last Attended</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
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
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarIcon color="action" fontSize="small" />
                                        {new Date(student.enrollment_date).toLocaleDateString()}
                                    </Box>
                                </TableCell>
                                <TableCell>{getStatusChip(student.status)}</TableCell>
                                <TableCell>{student.attendance}%</TableCell>
                                <TableCell>
                                    {new Date(student.last_attended).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteClick(student)}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredStudents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
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