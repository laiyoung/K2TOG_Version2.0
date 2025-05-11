import React from 'react';
import './ProfileOverview.css';

const ProfileOverview = ({ profile }) => {
    const stats = [
        {
            label: 'Enrolled Classes',
            value: profile?.enrollments?.length || 0,
            icon: 'fa-book'
        },
        {
            label: 'Certificates',
            value: profile?.certificates?.length || 0,
            icon: 'fa-certificate'
        },
        {
            label: 'Payment Methods',
            value: profile?.payment_methods?.length || 0,
            icon: 'fa-credit-card'
        },
        {
            label: 'Unread Notifications',
            value: profile?.notifications?.filter(n => !n.is_read).length || 0,
            icon: 'fa-bell'
        }
    ];

    const recentActivity = profile?.activity_log?.slice(0, 5) || [];

    return (
        <div className="profile-overview">
            <div className="section-header">
                <h2>Overview</h2>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <i className={`fas ${stat.icon}`}></i>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="recent-activity">
                <h3>Recent Activity</h3>
                {recentActivity.length > 0 ? (
                    <div className="activity-list">
                        {recentActivity.map(activity => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-icon">
                                    <i className={`fas ${getActivityIcon(activity.action)}`}></i>
                                </div>
                                <div className="activity-details">
                                    <p className="activity-text">{formatActivityText(activity)}</p>
                                    <span className="activity-time">
                                        {new Date(activity.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <i className="fas fa-history"></i>
                        <p>No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper function to get icon based on activity type
const getActivityIcon = (action) => {
    const icons = {
        profile_update: 'fa-user-edit',
        enrollment: 'fa-book',
        payment_method_added: 'fa-credit-card',
        certificate_earned: 'fa-certificate',
        default: 'fa-circle'
    };
    return icons[action] || icons.default;
};

// Helper function to format activity text
const formatActivityText = (activity) => {
    switch (activity.action) {
        case 'profile_update':
            return 'Updated profile information';
        case 'enrollment':
            return `Enrolled in ${activity.details.class_name}`;
        case 'payment_method_added':
            return `Added payment method ending in ${activity.details.last_four}`;
        case 'certificate_earned':
            return `Earned certificate: ${activity.details.certificate_name}`;
        default:
            return activity.action.replace(/_/g, ' ');
    }
};

export default ProfileOverview; 