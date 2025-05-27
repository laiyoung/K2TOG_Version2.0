import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useNotifications } from '../../utils/notificationUtils';
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
    Button,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    AttachMoney as MoneyIcon,
    Warning as WarningIcon,
    Schedule as ScheduleIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    Send as SendIcon,
    Check as CheckIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import './FinancialManagement.css';

const FinancialManagement = () => {
    const { showSuccess, showError } = useNotifications();
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        pendingPayments: 0,
        monthlyRevenue: 0,
        outstandingBalance: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [outstandingPayments, setOutstandingPayments] = useState([]);
    const [paymentStats, setPaymentStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [reminderDialogOpen, setReminderDialogOpen] = useState(false);

    useEffect(() => {
        fetchFinancialData();
    }, [dateRange]);

    const fetchFinancialData = async () => {
        try {
            setLoading(true);
            const [transactionsData, summaryData, paymentsData] = await Promise.all([
                adminService.getTransactions(dateRange),
                adminService.getFinancialSummary(dateRange),
                adminService.getOutstandingPayments(dateRange)
            ]);
            setTransactions(transactionsData);
            setSummary(summaryData);
            setOutstandingPayments(paymentsData.payments || []);
            setPaymentStats(paymentsData.stats || {
                total_outstanding: 0,
                overdue_amount: 0,
                overdue_count: 0,
                due_soon_amount: 0,
                due_soon_count: 0
            });
        } catch (error) {
            handleError(error, 'Failed to fetch financial data');
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (newDateRange) => {
        setDateRange(newDateRange);
    };

    const handleTransactionStatusUpdate = async (transactionId, newStatus) => {
        try {
            setLoading(true);
            await adminService.updateTransactionStatus(transactionId, newStatus);
            await fetchFinancialData();
            showSuccess('Transaction status updated successfully');
        } catch (error) {
            handleError(error, 'Failed to update transaction status');
        } finally {
            setLoading(false);
        }
    };

    const handleExportTransactions = async () => {
        try {
            setLoading(true);
            const data = await adminService.exportTransactions(dateRange);
            // Create and download CSV file
            const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showSuccess('Transactions exported successfully');
        } catch (error) {
            handleError(error, 'Failed to export transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleSendReminder = (payment) => {
        setSelectedPayment(payment);
        setReminderDialogOpen(true);
    };

    const handleReminderConfirm = async () => {
        try {
            setLoading(true);
            // Send both email and profile notification
            await Promise.all([
                adminService.sendPaymentReminderEmail(selectedPayment.id),
                adminService.sendPaymentNotification(selectedPayment.id, {
                    type: 'payment_reminder',
                    title: 'Payment Reminder',
                    message: `Reminder: Payment of ${formatCurrency(selectedPayment?.amount)} for ${selectedPayment?.class_name} is due on ${new Date(selectedPayment?.due_date).toLocaleDateString()}`,
                    userId: selectedPayment?.user_id
                })
            ]);
            showSuccess('Reminder sent successfully');
            setReminderDialogOpen(false);
            setSelectedPayment(null);
        } catch (error) {
            handleError(error, 'Failed to send reminder');
        } finally {
            setLoading(false);
        }
    };

    const handleReminderCancel = () => {
        setReminderDialogOpen(false);
        setSelectedPayment(null);
    };

    const handleError = (error, customMessage = 'An error occurred') => {
        console.error(error);
        setError(error.message || customMessage);
        showError(error.message || customMessage);
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

    const getStatusColor = (status) => {
        if (status === 'completed') {
            return 'success';
        }
        return 'warning';
    };

    const formatCurrency = (amount) => {
        if (amount == null) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <Box className="financial-management">
            <Typography variant="h5" component="h2" gutterBottom>
                Financial Management
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MoneyIcon color="primary" />
                                <Typography variant="h6">Total Outstanding</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ mt: 1 }}>
                                {formatCurrency(paymentStats?.total_outstanding)}
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
                                {formatCurrency(paymentStats?.overdue_amount)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {paymentStats?.overdue_count ?? 0} payments overdue
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
                                {formatCurrency(paymentStats?.due_soon_amount)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {paymentStats?.due_soon_count ?? 0} payments due soon
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Date Range Picker */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            type="date"
                            label="Start Date"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateRangeChange({ ...dateRange, startDate: e.target.value })}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            type="date"
                            label="End Date"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateRangeChange({ ...dateRange, endDate: e.target.value })}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Search and Table */}
            <Box className="financial-header">
                <Typography variant="h6" component="h3">
                    Outstanding Payments
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        placeholder="Search by student or class..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        InputProps={{
                            slots: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleExportTransactions}
                        startIcon={<DownloadIcon />}
                        disabled={loading}
                    >
                        Export
                    </Button>
                </Box>
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
                                <TableCell>{formatCurrency(payment.amount)}</TableCell>
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
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon color="primary" />
                        <Typography>Send Payment Reminder</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedPayment && (
                        <Box sx={{ mt: 2 }}>
                            <Typography gutterBottom>
                                Send a payment reminder to {selectedPayment.student_name}?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Amount due: {formatCurrency(selectedPayment.amount)} for {selectedPayment.class_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Due date: {new Date(selectedPayment.due_date).toLocaleDateString()}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                <EmailIcon color="action" fontSize="small" />
                                <Typography variant="body2" color="text.secondary">
                                    Reminder will be sent to: {selectedPayment.student_email}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <SendIcon color="action" fontSize="small" />
                                <Typography variant="body2" color="text.secondary">
                                    A notification will also appear in the user's profile
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleReminderCancel}>Cancel</Button>
                    <Button
                        onClick={handleReminderConfirm}
                        variant="contained"
                        color="primary"
                        startIcon={<EmailIcon />}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reminder'}
                    </Button>
                </DialogActions>
            </Dialog>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={transaction.status}
                                        color={getStatusColor(transaction.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleTransactionStatusUpdate(transaction.id, 'completed')}
                                        disabled={transaction.status === 'completed'}
                                    >
                                        <CheckIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default FinancialManagement; 