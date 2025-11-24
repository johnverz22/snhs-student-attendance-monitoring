const express = require('express');
const router = express.Router();
const dbManager = require('../models/database');
const { queryOne, execute } = require('../utils/dbHelpers');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validate,
  studentProfileUpdateRules,
  attendanceScanRules,
} = require('../middleware/validation');
const attendanceService = require('../services/attendanceService');

/**
 * GET /api/student/profile
 * Get current student's profile
 */
router.get('/profile', authenticate, authorize('student'), async (req, res, next) => {
  try {
    // Get student profile
    const student = await queryOne(
      'SELECT id, student_id, name, email, grade, section, phone, created_at, updated_at FROM students WHERE id = $1',
      [req.user.id]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'STUDENT_NOT_FOUND',
        message: 'Student profile not found',
      });
    }

    res.json({
      success: true,
      data: {
        student,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/student/profile
 * Update current student's profile
 */
router.put(
  '/profile',
  authenticate,
  authorize('student'),
  studentProfileUpdateRules,
  validate,
  async (req, res, next) => {
    try {
      const { name, grade, section, phone } = req.body;

      // Check if student exists
      const existingStudent = await queryOne(
        'SELECT id FROM students WHERE id = $1',
        [req.user.id]
      );

      if (!existingStudent) {
        return res.status(404).json({
          success: false,
          error: 'STUDENT_NOT_FOUND',
          message: 'Student profile not found',
        });
      }

      // Build update query dynamically based on provided fields
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
      }

      if (grade !== undefined) {
        updates.push(`grade = $${paramIndex++}`);
        values.push(grade);
      }

      if (section !== undefined) {
        updates.push(`section = $${paramIndex++}`);
        values.push(section);
      }

      if (phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        values.push(phone);
      }

      // Always update the updated_at timestamp
      updates.push('updated_at = CURRENT_TIMESTAMP');

      if (updates.length === 1) {
        // Only updated_at would be updated, no actual changes
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'No valid fields provided for update',
        });
      }

      // Add student ID to values
      values.push(req.user.id);

      // Execute update
      const query = `UPDATE students SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
      await execute(query, values);

      // Fetch updated student profile
      const updatedStudent = await queryOne(
        'SELECT id, student_id, name, email, grade, section, phone, created_at, updated_at FROM students WHERE id = $1',
        [req.user.id]
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          student: updatedStudent,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/student/attendance/scan
 * Process attendance scan with QR code and GPS validation
 */
router.post(
  '/attendance/scan',
  authenticate,
  authorize('student'),
  attendanceScanRules,
  validate,
  async (req, res, next) => {
    try {
      const { qrCode, latitude, longitude } = req.body;
      const studentId = req.user.id;

      // Process attendance scan
      const result = await attendanceService.processScan(
        studentId,
        qrCode,
        latitude,
        longitude
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/student/attendance/history
 * Get attendance history for current student
 */
router.get('/attendance/history', authenticate, authorize('student'), async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { limit, offset, startDate, endDate } = req.query;

    // Parse query parameters
    const options = {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    // Validate limit and offset
    if (options.limit < 1 || options.limit > 100) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Limit must be between 1 and 100',
      });
    }

    if (options.offset < 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Offset must be non-negative',
      });
    }

    // Get attendance history
    const history = await attendanceService.getAttendanceHistory(studentId, options);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
