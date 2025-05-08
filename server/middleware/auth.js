const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (process.env.NODE_ENV !== 'test') {
      console.log('No token provided or invalid format');
    }
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('JWT_SECRET:', process.env.JWT_SECRET);
      console.log('Token received:', token);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('Decoded token:', decoded);
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Token verification failed:', err);
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = requireAuth;
