import React, { useState } from 'react';
import mockData from '../../mock/adminDashboardData.json';
import ClassStudents from './ClassStudents';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    People as PeopleIcon,
    Event as EventIcon,
    LocationOn as LocationIcon,
    Person as PersonIcon,
    MoreVert as MoreVertIcon,
    Schedule as ScheduleIcon,
    Queue as QueueIcon,
    Update as UpdateIcon
} from '@mui/icons-material';

function ClassManagement() {
    const [classes, setClasses] = useState(mockData.classes || []);
    const [showModal, setShowModal] = useState(false);
    const [editClass, setEditClass] = useState(null);
    const [form, setForm] = useState({ title: '', instructor: '', date: '', location: '', capacity: '', enrolled: '' });
    const [sessionsClass, setSessionsClass] = useState(null);
    const [waitlistClass, setWaitlistClass] = useState(null);
    const [statusClass, setStatusClass] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedClassForMenu, setSelectedClassForMenu] = useState(null);

    const handleAdd = () => {
        setEditClass(null);
        setForm({ title: '', instructor: '', date: '', location: '', capacity: '', enrolled: '' });
        setShowModal(true);
    };

    const handleEdit = (cls) => {
        setEditClass(cls);
        setForm({ ...cls });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            setClasses(classes.filter(c => c.id !== id));
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (editClass) {
            setClasses(classes.map(c => c.id === editClass.id ? { ...editClass, ...form } : c));
        } else {
            setClasses([
                ...classes,
                { id: Date.now(), ...form }
            ]);
        }
        setShowModal(false);
    };

    const handleViewSessions = (cls) => {
        setSessionsClass(cls);
    };

    const handleViewWaitlist = (cls) => {
        setWaitlistClass(cls);
    };

    const handleUpdateStatus = (cls) => {
        setStatusClass(cls);
        setNewStatus(cls.status || 'scheduled');
    };

    const handleStatusSave = () => {
        setClasses(classes.map(c => c.id === statusClass.id ? { ...c, status: newStatus } : c));
        setStatusClass(null);
        setNewStatus('');
    };

    const handleViewStudents = (cls) => {
        setSelectedClass(cls);
    };

    const handleCloseStudents = () => {
        setSelectedClass(null);
    };

    const handleMenuClick = (event, cls) => {
        setAnchorEl(event.currentTarget);
        setSelectedClassForMenu(cls);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedClassForMenu(null);
    };

    const handleMenuAction = (action) => {
        if (selectedClassForMenu) {
            switch (action) {
                case 'edit':
                    handleEdit(selectedClassForMenu);
                    break;
                case 'sessions':
                    handleViewSessions(selectedClassForMenu);
                    break;
                case 'waitlist':
                    handleViewWaitlist(selectedClassForMenu);
                    break;
                case 'status':
                    handleUpdateStatus(selectedClassForMenu);
                    break;
                default:
                    break;
            }
        }
        handleMenuClose();
    };

    return (
        <Box className="class-management">
            <Typography variant="h5" component="h2" gutterBottom>
                Class Management
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={handleAdd}
                sx={{ mb: 2 }}
            >
                Add Class
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Instructor</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Capacity</TableCell>
                            <TableCell>Enrolled</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {classes.map(cls => (
                            <TableRow key={cls.id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon color="action" fontSize="small" />
                                        {cls.title}
                                    </Box>
                                </TableCell>
                                <TableCell>{cls.instructor}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EventIcon color="action" fontSize="small" />
                                        {cls.date}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationIcon color="action" fontSize="small" />
                                        {cls.location}
                                    </Box>
                                </TableCell>
                                <TableCell>{cls.capacity}</TableCell>
                                <TableCell>{cls.enrolled}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={(e) => handleMenuClick(e, cls)}
                                        size="small"
                                        title="More Actions"
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                        PaperProps={{
                                            elevation: 3,
                                            sx: { minWidth: 180 }
                                        }}
                                    >
                                        <MenuItem onClick={() => handleMenuAction('edit')}>
                                            <ListItemIcon>
                                                <EditIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>Edit Class</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => handleMenuAction('sessions')}>
                                            <ListItemIcon>
                                                <ScheduleIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>View Sessions</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => handleMenuAction('waitlist')}>
                                            <ListItemIcon>
                                                <QueueIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>View Waitlist</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => handleMenuAction('status')}>
                                            <ListItemIcon>
                                                <UpdateIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>Update Status</ListItemText>
                                        </MenuItem>
                                    </Menu>
                                    <IconButton
                                        color="info"
                                        onClick={() => handleViewStudents(cls)}
                                        size="small"
                                        title="View Students"
                                    >
                                        <PeopleIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(cls.id)}
                                        size="small"
                                        title="Delete Class"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Class Modal */}
            {showModal && (
                <Dialog
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        {editClass ? 'Edit Class' : 'Add New Class'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                name="title"
                                label="Class Title"
                                value={form.title}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                name="instructor"
                                label="Instructor"
                                value={form.instructor}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                name="date"
                                label="Date"
                                type="date"
                                value={form.date}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                name="location"
                                label="Location"
                                value={form.location}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                name="capacity"
                                label="Capacity"
                                type="number"
                                value={form.capacity}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                name="enrolled"
                                label="Enrolled"
                                type="number"
                                value={form.enrolled}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained" color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* View Students Modal */}
            <Dialog
                open={!!selectedClass}
                onClose={handleCloseStudents}
                maxWidth="lg"
                fullWidth
            >
                <DialogContent>
                    {selectedClass && (
                        <ClassStudents
                            classId={selectedClass.id}
                            className={selectedClass.title}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {sessionsClass && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Sessions for {sessionsClass.title}</h3>
                        <ul className="mb-4">
                            {mockData.classSessions.filter(s => s.classId === sessionsClass.id).map((s, idx) => (
                                <li key={idx} className="mb-1 text-sm">
                                    {s.date} {s.startTime}-{s.endTime} <span className="text-gray-400">({s.status})</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end">
                            <button className="px-4 py-2 border rounded" onClick={() => setSessionsClass(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {waitlistClass && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Waitlist for {waitlistClass.title}</h3>
                        <ul className="mb-4">
                            {mockData.classWaitlist.filter(w => w.classId === waitlistClass.id).map((w, idx) => (
                                <li key={idx} className="mb-1 text-sm">
                                    {w.user} <span className="text-gray-400">({w.status})</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end">
                            <button className="px-4 py-2 border rounded" onClick={() => setWaitlistClass(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {statusClass && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Update Status for {statusClass.title}</h3>
                        <select
                            value={newStatus}
                            onChange={e => setNewStatus(e.target.value)}
                            className="w-full border px-2 py-1 rounded mb-4"
                        >
                            <option value="scheduled">Scheduled</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                        <div className="flex justify-end space-x-2">
                            <button className="px-4 py-2 border rounded" onClick={() => setStatusClass(null)}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleStatusSave}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
}

export default ClassManagement; 