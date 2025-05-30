const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Token verification failed:', err);
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = requireAuth;
