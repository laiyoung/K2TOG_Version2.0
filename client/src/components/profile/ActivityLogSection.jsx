import React from 'react';
import './ActivityLogSection.css';

const ActivityLogSection = ({ activities }) => {
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

    // Group activities by date
    const groupedActivities = activities.reduce((groups, activity) => {
        const date = new Date(activity.created_at).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(activity);
        return groups;
    }, {});

    return (
        <div className="activity-log-section">
            <div className="section-header">
                <h2>Activity Log</h2>
            </div>

            {activities.length > 0 ? (
                <div className="activity-timeline">
                    {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                        <div key={date} className="activity-date-group">
                            <div className="activity-date-header">
                                {formatDate(dateActivities[0].created_at)}
                            </div>
                            {dateActivities.map(activity => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-icon">
                                        <i className={`fas ${getActivityIcon(activity.action)}`}></i>
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-text">
                                            {formatActivityText(activity)}
                                        </div>
                                        <div className="activity-time">
                                            {new Date(activity.created_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <i className="fas fa-history"></i>
                    <p>No activity to show</p>
                    <p className="empty-state-subtext">
                        Your activity will appear here
                    </p>
                </div>
            )}
        </div>
    );
};

export default ActivityLogSection; 