import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    IconButton,
    InputAdornment
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Lock as LockIcon
} from '@mui/icons-material';
import './PasswordSection.css';

const PasswordSection = () => {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handlePasswordChange = (field) => (event) => {
        setPasswords(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        setError('');
        setSuccess('');
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validatePasswords = () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setError('All fields are required');
            return false;
        }
        if (passwords.new !== passwords.confirm) {
            setError('New passwords do not match');
            return false;
        }
        if (passwords.new.length < 8) {
            setError('New password must be at least 8 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validatePasswords()) {
            return;
        }

        try {
            // TODO: Replace with actual API call
            // Simulating API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccess('Password updated successfully');
            setPasswords({
                current: '',
                new: '',
                confirm: ''
            });
            setShowPasswords({
                current: false,
                new: false,
                confirm: false
            });
        } catch (err) {
            setError('Failed to update password. Please try again.');
        }
    };

    return (
        <Box className="password-section">
            <Paper elevation={1} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LockIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                        Change Password
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Current Password"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwords.current}
                        onChange={handlePasswordChange('current')}
                        margin="normal"
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => togglePasswordVisibility('current')}
                                        edge="end"
                                    >
                                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        label="New Password"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwords.new}
                        onChange={handlePasswordChange('new')}
                        margin="normal"
                        required
                        helperText="Password must be at least 8 characters long"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => togglePasswordVisibility('new')}
                                        edge="end"
                                    >
                                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwords.confirm}
                        onChange={handlePasswordChange('confirm')}
                        margin="normal"
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        edge="end"
                                    >
                                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3 }}
                    >
                        Update Password
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default PasswordSection; 