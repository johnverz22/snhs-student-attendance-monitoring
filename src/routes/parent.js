const express = require('express');
const router = express.Router();
const dbManager = require('../models/database');
const { queryOne, queryAll, execute, transaction } = require('../utils/dbHelpers');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, deviceTokenRegistrationRules } = require('../middleware/validation');
const notificationService = require('../services/notificationService');

/**
 * POST /api/parent/device-token
 * Register device token for push notifications
 */
router.post(
  '/device-token',
  authenticate,
  authorize('parent'),
  deviceTokenRegistrationRules,
  validate,
  async (req, res, next) => {
    try {
      const { deviceToken, platform } = req.body;
      const parentId = req.user.id;

      // Register device token
      const result = await notificationService.registerDeviceToken(
        parentId,
        deviceToken,
        platform
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/parent/device-token
 * Unregister device token
 */
router.delete(
  '/device-token',
  authenticate,
  authorize('parent'),
  async (req, res, next) => {
    try {
      const { deviceToken } = req.body;
      const parentId = req.user.id;

      if (!deviceToken) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Device token is required',
        });
      }

      // Unregister device token
      const result = await notificationService.unregisterDeviceToken(
        parentId,
        deviceToken
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/parent/link-student
 * Link a student to the current parent
 */
router.post('/link-student', authenticate, authorize('parent'), async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const { studentId, relationship } = req.body;

    // Validate input
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Student ID is required',
      });
    }

    // Check if student exists
    const student = await queryOne(
      'SELECT id, student_id, name FROM students WHERE student_id = $1',
      [studentId]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Student not found',
      });
    }

    // Check if already linked
    const existingLink = await queryOne(
      'SELECT id FROM parent_student_links WHERE parent_id = $1 AND student_id = $2',
      [parentId, student.id]
    );

    if (existingLink) {
      return res.status(400).json({
        success: false,
        error: 'ALREADY_LINKED',
        message: 'This student is already linked to your account',
      });
    }

    // Create link
    const result = await execute(
      `INSERT INTO parent_student_links (parent_id, student_id, relationship)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [parentId, student.id, relationship || 'Parent']
    );

    res.status(201).json({
      success: true,
      message: 'Student linked successfully',
      data: {
        linkId: result.rows[0].id,
        student: {
          id: student.id,
          studentId: student.student_id,
          name: student.name,
          relationship: relationship || 'Parent',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/parent/unlink-student/:studentId
 * Unlink a student from the current parent
 */
router.delete('/unlink-student/:studentId', authenticate, authorize('parent'), async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const studentId = parseInt(req.params.studentId, 10);

    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid student ID',
      });
    }

    // Check if link exists
    const link = await queryOne(
      'SELECT id FROM parent_student_links WHERE parent_id = $1 AND student_id = $2',
      [parentId, studentId]
    );

    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Student link not found',
      });
    }

    // Delete link
    await execute('DELETE FROM parent_student_links WHERE id = $1', [link.id]);

    res.json({
      success: true,
      message: 'Student unlinked successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/parent/students
 * Get list of students linked to current parent
 */
router.get('/students', authenticate, authorize('parent'), async (req, res, next) => {
  try {
    const parentId = req.user.id;

    // Get linked students
    const students = await queryAll(
      `SELECT 
        s.id,
        s.student_id,
        s.name,
        s.email,
        s.grade,
        s.section,
        s.phone,
        psl.relationship
      FROM students s
      JOIN parent_student_links psl ON s.id = psl.student_id
      WHERE psl.parent_id = $1 AND s.is_archived = FALSE
      ORDER BY s.name`,
      [parentId]
    );

    res.json({
      success: true,
      data: {
        students,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/parent/student/:studentId/attendance
 * Get attendance history for a specific student
 */
router.get('/student/:studentId/attendance', authenticate, authorize('parent'), async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const studentId = parseInt(req.params.studentId, 10);

    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid student ID',
      });
    }

    // Verify parent-student relationship
    const link = await queryOne(
      'SELECT id FROM parent_student_links WHERE parent_id = $1 AND student_id = $2',
      [parentId, studentId]
    );

    if (!link) {
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'You do not have access to this student\'s attendance',
      });
    }

    // Parse query parameters
    const { limit, offset, startDate, endDate } = req.query;
    const options = {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    // Validate parameters
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
    const attendanceService = require('../services/attendanceService');
    const history = await attendanceService.getAttendanceHistory(studentId, options);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/parent/notifications
 * Get notification history (placeholder for future implementation)
 */
router.get('/notifications', authenticate, authorize('parent'), (req, res, next) => {
  try {
    // This would fetch notification history from a notifications table
    // For now, return empty array as notifications are sent via FCM
    res.json({
      success: true,
      data: {
        notifications: [],
      },
      message: 'Notification history not yet implemented',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
