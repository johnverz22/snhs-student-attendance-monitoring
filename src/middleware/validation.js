const { body, validationResult } = require('express-validator');
const { formatValidationErrors } = require('./errorHandler');

/**
 * Middleware to check validation results and return errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const firstError = errorArray[0];
    
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: firstError.msg,
      details: formatValidationErrors(errorArray),
    });
  }
  
  next();
};

/**
 * Validation rules for student registration
 */
const studentRegistrationRules = [
  body('student_id')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Student ID must be between 3 and 50 characters'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('grade')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Grade must not exceed 20 characters'),
  
  body('section')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Section must not exceed 20 characters'),
  
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true; // Optional field
      // Remove spaces for validation
      const cleanPhone = value.replace(/\s/g, '');
      // Philippine mobile format: 09XX XXX XXXX (11 digits starting with 09)
      if (!/^09\d{9}$/.test(cleanPhone)) {
        throw new Error('Phone format must be 09XX XXX XXXX');
      }
      return true;
    }),
];

/**
 * Validation rules for student login
 */
const studentLoginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for student profile update
 */
const studentProfileUpdateRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('grade')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Grade must not exceed 20 characters'),
  
  body('section')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Section must not exceed 20 characters'),
  
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true; // Optional field
      // Remove spaces for validation
      const cleanPhone = value.replace(/\s/g, '');
      // Philippine mobile format: 09XX XXX XXXX (11 digits starting with 09)
      if (!/^09\d{9}$/.test(cleanPhone)) {
        throw new Error('Phone format must be 09XX XXX XXXX');
      }
      return true;
    }),
];

/**
 * Validation rules for school configuration update
 */
const validateSchoolConfig = [
  body('schoolName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('School name cannot be empty')
    .isLength({ min: 2, max: 200 })
    .withMessage('School name must be between 2 and 200 characters'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('radiusMeters')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Radius must be between 1 and 10000 meters'),
  
  body('timezone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Timezone cannot be empty'),
  
  validate,
];

/**
 * Validation rules for creating a QR code
 */
const qrCodeCreateRules = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('QR code is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('QR code must be between 3 and 200 characters'),
  
  body('gateName')
    .trim()
    .notEmpty()
    .withMessage('Gate name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Gate name must be between 2 and 100 characters'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
    .custom((value) => {
      const expirationDate = new Date(value);
      const now = new Date();
      if (expirationDate <= now) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),
];

/**
 * Validation rules for updating a QR code
 */
const qrCodeUpdateRules = [
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('QR code cannot be empty')
    .isLength({ min: 3, max: 200 })
    .withMessage('QR code must be between 3 and 200 characters'),
  
  body('gateName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Gate name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Gate name must be between 2 and 100 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('expiresAt')
    .optional()
    .custom((value) => {
      if (value === null) {
        return true; // Allow null to clear expiration
      }
      // Validate ISO 8601 format
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Expiration date must be a valid ISO 8601 date');
      }
      return true;
    }),
];

/**
 * Validation rules for attendance scan
 */
const attendanceScanRules = [
  body('qrCode')
    .trim()
    .notEmpty()
    .withMessage('QR code is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('QR code must be between 3 and 200 characters'),
  
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO 8601 date'),
];

/**
 * Validation rules for device token registration
 */
const deviceTokenRegistrationRules = [
  body('deviceToken')
    .trim()
    .notEmpty()
    .withMessage('Device token is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Device token must be between 10 and 500 characters'),
  
  body('platform')
    .trim()
    .notEmpty()
    .withMessage('Platform is required')
    .isIn(['ios', 'android'])
    .withMessage('Platform must be either ios or android'),
];

/**
 * Validation rules for parent registration
 */
const parentRegistrationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Phone number must contain only digits, spaces, and valid phone characters'),
  
  body('studentIds')
    .isArray({ min: 1 })
    .withMessage('At least one student ID is required')
    .custom((studentIds) => {
      if (!studentIds.every(id => typeof id === 'string' && id.trim().length > 0)) {
        throw new Error('All student IDs must be non-empty strings');
      }
      return true;
    }),
  
  body('relationships')
    .optional()
    .isArray()
    .withMessage('Relationships must be an array')
    .custom((relationships, { req }) => {
      if (relationships && relationships.length !== req.body.studentIds.length) {
        throw new Error('Relationships array must match studentIds array length');
      }
      return true;
    }),
];

/**
 * Validation rules for parent login
 */
const parentLoginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = {
  validate,
  studentRegistrationRules,
  studentLoginRules,
  studentProfileUpdateRules,
  validateSchoolConfig,
  qrCodeCreateRules,
  qrCodeUpdateRules,
  attendanceScanRules,
  deviceTokenRegistrationRules,
  parentRegistrationRules,
  parentLoginRules,
};
