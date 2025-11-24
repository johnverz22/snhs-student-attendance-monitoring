const config = require('../config');

/**
 * Logger utility for comprehensive application logging
 */
class Logger {
  /**
   * Log levels
   */
  static LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
  };

  /**
   * Format log message with timestamp and level
   */
  static formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Log error message
   */
  static error(message, error = null, context = {}) {
    const logContext = {
      ...context,
    };

    if (error) {
      logContext.error = {
        message: error.message,
        code: error.code || error.errorCode,
        stack: config.server.env === 'development' ? error.stack : undefined,
      };
    }

    console.error(this.formatMessage(this.LEVELS.ERROR, message, logContext));
  }

  /**
   * Log warning message
   */
  static warn(message, context = {}) {
    console.warn(this.formatMessage(this.LEVELS.WARN, message, context));
  }

  /**
   * Log info message
   */
  static info(message, context = {}) {
    console.log(this.formatMessage(this.LEVELS.INFO, message, context));
  }

  /**
   * Log debug message (only in development)
   */
  static debug(message, context = {}) {
    if (config.server.env === 'development') {
      console.log(this.formatMessage(this.LEVELS.DEBUG, message, context));
    }
  }

  /**
   * Log API request
   */
  static logRequest(req) {
    const logContext = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user ? req.user.id : null,
      userRole: req.user ? req.user.role : null,
    };

    this.info('API Request', logContext);
  }

  /**
   * Log API response
   */
  static logResponse(req, res, responseTime) {
    const logContext = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user ? req.user.id : null,
    };

    if (res.statusCode >= 400) {
      this.warn('API Response Error', logContext);
    } else {
      this.info('API Response', logContext);
    }
  }

  /**
   * Log database operation
   */
  static logDatabaseOperation(operation, table, context = {}) {
    this.debug('Database Operation', {
      operation,
      table,
      ...context,
    });
  }

  /**
   * Log authentication event
   */
  static logAuthEvent(event, userId, role, success, context = {}) {
    const logContext = {
      event,
      userId,
      role,
      success,
      ...context,
    };

    if (success) {
      this.info('Authentication Event', logContext);
    } else {
      this.warn('Authentication Failed', logContext);
    }
  }

  /**
   * Log security event
   */
  static logSecurityEvent(event, severity, context = {}) {
    const logContext = {
      event,
      severity,
      ...context,
    };

    if (severity === 'high' || severity === 'critical') {
      this.error('Security Event', null, logContext);
    } else {
      this.warn('Security Event', logContext);
    }
  }
}

module.exports = Logger;
