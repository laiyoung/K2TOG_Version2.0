// server/utils/validators.js

/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates a phone number format (North American format)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?1?\d{10}$/;
    return phoneRegex.test(phone.replace(/[^0-9+]/g, ''));
};

/**
 * Validates a date format (YYYY-MM-DD)
 * @param {string} date - The date to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateDate = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const d = new Date(date);
    return d instanceof Date && !isNaN(d) && d.toISOString().split('T')[0] === date;
};

/**
 * Validates a time format (HH:MM)
 * @param {string} time - The time to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateTime = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
};

/**
 * Validates a price (must be positive number)
 * @param {number} price - The price to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validatePrice = (price) => {
    return typeof price === 'number' && price >= 0 && !isNaN(price);
};

/**
 * Validates a capacity (must be positive integer)
 * @param {number} capacity - The capacity to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateCapacity = (capacity) => {
    return Number.isInteger(capacity) && capacity > 0;
};

/**
 * Validates a password strength
 * @param {string} password - The password to validate
 * @returns {Object} - Object containing validation result and message
 */
const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }

    if (!/[!@#$%^&*]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
    }

    return { isValid: true, message: 'Password is valid' };
};

/**
 * Validates a name (first or last name)
 * @param {string} name - The name to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateName = (name) => {
    if (!name) return false;
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
    return nameRegex.test(name);
};

/**
 * Validates a role
 * @param {string} role - The role to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateRole = (role) => {
    const validRoles = ['admin', 'instructor', 'parent', 'student'];
    return validRoles.includes(role);
};

/**
 * Validates a status
 * @param {string} status - The status to validate
 * @param {string} type - The type of status (user, enrollment, class)
 * @returns {boolean} - True if valid, false otherwise
 */
const validateStatus = (status, type) => {
    const validStatuses = {
        user: ['active', 'inactive', 'suspended'],
        enrollment: ['pending', 'approved', 'rejected', 'cancelled'],
        class: ['scheduled', 'in_progress', 'completed', 'cancelled']
    };

    return validStatuses[type]?.includes(status) || false;
};

module.exports = {
    validateEmail,
    validatePhoneNumber,
    validateDate,
    validateTime,
    validatePrice,
    validateCapacity,
    validatePassword,
    validateName,
    validateRole,
    validateStatus
}; 