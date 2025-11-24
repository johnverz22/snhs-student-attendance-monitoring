const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const dbManager = require('../models/database');
const { queryOne, queryAll, execute, transaction } = require('../utils/dbHelpers');
const {
  validate,
  studentRegistrationRules,
  studentLoginRules,
  parentRegistrationRules,
  parentLoginRules,
} = require('../middleware/validation');
const { body } = require('express-validator');
const { authRateLimiter, registrationRateLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/auth/student/register
 * Register a new student account
 */
router.post(
  '/student/register',
  registrationRateLimiter,
  studentRegistrationRules,
  validate,
  asyncHandler(async (req, res) => {
    const { student_id, name, email, password, grade, section, phone } = req.body;

    // Check if student_id already exists
    const existingStudentId = await queryOne(
      'SELECT id FROM students WHERE student_id = $1',
      [student_id]
    );

    if (existingStudentId) {
      return res.status(409).json({
        success: false,
        error: 'VALIDATION_DUPLICATE',
        message: 'Student ID already exists',
      });
    }

    // Check if email already exists
    const existingEmail = await queryOne(
      'SELECT id FROM students WHERE email = $1',
      [email]
    );

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: 'VALIDATION_DUPLICATE',
        message: 'Email already exists',
      });
    }

    // Hash password
    const passwordHash = await authService.hashPassword(password);

    // Insert student into database
    const result = await execute(
      `INSERT INTO students (student_id, name, email, password_hash, grade, section, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [student_id, name, email, passwordHash, grade || null, section || null, phone || null]
    );

    const studentId = result.rows[0].id;

    // Generate tokens
    const tokens = authService.generateTokenPair({
      id: studentId,
      role: 'student',
      email: email,
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        student: {
          id: studentId,
          student_id,
          name,
          email,
          grade,
          section,
          phone,
        },
        ...tokens,
      },
    });
  })
);

/**
 * POST /api/auth/student/login
 * Login with student credentials
 */
router.post(
  '/student/login',
  authRateLimiter,
  studentLoginRules,
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find student by email
    const student = await queryOne(
      'SELECT id, student_id, name, email, password_hash, grade, section, phone, is_archived FROM students WHERE email = $1',
      [email]
    );

    if (!student) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Check if student is archived
    if (student.is_archived) {
      return res.status(403).json({
        success: false,
        error: 'ACCOUNT_ARCHIVED',
        message: 'Your account has been archived. Please contact the school administrator.',
      });
    }

    // Verify password
    const isPasswordValid = await authService.comparePassword(
      password,
      student.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const tokens = authService.generateTokenPair({
      id: student.id,
      role: 'student',
      email: student.email,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        student: {
          id: student.id,
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          grade: student.grade,
          section: student.section,
          phone: student.phone,
        },
        ...tokens,
      },
    });
  })
);

/**
 * POST /api/auth/parent/register
 * Register a new parent account with student linking
 */
router.post(
  '/parent/register',
  registrationRateLimiter,
  parentRegistrationRules,
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, studentIds, relationships } = req.body;

    // Check if email already exists
    const existingEmail = await queryOne(
      'SELECT id FROM parents WHERE email = $1',
      [email]
    );

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: 'VALIDATION_DUPLICATE',
        message: 'Email already exists',
      });
    }

    // Verify all student IDs exist and get their database IDs
    const invalidStudents = [];
    const validStudentDbIds = [];
    
    for (const studentId of studentIds) {
      const student = await queryOne(
        'SELECT id, student_id FROM students WHERE student_id = $1',
        [studentId]
      );
      if (!student) {
        invalidStudents.push(studentId);
      } else {
        validStudentDbIds.push(student.id);
      }
    }

    if (invalidStudents.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `Invalid student IDs: ${invalidStudents.join(', ')}`,
      });
    }

    // Hash password
    const passwordHash = await authService.hashPassword(password);

    // Use transaction to insert parent and create links
    const parentId = await transaction(async (client) => {
      // Insert parent into database
      const result = await client.query(
        `INSERT INTO parents (name, email, password_hash, phone)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [name, email, passwordHash, phone || null]
      );

      const newParentId = result.rows[0].id;

      // Create parent-student links using database IDs
      for (let i = 0; i < validStudentDbIds.length; i++) {
        const studentDbId = validStudentDbIds[i];
        const relationship = relationships && relationships[i] ? relationships[i] : null;
        await client.query(
          `INSERT INTO parent_student_links (parent_id, student_id, relationship)
           VALUES ($1, $2, $3)`,
          [newParentId, studentDbId, relationship]
        );
      }

      return newParentId;
    });

    // Generate tokens
    const tokens = authService.generateTokenPair({
      id: parentId,
      role: 'parent',
      email: email,
    });

    // Get linked students for response
    const linkedStudents = await queryAll(
      `SELECT s.id, s.student_id, s.name, s.grade, psl.relationship
       FROM students s
       JOIN parent_student_links psl ON s.id = psl.student_id
       WHERE psl.parent_id = $1`,
      [parentId]
    );

    res.status(201).json({
      success: true,
      message: 'Parent registered successfully',
      data: {
        parent: {
          id: parentId,
          name,
          email,
          phone,
        },
        linkedStudents,
        ...tokens,
      },
    });
  })
);

/**
 * POST /api/auth/parent/login
 * Login with parent credentials
 */
router.post(
  '/parent/login',
  authRateLimiter,
  parentLoginRules,
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find parent by email
    const parent = await queryOne(
      'SELECT id, name, email, password_hash, phone FROM parents WHERE email = $1',
      [email]
    );

    if (!parent) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await authService.comparePassword(
      password,
      parent.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const tokens = authService.generateTokenPair({
      id: parent.id,
      role: 'parent',
      email: parent.email,
    });

    // Get linked students
    const linkedStudents = await queryAll(
      `SELECT s.id, s.student_id, s.name, s.grade, psl.relationship
       FROM students s
       JOIN parent_student_links psl ON s.id = psl.student_id
       WHERE psl.parent_id = $1`,
      [parent.id]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        parent: {
          id: parent.id,
          name: parent.name,
          email: parent.email,
          phone: parent.phone,
        },
        linkedStudents,
        ...tokens,
      },
    });
  })
);

/**
 * POST /api/auth/admin/login
 * Login with admin credentials
 */
router.post(
  '/admin/login',
  authRateLimiter,
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await queryOne(
      'SELECT id, username, email, password_hash FROM admins WHERE username = $1',
      [username]
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid username or password',
      });
    }

    // Verify password
    const isPasswordValid = await authService.comparePassword(
      password,
      admin.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid username or password',
      });
    }

    // Generate tokens
    const tokens = authService.generateTokenPair({
      id: admin.id,
      role: 'admin',
      email: admin.email,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        },
        ...tokens,
      },
    });
  })
);

module.exports = router;
