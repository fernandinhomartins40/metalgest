const jwt = require('jsonwebtoken');
const database = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Access denied. No token provided.' } 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await database.get(
      'SELECT * FROM users WHERE id = ? AND active = 1', 
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Invalid token.' } 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: { message: 'Invalid token.' } 
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await database.get(
        'SELECT * FROM users WHERE id = ? AND active = 1', 
        [decoded.id]
      );
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' }
      });
    }

    next();
  };
};

module.exports = { 
  authMiddleware, 
  optionalAuth, 
  requireRole 
};