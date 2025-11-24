const request = require('supertest');
const app = require('../../src/index');
const notificationService = require('../../src/services/notificationService');

describe('Notification System', () => {
  let parentToken;
  let studentToken;
  let parentId;

  beforeAll(async () => {
    // Login parent
    const parentLogin = await request(app)
      .post('/api/auth/parent/login')
      .send({
        email: 'jane.doe@example.com',
        password: 'Password123'
      });
    
    parentToken = parentLogin.body.data.accessToken;
    parentId = parentLogin.body.data.parent.id;

    // Login student
    const studentLogin = await request(app)
      .post('/api/auth/student/login')
      .send({
        email: 'john.doe@school.com',
        password: 'Password123'
      });
    
    studentToken = studentLogin.body.data.accessToken;
  });

  describe('Push Token Registration', () => {
    it('should register device token for parent', async () => {
      const response = await request(app)
        .post('/api/parent/device-token')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          deviceToken: 'test_device_token_123',
          platform: 'android'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Notification Delivery', () => {
    it('should trigger notification on attendance log', async () => {
      // Mock notification service
      const sendSpy = jest.spyOn(notificationService, 'sendAttendanceNotification');
      
      // Log attendance
      await request(app)
        .post('/api/student/attendance/scan')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'GATE_A_2024',
          latitude: 40.7128,
          longitude: -74.0060,
          timestamp: new Date().toISOString()
        });

      // Verify notification was attempted
      expect(sendSpy).toHaveBeenCalled();
      
      sendSpy.mockRestore();
    });
  });

  describe('GET /api/parent/notifications', () => {
    it('should retrieve notification history', async () => {
      const response = await request(app)
        .get('/api/parent/notifications')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
    });
  });
});
