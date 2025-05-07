const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided or invalid format');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  console.log('Token received:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    console.log('Token verification error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = requireAuth;
