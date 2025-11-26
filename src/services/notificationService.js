const admin = require('firebase-admin');
const config = require('../config');
const dbManager = require('../models/database');
const { queryOne, queryAll, execute, transaction } = require('../utils/dbHelpers');

/**
 * NotificationService handles push notifications via Firebase Cloud Messaging
 */
class NotificationService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.initialized = false;
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initializeFirebase() {
    try {
      if (!this.initialized) {
        let serviceAccount;
        
        // Check if Firebase credentials are in environment variable (Vercel/Production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log(`[${new Date().toISOString()}] Using Firebase credentials from environment variable`);
          } catch (parseError) {
            console.error('Error parsing FIREBASE_SERVICE_ACCOUNT environment variable:', parseError);
            console.warn('Firebase service account not configured, push notifications will be disabled');
            return;
          }
        } 
        // Otherwise, try to load from file (local development)
        else if (config.firebase && config.firebase.serviceAccountPath) {
          try {
            const path = require('path');
            const serviceAccountPath = path.resolve(process.cwd(), config.firebase.serviceAccountPath);
            serviceAccount = require(serviceAccountPath);
            console.log(`[${new Date().toISOString()}] Using Firebase credentials from file: ${config.firebase.serviceAccountPath}`);
          } catch (fileError) {
            console.error('Error loading Firebase service account file:', fileError);
            console.warn('Firebase service account not configured, push notifications will be disabled');
            return;
          }
        } else {
          console.warn('Firebase service account not configured (no env var or file path), push notifications will be disabled');
          return;
        }
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        
        this.initialized = true;
        console.log(`[${new Date().toISOString()}] Firebase Admin SDK initialized successfully`);
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      console.warn('Push notifications will be disabled due to initialization error');
    }
  }

  /**
   * Register device token for push notifications
   * @param {number} parentId - Parent ID
   * @param {string} deviceToken - FCM device token
   * @param {string} platform - Platform (ios or android)
   * @returns {Object} Registration result
   */
  async registerDeviceToken(parentId, deviceToken, platform) {
    try {
      
      // Check if token already exists
      const existing = await queryOne(`
        SELECT id, is_active FROM push_tokens
        WHERE parent_id = $1 AND device_token = $2
      `, [parentId, deviceToken]);

      if (existing) {
        // Reactivate if inactive
        if (!existing.is_active) {
          await execute(`
            UPDATE push_tokens
            SET is_active = 't', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `, [existing.id]);

          console.log(`[${new Date().toISOString()}] Reactivated push token for parent ${parentId}`);
        }

        return {
          success: true,
          message: 'Device token already registered',
          tokenId: existing.id,
        };
      }

      // Insert new token
      const result = await execute(`
        INSERT INTO push_tokens (parent_id, device_token, platform, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [parentId, deviceToken, platform, true]);

      console.log(`[${new Date().toISOString()}] Registered push token for parent ${parentId}, platform ${platform}`);

      return {
        success: true,
        message: 'Device token registered successfully',
        tokenId: result.rows[0].id,
      };
    } catch (error) {
      console.error('Error registering device token:', error);
      throw new Error('Failed to register device token');
    }
  }

  /**
   * Unregister device token
   * @param {number} parentId - Parent ID
   * @param {string} deviceToken - Device token to unregister
   * @returns {Object} Unregistration result
   */
  async unregisterDeviceToken(parentId, deviceToken) {
    try {
      
      const result = await execute(`
        UPDATE push_tokens
        SET is_active = 'f', updated_at = CURRENT_TIMESTAMP
        WHERE parent_id = $1 AND device_token = $2
      `, [parentId, deviceToken]);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'Device token not found',
        };
      }

      console.log(`[${new Date().toISOString()}] Unregistered push token for parent ${parentId}`);

      return {
        success: true,
        message: 'Device token unregistered successfully',
      };
    } catch (error) {
      console.error('Error unregistering device token:', error);
      throw new Error('Failed to unregister device token');
    }
  }

  /**
   * Get all active device tokens for a parent
   * @param {number} parentId - Parent ID
   * @returns {Array} List of active device tokens
   */
  async getParentDeviceTokens(parentId) {
    try {
      
      const tokens = await queryAll(`
        SELECT device_token, platform
        FROM push_tokens
        WHERE parent_id = $1 AND is_active = TRUE
      `, [parentId]);

      return tokens.map(t => ({
        deviceToken: t.device_token,
        platform: t.platform,
      }));
    } catch (error) {
      console.error('Error fetching device tokens:', error);
      throw new Error('Failed to fetch device tokens');
    }
  }

  /**
   * Send push notification via Firebase Cloud Messaging
   * @param {string} deviceToken - FCM device token
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Object} Send result
   */
  async sendPushNotification(deviceToken, notification, data = {}) {
    try {
      if (!this.initialized) {
        console.warn('Firebase not initialized, skipping notification');
        return {
          success: false,
          error: 'FIREBASE_NOT_INITIALIZED',
          message: 'Firebase Admin SDK not initialized',
        };
      }

      // Convert all data values to strings (FCM requirement)
      const stringData = {};
      for (const [key, value] of Object.entries(data)) {
        stringData[key] = String(value);
      }
      stringData.timestamp = new Date().toISOString();

      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: stringData,
        android: {
          priority: 'high',
          notification: {
            sound: notification.sound || 'default',
            channelId: 'attendance_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: notification.sound || 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);

      console.log(`[${new Date().toISOString()}] Push notification sent successfully to ${deviceToken}`);

      return {
        success: true,
        message: 'Notification sent successfully',
        messageId: response,
      };
    } catch (error) {
      console.error('Error sending push notification:', error.message);
      
      // Handle specific FCM errors
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        console.log('Invalid or unregistered token, should be removed from database');
      }

      return {
        success: false,
        error: error.code || 'NOTIFICATION_SEND_FAILED',
        message: error.message,
      };
    }
  }

  /**
   * Send push notification with retry logic
   * @param {string} deviceToken - Device token
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @param {number} retryCount - Current retry attempt
   * @returns {Object} Send result
   */
  async sendPushNotificationWithRetry(deviceToken, notification, data = {}, retryCount = 0) {
    const result = await this.sendPushNotification(deviceToken, notification, data);

    if (!result.success && retryCount < this.maxRetries) {
      console.log(`[${new Date().toISOString()}] Retrying notification (attempt ${retryCount + 1}/${this.maxRetries})...`);
      
      // Wait before retrying (exponential backoff)
      await this.sleep(this.retryDelay * Math.pow(2, retryCount));
      
      return this.sendPushNotificationWithRetry(deviceToken, notification, data, retryCount + 1);
    }

    return result;
  }

  /**
   * Send attendance notification to parent(s)
   * @param {number} studentId - Student ID
   * @param {Object} attendanceData - Attendance log data
   * @returns {Object} Notification result
   */
  async sendAttendanceNotification(studentId, attendanceData) {
    try {
      
      // Get parent IDs linked to this student
      const parentLinks = await queryAll(`
        SELECT parent_id FROM parent_student_links
        WHERE student_id = $1
      `, [studentId]);

      if (parentLinks.length === 0) {
        console.log(`[${new Date().toISOString()}] No parents linked to student ${studentId}, skipping notification`);
        return {
          success: true,
          message: 'No parents to notify',
          notificationsSent: 0,
        };
      }

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      // Send notification to each parent
      for (const link of parentLinks) {
        const tokens = await this.getParentDeviceTokens(link.parent_id);

        if (tokens.length === 0) {
          console.log(`[${new Date().toISOString()}] No active device tokens for parent ${link.parent_id}`);
          continue;
        }

        // Prepare notification payload
        const notification = {
          title: 'Student Arrival',
          body: `${attendanceData.studentName} arrived at school at ${this.formatTime(attendanceData.entryTime)}`,
          sound: 'default',
        };

        const data = {
          type: 'attendance',
          studentId: studentId.toString(),
          studentName: attendanceData.studentName,
          entryTime: attendanceData.entryTime,
          gateName: attendanceData.gateName,
          attendanceId: attendanceData.attendanceId.toString(),
        };

        // Send to all device tokens for this parent
        for (const token of tokens) {
          const result = await this.sendPushNotificationWithRetry(
            token.deviceToken,
            notification,
            data
          );

          results.push({
            parentId: link.parent_id,
            deviceToken: token.deviceToken,
            platform: token.platform,
            success: result.success,
            error: result.error,
          });

          if (result.success) {
            successCount++;
          } else {
            failureCount++;
            
            // Log notification failure to database for tracking
            this.logNotificationFailure(link.parent_id, token.deviceToken, result.error);
          }
        }
      }

      console.log(`[${new Date().toISOString()}] Attendance notifications: ${successCount} sent, ${failureCount} failed`);

      return {
        success: true,
        message: 'Notifications processed',
        notificationsSent: successCount,
        notificationsFailed: failureCount,
        results,
      };
    } catch (error) {
      console.error('Error sending attendance notification:', error);
      throw new Error('Failed to send attendance notification');
    }
  }

  /**
   * Log notification failure for tracking
   * @param {number} parentId - Parent ID
   * @param {string} deviceToken - Device token
   * @param {string} error - Error message
   */
  logNotificationFailure(parentId, deviceToken, error) {
    try {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] Notification failure: parent=${parentId}, token=${deviceToken}, error=${error}`);
      
      // Could store in a notification_failures table if needed for analytics
      // For now, just logging to console
    } catch (err) {
      console.error('Error logging notification failure:', err);
    }
  }

  /**
   * Format time for notification display
   * @param {string} isoTime - ISO timestamp
   * @returns {string} Formatted time
   */
  formatTime(isoTime) {
    try {
      const date = new Date(isoTime);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return isoTime;
    }
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test notification service (for development/testing)
   * @param {string} deviceToken - Device token to test
   * @returns {Object} Test result
   */
  async testNotification(deviceToken) {
    const notification = {
      title: 'Test Notification',
      body: 'This is a test notification from the School Attendance System',
      sound: 'default',
    };

    const data = {
      type: 'test',
      timestamp: new Date().toISOString(),
    };

    return this.sendPushNotificationWithRetry(deviceToken, notification, data);
  }
}

module.exports = new NotificationService();
