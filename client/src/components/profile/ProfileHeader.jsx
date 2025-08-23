import React, { useState } from 'react';
import userService from '../../services/userService';
import './ProfileHeader.css';

const ProfileHeader = ({ profile, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        phone_number: profile?.phone_number || ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await userService.updateProfile(formData);
            setSuccess('Profile updated successfully');
            onUpdate(response.data);
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    return (
        <div className="profile-header">
            <div className="profile-header-content">
                <div className="profile-info">
                    {!isEditing ? (
                        <>
                            <h1>{profile?.first_name || 'User'} {profile?.last_name || ''}</h1>
                            <p className="email">{profile?.email || 'No email provided'}</p>
                            <p className="phone">
                                <i className="fas fa-phone"></i>
                                {profile?.phone_number || 'No phone number provided'}
                            </p>
                            <button
                                className="edit-profile-btn btn btn-outline"
                                onClick={() => setIsEditing(true)}
                            >
                                <i className="fas fa-edit"></i>
                                Edit Profile
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="edit-profile-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="first_name">First Name</label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Enter your first name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="last_name">Last Name</label>
                                    <input
                                        type="text"
                                        id="last_name"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Enter your last name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone_number">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    <i className="fas fa-save"></i>
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setIsEditing(false)}
                                >
                                    <i className="fas fa-times"></i>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            {error && (
                <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i>
                    {success}
                </div>
            )}
        </div>
    );
};

export default ProfileHeader; 