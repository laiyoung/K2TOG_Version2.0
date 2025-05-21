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
    Chip,
    TextField,
    InputAdornment,
    Grid,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import {
    Search as SearchIcon,
    AttachMoney as MoneyIcon,
    Warning as WarningIcon,
    Schedule as ScheduleIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    Send as SendIcon
} from '@mui/icons-material';
import mockData from '../../mock/adminDashboardData.json';
import './FinancialManagement.css';

const FinancialManagement = () => {
    const [outstandingPayments, setOutstandingPayments] = useState([]);
    const [paymentStats, setPaymentStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [reminderDialogOpen, setReminderDialogOpen] = useState(false);

    useEffect(() => {
        // In a real application, this would be an API call
        setOutstandingPayments(mockData.financialData.outstandingPayments);
        setPaymentStats(mockData.financialData.paymentStats);
    }, []);

    const handleSendReminder = (payment) => {
        setSelectedPayment(payment);
        setReminderDialogOpen(true);
    };

    const handleReminderConfirm = () => {
        // In a real application, this would send an email reminder
        console.log('Sending reminder for payment:', selectedPayment);
        setReminderDialogOpen(false);
        setSelectedPayment(null);
    };

    const handleReminderCancel = () => {
        setReminderDialogOpen(false);
        setSelectedPayment(null);
    };

    const filteredPayments = outstandingPayments.filter(payment =>
        payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusChip = (status, days) => {
        if (status === 'overdue') {
            return (
                <Chip
                    icon={<WarningIcon />}
                    label={`Overdue (${days} days)`}
                    color="error"
                    size="small"
                    variant="outlined"
                />
            );
        }
        return (
            <Chip
                icon={<ScheduleIcon />}
                label={`Due in ${days} days`}
                color="warning"
                size="small"
                variant="outlined"
            />
        );
    };

    return (
        <Box className="financial-management">
            <Typography variant="h5" component="h2" gutterBottom>
                Financial Management
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MoneyIcon color="primary" />
                                <Typography variant="h6">Total Outstanding</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ mt: 1 }}>
                                ${paymentStats?.total_outstanding.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WarningIcon color="error" />
                                <Typography variant="h6">Overdue Amount</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ mt: 1 }} color="error">
                                ${paymentStats?.overdue_amount.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {paymentStats?.overdue_count} payments overdue
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ScheduleIcon color="warning" />
                                <Typography variant="h6">Due Soon</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ mt: 1 }} color="warning.main">
                                ${paymentStats?.due_soon_amount.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {paymentStats?.due_soon_count} payments due soon
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search and Table */}
            <Box className="financial-header">
                <Typography variant="h6" component="h3">
                    Outstanding Payments
                </Typography>
                <TextField
                    placeholder="Search by student or class..."
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

            <TableContainer component={Paper} className="payments-table">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Class</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Payment Method</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPayments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon color="action" fontSize="small" />
                                        <Box>
                                            <Typography variant="body2">{payment.student_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {payment.student_email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{payment.class_name}</TableCell>
                                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                                <TableCell>{new Date(payment.due_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {getStatusChip(
                                        payment.status,
                                        payment.status === 'overdue' ? payment.days_overdue : payment.days_until_due
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <MoneyIcon color="action" fontSize="small" />
                                        **** {payment.last_four}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleSendReminder(payment)}
                                        size="small"
                                        title="Send Reminder"
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredPayments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No outstanding payments found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Reminder Dialog */}
            <Dialog
                open={reminderDialogOpen}
                onClose={handleReminderCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Send Payment Reminder</DialogTitle>
                <DialogContent>
                    {selectedPayment && (
                        <Box sx={{ mt: 2 }}>
                            <Typography gutterBottom>
                                Send a payment reminder to {selectedPayment.student_name}?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Amount due: ${selectedPayment.amount.toFixed(2)} for {selectedPayment.class_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Due date: {new Date(selectedPayment.due_date).toLocaleDateString()}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleReminderCancel}>Cancel</Button>
                    <Button onClick={handleReminderConfirm} variant="contained" color="primary">
                        Send Reminder
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FinancialManagement; 