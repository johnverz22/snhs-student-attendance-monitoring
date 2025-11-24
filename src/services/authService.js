const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');

class AuthService {
  /**
   * Hash a password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, config.security.bcryptRounds);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} True if passwords match
   */
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate JWT access token
   * @param {Object} payload - Token payload
   * @param {number} payload.id - User ID
   * @param {string} payload.role - User role (student, parent, admin)
   * @param {string} [payload.email] - User email
   * @returns {string} JWT token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Generate JWT refresh token
   * @param {Object} payload - Token payload
   * @param {number} payload.id - User ID
   * @param {string} payload.role - User role (student, parent, admin)
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const err = new Error('Token has expired');
        err.code = 'AUTH_TOKEN_EXPIRED';
        err.status = 401;
        throw err;
      }
      if (error.name === 'JsonWebTokenError') {
        const err = new Error('Invalid token');
        err.code = 'AUTH_INVALID_TOKEN';
        err.status = 401;
        throw err;
      }
      throw error;
    }
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} payload - Token payload
   * @param {number} payload.id - User ID
   * @param {string} payload.role - User role (student, parent, admin)
   * @param {string} [payload.email] - User email
   * @returns {Object} Object containing accessToken and refreshToken
   */
  generateTokenPair(payload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Valid refresh token
   * @returns {Object} Object containing new accessToken
   * @throws {Error} If refresh token is invalid
   */
  refreshAccessToken(refreshToken) {
    const decoded = this.verifyToken(refreshToken);
    
    // Generate new access token with same payload (excluding exp, iat)
    const payload = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };
    
    return {
      accessToken: this.generateAccessToken(payload),
    };
  }
}

module.exports = new AuthService();
