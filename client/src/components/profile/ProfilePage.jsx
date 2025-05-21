import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import ProfileNavigation from './ProfileNavigation';
import ProfileOverview from './ProfileOverview';
import CertificatesSection from './CertificatesSection';
import PaymentMethodsSection from './PaymentMethodsSection';
import ActivityLogSection from './ActivityLogSection';
import NotificationsSection from './NotificationsSection';
import EnrollmentsSection from './EnrollmentsSection';
import PasswordSection from './PasswordSection';
import PaymentsDueSection from './PaymentsDueSection';
import userService from '../../services/userService';
import './ProfilePage.css';

const ProfilePage = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            console.log('Fetching profile...'); // Debug log
            const response = await userService.getProfile();
            console.log('Raw API Response:', response); // Debug log
            if (!response) {
                console.error('Invalid API response:', response);
                throw new Error('Invalid response from server');
            }
            console.log('Setting profile data:', response); // Debug log
            setProfile(response);
            console.log('Enrollments from API:', response.enrollments);
            setError(null);
        } catch (err) {
            console.error('Profile fetch error details:', {
                message: err.message,
                response: err.response,
                stack: err.stack
            });
            setError(err.message || 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleSectionChange = (section) => {
        console.log('Changing section to:', section); // Debug log
        setActiveSection(section);
    };

    const handleProfileUpdate = async (updatedData) => {
        try {
            setLoading(true);
            const response = await userService.updateProfile(updatedData);
            console.log('Profile update response:', response); // Debug log
            setProfile(response.data);
            setError(null);
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentComplete = async (paymentId) => {
        try {
            await userService.updatePaymentStatus(paymentId, 'paid');
            await fetchProfile();
        } catch (err) {
            console.error('Payment update error:', err);
            setError(err.message || 'Failed to update payment status');
        }
    };

    if (loading) {
        return (
            <div className="profile-page loading">
                <div className="loading-spinner"></div>
                <p>Loading profile data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page error">
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{error}</p>
                    <button className="retry-button" onClick={fetchProfile}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-page error">
                <div className="error-message">
                    <i className="fas fa-user-slash"></i>
                    <p>No profile data available</p>
                    <button className="retry-button" onClick={fetchProfile}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    console.log('Rendering profile page with data:', profile); // Debug log

    return (
        <div className="profile-page">
            <ProfileHeader profile={profile} onUpdate={handleProfileUpdate} />
            <div className="profile-content">
                <ProfileNavigation
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                    profile={profile}
                />
                <div className="profile-section">
                    {activeSection === 'overview' && (
                        <ProfileOverview
                            profile={profile}
                            onSectionChange={handleSectionChange}
                        />
                    )}
                    {activeSection === 'certificates' && (
                        <CertificatesSection certificates={profile.certificates} />
                    )}
                    {activeSection === 'payment-methods' && (
                        <PaymentMethodsSection paymentMethods={profile.payment_methods} />
                    )}
                    {activeSection === 'activity' && (
                        <ActivityLogSection activities={profile.recent_activity} />
                    )}
                    {activeSection === 'notifications' && (
                        <NotificationsSection notifications={profile.notifications} />
                    )}
                    {activeSection === 'enrollments' && (
                        <EnrollmentsSection enrollments={profile.enrollments} />
                    )}
                    {activeSection === 'password' && (
                        <PasswordSection onUpdate={handleProfileUpdate} />
                    )}
                    {activeSection === 'payments' && (
                        <PaymentsDueSection
                            payments={profile.payments}
                            onPaymentComplete={handlePaymentComplete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage; 