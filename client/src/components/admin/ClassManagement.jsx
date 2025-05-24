import React, { useState, useCallback } from "react";
import mockData from "../../mock/adminDashboardData.json";
import ClassStudents from "./ClassStudents";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    ListItemText,
    CircularProgress,
    Alert,
    Snackbar,
    TextField,
} from "@mui/material";
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
    Update as UpdateIcon,
} from "@mui/icons-material";

function ClassManagement() {
    const [classes, setClasses] = useState(mockData.classes || []);
    const [showModal, setShowModal] = useState(false);
    const [editClass, setEditClass] = useState(null);
    const [form, setForm] = useState({
        title: "",
        instructor: "",
        date: "",
        location: "",
        capacity: "",
        enrolled: "",
    });
    const [sessionsClass, setSessionsClass] = useState(null);
    const [waitlistClass, setWaitlistClass] = useState(null);
    const [statusClass, setStatusClass] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [selectedClass, setSelectedClass] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedClassForMenu, setSelectedClassForMenu] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showNotification = useCallback((message, severity = "success") => {
        setNotification({ open: true, message, severity });
    }, []);

    const handleCloseNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };

    const handleError = useCallback(
        (error, customMessage = "An error occurred") => {
            console.error(error);
            setError(error.message || customMessage);
            showNotification(error.message || customMessage, "error");
        },
        [showNotification]
    );

    const handleAdd = () => {
        setError(null);
        setEditClass(null);
        setForm({
            title: "",
            instructor: "",
            date: "",
            location: "",
            capacity: "",
            enrolled: "",
        });
        setShowModal(true);
    };

    const handleEdit = (cls) => {
        setError(null);
        setEditClass(cls);
        setForm({ ...cls });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            if (window.confirm("Are you sure you want to delete this class?")) {
                setLoading(true);
                // TODO: Replace with actual API call
                // await deleteClass(id);
                setClasses(classes.filter((c) => c.id !== id));
                showNotification("Class deleted successfully");
            }
        } catch (error) {
            handleError(error, "Failed to delete class");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate form
            if (!form.title || !form.instructor || !form.date || !form.location || !form.capacity) {
                throw new Error('Please fill in all required fields');
            }

            // Validate numeric fields
            if (isNaN(Number(form.capacity)) || Number(form.capacity) <= 0) {
                throw new Error('Capacity must be a positive number');
            }

            if (form.enrolled && (isNaN(Number(form.enrolled)) || Number(form.enrolled) < 0)) {
                throw new Error('Enrolled count must be a non-negative number');
            }

            if (form.enrolled && Number(form.enrolled) > Number(form.capacity)) {
                throw new Error('Enrolled count cannot exceed capacity');
            }

            // TODO: Replace with actual API call
            if (editClass) {
                // await updateClass(editClass.id, form);
                setClasses(classes.map(c => c.id === editClass.id ? { ...editClass, ...form } : c));
                showNotification('Class updated successfully');
            } else {
                // await createClass(form);
                setClasses([...classes, { id: Date.now(), ...form }]);
                showNotification('Class created successfully');
            }
            setShowModal(false);
        } catch (error) {
            handleError(error, 'Failed to save class');
        } finally {
            setLoading(false);
        }
    };

    const handleViewSessions = (cls) => {
        setSessionsClass(cls);
    };

    const handleViewWaitlist = (cls) => {
        setWaitlistClass(cls);
    };

    const handleUpdateStatus = (cls) => {
        setStatusClass(cls);
        setNewStatus(cls.status || "scheduled");
    };

    const handleStatusSave = async () => {
        try {
            setLoading(true);
            setError(null);

            // TODO: Replace with actual API call
            // await updateClassStatus(statusClass.id, newStatus);
            setClasses(
                classes.map((c) =>
                    c.id === statusClass.id ? { ...c, status: newStatus } : c
                )
            );
            showNotification("Class status updated successfully");
            setStatusClass(null);
            setNewStatus("");
        } catch (error) {
            handleError(error, "Failed to update class status");
        } finally {
            setLoading(false);
        }
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
                case "edit":
                    handleEdit(selectedClassForMenu);
                    break;
                case "sessions":
                    handleViewSessions(selectedClassForMenu);
                    break;
                case "waitlist":
                    handleViewWaitlist(selectedClassForMenu);
                    break;
                case "status":
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
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Typography variant="h5" component="h2" gutterBottom>
                Class Management
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={handleAdd}
                sx={{ mb: 2 }}
                disabled={loading}
            >
                Add Class
            </Button>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                    <CircularProgress />
                </Box>
            )}

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
                        {classes.map((cls) => (
                            <TableRow key={cls.id}>
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <PersonIcon color="action" fontSize="small" />
                                        {cls.title}
                                    </Box>
                                </TableCell>
                                <TableCell>{cls.instructor}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <EventIcon color="action" fontSize="small" />
                                        {cls.date}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                                            sx: { minWidth: 180 },
                                        }}
                                    >
                                        <MenuItem onClick={() => handleMenuAction("edit")}>
                                            <ListItemIcon>
                                                <EditIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>Edit Class</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => handleMenuAction("sessions")}>
                                            <ListItemIcon>
                                                <ScheduleIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>View Sessions</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => handleMenuAction("waitlist")}>
                                            <ListItemIcon>
                                                <QueueIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>View Waitlist</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => handleMenuAction("status")}>
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
                    onClose={() => !loading && setShowModal(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        {editClass ? "Edit Class" : "Add New Class"}
                    </DialogTitle>
                    <DialogContent>
                        <Box
                            sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
                        >
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
                        <Button onClick={() => setShowModal(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            color="primary"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : "Save"}
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
                        <h3 className="text-lg font-medium mb-4">
                            Sessions for {sessionsClass.title}
                        </h3>
                        <ul className="mb-4">
                            {mockData.classSessions
                                .filter((s) => s.classId === sessionsClass.id)
                                .map((s, idx) => (
                                    <li key={idx} className="mb-1 text-sm">
                                        {s.date} {s.startTime}-{s.endTime}{" "}
                                        <span className="text-gray-400">({s.status})</span>
                                    </li>
                                ))}
                        </ul>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 border rounded"
                                onClick={() => setSessionsClass(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {waitlistClass && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">
                            Waitlist for {waitlistClass.title}
                        </h3>
                        <ul className="mb-4">
                            {mockData.classWaitlist
                                .filter((w) => w.classId === waitlistClass.id)
                                .map((w, idx) => (
                                    <li key={idx} className="mb-1 text-sm">
                                        {w.user} <span className="text-gray-400">({w.status})</span>
                                    </li>
                                ))}
                        </ul>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 border rounded"
                                onClick={() => setWaitlistClass(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {statusClass && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">
                            Update Status for {statusClass.title}
                        </h3>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full border px-2 py-1 rounded mb-4"
                        >
                            <option value="scheduled">Scheduled</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 border rounded"
                                onClick={() => setStatusClass(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={handleStatusSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: "100%" }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ClassManagement;
