import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import './ProfileOverview.css';

const ProfileOverview = ({ profile, onSectionChange }) => {
    console.log('Profile data in Overview:', profile); // Debug log

    const stats = [
        {
            label: 'Active Classes',
            value: profile?.enrollments?.filter(e => e.enrollment_status === 'approved').length || 0,
            icon: 'fa-book',
            section: 'enrollments'
        },
        {
            label: 'Certificates',
            value: profile?.certificates?.length || 0,
            icon: 'fa-certificate',
            section: 'certificates'
        },
        {
            label: 'Payments Due',
            value: profile?.payments?.filter(p => p.status === 'pending').length || 0,
            icon: 'fa-credit-card',
            section: 'payments'
        },
        {
            label: 'Unread Notifications',
            value: profile?.notifications?.filter(n => !n.is_read).length || 0,
            icon: 'fa-bell',
            section: 'notifications'
        }
    ];

    const recentActivity = profile?.recent_activity?.slice(0, 5) || [];

    return (
        <div className="profile-overview">
            <div className="section-header">
                <h2>Overview</h2>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <Button
                        key={index}
                        className="stat-card"
                        onClick={() => onSectionChange && onSectionChange(stat.section)}
                        sx={{
                            textTransform: 'none',
                            textAlign: 'left',
                            padding: '1.5rem',
                            width: '100%',
                            justifyContent: 'flex-start'
                        }}
                    >
                        <i className={`fas ${stat.icon}`}></i>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </Button>
                ))}
            </div>

            <div className="recent-activity">
                <h3>Recent Activity</h3>
                {recentActivity.length > 0 ? (
                    <ul className="activity-list">
                        {recentActivity.map((activity, index) => (
                            <li key={index} className="activity-item">
                                <div className="activity-icon">
                                    <i className={`fas ${getActivityIcon(activity.action)}`}></i>
                                </div>
                                <div className="activity-details">
                                    <span className="activity-time">
                                        {formatDate(activity.created_at)}
                                    </span>
                                    <span className="activity-description">
                                        {formatActivityText(activity)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-state">No recent activity</p>
                )}
            </div>
        </div>
    );
};

// Helper functions
const getActivityIcon = (action) => {
    const icons = {
        profile_update: 'fa-user-edit',
        enrollment: 'fa-book',
        payment: 'fa-credit-card',
        certificate: 'fa-certificate',
        default: 'fa-circle'
    };
    return icons[action] || icons.default;
};

const formatActivityText = (activity) => {
    switch (activity.action) {
        case 'profile_update':
            return 'Updated profile information';
        case 'enrollment':
            return `Enrolled in ${activity.details?.class_title || 'a class'}`;
        case 'payment':
            return `Made a payment of $${activity.details?.amount || '0'}`;
        case 'certificate':
            return `Earned a certificate`;
        default:
            return activity.description || activity.action.replace(/_/g, ' ');
    }
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
};

export default ProfileOverview; 