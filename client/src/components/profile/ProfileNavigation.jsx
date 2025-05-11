import React from 'react';
import './ProfileNavigation.css';

const ProfileNavigation = ({ activeSection, onSectionChange, unreadNotifications }) => {
    const navItems = [
        { id: 'overview', label: 'Overview', icon: 'fas fa-user' },
        { id: 'certificates', label: 'Certificates', icon: 'fas fa-certificate' },
        { id: 'payment-methods', label: 'Payment Methods', icon: 'fas fa-credit-card' },
        { id: 'activity', label: 'Activity Log', icon: 'fas fa-history' },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: 'fas fa-bell',
            badge: unreadNotifications > 0 ? unreadNotifications : null
        }
    ];

    return (
        <nav className="profile-navigation">
            <ul>
                {navItems.map(item => (
                    <li key={item.id}>
                        <button
                            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => onSectionChange(item.id)}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                            {item.badge && (
                                <span className="notification-badge">{item.badge}</span>
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default ProfileNavigation; 