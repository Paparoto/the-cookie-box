const jwt = require('jsonwebtoken');

// Middleware to check if user is logged in
function authenticateUser(req, res, next) {
  // Read token from the HTTP-only cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No cookie found.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info { id, email, role } to the request
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired session token.' });
  }
}

// Middleware to check if user has admin privileges
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only.' });
  }
  next();
}

module.exports = { authenticateUser, requireAdmin };