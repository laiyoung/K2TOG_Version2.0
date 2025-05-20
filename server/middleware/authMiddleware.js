const requireAuth = require('./auth');

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Admins only' });
}

module.exports = {
  requireAuth,
  requireAdmin,
}; 