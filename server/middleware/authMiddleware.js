const { requireAuth, authorizeRole } = require('./auth');

const requireAdmin = authorizeRole(['admin']);

module.exports = {
  requireAuth,
  requireAdmin,
}; 