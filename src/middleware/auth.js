const authService = require('../services/authService');

/**
 * Authentication middleware to verify JWT tokens
 * Extracts token from Authorization header and verifies it
 * Attaches decoded user info to req.user
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_NO_TOKEN',
        message: 'No authorization token provided',
      });
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'AUTH_INVALID_FORMAT',
        message: 'Authorization header format must be: Bearer <token>',
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(error.status || 401).json({
      success: false,
      error: error.code || 'AUTH_FAILED',
      message: error.message || 'Authentication failed',
    });
  }
};

/**
 * Role-based access control middleware factory
 * Creates middleware that checks if user has required role(s)
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'AUTH_FORBIDDEN',
        message: 'Insufficient permissions to access this resource',
      });
    }

    next();
  };
};

/**
 * Combined authentication and authorization middleware
 * Authenticates user and checks for required role(s)
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Array<Function>} Array of middleware functions
 */
const authenticateAndAuthorize = (...allowedRoles) => {
  return [authenticate, authorize(...allowedRoles)];
};

/**
 * Alias for authenticate function for backward compatibility
 */
const authenticateToken = authenticate;

/**
 * Role requirement middleware factory
 * Creates middleware that checks if user has a specific role
 * @param {string} role - Required role
 * @returns {Function} Express middleware function
 */
const requireRole = (role) => {
  return authorize(role);
};

module.exports = {
  authenticate,
  authorize,
  authenticateAndAuthorize,
  authenticateToken,
  requireRole,
};
