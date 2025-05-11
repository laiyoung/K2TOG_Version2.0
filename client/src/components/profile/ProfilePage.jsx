import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import ProfileNavigation from './ProfileNavigation';
import ProfileOverview from './ProfileOverview';
import CertificatesSection from './CertificatesSection';
import PaymentMethodsSection from './PaymentMethodsSection';
import ActivityLogSection from './ActivityLogSection';
import NotificationsSection from './NotificationsSection';
import { mockProfileData } from '../../mock/profileData';
import './ProfilePage.css';

const ProfilePage = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate API call with mock data
        const loadMockData = () => {
            setLoading(true);
            try {
                // Simulate network delay
                setTimeout(() => {
                    setProfile(mockProfileData);
                    setError(null);
                    setLoading(false);
                }, 500);
            } catch (err) {
                setError('Failed to load profile. Please try again later.');
                setLoading(false);
            }
        };

        loadMockData();
    }, []);

    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    // Mock function to simulate profile updates
    const handleProfileUpdate = () => {
        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
            setProfile(prevProfile => ({
                ...prevProfile,
                updated_at: new Date().toISOString()
            }));
            setLoading(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className="profile-page loading">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page error">
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-button">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <ProfileHeader profile={profile} onProfileUpdate={handleProfileUpdate} />

            <div className="profile-content">
                <ProfileNavigation
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                    unreadNotifications={profile?.notifications?.filter(n => !n.is_read).length || 0}
                />

                <div className="profile-section">
                    {activeSection === 'overview' && (
                        <ProfileOverview profile={profile} onProfileUpdate={handleProfileUpdate} />
                    )}
                    {activeSection === 'certificates' && (
                        <CertificatesSection certificates={profile?.certificates || []} />
                    )}
                    {activeSection === 'payment-methods' && (
                        <PaymentMethodsSection
                            paymentMethods={profile?.payment_methods || []}
                            onPaymentMethodsUpdate={handleProfileUpdate}
                        />
                    )}
                    {activeSection === 'activity' && (
                        <ActivityLogSection activities={profile?.activity_log || []} />
                    )}
                    {activeSection === 'notifications' && (
                        <NotificationsSection
                            notifications={profile?.notifications || []}
                            onNotificationsUpdate={handleProfileUpdate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage; 