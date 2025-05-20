import React, { useState } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Badge,
    Divider,
    Paper,
    Tab,
    Tabs,
    ListSubheader
} from '@mui/material';
import {
    Notifications as NotificationIcon,
    Delete as DeleteIcon,
    CheckCircle as ReadIcon,
    Send as SendIcon,
    Add as AddIcon,
    Close as CloseIcon,
    Email as EmailIcon,
    Announcement as BroadcastIcon
} from '@mui/icons-material';
import { mockData } from '../../mockData/adminDashboardData';

const NotificationCenter = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [notifications, setNotifications] = useState(mockData.notifications || []);
    const [templates, setTemplates] = useState(mockData.notificationTemplates || []);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedRecipientType, setSelectedRecipientType] = useState('user');
    const [selectedRecipient, setSelectedRecipient] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        content: '',
        recipientType: 'user',
        selectedRecipient: '',
        variables: []
    });

    // Get users and classes from mock data
    const users = mockData.users || [];
    const classes = mockData.classes || [];

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleMarkAsRead = (notificationId) => {
        setNotifications(notifications.map(notification =>
            notification.id === notificationId
                ? { ...notification, read: true }
                : notification
        ));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(notification => ({
            ...notification,
            read: true
        })));
    };

    const handleDeleteNotification = (notificationId) => {
        setNotifications(notifications.filter(n => n.id !== notificationId));
    };

    const handleSendNotification = () => {
        // Mock sending notification
        const recipientName = selectedRecipientType === 'user'
            ? users.find(u => u.id === selectedRecipient)?.name
            : classes.find(c => c.id === selectedRecipient)?.title;

        const newNotification = {
            id: notifications.length + 1,
            title: selectedTemplate
                ? templates.find(t => t.id === selectedTemplate)?.name
                : 'Custom Notification',
            message: broadcastMessage,
            read: false,
            timestamp: new Date().toISOString(),
            type: 'custom',
            recipient: recipientName,
            recipientType: selectedRecipientType
        };
        setNotifications([newNotification, ...notifications]);
        setShowSendDialog(false);
        setSelectedTemplate('');
        setBroadcastMessage('');
        setSelectedRecipient('');
        setSelectedRecipientType('user');
    };

    const handleCreateTemplate = () => {
        const recipient = newTemplate.recipientType === 'user'
            ? users.find(u => u.id === newTemplate.selectedRecipient)
            : classes.find(c => c.id === newTemplate.selectedRecipient);

        const newTemplateData = {
            id: templates.length + 1,
            name: newTemplate.name,
            content: newTemplate.content,
            recipientType: newTemplate.recipientType,
            recipientId: newTemplate.selectedRecipient,
            recipientName: recipient?.name || recipient?.title,
            variables: newTemplate.variables,
            type: 'custom'
        };
        setTemplates([...templates, newTemplateData]);
        setShowTemplateDialog(false);
        setNewTemplate({
            name: '',
            content: '',
            recipientType: 'user',
            selectedRecipient: '',
            variables: []
        });
    };

    const handleBroadcast = () => {
        // Mock broadcasting to all users
        const broadcastNotification = {
            id: notifications.length + 1,
            title: 'Broadcast Message',
            message: broadcastMessage,
            read: false,
            timestamp: new Date().toISOString(),
            type: 'broadcast'
        };
        setNotifications([broadcastNotification, ...notifications]);
        setShowBroadcastDialog(false);
        setBroadcastMessage('');
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Box sx={{
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            px: { xs: 1, sm: 2, md: 3 } // Responsive padding
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
                mb: 3
            }}>
                <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1
                    }}
                >
                    Notification Center
                    {unreadCount > 0 && (
                        <Chip
                            label={`${unreadCount} unread`}
                            color="primary"
                            size="small"
                        />
                    )}
                </Typography>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    width: { xs: '100%', sm: 'auto' }
                }}>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() => setShowTemplateDialog(true)}
                        fullWidth={false}
                        sx={{
                            minWidth: { xs: '100%', sm: 'auto' },
                            whiteSpace: 'nowrap'
                        }}
                    >
                        New Template
                    </Button>
                    <Button
                        startIcon={<SendIcon />}
                        onClick={() => setShowSendDialog(true)}
                        fullWidth={false}
                        sx={{
                            minWidth: { xs: '100%', sm: 'auto' },
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Send Notification
                    </Button>
                    <Button
                        startIcon={<BroadcastIcon />}
                        onClick={() => setShowBroadcastDialog(true)}
                        variant="contained"
                        fullWidth={false}
                        sx={{
                            minWidth: { xs: '100%', sm: 'auto' },
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Broadcast
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                >
                    <Tab label="All Notifications" />
                    <Tab label="Templates" />
                </Tabs>
            </Paper>

            {activeTab === 0 && (
                <>
                    <Box sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%'
                    }}>
                        <Button
                            startIcon={<ReadIcon />}
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                            fullWidth={false}
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            Mark All as Read
                        </Button>
                    </Box>
                    <List sx={{ width: '100%' }}>
                        {notifications.map((notification) => (
                            <React.Fragment key={notification.id}>
                                <ListItem
                                    sx={{
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        gap: 1,
                                        py: 2
                                    }}
                                    secondaryAction={
                                        <Box sx={{
                                            display: 'flex',
                                            gap: 1,
                                            mt: { xs: 1, sm: 0 }
                                        }}>
                                            {!notification.read && (
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    size="small"
                                                >
                                                    <ReadIcon />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleDeleteNotification(notification.id)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    }
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Badge
                                            color="primary"
                                            variant="dot"
                                            invisible={notification.read}
                                        >
                                            <NotificationIcon />
                                        </Badge>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="subtitle1"
                                                component="div"
                                                sx={{
                                                    fontWeight: notification.read ? 'normal' : 'bold',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {notification.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 0.5 }}>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    sx={{
                                                        display: 'block',
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {notification.message}
                                                </Typography>
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ display: 'block', mt: 0.5 }}
                                                >
                                                    {new Date(notification.timestamp).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                </>
            )}

            {activeTab === 1 && (
                <List sx={{ width: '100%' }}>
                    {templates.map((template) => (
                        <ListItem
                            key={template.id}
                            sx={{
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                gap: 1,
                                py: 2
                            }}
                            secondaryAction={
                                <Box sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    mt: { xs: 1, sm: 0 },
                                    justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                                }}>
                                    <Chip
                                        label={template.recipientType === 'user' ? 'Student Template' : 'Class Template'}
                                        size="small"
                                        color={template.recipientType === 'user' ? 'primary' : 'secondary'}
                                    />
                                    <IconButton
                                        edge="end"
                                        onClick={() => {
                                            setSelectedTemplate(template.id);
                                            setSelectedRecipientType(template.recipientType);
                                            setShowSendDialog(true);
                                        }}
                                        size="small"
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </Box>
                            }
                        >
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="subtitle1"
                                        component="div"
                                        sx={{ wordBreak: 'break-word' }}
                                    >
                                        {template.name}
                                    </Typography>
                                }
                                secondary={
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            sx={{
                                                display: 'block',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {template.content}
                                        </Typography>
                                        <Typography
                                            component="span"
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ display: 'block', mt: 0.5 }}
                                        >
                                            Variables: {template.variables.map(v => `{${v}}`).join(', ')}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            {/* Send Notification Dialog */}
            <Dialog
                open={showSendDialog}
                onClose={() => {
                    setShowSendDialog(false);
                    setSelectedRecipient('');
                    setSelectedTemplate('');
                    setBroadcastMessage('');
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        width: { xs: '95%', sm: 'auto' },
                        maxHeight: { xs: '90vh', sm: '80vh' },
                        m: { xs: 1, sm: 2 }
                    }
                }}
            >
                <DialogTitle>Send Notification</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select Template</InputLabel>
                            <Select
                                value={selectedTemplate}
                                label="Select Template"
                                onChange={(e) => {
                                    const template = templates.find(t => t.id === e.target.value);
                                    setSelectedTemplate(e.target.value);
                                    if (template) {
                                        setSelectedRecipientType(template.recipientType);
                                        setBroadcastMessage(template.content);
                                    } else {
                                        setSelectedRecipientType('user');
                                        setBroadcastMessage('');
                                    }
                                }}
                            >
                                <MenuItem value="">Custom Message</MenuItem>
                                {templates.map(template => (
                                    <MenuItem key={template.id} value={template.id}>
                                        {template.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select {selectedTemplate ? (templates.find(t => t.id === selectedTemplate)?.recipientType === 'user' ? 'Student' : 'Class') : 'Recipient'}</InputLabel>
                            <Select
                                value={selectedRecipient}
                                label={`Select ${selectedTemplate ? (templates.find(t => t.id === selectedTemplate)?.recipientType === 'user' ? 'Student' : 'Class') : 'Recipient'}`}
                                onChange={(e) => setSelectedRecipient(e.target.value)}
                            >
                                {selectedTemplate
                                    ? (templates.find(t => t.id === selectedTemplate)?.recipientType === 'user'
                                        ? users.map(user => (
                                            <MenuItem key={user.id} value={user.id}>
                                                {user.name}
                                            </MenuItem>
                                        ))
                                        : classes.map(cls => (
                                            <MenuItem key={cls.id} value={cls.id}>
                                                {cls.title}
                                            </MenuItem>
                                        )))
                                    : [...users, ...classes].map(item => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.name || item.title}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Message"
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                            helperText={
                                selectedTemplate
                                    ? `Template variables will be replaced automatically. Available variables: ${templates.find(t => t.id === selectedTemplate)?.variables.map(v => `{${v}}`).join(', ')
                                    }`
                                    : ""
                            }
                        />

                        {selectedTemplate && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Preview:
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <Typography variant="body2">
                                        {broadcastMessage.replace(
                                            /\{([^}]+)\}/g,
                                            (match, variable) => {
                                                switch (variable) {
                                                    case 'student_name':
                                                        return users.find(u => u.id === selectedRecipient)?.name || '{student_name}';
                                                    case 'class_name':
                                                        return classes.find(c => c.id === selectedRecipient)?.title || '{class_name}';
                                                    case 'student_count':
                                                        return '15'; // Mock value
                                                    case 'teacher_name':
                                                        return 'Mrs. Smith'; // Mock value
                                                    case 'time':
                                                        return '30'; // Mock value
                                                    case 'amount':
                                                        return '$150.00'; // Mock value
                                                    case 'days':
                                                        return '3'; // Mock value
                                                    case 'certificate_name':
                                                        return 'Art Fundamentals'; // Mock value
                                                    default:
                                                        return match;
                                                }
                                            }
                                        )}
                                    </Typography>
                                </Paper>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowSendDialog(false);
                        setSelectedRecipient('');
                        setSelectedTemplate('');
                        setBroadcastMessage('');
                    }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSendNotification}
                        variant="contained"
                        disabled={!selectedRecipient || !broadcastMessage}
                    >
                        Send
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Template Dialog */}
            <Dialog
                open={showTemplateDialog}
                onClose={() => {
                    setShowTemplateDialog(false);
                    setNewTemplate({
                        name: '',
                        content: '',
                        recipientType: 'user',
                        selectedRecipient: '',
                        variables: []
                    });
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        width: { xs: '95%', sm: 'auto' },
                        maxHeight: { xs: '90vh', sm: '80vh' },
                        m: { xs: 1, sm: 2 }
                    }
                }}
            >
                <DialogTitle>Create Notification Template</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Template For</InputLabel>
                            <Select
                                value={newTemplate.recipientType}
                                label="Template For"
                                onChange={(e) => setNewTemplate({
                                    ...newTemplate,
                                    recipientType: e.target.value,
                                    selectedRecipient: '',
                                    variables: e.target.value === 'user'
                                        ? ['student_name', 'class_name', 'grade']
                                        : ['class_name', 'student_count', 'teacher_name']
                                })}
                            >
                                <MenuItem value="user">Specific Student</MenuItem>
                                <MenuItem value="class">Specific Class</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select {newTemplate.recipientType === 'user' ? 'Student' : 'Class'}</InputLabel>
                            <Select
                                value={newTemplate.selectedRecipient}
                                label={`Select ${newTemplate.recipientType === 'user' ? 'Student' : 'Class'}`}
                                onChange={(e) => setNewTemplate({
                                    ...newTemplate,
                                    selectedRecipient: e.target.value,
                                    name: e.target.value
                                        ? `${newTemplate.recipientType === 'user'
                                            ? users.find(u => u.id === e.target.value)?.name
                                            : classes.find(c => c.id === e.target.value)?.title} - `
                                        : ''
                                })}
                            >
                                {newTemplate.recipientType === 'user'
                                    ? users.map(user => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.name}
                                        </MenuItem>
                                    ))
                                    : classes.map(cls => (
                                        <MenuItem key={cls.id} value={cls.id}>
                                            {cls.title}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Template Name"
                            value={newTemplate.name}
                            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                            sx={{ mb: 2 }}
                            helperText={`Name for your ${newTemplate.recipientType === 'user' ? 'student' : 'class'} template`}
                            placeholder={newTemplate.selectedRecipient
                                ? `${newTemplate.recipientType === 'user'
                                    ? users.find(u => u.id === newTemplate.selectedRecipient)?.name
                                    : classes.find(c => c.id === newTemplate.selectedRecipient)?.title} - `
                                : 'Enter template name'}
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Template Content"
                            value={newTemplate.content}
                            onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                            helperText={
                                <Box component="span">
                                    Available variables: {newTemplate.variables.map(v => `{${v}}`).join(', ')}
                                    <br />
                                    {newTemplate.recipientType === 'user'
                                        ? 'Use {student_name} for the student\'s name, {class_name} for their class, and {grade} for their grade'
                                        : 'Use {class_name} for the class name, {student_count} for the number of students, and {teacher_name} for the teacher\'s name'}
                                </Box>
                            }
                        />

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Template Preview:
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="body2">
                                    {newTemplate.content.replace(
                                        /\{([^}]+)\}/g,
                                        (match, variable) => {
                                            switch (variable) {
                                                case 'student_name':
                                                    return newTemplate.selectedRecipient && newTemplate.recipientType === 'user'
                                                        ? users.find(u => u.id === newTemplate.selectedRecipient)?.name || '{student_name}'
                                                        : '{student_name}';
                                                case 'class_name':
                                                    return newTemplate.selectedRecipient && newTemplate.recipientType === 'class'
                                                        ? classes.find(c => c.id === newTemplate.selectedRecipient)?.title || '{class_name}'
                                                        : '{class_name}';
                                                case 'grade':
                                                    return 'A+';
                                                case 'student_count':
                                                    return '15';
                                                case 'teacher_name':
                                                    return 'Mrs. Smith';
                                                default:
                                                    return match;
                                            }
                                        }
                                    )}
                                </Typography>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowTemplateDialog(false);
                        setNewTemplate({
                            name: '',
                            content: '',
                            recipientType: 'user',
                            selectedRecipient: '',
                            variables: []
                        });
                    }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateTemplate}
                        variant="contained"
                        disabled={!newTemplate.name || !newTemplate.content || !newTemplate.selectedRecipient}
                    >
                        Create Template
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Broadcast Dialog */}
            <Dialog
                open={showBroadcastDialog}
                onClose={() => setShowBroadcastDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        width: { xs: '95%', sm: 'auto' },
                        maxHeight: { xs: '90vh', sm: '80vh' },
                        m: { xs: 1, sm: 2 }
                    }
                }}
            >
                <DialogTitle>Broadcast Message</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Broadcast Message"
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                            helperText="This message will be sent to all users"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowBroadcastDialog(false)}>Cancel</Button>
                    <Button onClick={handleBroadcast} variant="contained" color="primary">
                        Broadcast
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NotificationCenter; 