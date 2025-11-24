require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'school_attendance',
    user: process.env.DB_USER || 'school_admin',
    password: process.env.DB_PASSWORD || 'school_password_123',
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  school: {
    name: process.env.SCHOOL_NAME || 'Sample School',
    latitude: parseFloat(process.env.SCHOOL_LATITUDE) || 40.7128,
    longitude: parseFloat(process.env.SCHOOL_LONGITUDE) || -74.0060,
    radiusMeters: parseInt(process.env.SCHOOL_RADIUS_METERS) || 100,
  },
  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
  },
};
