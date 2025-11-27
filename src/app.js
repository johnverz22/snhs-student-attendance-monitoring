const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const dbManager = require('./models/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiRateLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const Logger = require('./utils/logger');

const app = express();

// Database initialization promise
let dbInitPromise = null;

// Initialize database once
const initializeDatabase = async () => {
  if (!dbInitPromise) {
    dbInitPromise = dbManager.initialize()
      .then(() => {
        Logger.info('Database initialized successfully');
        return true;
      })
      .catch((error) => {
        Logger.error('Failed to initialize database', error);
        console.error('Failed to initialize database:', error);
        // Don't exit in serverless environment
        if (process.env.NODE_ENV !== 'production') {
          throw error;
        }
        return false;
      });
  }
  return dbInitPromise;
};

// Middleware to ensure database is initialized
const ensureDbInitialized = async (req, res, next) => {
  try {
    const initialized = await initializeDatabase();
    if (!initialized && process.env.NODE_ENV === 'production') {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        message: 'Database connection failed'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Trust proxy - important for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Disable caching for API routes in production (prevent CDN cache issues)
app.use('/api/', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Request logging (only in development)
if (config.server.env === 'development') {
  app.use(requestLogger);
}

// Serve static files for admin interface
app.use('/admin', express.static(path.join(__dirname, '../public/admin'), {
  index: 'index.html'
}));

// Health check endpoint (no database required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// Apply database initialization middleware to all API routes
app.use('/api/', ensureDbInitialized);

// Apply rate limiting to all API routes
app.use('/api/', apiRateLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/parent', require('./routes/parent'));

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Centralized error handling middleware - must be last
app.use(errorHandler);

module.exports = app;
