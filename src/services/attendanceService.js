const dbManager = require('../models/database');
const { queryOne, queryAll, execute, transaction } = require('../utils/dbHelpers');

/**
 * AttendanceService handles attendance logging and QR code validation
 */
class AttendanceService {
  /**
   * Validate QR code against database
   * @param {string} qrCode - QR code string to validate
   * @returns {Object} Validation result with isValid, qrCodeData, and error message
   */
  async validateQRCode(qrCode) {
    try {
      // Find QR code in database
      const qrCodeData = await queryOne(`
        SELECT id, code, gate_name, is_active, expires_at, created_at
        FROM qr_codes
        WHERE code = $1
      `, [qrCode]);

      // Check if QR code exists
      if (!qrCodeData) {
        return {
          isValid: false,
          error: 'QR_CODE_INVALID',
          message: 'QR code not recognized',
        };
      }

      // Check if QR code is active
      if (!qrCodeData.is_active) {
        return {
          isValid: false,
          error: 'QR_CODE_INACTIVE',
          message: 'QR code is not active',
        };
      }

      // Check if QR code has expired
      if (qrCodeData.expires_at) {
        const expirationDate = new Date(qrCodeData.expires_at);
        const now = new Date();
        
        if (now > expirationDate) {
          return {
            isValid: false,
            error: 'QR_CODE_EXPIRED',
            message: 'QR code has expired',
            expiresAt: qrCodeData.expires_at,
          };
        }
      }

      // QR code is valid
      return {
        isValid: true,
        qrCodeData: {
          id: qrCodeData.id,
          code: qrCodeData.code,
          gateName: qrCodeData.gate_name,
          expiresAt: qrCodeData.expires_at,
        },
      };
    } catch (error) {
      console.error('QR code validation error:', error);
      throw new Error('Failed to validate QR code');
    }
  }

  /**
   * Create a new QR code
   * @param {string} code - QR code string
   * @param {string} gateName - Name of the gate
   * @param {string} expiresAt - Optional expiration date (ISO string)
   * @returns {Object} Created QR code data
   */
  async createQRCode(code, gateName, expiresAt = null) {
    try {
      // Check if QR code already exists
      const existing = await queryOne('SELECT id FROM qr_codes WHERE code = $1', [code]);
      
      if (existing) {
        throw new Error('QR code already exists');
      }

      // Insert new QR code and return it
      const result = await execute(`
        INSERT INTO qr_codes (code, gate_name, is_active, expires_at)
        VALUES ($1, $2, TRUE, $3)
        RETURNING id, code, gate_name, is_active, expires_at, created_at
      `, [code, gateName, expiresAt]);

      const qrCode = result.rows[0];

      return {
        id: qrCode.id,
        code: qrCode.code,
        gateName: qrCode.gate_name,
        isActive: qrCode.is_active,
        expiresAt: qrCode.expires_at,
        createdAt: qrCode.created_at,
      };
    } catch (error) {
      console.error('Error creating QR code:', error);
      throw error;
    }
  }

  /**
   * Get all QR codes
   * @param {boolean} activeOnly - If true, return only active QR codes
   * @returns {Array} List of QR codes
   */
  async getAllQRCodes(activeOnly = false) {
    try {
      let query = `
        SELECT id, code, gate_name, is_active, expires_at, created_at
        FROM qr_codes
      `;
      
      const params = [];
      if (activeOnly) {
        query += ' WHERE is_active = TRUE';
      }
      
      query += ' ORDER BY created_at DESC';
      
      const qrCodes = await queryAll(query, params);

      return qrCodes.map(qr => ({
        id: qr.id,
        code: qr.code,
        gateName: qr.gate_name,
        isActive: qr.is_active,
        expiresAt: qr.expires_at,
        createdAt: qr.created_at,
      }));
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      throw new Error('Failed to fetch QR codes');
    }
  }

  /**
   * Get a single QR code by ID
   * @param {number} id - QR code ID
   * @returns {Object} QR code data
   */
  async getQRCodeById(id) {
    try {
      const qrCode = await queryOne(`
        SELECT id, code, gate_name, is_active, expires_at, created_at
        FROM qr_codes
        WHERE id = $1
      `, [id]);

      if (!qrCode) {
        return null;
      }

      return {
        id: qrCode.id,
        code: qrCode.code,
        gateName: qrCode.gate_name,
        isActive: qrCode.is_active,
        expiresAt: qrCode.expires_at,
        createdAt: qrCode.created_at,
      };
    } catch (error) {
      console.error('Error fetching QR code:', error);
      throw new Error('Failed to fetch QR code');
    }
  }

  /**
   * Update a QR code
   * @param {number} id - QR code ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated QR code data
   */
  async updateQRCode(id, updates) {
    try {
      // Check if QR code exists
      const existing = await queryOne('SELECT id FROM qr_codes WHERE id = $1', [id]);
      
      if (!existing) {
        throw new Error('QR code not found');
      }

      // Build update query dynamically
      const fields = [];
      const values = [];
      let paramIndex = 1;
      
      if (updates.code !== undefined) {
        // Check if new code already exists
        const duplicate = await queryOne(
          'SELECT id FROM qr_codes WHERE code = $1 AND id != $2',
          [updates.code, id]
        );
        if (duplicate) {
          throw new Error('QR code already exists');
        }
        fields.push(`code = $${paramIndex++}`);
        values.push(updates.code);
      }
      
      if (updates.gateName !== undefined) {
        fields.push(`gate_name = $${paramIndex++}`);
        values.push(updates.gateName);
      }
      
      if (updates.isActive !== undefined) {
        fields.push(`is_active = $${paramIndex++}`);
        values.push(updates.isActive);
      }
      
      if (updates.expiresAt !== undefined) {
        fields.push(`expires_at = $${paramIndex++}`);
        values.push(updates.expiresAt);
      }

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(id);
      const query = `UPDATE qr_codes SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
      
      await execute(query, values);

      // Return updated QR code
      return await this.getQRCodeById(id);
    } catch (error) {
      console.error('Error updating QR code:', error);
      throw error;
    }
  }

  /**
   * Delete a QR code
   * @param {number} id - QR code ID
   * @returns {boolean} Success status
   */
  async deleteQRCode(id) {
    try {
      // Check if QR code exists
      const existing = await queryOne('SELECT id FROM qr_codes WHERE id = $1', [id]);
      
      if (!existing) {
        throw new Error('QR code not found');
      }

      // Delete QR code
      await execute('DELETE FROM qr_codes WHERE id = $1', [id]);

      return true;
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
  }

  /**
   * Process attendance scan request
   * @param {number} studentId - Student ID
   * @param {string} qrCode - QR code scanned
   * @param {number} latitude - GPS latitude
   * @param {number} longitude - GPS longitude
   * @returns {Object} Attendance log result
   */
  async processScan(studentId, qrCode, latitude, longitude) {
    const locationService = require('./locationService');
    const { getCurrentTimestamp } = require('../utils/timezone');
    
    try {
      // Step 1: Validate QR code
      const qrValidation = await this.validateQRCode(qrCode);
      
      if (!qrValidation.isValid) {
        return {
          success: false,
          error: qrValidation.error,
          message: qrValidation.message,
        };
      }

      // Step 2: Validate GPS location
      const locationValidation = await locationService.validateLocation(latitude, longitude);
      
      if (!locationValidation.isValid) {
        return {
          success: false,
          error: 'LOCATION_INVALID',
          message: 'You are not within school boundaries',
          data: {
            distanceFromSchool: locationValidation.distance,
            maxAllowedDistance: locationValidation.maxAllowedDistance,
          },
        };
      }

      // Step 3: Check for duplicate entry (within last 30 minutes)
      const duplicateCheck = await this.checkDuplicateEntry(studentId);
      
      if (duplicateCheck.isDuplicate) {
        return {
          success: false,
          error: 'ATTENDANCE_DUPLICATE',
          message: 'Attendance already logged recently',
          data: {
            lastEntry: duplicateCheck.lastEntry,
            timeWindow: duplicateCheck.timeWindow,
          },
        };
      }

      // Step 4: Log attendance with configured timezone
      const currentTime = await getCurrentTimestamp();
      const result = await execute(`
        INSERT INTO attendance_logs (student_id, qr_code_id, latitude, longitude, location_valid, entry_time)
        VALUES ($1, $2, $3, $4, TRUE, $5)
        RETURNING id
      `, [studentId, qrValidation.qrCodeData.id, latitude, longitude, currentTime]);

      // Step 5: Get the created attendance log
      const attendanceLog = await queryOne(`
        SELECT 
          al.id,
          al.student_id,
          al.entry_time,
          al.latitude,
          al.longitude,
          al.location_valid,
          s.name as student_name,
          s.student_id as student_identifier,
          qr.gate_name
        FROM attendance_logs al
        JOIN students s ON al.student_id = s.id
        JOIN qr_codes qr ON al.qr_code_id = qr.id
        WHERE al.id = $1
      `, [result.rows[0].id]);

      // Log successful attendance
      const { getCurrentLogTimestamp } = require('../utils/timezone');
      console.log(`[${getCurrentLogTimestamp()}] Attendance logged: student=${studentId}, gate=${qrValidation.qrCodeData.gateName}`);

      const attendanceResult = {
        success: true,
        message: 'Attendance logged successfully',
        data: {
          attendanceId: attendanceLog.id,
          studentName: attendanceLog.student_name,
          entryTime: attendanceLog.entry_time,
          gateName: attendanceLog.gate_name,
          locationValid: attendanceLog.location_valid,
        },
      };

      // Step 6: Send push notification to parent(s)
      // Run asynchronously without blocking the response
      console.log(`[${getCurrentLogTimestamp()}] Triggering attendance notification for student ${studentId}...`);
      this.sendAttendanceNotification(studentId, attendanceResult.data)
        .then(result => {
          console.log(`[${getCurrentLogTimestamp()}] Notification result:`, result);
        })
        .catch(error => {
          console.error(`[${getCurrentLogTimestamp()}] Failed to send attendance notification:`, error);
        });

      return attendanceResult;
    } catch (error) {
      console.error('Error processing attendance scan:', error);
      throw error;
    }
  }

  /**
   * Check for duplicate attendance entry within time window
   * @param {number} studentId - Student ID
   * @param {number} timeWindowMinutes - Time window in minutes (default: 30)
   * @returns {Object} Duplicate check result
   */
  async checkDuplicateEntry(studentId, timeWindowMinutes = 30) {
    const { getCurrentTimestamp } = require('../utils/timezone');
    
    try {
      // Get current time in configured timezone
      const currentTime = await getCurrentTimestamp();
      
      // Calculate threshold time (current time - X minutes)
      const thresholdDate = new Date(currentTime);
      thresholdDate.setMinutes(thresholdDate.getMinutes() - timeWindowMinutes);
      
      // Check for recent entries
      const lastEntry = await queryOne(`
        SELECT 
          al.id,
          al.entry_time,
          qr.gate_name
        FROM attendance_logs al
        JOIN qr_codes qr ON al.qr_code_id = qr.id
        WHERE al.student_id = $1
          AND al.entry_time >= $2
        ORDER BY al.entry_time DESC
        LIMIT 1
      `, [studentId, thresholdDate.toISOString()]);

      if (lastEntry) {
        return {
          isDuplicate: true,
          lastEntry: {
            id: lastEntry.id,
            entryTime: lastEntry.entry_time,
            gateName: lastEntry.gate_name,
          },
          timeWindow: timeWindowMinutes,
        };
      }

      return {
        isDuplicate: false,
      };
    } catch (error) {
      console.error('Error checking duplicate entry:', error);
      throw error;
    }
  }

  /**
   * Get attendance history for a student
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options (limit, offset, startDate, endDate)
   * @returns {Object} Attendance history with pagination
   */
  async getAttendanceHistory(studentId, options = {}) {
    try {
      const { limit = 50, offset = 0, startDate, endDate } = options;

      // Build query with optional date filters
      let query = `
        SELECT 
          al.id,
          al.entry_time,
          al.latitude,
          al.longitude,
          al.location_valid,
          qr.gate_name,
          qr.code as qr_code
        FROM attendance_logs al
        JOIN qr_codes qr ON al.qr_code_id = qr.id
        WHERE al.student_id = $1
      `;

      const params = [studentId];
      let paramIndex = 2;

      if (startDate) {
        query += ` AND al.entry_time >= $${paramIndex++}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND al.entry_time <= $${paramIndex++}`;
        params.push(endDate);
      }

      query += ` ORDER BY al.entry_time DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
      params.push(limit, offset);

      // Get attendance logs
      const logs = await queryAll(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM attendance_logs WHERE student_id = $1';
      const countParams = [studentId];
      let countParamIndex = 2;

      if (startDate) {
        countQuery += ` AND entry_time >= $${countParamIndex++}`;
        countParams.push(startDate);
      }

      if (endDate) {
        countQuery += ` AND entry_time <= $${countParamIndex++}`;
        countParams.push(endDate);
      }

      const countResult = await queryOne(countQuery, countParams);
      const total = parseInt(countResult.total);

      return {
        logs: logs.map(log => ({
          id: log.id,
          entryTime: log.entry_time,
          gateName: log.gate_name,
          qrCode: log.qr_code,
          latitude: log.latitude,
          longitude: log.longitude,
          locationValid: log.location_valid,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + logs.length < total,
        },
      };
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      throw error;
    }
  }

  /**
   * Send attendance notification to parent(s)
   * @param {number} studentId - Student ID
   * @param {Object} attendanceData - Attendance log data
   * @returns {Promise<Object>} Notification result
   */
  async sendAttendanceNotification(studentId, attendanceData) {
    const notificationService = require('./notificationService');
    return notificationService.sendAttendanceNotification(studentId, attendanceData);
  }

  /**
   * Log validation attempt
   * @param {string} qrCode
   * @param {boolean} isValid
   * @param {string} reason
   */
  logValidation(qrCode, isValid, reason = '') {
    const { getCurrentLogTimestamp } = require('../utils/timezone');
    console.log(`[${getCurrentLogTimestamp()}] QR validation: code=${qrCode}, valid=${isValid}, reason=${reason}`);
  }
}

module.exports = new AttendanceService();
