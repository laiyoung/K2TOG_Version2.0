import React, { useState } from 'react';
import userService from '../../services/userService';
import './ProfileHeader.css';

const ProfileHeader = ({ profile, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        phone_number: profile?.phone_number || '',
        profile_picture_url: profile?.profile_picture_url || ''
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const response = await userService.uploadProfilePicture(file);
            setFormData(prev => ({
                ...prev,
                profile_picture_url: response.data.profile_picture_url
            }));
            onUpdate(response.data);
        } catch (err) {
            setError('Failed to upload profile picture');
        }
    };

    return (
        <div className="profile-header">
            <div className="profile-header-content">
                <div className="profile-picture-container">
                    <img
                        src={profile?.profile_picture_url || '/default-profile.png'}
                        alt={`${profile?.first_name || 'User'}'s profile`}
                        className="profile-picture"
                    />
                    {isEditing && (
                        <label className="upload-picture-label">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                            <i className="fas fa-camera"></i>
                        </label>
                    )}
                </div>

                <div className="profile-info">
                    {isEditing ? (
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
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            first_name: profile?.first_name || '',
                                            last_name: profile?.last_name || '',
                                            phone_number: profile?.phone_number || '',
                                            profile_picture_url: profile?.profile_picture_url || ''
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h1>{`${profile?.first_name || ''} ${profile?.last_name || ''}`}</h1>
                            <p className="email">{profile?.email}</p>
                            {profile?.phone_number && (
                                <p className="phone">
                                    <i className="fas fa-phone"></i> {profile.phone_number}
                                </p>
                            )}
                            <button
                                className="btn btn-primary edit-profile-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                <i className="fas fa-edit"></i> Edit Profile
                            </button>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i> {success}
                </div>
            )}
        </div>
    );
};

export default ProfileHeader; 