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
  Table,
  TableBody,
  TableCell,
  TableRow,
  FormHelperText,
} from "@mui/material";
import {
  Notifications as NotificationIcon,
  Delete as DeleteIcon,
  CheckCircle as ReadIcon,
  Send as SendIcon,
  Add as AddIcon,
  Announcement as BroadcastIcon,
  Edit as EditIcon,
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
  const [selectedRecipientType, setSelectedRecipientType] = useState("user");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
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
    variables: [],
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [classesLoaded, setClassesLoaded] = useState(false);

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
      setLoading(true);
      setError(false);
      const response = await adminService.getAllClasses();
      console.log('Fetched classes:', response);
      setClasses(response);
      setClassesLoaded(true);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError(true);
      handleError(err, "Failed to load classes");
    } finally {
      setLoading(false);
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

      if (!Array.isArray(response)) {
        setSentNotifications([]);
        return;
      }

      // Process notifications to handle broadcasts
      const processedNotifications = response.reduce((acc, notification) => {
        // If it's a broadcast notification
        if (notification.is_broadcast) {
          // Check if we already have a broadcast with the same title and message
          const existingBroadcast = acc.find(n =>
            n.is_broadcast &&
            n.title === notification.title &&
            n.message === notification.message
          );

          if (existingBroadcast) {
            // Update the sent count if this is a duplicate broadcast
            existingBroadcast.sent_count = (existingBroadcast.sent_count || 0) + 1;
          } else {
            // Add as new broadcast notification
            acc.push({
              ...notification,
              sent_count: 1,
              recipient_name: 'All Users'
            });
          }
        } else {
          // Add non-broadcast notifications as is
          acc.push(notification);
        }
        return acc;
      }, []);

      setSentNotifications(processedNotifications);
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
      console.log('Fetching templates...');
      const response = await adminService.getTemplates();
      console.log('Templates fetched:', response);

      if (!Array.isArray(response)) {
        console.error('Invalid templates response format:', response);
        setError('Failed to fetch templates: Invalid response format');
        setTemplates([]);
        return;
      }

      const validTemplates = response.filter(template => {
        const isValid = template && template.id && template.name && template.message_template;
        if (!isValid) {
          console.warn('Invalid template data:', template);
        }
        return isValid;
      });

      console.log('Filtered valid templates:', validTemplates);
      setTemplates(validTemplates);
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

      const selectedClassDetails = selectedRecipientType === "class"
        ? classes.find(c => Number(c.id) === Number(selectedClass))
        : null;

      if (selectedRecipientType === "class" && !selectedClassDetails) {
        console.error('Class not found in available classes:', {
          selectedClass,
          availableClasses: classes.map(c => ({ id: c.id, title: c.title }))
        });
        enqueueSnackbar("Selected class not found", { variant: "error" });
        return;
      }

      // For class notifications, check if there are students first
      if (selectedRecipientType === "class") {
        try {
          console.log('Fetching students for class:', selectedClass);
          const response = await adminService.getClassStudents(selectedClass);
          console.log('Raw response from getClassStudents:', response);

          // Ensure we have an array of students
          const students = Array.isArray(response) ? response : [];
          console.log('Processed students array:', students);

          // Filter out any duplicate students (since they might have multiple enrollments)
          const uniqueStudents = students.filter((student, index, self) =>
            index === self.findIndex((s) => s.id === student.id)
          );

          console.log('Unique students in class:', uniqueStudents);

          if (uniqueStudents.length === 0) {
            console.log('No unique students found in class');
            enqueueSnackbar(`No students are currently enrolled in ${selectedClassDetails.title}`, {
              variant: "warning",
              action: (key) => (
                <Button color="inherit" size="small" onClick={() => {
                  enqueueSnackbar("Please enroll students in the class first", { variant: "info" });
                }}>
                  View Class
                </Button>
              )
            });
            return;
          }

          // Log the notification data we're about to send
          console.log('Preparing to send notification with data:', {
            title: notificationTitle,
            message: notificationMessage,
            recipient: selectedClass,
            recipientType: selectedRecipientType,
            templateId: selectedTemplateId,
            students: uniqueStudents
          });
        } catch (error) {
          console.error('Error checking class students:', error);
          enqueueSnackbar("Failed to check class enrollment. Please try again.", { variant: "error" });
          return;
        }
      }

      const notificationData = {
        title: notificationTitle,
        message: notificationMessage,
        recipient: selectedRecipientType === "class" ? selectedClass : selectedRecipient.id,
        recipientType: selectedRecipientType,
        templateId: selectedTemplateId || undefined,
        template: selectedTemplateId ? templates.find(t => t.id === selectedTemplateId) : undefined,
        user: selectedRecipientType === "user" ? selectedRecipient : undefined
      };

      console.log('Sending notification with data:', notificationData);
      await adminService.sendNotification(notificationData);

      // Refresh both notifications and sent notifications
      await Promise.all([
        fetchNotifications(),
        fetchSentNotifications()
      ]);

      enqueueSnackbar(
        selectedRecipientType === "class"
          ? `Notification sent to all students in ${selectedClassDetails?.title}`
          : "Notification sent successfully",
        { variant: "success" }
      );
      setShowSendDialog(false);
      // Reset form
      setSelectedRecipientType("user");
      setSelectedRecipient(null);
      setSelectedClass(null);
      setNotificationMessage("");
      setNotificationTitle("");
      setSelectedTemplateId("");
    } catch (error) {
      console.error('Error sending notification:', error);
      handleError(error, "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      content: template.message_template,
      recipientType: template.type === "user_notification" ? "user" : "class",
      variables: template.metadata?.variables || [],
    });
    setShowTemplateDialog(true);
  };

  const handleCreateOrUpdateTemplate = async () => {
    try {
      setLoading(true);
      const templateData = {
        name: newTemplate.name,
        type: newTemplate.recipientType === "user" ? "user_notification" : "class_notification",
        title_template: newTemplate.name,
        message_template: newTemplate.content,
        metadata: {
          recipientType: newTemplate.recipientType,
          variables: newTemplate.variables
        }
      };

      if (editingTemplate) {
        // Update existing template
        await adminService.updateTemplate(editingTemplate.id, templateData);
        enqueueSnackbar("Template updated successfully", { variant: "success" });
      } else {
        // Create new template
        await adminService.createTemplate(templateData);
        enqueueSnackbar("Template created successfully", { variant: "success" });
      }

      await fetchTemplates();
      setShowTemplateDialog(false);
      setNewTemplate({
        name: "",
        content: "",
        recipientType: "user",
        variables: [],
      });
      setEditingTemplate(null);
    } catch (error) {
      handleError(error, editingTemplate ? "Failed to update template" : "Failed to create template");
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
      const response = await adminService.sendBroadcast({
        title: broadcastTitle,
        message: broadcastMessage,
        is_broadcast: true
      });

      // Add the broadcast to sent notifications immediately
      const broadcastNotification = {
        id: `broadcast_${Date.now()}`, // Generate a unique ID for the broadcast
        title: broadcastTitle,
        message: broadcastMessage,
        created_at: new Date().toISOString(),
        is_broadcast: true,
        recipient_name: `All Users (${response.sent_count || 0} recipients)`,
        is_read: false,
        sent_count: response.sent_count || 0
      };

      setSentNotifications(prev => [broadcastNotification, ...prev]);
      enqueueSnackbar(`Broadcast sent successfully to ${response.sent_count || 0} recipients`, { variant: "success" });
      setShowBroadcastDialog(false);
      setBroadcastMessage("");
      setBroadcastTitle("");
    } catch (error) {
      console.error('Broadcast error:', error);
      handleError(error, "Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      setLoading(true);
      await adminService.deleteTemplate(templateId);
      await fetchTemplates(); // Refresh templates after deletion
      enqueueSnackbar("Template deleted successfully", { variant: "success" });
    } catch (error) {
      handleError(error, "Failed to delete template");
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

  const formatTemplateName = (name) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
                  ...(notification.is_broadcast && {
                    bgcolor: 'info.light',
                    '&:hover': {
                      bgcolor: 'info.light',
                    }
                  })
                }}
                secondaryAction={
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    {notification.is_broadcast && (
                      <Chip
                        label="Broadcast"
                        color="info"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    )}
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
                        Sent to: {notification.is_broadcast ? "All Users" : (notification.recipient_name || 'Multiple recipients')}
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
        <Table>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{formatTemplateName(template.name)}</TableCell>
                <TableCell>{template.type}</TableCell>
                <TableCell>{template.title_template}</TableCell>
                <TableCell>
                  {template.message_template.length > 50
                    ? `${template.message_template.substring(0, 50)}...`
                    : template.message_template}
                </TableCell>
                <TableCell>
                  {template.metadata?.variables?.map(v => `{${v}}`).join(", ")}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEditTemplate(template)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTemplate(template.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
          setSelectedClass(null);
          setNotificationMessage("");
          setNotificationTitle("");
          setSelectedTemplateId("");
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
                  setSelectedClass(null);
                  setSelectedTemplateId('');
                  setNotificationTitle('');
                  setNotificationMessage('');
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
                    const { key, ...otherProps } = props;
                    return (
                      <li key={key} {...otherProps}>
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
                  value={!classesLoaded ? '' : (selectedClass === null ? '' : selectedClass)}
                  label="Select Class"
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log('Selected class value:', value);
                    setSelectedClass(value === '' ? null : Number(value));
                  }}
                  error={!selectedClass && error}
                  disabled={loading || !classesLoaded}
                >
                  {loading ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography>Loading classes...</Typography>
                      </Box>
                    </MenuItem>
                  ) : !classesLoaded ? (
                    <MenuItem disabled>
                      <Typography>Loading classes...</Typography>
                    </MenuItem>
                  ) : classes.length === 0 ? (
                    <MenuItem disabled>
                      <Typography color="error">No classes available</Typography>
                    </MenuItem>
                  ) : (
                    classes.map((cls) => {
                      console.log('Rendering class option:', cls);
                      return (
                        <MenuItem key={cls.id} value={Number(cls.id)}>
                          <Box>
                            <Typography variant="body1">{cls.title}</Typography>
                            {cls.description && (
                              <Typography variant="caption" color="text.secondary">
                                {cls.description}
                              </Typography>
                            )}
                            {cls.student_count !== undefined && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Students: {cls.student_count}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      );
                    })
                  )}
                </Select>
                {error && (
                  <FormHelperText error>
                    Failed to load classes. Please try again.
                  </FormHelperText>
                )}
              </FormControl>
            )}

            {/* Add Template Selection Dropdown */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Template</InputLabel>
              <Select
                value={selectedTemplateId || ''}
                label="Select Template"
                onChange={(e) => {
                  const templateId = e.target.value;
                  setSelectedTemplateId(templateId);

                  if (templateId) {
                    const template = templates.find(t => t.id === templateId);
                    if (template) {
                      // Only update if the template type matches the current recipient type
                      const templateTypeMap = {
                        'user_notification': 'user',
                        'class_notification': 'class',
                        'class_reminder': 'class',
                        'enrollment': 'user',
                        'payment': 'user',
                        'certificate': 'user'
                      };
                      const mappedType = templateTypeMap[template.type] || template.type;

                      if (mappedType === selectedRecipientType) {
                        setNotificationTitle(template.title_template || '');
                        setNotificationMessage(template.message_template || '');
                      } else {
                        // If template type doesn't match, reset the selection
                        setSelectedTemplateId('');
                        setNotificationTitle('');
                        setNotificationMessage('');
                        enqueueSnackbar(`This template is for ${mappedType} notifications, not ${selectedRecipientType} notifications`, {
                          variant: "warning"
                        });
                      }
                    }
                  } else {
                    setNotificationTitle('');
                    setNotificationMessage('');
                  }
                }}
              >
                {loading ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography>Loading templates...</Typography>
                    </Box>
                  </MenuItem>
                ) : templates.length === 0 ? (
                  <MenuItem disabled>
                    <Typography color="error">No templates available</Typography>
                  </MenuItem>
                ) : (
                  (() => {
                    console.log('All available templates:', templates);
                    const filteredTemplates = templates.filter(t => {
                      // Map the template types to match what we expect
                      const templateTypeMap = {
                        'user_notification': 'user',
                        'class_notification': 'class',
                        'class_reminder': 'class',
                        'enrollment': 'user',
                        'payment': 'user',
                        'certificate': 'user'
                      };

                      const mappedType = templateTypeMap[t.type] || t.type;
                      return mappedType === selectedRecipientType;
                    });

                    if (filteredTemplates.length === 0) {
                      return (
                        <MenuItem disabled>
                          <Typography color="text.secondary">
                            No templates available for {selectedRecipientType === "user" ? "student" : "class"} notifications
                          </Typography>
                        </MenuItem>
                      );
                    }

                    return filteredTemplates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        <Box>
                          <Typography variant="body1">
                            {formatTemplateName(template.name)}
                          </Typography>
                          {template.message_template && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {template.message_template.length > 50
                                ? `${template.message_template.substring(0, 50)}...`
                                : template.message_template}
                            </Typography>
                          )}
                          {template.metadata?.variables?.length > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Variables: {template.metadata.variables.map(v => `{${v}}`).join(", ")}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ));
                  })()
                )}
              </Select>
            </FormControl>

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
              setSelectedClass(null);
              setNotificationMessage("");
              setNotificationTitle("");
              setSelectedTemplateId("");
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
        onClose={() => {
          setShowTemplateDialog(false);
          setNewTemplate({
            name: "",
            content: "",
            recipientType: "user",
            variables: [],
          });
          setEditingTemplate(null);
        }}
        aria-labelledby="template-dialog-title"
        keepMounted={false}
      >
        <DialogTitle>
          {editingTemplate ? `Edit Template: ${formatTemplateName(editingTemplate.name)}` : 'New Template'}
        </DialogTitle>
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

            <TextField
              fullWidth
              label="Template Name"
              value={formatTemplateName(newTemplate.name)}
              onChange={(e) => {
                // Convert the formatted name back to snake_case for storage
                const snakeCase = e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, '_')
                  .replace(/[^a-z0-9_]/g, '');
                setNewTemplate(prev => ({
                  ...prev,
                  name: snakeCase
                }));
              }}
              placeholder="Enter a descriptive name (e.g., Welcome Message, Class Reminder)"
              required
              error={!newTemplate.name}
              helperText={!newTemplate.name ? "Template name is required" : "Use spaces and proper capitalization"}
              sx={{ mb: 2 }}
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
                          return "{student_name}";
                        case "class_name":
                          return "{class_name}";
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
                variables: [],
              });
              setEditingTemplate(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateOrUpdateTemplate}
            variant="contained"
            disabled={!newTemplate.name || !newTemplate.content}
          >
            {editingTemplate ? 'Update Template' : 'Create Template'}
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
