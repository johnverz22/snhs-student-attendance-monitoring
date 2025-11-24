const dbManager = require('../models/database');
const { queryOne, queryAll, execute, transaction } = require('../utils/dbHelpers');

/**
 * ReportService handles report generation and data aggregation
 */
class ReportService {
  /**
   * Generate daily attendance report
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Object} Daily report data
   */
  async generateDailyReport(date) {
    try {
            
      // Get all attendance logs for the specified date
      const logs = await queryAll(`
        SELECT 
          al.id,
          al.entry_time,
          al.latitude,
          al.longitude,
          al.location_valid,
          s.id as student_id,
          s.student_id as student_identifier,
          s.name as student_name,
          s.grade,
          qr.gate_name
        FROM attendance_logs al
        JOIN students s ON al.student_id = s.id
        JOIN qr_codes qr ON al.qr_code_id = qr.id
        WHERE DATE(al.entry_time) = $1
        ORDER BY al.entry_time ASC
      `, [date]);

      // Calculate statistics
      const totalEntries = logs.length;
      const uniqueStudents = new Set(logs.map(log => log.student_id)).size;
      const locationValidCount = logs.filter(log => log.location_valid).length;

      return {
        date,
        statistics: {
          totalEntries,
          uniqueStudents,
          locationValidCount,
          locationInvalidCount: totalEntries - locationValidCount,
        },
        entries: logs.map(log => ({
          id: log.id,
          studentId: log.student_identifier,
          studentName: log.student_name,
          grade: log.grade,
          entryTime: log.entry_time,
          gateName: log.gate_name,
          locationValid: Boolean(log.location_valid),
          latitude: log.latitude,
          longitude: log.longitude,
        })),
      };
    } catch (error) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  }

  /**
   * Generate weekly attendance report
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @returns {Object} Weekly report data
   */
  async generateWeeklyReport(startDate) {
    try {
            
      // Calculate end date (6 days after start date)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      const endDateStr = endDate.toISOString().split('T')[0];

      // Get all attendance logs for the week
      const logs = await queryAll(`
        SELECT 
          al.id,
          al.entry_time,
          al.location_valid,
          DATE(al.entry_time) as entry_date,
          s.id as student_id,
          s.student_id as student_identifier,
          s.name as student_name,
          s.grade,
          qr.gate_name
        FROM attendance_logs al
        JOIN students s ON al.student_id = s.id
        JOIN qr_codes qr ON al.qr_code_id = qr.id
        WHERE DATE(al.entry_time) BETWEEN $1 AND $2
        ORDER BY al.entry_time ASC
      `, [startDate, endDateStr]);

      // Group by date
      const dailyBreakdown = {};
      const studentAttendance = {};

      logs.forEach(log => {
        const date = log.entry_date;
        
        // Daily breakdown
        if (!dailyBreakdown[date]) {
          dailyBreakdown[date] = {
            date,
            totalEntries: 0,
            uniqueStudents: new Set(),
            locationValidCount: 0,
          };
        }
        
        dailyBreakdown[date].totalEntries++;
        dailyBreakdown[date].uniqueStudents.add(log.student_id);
        if (log.location_valid) {
          dailyBreakdown[date].locationValidCount++;
        }

        // Student attendance tracking
        if (!studentAttendance[log.student_id]) {
          studentAttendance[log.student_id] = {
            studentId: log.student_identifier,
            studentName: log.student_name,
            grade: log.grade,
            daysPresent: new Set(),
          };
        }
        studentAttendance[log.student_id].daysPresent.add(date);
      });

      // Convert daily breakdown to array
      const dailySummary = Object.values(dailyBreakdown).map(day => ({
        date: day.date,
        totalEntries: day.totalEntries,
        uniqueStudents: day.uniqueStudents.size,
        locationValidCount: day.locationValidCount,
        locationInvalidCount: day.totalEntries - day.locationValidCount,
      }));

      // Calculate overall statistics
      const totalEntries = logs.length;
      const uniqueStudents = new Set(logs.map(log => log.student_id)).size;
      const locationValidCount = logs.filter(log => log.location_valid).length;

      return {
        startDate,
        endDate: endDateStr,
        statistics: {
          totalEntries,
          uniqueStudents,
          locationValidCount,
          locationInvalidCount: totalEntries - locationValidCount,
          averageEntriesPerDay: dailySummary.length > 0 ? (totalEntries / dailySummary.length).toFixed(2) : 0,
        },
        dailySummary,
        entries: logs.map(log => ({
          id: log.id,
          studentId: log.student_identifier,
          studentName: log.student_name,
          grade: log.grade,
          entryTime: log.entry_time,
          entryDate: log.entry_date,
          gateName: log.gate_name,
          locationValid: Boolean(log.location_valid),
        })),
      };
    } catch (error) {
      console.error('Error generating weekly report:', error);
      throw error;
    }
  }

  /**
   * Generate monthly attendance report
   * @param {string} month - Month in YYYY-MM format
   * @returns {Object} Monthly report data
   */
  async generateMonthlyReport(month) {
    try {
            
      // Parse month and calculate date range
      const [year, monthNum] = month.split('-');
      const startDate = `${year}-${monthNum}-01`;
      
      // Calculate last day of month
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
      const endDate = `${year}-${monthNum}-${lastDay.toString().padStart(2, '0')}`;

      // Get all attendance logs for the month
      const logs = await queryAll(`
        SELECT 
          al.id,
          al.entry_time,
          al.location_valid,
          DATE(al.entry_time) as entry_date,
          s.id as student_id,
          s.student_id as student_identifier,
          s.name as student_name,
          s.grade,
          qr.gate_name
        FROM attendance_logs al
        JOIN students s ON al.student_id = s.id
        JOIN qr_codes qr ON al.qr_code_id = qr.id
        WHERE DATE(al.entry_time) BETWEEN $1 AND $2
        ORDER BY al.entry_time ASC
      `, [startDate, endDate]);

      // Group by date
      const dailyBreakdown = {};
      const studentAttendance = {};

      logs.forEach(log => {
        const date = log.entry_date;
        
        // Daily breakdown
        if (!dailyBreakdown[date]) {
          dailyBreakdown[date] = {
            date,
            totalEntries: 0,
            uniqueStudents: new Set(),
            locationValidCount: 0,
          };
        }
        
        dailyBreakdown[date].totalEntries++;
        dailyBreakdown[date].uniqueStudents.add(log.student_id);
        if (log.location_valid) {
          dailyBreakdown[date].locationValidCount++;
        }

        // Student attendance tracking
        if (!studentAttendance[log.student_id]) {
          studentAttendance[log.student_id] = {
            studentId: log.student_identifier,
            studentName: log.student_name,
            grade: log.grade,
            daysPresent: new Set(),
          };
        }
        studentAttendance[log.student_id].daysPresent.add(date);
      });

      // Convert daily breakdown to array
      const dailySummary = Object.values(dailyBreakdown).map(day => ({
        date: day.date,
        totalEntries: day.totalEntries,
        uniqueStudents: day.uniqueStudents.size,
        locationValidCount: day.locationValidCount,
        locationInvalidCount: day.totalEntries - day.locationValidCount,
      }));

      // Calculate overall statistics
      const totalEntries = logs.length;
      const uniqueStudents = new Set(logs.map(log => log.student_id)).size;
      const locationValidCount = logs.filter(log => log.location_valid).length;
      const daysWithAttendance = Object.keys(dailyBreakdown).length;

      // Calculate attendance percentage (assuming school days)
      const workingDays = this.calculateWorkingDays(startDate, endDate);
      const attendancePercentage = workingDays > 0 ? ((daysWithAttendance / workingDays) * 100).toFixed(2) : 0;

      return {
        month,
        startDate,
        endDate,
        statistics: {
          totalEntries,
          uniqueStudents,
          locationValidCount,
          locationInvalidCount: totalEntries - locationValidCount,
          daysWithAttendance,
          workingDays,
          attendancePercentage: parseFloat(attendancePercentage),
          averageEntriesPerDay: daysWithAttendance > 0 ? (totalEntries / daysWithAttendance).toFixed(2) : 0,
        },
        dailySummary,
        entries: logs.map(log => ({
          id: log.id,
          studentId: log.student_identifier,
          studentName: log.student_name,
          grade: log.grade,
          entryTime: log.entry_time,
          entryDate: log.entry_date,
          gateName: log.gate_name,
          locationValid: Boolean(log.location_valid),
        })),
      };
    } catch (error) {
      console.error('Error generating monthly report:', error);
      throw error;
    }
  }

  /**
   * Generate per-student attendance report
   * @param {number} studentId - Student database ID
   * @param {Object} options - Query options (startDate, endDate)
   * @returns {Object} Student attendance report
   */
  async generateStudentReport(studentId, options = {}) {
    try {
            const { startDate, endDate } = options;

      // Get student information
      const student = await queryOne(`
        SELECT id, student_id, name, email, grade, phone
        FROM students
        WHERE id = $1
      `, [studentId]);

      if (!student) {
        throw new Error('Student not found');
      }

      // Build query with optional date filters
      let query = `
        SELECT 
          al.id,
          al.entry_time,
          al.latitude,
          al.longitude,
          al.location_valid,
          DATE(al.entry_time) as entry_date,
          qr.gate_name,
          qr.code as qr_code
        FROM attendance_logs al
        JOIN qr_codes qr ON al.qr_code_id = qr.id
        WHERE al.student_id = ?
      `;

      const params = [studentId];

      if (startDate) {
        query += ' AND DATE(al.entry_time) >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND DATE(al.entry_time) <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY al.entry_time DESC';

      // Get attendance logs
      const logs = await queryAll(query, params);

      // Calculate statistics
      const totalEntries = logs.length;
      const locationValidCount = logs.filter(log => log.location_valid).length;
      const uniqueDates = new Set(logs.map(log => log.entry_date)).size;

      // Group by date for daily summary
      const dailyAttendance = {};
      logs.forEach(log => {
        const date = log.entry_date;
        if (!dailyAttendance[date]) {
          dailyAttendance[date] = [];
        }
        dailyAttendance[date].push({
          id: log.id,
          entryTime: log.entry_time,
          gateName: log.gate_name,
          locationValid: Boolean(log.location_valid),
        });
      });

      return {
        student: {
          id: student.id,
          studentId: student.student_id,
          name: student.name,
          email: student.email,
          grade: student.grade,
          phone: student.phone,
        },
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
        statistics: {
          totalEntries,
          uniqueDays: uniqueDates,
          locationValidCount,
          locationInvalidCount: totalEntries - locationValidCount,
        },
        entries: logs.map(log => ({
          id: log.id,
          entryTime: log.entry_time,
          entryDate: log.entry_date,
          gateName: log.gate_name,
          qrCode: log.qr_code,
          latitude: log.latitude,
          longitude: log.longitude,
          locationValid: Boolean(log.location_valid),
        })),
        dailyAttendance,
      };
    } catch (error) {
      console.error('Error generating student report:', error);
      throw error;
    }
  }

  /**
   * Convert report data to CSV format
   * @param {Object} reportData - Report data object
   * @param {string} reportType - Type of report (daily, weekly, monthly, student)
   * @returns {string} CSV formatted string
   */
  convertToCSV(reportData, reportType) {
    try {
      let csv = '';
      
      if (reportType === 'daily' || reportType === 'weekly' || reportType === 'monthly') {
        // Header
        csv = 'Student ID,Student Name,Grade,Entry Time,Entry Date,Gate Name,Location Valid\n';
        
        // Data rows
        reportData.entries.forEach(entry => {
          csv += `"${entry.studentId}","${entry.studentName}","${entry.grade || ''}","${entry.entryTime}","${entry.entryDate || entry.entryTime.split(' ')[0]}","${entry.gateName}","${entry.locationValid ? 'Yes' : 'No'}"\n`;
        });
      } else if (reportType === 'student') {
        // Header
        csv = `Student Report: ${reportData.student.name} (${reportData.student.studentId})\n`;
        csv += `Grade: ${reportData.student.grade || 'N/A'}\n`;
        csv += `Total Entries: ${reportData.statistics.totalEntries}\n`;
        csv += `Unique Days: ${reportData.statistics.uniqueDays}\n\n`;
        csv += 'Entry Date,Entry Time,Gate Name,Location Valid\n';
        
        // Data rows
        reportData.entries.forEach(entry => {
          csv += `"${entry.entryDate}","${entry.entryTime}","${entry.gateName}","${entry.locationValid ? 'Yes' : 'No'}"\n`;
        });
      }
      
      return csv;
    } catch (error) {
      console.error('Error converting to CSV:', error);
      throw error;
    }
  }

  /**
   * Calculate working days (excluding weekends) between two dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {number} Number of working days
   */
  calculateWorkingDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Exclude Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return workingDays;
  }
}

module.exports = new ReportService();
