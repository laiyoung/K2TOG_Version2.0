// server/utils/validators.js

function isValidEmail(email) {
  // Simple regex for demonstration
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  // Simple regex for demonstration
  return /^[0-9\-\+]{9,15}$/.test(phone);
}

function isStrongPassword(password) {
  // At least 8 characters, one uppercase, one lowercase, one number
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

module.exports = {
  isValidEmail,
  isValidPhone,
  isStrongPassword,
}; 