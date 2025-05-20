import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Payment as PaymentIcon,
    Info as InfoIcon,
    CalendarToday as CalendarIcon,
    School as SchoolIcon
} from '@mui/icons-material';
import './PaymentsDueSection.css';

const PaymentsDueSection = ({ payments, onPaymentComplete }) => {
    const handlePayment = (paymentId) => {
        // TODO: Implement payment processing
        console.log('Processing payment for:', paymentId);
        // Simulate payment completion
        if (onPaymentComplete) {
            onPaymentComplete(paymentId);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'due_soon':
                return 'warning';
            case 'overdue':
                return 'error';
            case 'paid':
                return 'success';
            default:
                return 'default';
        }
    };

    return (
        <Box className="payments-due-section">
            <Typography variant="h6" component="h2" gutterBottom>
                Payments Due
            </Typography>

            {payments && payments.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Class</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SchoolIcon color="action" fontSize="small" />
                                            <Typography variant="body2">
                                                {payment.class_name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            ${payment.amount.toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarIcon color="action" fontSize="small" />
                                            <Typography variant="body2">
                                                {formatDate(payment.due_date)}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={payment.status.replace('_', ' ')}
                                            color={getStatusColor(payment.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {payment.status !== 'paid' && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                startIcon={<PaymentIcon />}
                                                onClick={() => handlePayment(payment.id)}
                                            >
                                                Pay Now
                                            </Button>
                                        )}
                                        <Tooltip title="Payment Details">
                                            <IconButton size="small" sx={{ ml: 1 }}>
                                                <InfoIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No payments due at this time
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default PaymentsDueSection; 