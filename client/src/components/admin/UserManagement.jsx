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
    TablePagination,
    Chip,
    TextField,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Tab,
    Tabs,
    Tooltip,
    Menu,
    ListItemIcon,
    ListItemText,
    Alert,
    Snackbar,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    Avatar
} from '@mui/material';
import {
    Search as SearchIcon,
    MoreVert as MoreIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    School as InstructorIcon,
    Person as UserIcon,
    Block as BlockIcon,
    CheckCircle as ActiveIcon,
    Warning as WarningIcon,
    Send as SendIcon,
    Visibility as ViewIcon,
    Lock as LockIcon,
    History as HistoryIcon
} from '@mui/icons-material';

// Mock data
const mockUsers = [
    {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        status: 'active',
        phone_number: '123-456-7890',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-03-15T00:00:00Z',
        email_notifications: true,
        sms_notifications: false
    },
    {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        role: 'instructor',
        status: 'active',
        phone_number: '234-567-8901',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-03-14T00:00:00Z',
        email_notifications: true,
        sms_notifications: true
    },
    {
        id: 3,
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@example.com',
        role: 'user',
        status: 'inactive',
        phone_number: '345-678-9012',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-03-13T00:00:00Z',
        email_notifications: false,
        sms_notifications: true
    }
];

const mockActivity = [
    {
        id: 1,
        action: 'role_update',
        created_at: '2024-03-15T10:00:00Z',
        details: { old_role: 'user', new_role: 'admin' }
    },
    {
        id: 2,
        action: 'status_update',
        created_at: '2024-03-14T15:30:00Z',
        details: { old_status: 'active', new_status: 'inactive' }
    },
    {
        id: 3,
        action: 'profile_update',
        created_at: '2024-03-13T09:15:00Z',
        details: { updated_fields: 'email, phone_number' }
    }
];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [userProfile, setUserProfile] = useState(null);
    const [userActivity, setUserActivity] = useState([]);
    const [activityLoading, setActivityLoading] = useState(false);
    const [activityPage, setActivityPage] = useState(1);
    const [activityTotal, setActivityTotal] = useState(0);

    // Mock fetch functions
    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Filter users based on search term and role
            const filteredUsers = mockUsers.filter(user => {
                const matchesSearch = searchTerm === '' ||
                    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesRole = selectedRole === 'all' || user.role === selectedRole;
                return matchesSearch && matchesRole;
            });

            setUsers(filteredUsers);
            setPagination(prev => ({
                ...prev,
                total: filteredUsers.length,
                totalPages: Math.ceil(filteredUsers.length / prev.limit)
            }));
        } catch (err) {
            setError('Failed to fetch users');
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async (userId) => {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            const user = mockUsers.find(u => u.id === userId);
            setUserProfile(user);
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Failed to fetch user profile',
                severity: 'error'
            });
        }
    };

    const fetchUserActivity = async (userId, page = 1) => {
        try {
            setActivityLoading(true);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            setUserActivity(mockActivity);
            setActivityTotal(mockActivity.length);
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Failed to fetch user activity',
                severity: 'error'
            });
        } finally {
            setActivityLoading(false);
        }
    };

    const handleRoleUpdate = async (newRole) => {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            setSnackbar({
                open: true,
                message: 'User role updated successfully',
                severity: 'success'
            });
            fetchUsers();
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Failed to update user role',
                severity: 'error'
            });
        }
        setRoleDialogOpen(false);
        handleMenuClose();
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            setSnackbar({
                open: true,
                message: 'User status updated successfully',
                severity: 'success'
            });
            fetchUsers();
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Failed to update user status',
                severity: 'error'
            });
        }
        setStatusDialogOpen(false);
        handleMenuClose();
    };

    const handlePasswordChange = async (newPassword) => {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            setSnackbar({
                open: true,
                message: 'Password updated successfully',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Failed to update password',
                severity: 'error'
            });
        }
        setPasswordDialogOpen(false);
        handleMenuClose();
    };

    const handleDeleteUser = async () => {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            setSnackbar({
                open: true,
                message: 'User deleted successfully',
                severity: 'success'
            });
            fetchUsers();
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Failed to delete user',
                severity: 'error'
            });
        }
        setDeleteDialogOpen(false);
        handleMenuClose();
    };

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, selectedRole, pagination.page]);

    const handleMenuOpen = (event, user) => {
        setMenuAnchor(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedUser(null);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <AdminIcon color="error" />;
            case 'instructor':
                return <InstructorIcon color="primary" />;
            default:
                return <UserIcon color="action" />;
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'active':
                return <Chip icon={<ActiveIcon />} label="Active" color="success" size="small" />;
            case 'inactive':
                return <Chip icon={<BlockIcon />} label="Inactive" color="error" size="small" />;
            case 'suspended':
                return <Chip icon={<WarningIcon />} label="Suspended" color="warning" size="small" />;
            default:
                return null;
        }
    };

    const handleProfileDialogOpen = async (user) => {
        setSelectedUser(user);
        setProfileDialogOpen(true);
        await fetchUserProfile(user.id);
        await fetchUserActivity(user.id);
    };

    const handleActivityPageChange = async (event, newPage) => {
        setActivityPage(newPage + 1);
        if (selectedUser) {
            await fetchUserActivity(selectedUser.id, newPage + 1);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                User Management
            </Typography>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid sx={{ width: { xs: '100%', sm: '50%', md: '40%' } }}>
                        <TextField
                            fullWidth
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: { xs: '100%', sm: '50%', md: '30%' } }}>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={selectedRole}
                                label="Role"
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <MenuItem value="all">All Roles</MenuItem>
                                <MenuItem value="user">Users</MenuItem>
                                <MenuItem value="instructor">Instructors</MenuItem>
                                <MenuItem value="admin">Admins</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Users Table with Pagination */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Last Updated</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Alert severity="error">{error}</Alert>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">No users found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon color="action" />
                                            <Box>
                                                <Typography variant="body2">
                                                    {user.first_name} {user.last_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getRoleIcon(user.role)}
                                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                {user.role}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{getStatusChip(user.status)}</TableCell>
                                    <TableCell>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.updated_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, user)}
                                        >
                                            <MoreIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={pagination.total}
                    page={pagination.page - 1}
                    onPageChange={(e, newPage) => setPagination(prev => ({ ...prev, page: newPage + 1 }))}
                    rowsPerPage={pagination.limit}
                    rowsPerPageOptions={[10, 25, 50]}
                    onRowsPerPageChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                />
            </TableContainer>

            {/* User Actions Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    handleProfileDialogOpen(selectedUser);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <ViewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    setRoleDialogOpen(true);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Change Role</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    setStatusDialogOpen(true);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <BlockIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Change Status</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    setPasswordDialogOpen(true);
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <LockIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Reset Password</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setDeleteDialogOpen(true);
                        handleMenuClose();
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Delete User</ListItemText>
                </MenuItem>
            </Menu>

            {/* Role Update Dialog */}
            <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
                <DialogTitle>Change User Role</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>New Role</InputLabel>
                        <Select
                            value=""
                            label="New Role"
                            onChange={(e) => handleRoleUpdate(e.target.value)}
                        >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="instructor">Instructor</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Status Update Dialog */}
            <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
                <DialogTitle>Change User Status</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>New Status</InputLabel>
                        <Select
                            value=""
                            label="New Status"
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                            <MenuItem value="suspended">Suspended</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Password Reset Dialog */}
            <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
                <DialogTitle>Reset User Password</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        sx={{ mt: 2 }}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="primary">
                        Reset Password
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleDeleteUser}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Profile Dialog */}
            <Dialog
                open={profileDialogOpen}
                onClose={() => setProfileDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon />
                        <Typography variant="h6">
                            {userProfile?.first_name} {userProfile?.last_name}'s Profile
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {userProfile ? (
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                                    <Typography variant="subtitle1" gutterBottom>Personal Information</Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Email</Typography>
                                        <Typography variant="body1">{userProfile.email}</Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Phone</Typography>
                                        <Typography variant="body1">{userProfile.phone_number || 'Not provided'}</Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Role</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getRoleIcon(userProfile.role)}
                                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                                {userProfile.role}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Status</Typography>
                                        {getStatusChip(userProfile.status)}
                                    </Box>
                                </Grid>
                                <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                                    <Typography variant="subtitle1" gutterBottom>Account Information</Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Member Since</Typography>
                                        <Typography variant="body1">
                                            {new Date(userProfile.created_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                                        <Typography variant="body1">
                                            {new Date(userProfile.updated_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Email Notifications</Typography>
                                        <Typography variant="body1">
                                            {userProfile.email_notifications ? 'Enabled' : 'Disabled'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">SMS Notifications</Typography>
                                        <Typography variant="body1">
                                            {userProfile.sms_notifications ? 'Enabled' : 'Disabled'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="subtitle1" gutterBottom>Recent Activity</Typography>
                            {activityLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    <List>
                                        {userActivity.map((activity) => (
                                            <ListItem
                                                key={activity.id}
                                                alignItems="flex-start"
                                                sx={{
                                                    borderLeft: '4px solid',
                                                    borderColor:
                                                        activity.action === 'role_update' ? 'primary.main' :
                                                            activity.action === 'status_update' ? 'warning.main' :
                                                                activity.action === 'profile_update' ? 'info.main' :
                                                                    'grey.500',
                                                    mb: 1,
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 1
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor:
                                                                activity.action === 'role_update' ? 'primary.main' :
                                                                    activity.action === 'status_update' ? 'warning.main' :
                                                                        activity.action === 'profile_update' ? 'info.main' :
                                                                            'grey.500'
                                                        }}
                                                    >
                                                        {activity.action === 'role_update' ? <AdminIcon /> :
                                                            activity.action === 'status_update' ? <BlockIcon /> :
                                                                activity.action === 'profile_update' ? <EditIcon /> :
                                                                    <HistoryIcon />}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                            {activity.action.replace('_', ' ').toUpperCase()}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box component="span" sx={{ display: 'block' }}>
                                                            <Typography component="span" variant="caption" color="text.secondary">
                                                                {new Date(activity.created_at).toLocaleString()}
                                                            </Typography>
                                                            {activity.details && (
                                                                <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                                                                    {Object.entries(activity.details).map(([key, value]) => (
                                                                        <Box key={key} component="span" sx={{ display: 'flex', gap: 1 }}>
                                                                            <Typography component="span" sx={{ fontWeight: 'bold' }}>
                                                                                {key.replace('_', ' ')}:
                                                                            </Typography>
                                                                            <Typography component="span">
                                                                                {value}
                                                                            </Typography>
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <TablePagination
                                        component="div"
                                        count={activityTotal}
                                        page={activityPage - 1}
                                        onPageChange={handleActivityPageChange}
                                        rowsPerPage={10}
                                        rowsPerPageOptions={[10]}
                                    />
                                </>
                            )}
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProfileDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserManagement; 