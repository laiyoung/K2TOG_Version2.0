import React, { useState } from 'react';
import { Box, Typography, Tab, Tabs, CircularProgress, Alert } from '@mui/material';
import MyEnrollments from './MyEnrollments';
import MyWaitlist from './MyWaitlist';
import ProfileOverview from '../profile/ProfileOverview';
import CertificatesSection from '../profile/CertificatesSection';
import PaymentMethodsSection from '../profile/PaymentMethodsSection';
import ActivityLogSection from '../profile/ActivityLogSection';
import NotificationsSection from '../profile/NotificationsSection';
import PaymentsDueSection from '../profile/PaymentsDueSection';
import PasswordSection from '../profile/PasswordSection';

function Dashboard() {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <ProfileOverview />;
            case 1:
                return <MyEnrollments />;
            case 2:
                return <MyWaitlist />;
            case 3:
                return <CertificatesSection />;
            case 4:
                return <PaymentsDueSection />;
            case 5:
                return <PaymentMethodsSection />;
            case 6:
                return <PasswordSection />;
            case 7:
                return <ActivityLogSection />;
            case 8:
                return <NotificationsSection />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                My Dashboard
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Overview" />
                    <Tab label="My Enrollments" />
                    <Tab label="My Waitlist" />
                    <Tab label="Certificates" />
                    <Tab label="Payments Due" />
                    <Tab label="Payment Methods" />
                    <Tab label="Password" />
                    <Tab label="Activity" />
                    <Tab label="Notifications" />
                </Tabs>
            </Box>
            {renderTabContent()}
        </Box>
    );
}

export default Dashboard; 