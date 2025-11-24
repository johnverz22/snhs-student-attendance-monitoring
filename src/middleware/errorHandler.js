const config = require('../config');
const Logger = require('../utils/logger');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error logger middleware
 * Logs all errors with context information
 */
const logError = (err, req) => {
  const errorContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user ? req.user.id : null,
    userRole: req.user ? req.user.role : null,
    errorCode: err.errorCode || err.code || 'UNKNOWN_ERROR',
    statusCode: err.statusCode || err.status || 500,
  };

  // Use the Logger utility for comprehensive logging
  Logger.error('Request Error', err, errorContext);

  // In production, you would also send this to a logging service like:
  // - Winston
  // - Sentry
  // - CloudWatch
  // - Datadog
  // etc.
};

/**
 * Centralized error handler middleware
 * Handles all errors and returns standardized error responses
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logError(err, req);

  // Default error values
  let statusCode = err.statusCode || err.status || 500;
  let errorCode = err.errorCode || err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || undefined;

  // Handle specific error types
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'AUTH_INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'AUTH_TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  // Validation errors from express-validator
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT' || err.message?.includes('UNIQUE constraint failed')) {
    statusCode = 409;
    errorCode = 'DATABASE_CONSTRAINT_ERROR';
    message = 'A record with this information already exists';
  } else if (err.code === 'SQLITE_ERROR' || err.message?.includes('database')) {
    statusCode = 500;
    errorCode = 'DATABASE_ERROR';
    message = config.server.env === 'development' ? err.message : 'Database operation failed';
  }

  // Syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }

  // Rate limit errors
  if (err.name === 'RateLimitError') {
    statusCode = 429;
    errorCode = 'RATE_LIMIT_EXCEEDED';
    message = 'Too many requests, please try again later';
  }

  // Don't expose internal error details in production
  if (statusCode === 500 && config.server.env === 'production') {
    message = 'An unexpected error occurred';
    details = undefined;
  }

  // Send error response
  const errorResponse = {
    success: false,
    error: errorCode,
    message: message,
  };

  // Add details if available
  if (details) {
    errorResponse.details = details;
  }

  // Add stack trace in development mode
  if (config.server.env === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Handles requests to non-existent routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors and pass them to error handler
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error formatter
 * Formats validation errors from express-validator
 */
const formatValidationErrors = (errors) => {
  return errors.map(err => ({
    field: err.path || err.param,
    message: err.msg,
    value: err.value,
  }));
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  logError,
  formatValidationErrors,
};
