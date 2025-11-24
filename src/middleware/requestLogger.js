const Logger = require('../utils/logger');

/**
 * Request logging middleware
 * Logs all incoming requests and their responses
 */
const requestLogger = (req, res, next) => {
  // Record start time
  const startTime = Date.now();

  // Log incoming request
  Logger.logRequest(req);

  // Capture the original res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log response
    Logger.logResponse(req, res, responseTime);
    
    // Call original json method
    return originalJson(body);
  };

  next();
};

module.exports = requestLogger;
