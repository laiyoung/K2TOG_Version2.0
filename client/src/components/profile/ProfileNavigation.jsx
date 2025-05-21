import React from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Badge, Paper } from '@mui/material';
import {
    Person as PersonIcon,
    School as SchoolIcon,
    CardMembership as CertificateIcon,
    CreditCard as PaymentIcon,
    History as HistoryIcon,
    Notifications as NotificationIcon,
    Lock as LockIcon,
    Payment as PaymentsDueIcon
} from '@mui/icons-material';
import './ProfileNavigation.css';

const ProfileNavigation = ({ activeSection, onSectionChange, unreadNotifications, paymentsDue }) => {
    const menuItems = [
        { value: 'overview', label: 'Overview', icon: <PersonIcon /> },
        { value: 'enrollments', label: 'Enrollments', icon: <SchoolIcon /> },
        { value: 'certificates', label: 'Certificates', icon: <CertificateIcon /> },
        {
            value: 'payments-due',
            label: 'Payments Due',
            icon: <Badge badgeContent={paymentsDue} color="error">
                <PaymentsDueIcon />
            </Badge>
        },
        { value: 'payment-methods', label: 'Payment Methods', icon: <PaymentIcon /> },
        { value: 'password', label: 'Password', icon: <LockIcon /> },
        { value: 'activity', label: 'Activity', icon: <HistoryIcon /> },
        {
            value: 'notifications',
            label: 'Notifications',
            icon: <Badge badgeContent={unreadNotifications} color="error">
                <NotificationIcon />
            </Badge>
        }
    ];

    return (
        <Paper className="profile-navigation" elevation={1}>
            <List component="nav">
                {menuItems.map((item) => (
                    <ListItemButton
                        key={item.value}
                        selected={activeSection === item.value}
                        onClick={() => onSectionChange(item.value)}
                        className="nav-item"
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>
        </Paper>
    );
};

export default ProfileNavigation; 