import React, { useState, useEffect } from "react";
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
  Alert,
  Tooltip,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import {
  Notifications as NotificationIcon,
  Delete as DeleteIcon,
  CheckCircle as ReadIcon,
  Send as SendIcon,
  Add as AddIcon,
  Announcement as BroadcastIcon,
} from "@mui/icons-material";
import { mockData } from "../../mockData/adminDashboardData";
import adminService from "../../services/adminService";
import { useSnackbar } from "notistack";

const NotificationCenter = () => {
  const { enqueueSnackbar } = useSnackbar();
  const errorTimeoutRef = React.useRef();

  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedRecipientType, setSelectedRecipientType] = useState("user");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    recipientType: "user",
    selectedRecipient: "",
    variables: [],
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users and classes when component mounts
  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      console.log('Fetching users in NotificationCenter...');
      const response = await adminService.getAllUsers();
      console.log('Users fetched in NotificationCenter:', response);

      if (!Array.isArray(response)) {
        console.error('Invalid response format:', response);
        setError('Invalid response format from server');
        setUsers([]);
        return;
      }

      const validUsers = response
        .filter(user => {
          const isValid = user &&
            user.role === 'student' &&
            user.id &&
            (user.first_name || user.last_name || user.email);

          if (!isValid) {
            console.warn('Invalid user data:', user);
          }
          return isValid;
        })
        .map(user => ({
          ...user,
          displayName: user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.email || 'Unnamed User'
        }));

      console.log('Filtered valid users:', validUsers);
      setUsers(validUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await adminService.getAllClasses();
      setClasses(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setError('Failed to fetch classes');
      setClasses([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
    if (activeTab === 1) { // If on sent notifications tab
      fetchSentNotifications();
    }
    return () => {
      // Clear any pending error timeout when component unmounts
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [activeTab]); // Add activeTab as dependency

  // Filter students based on search term
  useEffect(() => {
    if (!Array.isArray(users)) {
      setFilteredStudents([]);
      return;
    }

    if (studentSearchTerm) {
      const searchTerm = studentSearchTerm.toLowerCase().trim();
      const filtered = users.filter(user => {
        if (!user) return false;
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        return name.includes(searchTerm) || email.includes(searchTerm);
      });
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(users.filter(user => user && user.name)); // Only include valid users
    }
  }, [studentSearchTerm, users]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminService.getNotifications();
      setNotifications(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError(error.message || 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSentNotifications();
      console.log('Fetched from /admin/sent:', response);
      setSentNotifications(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch sent notifications:', error);
      setError(error.message || 'Failed to fetch sent notifications');
      setSentNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await adminService.getTemplates();
      setTemplates(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setError(error.message || 'Failed to fetch templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setLoading(true);
      await adminService.markNotificationAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      handleError(error, "Failed to mark notification as read");
    } finally {
      setLoading(false);
    }
  };
  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await adminService.markAllNotificationsAsRead(); // <-- new endpoint
      await fetchNotifications();
    } catch (err) {
      handleError(err, "Failed to mark all notifications as read");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      setLoading(true);
      await adminService.deleteNotification(notificationId);
      await fetchNotifications();
      enqueueSnackbar("Notification deleted successfully", {
        variant: "success",
      });
    } catch (error) {
      handleError(error, "Failed to delete notification");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSentNotification = async (notificationId) => {
    try {
      setLoading(true);
      await adminService.deleteNotification(notificationId);
      await fetchSentNotifications();
      enqueueSnackbar("Notification deleted successfully", {
        variant: "success",
      });
    } catch (error) {
      handleError(error, "Failed to delete notification");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      setLoading(true);
      if (!notificationTitle.trim() || !notificationMessage.trim()) {
        enqueueSnackbar("Please provide both a title and message", { variant: "error" });
        return;
      }

      if (selectedRecipientType === "user" && !selectedRecipient?.id) {
        enqueueSnackbar("Please select a recipient", { variant: "error" });
        return;
      }

      if (selectedRecipientType === "class" && !selectedClass) {
        enqueueSnackbar("Please select a class", { variant: "error" });
        return;
      }

      await adminService.sendNotification({
        title: notificationTitle,
        message: notificationMessage,
        recipient: selectedRecipientType === "user" ? selectedRecipient.id : selectedClass,
        recipientType: selectedRecipientType
      });

      await fetchNotifications();
      enqueueSnackbar("Notification sent successfully", { variant: "success" });
      setShowSendDialog(false);
      // Reset form
      setSelectedRecipientType("user");
      setSelectedRecipient(null);
      setSelectedClass("");
      setNotificationMessage("");
      setNotificationTitle("");
    } catch (error) {
      handleError(error, "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setLoading(true);
      const templateData = {
        name: newTemplate.name,
        type: newTemplate.recipientType === "user" ? "user_notification" : "class_notification",
        title_template: newTemplate.name, // Using name as title for now
        message_template: newTemplate.content,
        metadata: {
          recipientType: newTemplate.recipientType,
          variables: newTemplate.variables
        }
      };

      await adminService.createTemplate(templateData);
      await fetchTemplates(); // Refresh templates after creating new one
      enqueueSnackbar("Template created successfully", { variant: "success" });
      setShowTemplateDialog(false);
      setNewTemplate({
        name: "",
        content: "",
        recipientType: "user",
        selectedRecipient: "",
        variables: [],
      });
    } catch (error) {
      handleError(error, "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    try {
      setLoading(true);
      if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
        enqueueSnackbar("Please provide both a title and message for the broadcast", { variant: "error" });
        return;
      }
      await adminService.sendBroadcast({
        title: broadcastTitle,
        message: broadcastMessage
      });
      await fetchNotifications();
      enqueueSnackbar("Broadcast sent successfully", { variant: "success" });
      setShowBroadcastDialog(false);
      setBroadcastMessage("");
      setBroadcastTitle("");
    } catch (error) {
      handleError(error, "Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setNotificationDialogOpen(true);
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleError = (error, customMessage = "An error occurred") => {
    console.error(error);
    setError(error.message || customMessage);
    enqueueSnackbar(error.message || customMessage, { variant: "error" });

    // Clear any existing timeout before setting a new one
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    // Set new timeout and store its ID in the ref
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
      errorTimeoutRef.current = null;
    }, 5000);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        px: { xs: 1, sm: 2, md: 3 }, // Responsive padding
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
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
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            startIcon={<AddIcon />}
            onClick={() => setShowTemplateDialog(true)}
            fullWidth={false}
            sx={{
              minWidth: { xs: "100%", sm: "auto" },
              whiteSpace: "nowrap",
            }}
          >
            New Template
          </Button>
          <Button
            startIcon={<SendIcon />}
            onClick={() => setShowSendDialog(true)}
            fullWidth={false}
            sx={{
              minWidth: { xs: "100%", sm: "auto" },
              whiteSpace: "nowrap",
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
              minWidth: { xs: "100%", sm: "auto" },
              whiteSpace: "nowrap",
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
          <Tab label="Received Notifications" />
          <Tab label="Sent Notifications" />
          <Tab label="Templates" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <Button
              startIcon={<ReadIcon />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              fullWidth={false}
              sx={{ whiteSpace: "nowrap" }}
            >
              Mark All as Read
            </Button>
          </Box>
          <List sx={{ width: "100%" }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={`notification-${notification.id || index}`}>
                <ListItem
                  onClick={() => handleViewNotification(notification)}
                  sx={{
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1,
                    py: 2,
                    cursor: "pointer",
                  }}
                  secondaryAction={
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: { xs: 1, sm: 0 },
                      }}
                    >
                      {!notification.read && (
                        <Tooltip title={<Typography sx={{ fontSize: '1rem', fontWeight: 400 }}>Mark as Read</Typography>} placement="top" arrow sx={{ '& .MuiTooltip-tooltip': { fontSize: '1rem', fontWeight: 400 } }}>
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            size="small"
                          >
                            <ReadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={<Typography sx={{ fontSize: '1rem', fontWeight: 400 }}>Delete Notification</Typography>} placement="top" arrow sx={{ '& .MuiTooltip-tooltip': { fontSize: '1rem', fontWeight: 400 } }}>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
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
                          fontWeight: notification.read ? "normal" : "bold",
                          wordBreak: "break-word",
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          wordBreak: "break-word",
                        }}
                      >
                        {notification.message}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {new Date(notification.timestamp).toLocaleString()}
                        </Typography>
                      </Typography>
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
        <List sx={{ width: "100%" }}>
          {sentNotifications.map((notification, index) => (
            <React.Fragment key={`sent-notification-${notification.id || index}`}>
              <ListItem
                sx={{
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 1,
                  py: 2,
                  bgcolor: notification.is_read ? 'inherit' : 'action.hover',
                  borderLeft: notification.is_read ? 'none' : '4px solid #3498db',
                }}
                secondaryAction={
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    <Tooltip title={<Typography sx={{ fontSize: '1rem', fontWeight: 400 }}>Delete Sent Notification</Typography>} placement="top" arrow sx={{ '& .MuiTooltip-tooltip': { fontSize: '1rem', fontWeight: 400 } }}>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSentNotification(notification.id);
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemIcon>
                  <NotificationIcon color={notification.is_read ? "action" : "primary"} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="div">
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box component="div" sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block', mb: 1 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span">
                        Sent to: {notification.recipient_name || 'Multiple recipients'}
                      </Typography>
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}

      {activeTab === 2 && (
        <List sx={{ width: "100%" }}>
          {templates.map((template, index) => (
            <ListItem
              key={`template-${template.id || index}`}
              sx={{
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 1,
                py: 2,
              }}
              secondaryAction={
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: { xs: 1, sm: 0 },
                    justifyContent: { xs: "flex-start", sm: "flex-end" },
                  }}
                >
                  <Chip
                    label={
                      template.recipientType === "user"
                        ? "Student Template"
                        : "Class Template"
                    }
                    size="small"
                    color={
                      template.recipientType === "user"
                        ? "primary"
                        : "secondary"
                    }
                  />
                  <Tooltip title={<Typography sx={{ fontSize: '1rem', fontWeight: 400 }}>Send Template</Typography>} placement="top" arrow sx={{ '& .MuiTooltip-tooltip': { fontSize: '1rem', fontWeight: 400 } }}>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setSelectedRecipientType(template.metadata?.recipientType || "user");
                        setShowSendDialog(true);
                      }}
                      size="small"
                    >
                      <SendIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{ wordBreak: "break-word" }}
                  >
                    {template.name}
                  </Typography>
                }
                secondary={
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      wordBreak: "break-word",
                    }}
                  >
                    {template.message_template}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      Variables:{" "}
                      {template.metadata?.variables?.map((v) => `{${v}}`).join(", ")}
                    </Typography>
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Notification Dialog */}
      <Dialog
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
        aria-labelledby="notification-dialog-title"
        keepMounted={false}
      >
        <DialogTitle id="notification-dialog-title">
          {selectedNotification?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {selectedNotification?.message}
          </Typography>
          {selectedNotification?.action_url && (
            <Button
              href={selectedNotification.action_url}
              variant="contained"
              sx={{ mt: 2 }}
            >
              View Details
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog
        open={showSendDialog}
        onClose={() => {
          setShowSendDialog(false);
          setSelectedRecipientType("user");
          setSelectedRecipient(null);
          setSelectedClass("");
          setNotificationMessage("");
          setNotificationTitle("");
        }}
        aria-labelledby="send-notification-dialog-title"
        keepMounted={false}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Notification Type</InputLabel>
              <Select
                value={selectedRecipientType}
                label="Notification Type"
                onChange={(e) => {
                  setSelectedRecipientType(e.target.value);
                  setSelectedRecipient(null);
                  setSelectedClass("");
                }}
              >
                <MenuItem value="user">Send to Student</MenuItem>
                <MenuItem value="class">Send to Class</MenuItem>
              </Select>
            </FormControl>

            {selectedRecipientType === "user" ? (
              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  value={selectedRecipient}
                  onChange={(event, newValue) => {
                    console.log('Selected recipient:', newValue);
                    setSelectedRecipient(newValue);
                  }}
                  options={users}
                  getOptionLabel={(option) => {
                    if (!option) return '';
                    console.log('Getting label for option:', option);
                    return option.displayName || `${option.first_name} ${option.last_name}`.trim() || option.email || 'Unnamed User';
                  }}
                  isOptionEqualToValue={(option, value) => {
                    const isEqual = option?.id === value?.id;
                    console.log('Comparing options:', { option, value, isEqual });
                    return isEqual;
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search and Select Student"
                      placeholder="Type to search..."
                      error={!!error}
                      helperText={error || "Type to search for a student"}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    console.log('Rendering option:', option);
                    return (
                      <li {...props}>
                        <Box>
                          <Typography variant="body1">
                            {option.displayName || `${option.first_name} ${option.last_name}`.trim() || option.email || 'Unnamed User'}
                          </Typography>
                          {option.email && (
                            <Typography variant="body2" color="text.secondary">
                              {option.email}
                            </Typography>
                          )}
                          {option.role && (
                            <Typography variant="caption" color="text.secondary">
                              Student
                            </Typography>
                          )}
                        </Box>
                      </li>
                    );
                  }}
                  noOptionsText={loadingUsers ? "Loading..." : "No students found"}
                  loadingText="Loading students..."
                  clearText="Clear"
                  openText="Open"
                  closeText="Close"
                  loading={loadingUsers}
                  fullWidth
                />
                {error && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}
              </Box>
            ) : (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Select Class"
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Notification Title"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Enter your notification message..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowSendDialog(false);
              setSelectedRecipientType("user");
              setSelectedRecipient(null);
              setSelectedClass("");
              setNotificationMessage("");
              setNotificationTitle("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendNotification}
            variant="contained"
            color="primary"
            disabled={
              !notificationTitle.trim() ||
              !notificationMessage.trim() ||
              (selectedRecipientType === "user" && !selectedRecipient?.id) ||
              (selectedRecipientType === "class" && !selectedClass)
            }
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Dialog */}
      <Dialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        aria-labelledby="template-dialog-title"
        keepMounted={false}
      >
        <DialogTitle>Create Notification Template</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Template For</InputLabel>
              <Select
                value={newTemplate.recipientType}
                label="Template For"
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    recipientType: e.target.value,
                    selectedRecipient: "",
                    variables:
                      e.target.value === "user"
                        ? ["student_name", "class_name", "grade"]
                        : ["class_name", "student_count", "teacher_name"],
                  })
                }
              >
                <MenuItem value="user">Specific Student</MenuItem>
                <MenuItem value="class">Specific Class</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>
                Select{" "}
                {newTemplate.recipientType === "user" ? "Student" : "Class"}
              </InputLabel>
              <Select
                value={newTemplate.selectedRecipient}
                label={`Select ${newTemplate.recipientType === "user" ? "Student" : "Class"
                  }`}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    selectedRecipient: e.target.value,
                    name: e.target.value
                      ? `${newTemplate.recipientType === "user"
                        ? users.find((u) => u.id === e.target.value)?.name
                        : classes.find((c) => c.id === e.target.value)
                          ?.title
                      } - `
                      : "",
                  })
                }
              >
                {newTemplate.recipientType === "user"
                  ? users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))
                  : classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.title}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Template Name"
              value={newTemplate.name}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, name: e.target.value })
              }
              sx={{ mb: 2 }}
              helperText={`Name for your ${newTemplate.recipientType === "user" ? "student" : "class"
                } template`}
              placeholder={
                newTemplate.selectedRecipient
                  ? `${newTemplate.recipientType === "user"
                    ? users.find(
                      (u) => u.id === newTemplate.selectedRecipient
                    )?.name
                    : classes.find(
                      (c) => c.id === newTemplate.selectedRecipient
                    )?.title
                  } - `
                  : "Enter template name"
              }
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Template Content"
              value={newTemplate.content}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, content: e.target.value })
              }
              helperText={
                <Box component="span">
                  Available variables:{" "}
                  {newTemplate.variables.map((v) => `{${v}}`).join(", ")}
                  <br />
                  {newTemplate.recipientType === "user"
                    ? "Use {student_name} for the student's name, {class_name} for their class, and {grade} for their grade"
                    : "Use {class_name} for the class name, {student_count} for the number of students, and {teacher_name} for the teacher's name"}
                </Box>
              }
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Template Preview:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography variant="body2">
                  {newTemplate.content.replace(
                    /\{([^}]+)\}/g,
                    (match, variable) => {
                      switch (variable) {
                        case "student_name":
                          return newTemplate.selectedRecipient &&
                            newTemplate.recipientType === "user"
                            ? users.find(
                              (u) => u.id === newTemplate.selectedRecipient
                            )?.name || "{student_name}"
                            : "{student_name}";
                        case "class_name":
                          return newTemplate.selectedRecipient &&
                            newTemplate.recipientType === "class"
                            ? classes.find(
                              (c) => c.id === newTemplate.selectedRecipient
                            )?.title || "{class_name}"
                            : "{class_name}";
                        case "grade":
                          return "A+";
                        case "student_count":
                          return "15";
                        case "teacher_name":
                          return "Mrs. Smith";
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
          <Button
            onClick={() => {
              setShowTemplateDialog(false);
              setNewTemplate({
                name: "",
                content: "",
                recipientType: "user",
                selectedRecipient: "",
                variables: [],
              });
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTemplate}
            variant="contained"
            disabled={
              !newTemplate.name ||
              !newTemplate.content ||
              !newTemplate.selectedRecipient
            }
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Broadcast Dialog */}
      <Dialog
        open={showBroadcastDialog}
        onClose={() => {
          setShowBroadcastDialog(false);
          setBroadcastMessage("");
          setBroadcastTitle("");
        }}
        aria-labelledby="broadcast-dialog-title"
        keepMounted={false}
      >
        <DialogTitle>Broadcast Message</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Broadcast Title"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Enter a title for your broadcast message"
            />
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
          <Button onClick={() => {
            setShowBroadcastDialog(false);
            setBroadcastMessage("");
            setBroadcastTitle("");
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleBroadcast}
            variant="contained"
            color="primary"
            disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
          >
            Broadcast
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationCenter;
