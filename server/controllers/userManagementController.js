const User = require('../models/userModel');
const { validateEmail, validatePhoneNumber } = require('../utils/validators');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { logUserActivity } = require('../models/userModel');

// @desc    Search and filter users
// @route   GET /api/admin/users/search
// @access  Private/Admin
const searchUsers = async (req, res) => {
    try {
        const {
            searchTerm,
            role,
            sortBy,
            sortOrder,
            page = 1,
            limit = 50,
            includeInactive
        } = req.query;

        const offset = (page - 1) * limit;
        const result = await User.searchUsers({
            searchTerm,
            role,
            sortBy,
            sortOrder,
            limit: parseInt(limit),
            offset,
            includeInactive: includeInactive === 'true'
        });

        res.json({
            users: result.users,
            pagination: {
                total: result.total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(result.total / limit)
            }
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ error: 'Role is required' });
        }

        const updatedUser = await User.updateUserRole(id, role, req.user.id);
        res.json(updatedUser);
    } catch (error) {
        console.error('Update role error:', error);
        if (error.message === 'Invalid role specified') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update user role' });
    }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const updatedUser = await User.updateUserStatus(id, status, req.user.id);
        res.json(updatedUser);
    } catch (error) {
        console.error('Update status error:', error);
        if (error.message === 'Invalid status specified') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

// @desc    Get users by role
// @route   GET /api/admin/users/role/:role
// @access  Private/Admin
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const users = await User.getUsersByRole(role);
        res.json(users);
    } catch (error) {
        console.error('Get users by role error:', error);
        res.status(500).json({ error: 'Failed to get users by role' });
    }
};

// @desc    Get user activity
// @route   GET /api/admin/users/:id/activity
// @access  Private/Admin
const getUserActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            action,
            startDate,
            endDate,
            page = 1,
            limit = 50
        } = req.query;

        const offset = (page - 1) * limit;
        const activities = await User.getUserActivity(id, {
            action,
            startDate,
            endDate,
            limit: parseInt(limit),
            offset
        });

        res.json({
            activities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({ error: 'Failed to get user activity' });
    }
};

// @desc    Update user profile (admin)
// @route   PUT /api/admin/users/:id/profile
// @access  Private/Admin
const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            email,
            first_name,
            last_name,
            phone_number,
            email_notifications,
            sms_notifications
        } = req.body;

        // Validate email if provided
        if (email && !validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate phone number if provided
        if (phone_number && !validatePhoneNumber(phone_number)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        const updatedUser = await User.updateProfile(id, {
            email,
            first_name,
            last_name,
            phone_number,
            email_notifications,
            sms_notifications
        });

        // Log the profile update
        await User.logUserActivity(id, 'profile_update', {
            updated_by: req.user.id,
            updated_fields: Object.keys(req.body)
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
};

// @desc    Change user password
// @route   PUT /api/admin/users/:id/password
// @access  Private/Admin
const changeUserPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    const adminId = req.user.id; // Admin performing the action

    if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
    }

    try {
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password
        const query = `
            UPDATE users 
            SET password = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, email, role
        `;
        const { rows } = await pool.query(query, [hashedPassword, id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Log the activity
        await logUserActivity(id, 'password_changed', {
            changed_by: adminId,
            changed_at: new Date().toISOString()
        });

        res.json({ 
            message: 'Password updated successfully',
            user: {
                id: rows[0].id,
                email: rows[0].email,
                role: rows[0].role
            }
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUserAccount = async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id; // Admin performing the action
    const { reason } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // First, check if user exists and get their details
        const userQuery = `
            SELECT id, email, role 
            FROM users 
            WHERE id = $1
        `;
        const { rows: userRows } = await client.query(userQuery, [id]);

        if (userRows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userRows[0];

        // Check if user has any active enrollments
        const enrollmentQuery = `
            SELECT COUNT(*) 
            FROM enrollments 
            WHERE user_id = $1 
            AND enrollment_status = 'approved'
        `;
        const { rows: enrollmentRows } = await client.query(enrollmentQuery, [id]);
        
        if (parseInt(enrollmentRows[0].count) > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                error: 'Cannot delete user with active enrollments. Please handle enrollments first.' 
            });
        }

        // Check if user has any pending payments
        const paymentQuery = `
            SELECT COUNT(*) 
            FROM payments 
            WHERE user_id = $1 
            AND status = 'pending'
        `;
        const { rows: paymentRows } = await client.query(paymentQuery, [id]);
        
        if (parseInt(paymentRows[0].count) > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                error: 'Cannot delete user with pending payments. Please handle payments first.' 
            });
        }

        // Log the activity before deletion
        await logUserActivity(id, 'account_deleted', {
            deleted_by: adminId,
            deleted_at: new Date().toISOString(),
            reason: reason || 'No reason provided'
        });

        // Delete user's data from related tables
        await client.query('DELETE FROM user_notifications WHERE user_id = $1', [id]);
        await client.query('DELETE FROM user_activity_log WHERE user_id = $1', [id]);
        await client.query('DELETE FROM user_payment_methods WHERE user_id = $1', [id]);
        await client.query('DELETE FROM user_certificates WHERE user_id = $1', [id]);
        await client.query('DELETE FROM class_waitlist WHERE user_id = $1', [id]);
        await client.query('DELETE FROM enrollments WHERE user_id = $1', [id]);
        
        // Finally, delete the user
        await client.query('DELETE FROM users WHERE id = $1', [id]);

        await client.query('COMMIT');

        res.json({ 
            message: 'User account deleted successfully',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user account' });
    } finally {
        client.release();
    }
};

// @desc    Get user account status
// @route   GET /api/admin/users/:id/status
// @access  Private/Admin
const getUserAccountStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                u.id,
                u.email,
                u.role,
                u.status,
                u.created_at,
                u.updated_at,
                COUNT(DISTINCT e.id) as total_enrollments,
                COUNT(DISTINCT CASE WHEN e.enrollment_status = 'approved' THEN e.id END) as active_enrollments,
                COUNT(DISTINCT p.id) as total_payments,
                COUNT(DISTINCT CASE WHEN p.status = 'pending' THEN p.id END) as pending_payments,
                COUNT(DISTINCT c.id) as total_certificates,
                COUNT(DISTINCT w.id) as waitlist_positions
            FROM users u
            LEFT JOIN enrollments e ON u.id = e.user_id
            LEFT JOIN payments p ON u.id = p.user_id
            LEFT JOIN user_certificates c ON u.id = c.user_id
            LEFT JOIN class_waitlist w ON u.id = w.user_id
            WHERE u.id = $1
            GROUP BY u.id, u.email, u.role, u.status, u.created_at, u.updated_at
        `;
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Get user status error:', error);
        res.status(500).json({ error: 'Failed to get user account status' });
    }
};

module.exports = {
    searchUsers,
    updateUserRole,
    updateUserStatus,
    getUsersByRole,
    getUserActivity,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount,
    getUserAccountStatus
}; 