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
import { mockProfileData } from '../../mock/profileData';
import './ProfilePage.css';

const ProfilePage = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [profile, setProfile] = useState(mockProfileData); // Initialize with mock data
    const [loading, setLoading] = useState(false); // Set to false since we're using mock data
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    // Simplified profile update function for mock data
    const handleProfileUpdate = () => {
        // Just update the timestamp to simulate a change
        setProfile(prevProfile => ({
            ...prevProfile,
            updated_at: new Date().toISOString()
        }));
    };

    const handlePaymentComplete = (paymentId) => {
        // Update payment status in the profile
        setProfile(prevProfile => ({
            ...prevProfile,
            payments: prevProfile.payments.map(payment =>
                payment.id === paymentId
                    ? { ...payment, status: 'paid', paid_date: new Date().toISOString() }
                    : payment
            )
        }));
    };

    // Calculate number of payments due
    const paymentsDue = profile?.payments?.filter(p => p.status !== 'paid').length || 0;

    return (
        <div className="profile-page">
            <ProfileHeader profile={profile} onProfileUpdate={handleProfileUpdate} />

            <div className="profile-content">
                <ProfileNavigation
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                    unreadNotifications={profile?.notifications?.filter(n => !n.is_read).length || 0}
                    paymentsDue={paymentsDue}
                />

                <div className="profile-section">
                    {activeSection === 'overview' && (
                        <ProfileOverview
                            profile={profile}
                            onProfileUpdate={handleProfileUpdate}
                            onSectionChange={handleSectionChange}
                        />
                    )}
                    {activeSection === 'enrollments' && (
                        <EnrollmentsSection enrollments={profile?.enrollments || []} />
                    )}
                    {activeSection === 'certificates' && (
                        <CertificatesSection certificates={profile?.certificates || []} />
                    )}
                    {activeSection === 'payments-due' && (
                        <PaymentsDueSection
                            payments={profile?.payments || []}
                            onPaymentComplete={handlePaymentComplete}
                        />
                    )}
                    {activeSection === 'payment-methods' && (
                        <PaymentMethodsSection
                            paymentMethods={profile?.payment_methods || []}
                            onPaymentMethodsUpdate={handleProfileUpdate}
                        />
                    )}
                    {activeSection === 'password' && (
                        <PasswordSection />
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