const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateSchoolConfig, qrCodeCreateRules, qrCodeUpdateRules, validate } = require('../middleware/validation');
const locationService = require('../services/locationService');
const attendanceService = require('../services/attendanceService');
const reportService = require('../services/reportService');
const dbManager = require('../models/database');
const { queryOne, queryAll, execute } = require('../utils/dbHelpers');

/**
 * GET /api/admin/school/config
 * Get school configuration
 */
router.get('/school/config', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const config = await locationService.getSchoolConfig();

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'CONFIG_NOT_FOUND',
        message: 'School configuration not found',
      });
    }

    res.json({
      success: true,
      data: {
        schoolName: config.school_name,
        latitude: config.latitude,
        longitude: config.longitude,
        radiusMeters: config.radius_meters,
        timezone: config.timezone,
        updatedAt: config.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching school config:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch school configuration',
    });
  }
});

/**
 * PUT /api/admin/school/config
 * Update school configuration
 */
router.put('/school/config', authenticateToken, requireRole('admin'), validateSchoolConfig, async (req, res) => {
  try {
    const { schoolName, latitude, longitude, radiusMeters, timezone } = req.body;

    // Build config data object
    const configData = {};
    
    if (schoolName !== undefined) {
      configData.school_name = schoolName;
    }
    
    if (latitude !== undefined) {
      configData.latitude = parseFloat(latitude);
    }
    
    if (longitude !== undefined) {
      configData.longitude = parseFloat(longitude);
    }
    
    if (radiusMeters !== undefined) {
      configData.radius_meters = parseInt(radiusMeters);
    }
    
    if (timezone !== undefined) {
      configData.timezone = timezone;
    }

    // Update configuration
    const updatedConfig = await locationService.updateSchoolConfig(configData);

    res.json({
      success: true,
      message: 'School configuration updated successfully',
      data: {
        schoolName: updatedConfig.school_name,
        latitude: updatedConfig.latitude,
        longitude: updatedConfig.longitude,
        radiusMeters: updatedConfig.radius_meters,
        timezone: updatedConfig.timezone,
        updatedAt: updatedConfig.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating school config:', error);
    
    if (error.message.includes('Latitude') || error.message.includes('Longitude') || error.message.includes('Radius')) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to update school configuration',
    });
  }
});

/**
 * POST /api/admin/qr-codes
 * Create a new QR code
 */
router.post('/qr-codes', authenticateToken, requireRole('admin'), qrCodeCreateRules, validate, async (req, res) => {
  try {
    const { code, gateName, expiresAt } = req.body;

    const qrCode = await attendanceService.createQRCode(code, gateName, expiresAt || null);

    res.status(201).json({
      success: true,
      message: 'QR code created successfully',
      data: qrCode,
    });
  } catch (error) {
    console.error('Error creating QR code:', error);
    
    if (error.message === 'QR code already exists') {
      return res.status(409).json({
        success: false,
        error: 'QR_CODE_EXISTS',
        message: 'QR code already exists',
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to create QR code',
    });
  }
});

/**
 * GET /api/admin/qr-codes
 * Get all QR codes
 */
router.get('/qr-codes', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const qrCodes = await attendanceService.getAllQRCodes(activeOnly);

    res.json({
      success: true,
      data: qrCodes,
    });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch QR codes',
    });
  }
});

/**
 * GET /api/admin/qr-codes/:id
 * Get a single QR code by ID
 */
router.get('/qr-codes/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid QR code ID',
      });
    }

    const qrCode = await attendanceService.getQRCodeById(id);

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        error: 'QR_CODE_NOT_FOUND',
        message: 'QR code not found',
      });
    }

    res.json({
      success: true,
      data: qrCode,
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch QR code',
    });
  }
});

/**
 * PUT /api/admin/qr-codes/:id
 * Update a QR code
 */
router.put('/qr-codes/:id', authenticateToken, requireRole('admin'), qrCodeUpdateRules, validate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid QR code ID',
      });
    }

    const { code, gateName, isActive, expiresAt } = req.body;

    const updates = {};
    if (code !== undefined) updates.code = code;
    if (gateName !== undefined) updates.gateName = gateName;
    if (isActive !== undefined) updates.isActive = isActive;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt;

    const updatedQRCode = await attendanceService.updateQRCode(id, updates);

    res.json({
      success: true,
      message: 'QR code updated successfully',
      data: updatedQRCode,
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    
    if (error.message === 'QR code not found') {
      return res.status(404).json({
        success: false,
        error: 'QR_CODE_NOT_FOUND',
        message: 'QR code not found',
      });
    }

    if (error.message === 'QR code already exists') {
      return res.status(409).json({
        success: false,
        error: 'QR_CODE_EXISTS',
        message: 'QR code already exists',
      });
    }

    if (error.message === 'No valid fields to update') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'No valid fields to update',
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to update QR code',
    });
  }
});

/**
 * DELETE /api/admin/qr-codes/:id
 * Delete a QR code
 */
router.delete('/qr-codes/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid QR code ID',
      });
    }

    await attendanceService.deleteQRCode(id);

    res.json({
      success: true,
      message: 'QR code deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    
    if (error.message === 'QR code not found') {
      return res.status(404).json({
        success: false,
        error: 'QR_CODE_NOT_FOUND',
        message: 'QR code not found',
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to delete QR code',
    });
  }
});

/**
 * GET /api/admin/reports/daily
 * Generate daily attendance report
 */
router.get('/reports/daily', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { date, format } = req.query;

    // Validate date parameter
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Date parameter is required (format: YYYY-MM-DD)',
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // Generate report
    const report = await reportService.generateDailyReport(date);

    // Return CSV if requested
    if (format === 'csv') {
      const csv = reportService.convertToCSV(report, 'daily');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="daily-report-${date}.csv"`);
      return res.send(csv);
    }

    // Return JSON
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate daily report',
    });
  }
});

/**
 * GET /api/admin/reports/weekly
 * Generate weekly attendance report
 */
router.get('/reports/weekly', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { startDate, format } = req.query;

    // Validate startDate parameter
    if (!startDate) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'startDate parameter is required (format: YYYY-MM-DD)',
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // Generate report
    const report = await reportService.generateWeeklyReport(startDate);

    // Return CSV if requested
    if (format === 'csv') {
      const csv = reportService.convertToCSV(report, 'weekly');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="weekly-report-${startDate}.csv"`);
      return res.send(csv);
    }

    // Return JSON
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate weekly report',
    });
  }
});

/**
 * GET /api/admin/reports/monthly
 * Generate monthly attendance report
 */
router.get('/reports/monthly', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { month, format } = req.query;

    // Validate month parameter
    if (!month) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'month parameter is required (format: YYYY-MM)',
      });
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid month format. Use YYYY-MM',
      });
    }

    // Generate report
    const report = await reportService.generateMonthlyReport(month);

    // Return CSV if requested
    if (format === 'csv') {
      const csv = reportService.convertToCSV(report, 'monthly');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${month}.csv"`);
      return res.send(csv);
    }

    // Return JSON
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate monthly report',
    });
  }
});

/**
 * GET /api/admin/reports/student/:studentId
 * Generate per-student attendance report
 */
router.get('/reports/student/:studentId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const { startDate, endDate, format } = req.query;

    // Validate student ID
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid student ID',
      });
    }

    // Validate date formats if provided
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDate && !dateRegex.test(startDate)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid startDate format. Use YYYY-MM-DD',
      });
    }

    if (endDate && !dateRegex.test(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid endDate format. Use YYYY-MM-DD',
      });
    }

    // Generate report
    const report = await reportService.generateStudentReport(studentId, {
      startDate,
      endDate,
    });

    // Return CSV if requested
    if (format === 'csv') {
      const csv = reportService.convertToCSV(report, 'student');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="student-report-${report.student.studentId}.csv"`);
      return res.send(csv);
    }

    // Return JSON
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating student report:', error);
    
    if (error.message === 'Student not found') {
      return res.status(404).json({
        success: false,
        error: 'STUDENT_NOT_FOUND',
        message: 'Student not found',
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to generate student report',
    });
  }
});

/**
 * GET /api/admin/attendance/logs
 * Get attendance logs with pagination and filtering
 */
router.get('/attendance/logs', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      studentId,
      startDate,
      endDate,
      sortBy = 'entry_time',
      sortOrder = 'DESC',
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Validate pagination parameters
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid page number',
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid limit (must be between 1 and 100)',
      });
    }

    // Build query
    let query = `
      SELECT 
        al.id,
        al.entry_time,
        al.latitude,
        al.longitude,
        al.location_valid,
        s.id as student_db_id,
        s.student_id,
        s.name as student_name,
        s.grade,
        qr.gate_name
      FROM attendance_logs al
      JOIN students s ON al.student_id = s.id
      JOIN qr_codes qr ON al.qr_code_id = qr.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Add filters
    if (studentId) {
      query += ` AND s.id = $${paramIndex++}`;
      params.push(parseInt(studentId));
    }

    if (startDate) {
      query += ` AND DATE(al.entry_time) >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND DATE(al.entry_time) <= $${paramIndex++}`;
      params.push(endDate);
    }

    // Add sorting
    const validSortColumns = ['entry_time', 'student_name', 'gate_name'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'entry_time';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    query += ` ORDER BY ${sortColumn === 'student_name' ? 's.name' : sortColumn === 'gate_name' ? 'qr.gate_name' : 'al.' + sortColumn} ${order}`;

    // Add pagination
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limitNum, offset);

    // Execute query
    const logs = await queryAll(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM attendance_logs al
      JOIN students s ON al.student_id = s.id
      WHERE 1=1
    `;

    const countParams = [];
    let countParamIndex = 1;

    if (studentId) {
      countQuery += ` AND s.id = $${countParamIndex++}`;
      countParams.push(parseInt(studentId));
    }

    if (startDate) {
      countQuery += ` AND DATE(al.entry_time) >= $${countParamIndex++}`;
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ` AND DATE(al.entry_time) <= $${countParamIndex++}`;
      countParams.push(endDate);
    }

    const countResult = await queryOne(countQuery, countParams);
    const total = parseInt(countResult.total);

    res.json({
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log.id,
          studentId: log.student_id,
          studentName: log.student_name,
          grade: log.grade,
          entryTime: log.entry_time,
          gateName: log.gate_name,
          locationValid: log.location_valid,
          latitude: log.latitude,
          longitude: log.longitude,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasMore: offset + logs.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch attendance logs',
    });
  }
});

/**
 * GET /api/admin/students/search
 * Search for students
 */
router.get('/students/search', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Search query is required',
      });
    }

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid limit (must be between 1 and 100)',
      });
    }

        const searchTerm = `%${query.trim()}%`;

    // Search across student_id, name, and email
    const students = await queryAll(`
      SELECT 
        id,
        student_id,
        name,
        email,
        grade,
        phone,
        created_at
      FROM students
      WHERE student_id LIKE $1 OR name LIKE $2 OR email LIKE $3
      ORDER BY name ASC
      LIMIT $4
    `, [searchTerm, searchTerm, searchTerm, limitNum]);

    res.json({
      success: true,
      data: {
        students: students.map(student => ({
          id: student.id,
          studentId: student.student_id,
          name: student.name,
          email: student.email,
          grade: student.grade,
          phone: student.phone,
          createdAt: student.created_at,
        })),
        count: students.length,
      },
    });
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to search students',
    });
  }
});

/**
 * GET /api/admin/students
 * Get all students with filtering and pagination
 */
router.get('/students', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      grade,
      section,
      archived = 'false',
      search,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    const showArchived = archived === 'true';

    // Validate pagination
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid page number',
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid limit (must be between 1 and 100)',
      });
    }

        let query = `
      SELECT 
        id,
        student_id,
        name,
        email,
        grade,
        section,
        phone,
        is_archived,
        created_at,
        updated_at
      FROM students
      WHERE is_archived = $1
    `;

    const params = [showArchived];
    let paramIndex = 2;

    // Add filters
    if (grade) {
      query += ` AND grade = $${paramIndex++}`;
      params.push(grade);
    }

    if (section) {
      query += ` AND section = $${paramIndex++}`;
      params.push(section);
    }

    if (search) {
      query += ` AND (student_id LIKE $${paramIndex} OR name LIKE $${paramIndex + 1} OR email LIKE $${paramIndex + 2})`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    // Add sorting and pagination
    query += ` ORDER BY grade, section, name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const students = await queryAll(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM students WHERE is_archived = $1';
    const countParams = [showArchived];
    let countParamIndex = 2;

    if (grade) {
      countQuery += ` AND grade = $${countParamIndex++}`;
      countParams.push(grade);
    }

    if (section) {
      countQuery += ` AND section = $${countParamIndex++}`;
      countParams.push(section);
    }

    if (search) {
      countQuery += ` AND (student_id LIKE $${countParamIndex} OR name LIKE $${countParamIndex + 1} OR email LIKE $${countParamIndex + 2})`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const countResult = await queryOne(countQuery, countParams);
    const total = parseInt(countResult.total);

    // Get unique grades and sections for filter options
    const grades = await queryAll('SELECT DISTINCT grade FROM students WHERE grade IS NOT NULL AND is_archived = FALSE ORDER BY grade', []);
    const sections = await queryAll('SELECT DISTINCT section FROM students WHERE section IS NOT NULL AND is_archived = FALSE ORDER BY section', []);

    res.json({
      success: true,
      data: {
        students: students.map(s => ({
          id: s.id,
          studentId: s.student_id,
          name: s.name,
          email: s.email,
          grade: s.grade,
          section: s.section,
          phone: s.phone,
          isArchived: Boolean(s.is_archived),
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        filters: {
          grades: grades.map(g => g.grade),
          sections: sections.map(s => s.section),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch students',
    });
  }
});

/**
 * PUT /api/admin/students/:id
 * Update student information
 */
router.put('/students/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);

    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid student ID',
      });
    }

    const { name, email, grade, section, phone } = req.body;

    
    // Check if student exists
    const student = await queryOne('SELECT id FROM students WHERE id = $1', [studentId]);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'STUDENT_NOT_FOUND',
        message: 'Student not found',
      });
    }

    // Build update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email);
    }

    if (grade !== undefined) {
      updates.push(`grade = $${paramIndex++}`);
      params.push(grade);
    }

    if (section !== undefined) {
      updates.push(`section = $${paramIndex++}`);
      params.push(section);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'No valid fields to update',
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(studentId);

    await execute(`UPDATE students SET ${updates.join(', ')} WHERE id = $${paramIndex}`, params);

    // Get updated student
    const updatedStudent = await queryOne(`
      SELECT id, student_id, name, email, grade, section, phone, is_archived, created_at, updated_at
      FROM students WHERE id = $1
    `, [studentId]);

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: {
        id: updatedStudent.id,
        studentId: updatedStudent.student_id,
        name: updatedStudent.name,
        email: updatedStudent.email,
        grade: updatedStudent.grade,
        section: updatedStudent.section,
        phone: updatedStudent.phone,
        isArchived: Boolean(updatedStudent.is_archived),
        createdAt: updatedStudent.created_at,
        updatedAt: updatedStudent.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating student:', error);

    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_ERROR',
        message: 'Email already exists',
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to update student',
    });
  }
});

/**
 * POST /api/admin/students/:id/archive
 * Archive a student
 */
router.post('/students/:id/archive', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);

    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid student ID',
      });
    }

    
    // Check if student exists
    const student = await queryOne('SELECT id, is_archived FROM students WHERE id = $1', [studentId]);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'STUDENT_NOT_FOUND',
        message: 'Student not found',
      });
    }

    if (student.is_archived) {
      return res.status(400).json({
        success: false,
        error: 'ALREADY_ARCHIVED',
        message: 'Student is already archived',
      });
    }

    // Archive student
    await execute('UPDATE students SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [studentId]);

    res.json({
      success: true,
      message: 'Student archived successfully',
    });
  } catch (error) {
    console.error('Error archiving student:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to archive student',
    });
  }
});

/**
 * POST /api/admin/students/:id/unarchive
 * Unarchive a student
 */
router.post('/students/:id/unarchive', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);

    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid student ID',
      });
    }

    
    // Check if student exists
    const student = await queryOne('SELECT id, is_archived FROM students WHERE id = $1', [studentId]);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'STUDENT_NOT_FOUND',
        message: 'Student not found',
      });
    }

    if (!student.is_archived) {
      return res.status(400).json({
        success: false,
        error: 'NOT_ARCHIVED',
        message: 'Student is not archived',
      });
    }

    // Unarchive student
    await execute('UPDATE students SET is_archived = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [studentId]);

    res.json({
      success: true,
      message: 'Student unarchived successfully',
    });
  } catch (error) {
    console.error('Error unarchiving student:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to unarchive student',
    });
  }
});

module.exports = router;
