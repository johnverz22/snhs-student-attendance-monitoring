const request = require('supertest');
const app = require('../../src/index');

describe('Attendance Endpoints', () => {
  let studentToken;
  let studentId;

  beforeAll(async () => {
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/student/login')
      .send({
        email: 'john.doe@school.com',
        password: 'Password123'
      });
    
    studentToken = loginResponse.body.data.accessToken;
    studentId = loginResponse.body.data.student.id;
  });

  describe('POST /api/student/attendance/scan', () => {
    it('should log attendance with valid QR code and GPS', async () => {
      const response = await request(app)
        .post('/api/student/attendance/scan')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'GATE_A_2024',
          latitude: 40.7128,
          longitude: -74.0060,
          timestamp: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('attendanceId');
      expect(response.body.data).toHaveProperty('entryTime');
    });

    it('should reject invalid QR code', async () => {
      const response = await request(app)
        .post('/api/student/attendance/scan')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'INVALID_CODE',
          latitude: 40.7128,
          longitude: -74.0060,
          timestamp: new Date().toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('QR_CODE_INVALID');
    });

    it('should reject location outside school boundaries', async () => {
      const response = await request(app)
        .post('/api/student/attendance/scan')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'GATE_A_2024',
          latitude: 34.0522,
          longitude: -118.2437,
          timestamp: new Date().toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('LOCATION_INVALID');
    });

    it('should reject duplicate attendance within time window', async () => {
      // First scan
      await request(app)
        .post('/api/student/attendance/scan')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'GATE_B_2024',
          latitude: 40.7128,
          longitude: -74.0060,
          timestamp: new Date().toISOString()
        });

      // Duplicate scan
      const response = await request(app)
        .post('/api/student/attendance/scan')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrCode: 'GATE_B_2024',
          latitude: 40.7128,
          longitude: -74.0060,
          timestamp: new Date().toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ATTENDANCE_DUPLICATE');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/student/attendance/scan')
        .send({
          qrCode: 'GATE_A_2024',
          latitude: 40.7128,
          longitude: -74.0060
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/student/attendance/history', () => {
    it('should retrieve attendance history', async () => {
      const response = await request(app)
        .get('/api/student/attendance/history')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('logs');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.logs)).toBe(true);
    });

    it('should filter history by date range', async () => {
      const today = new Date().toISOString();
      const response = await request(app)
        .get('/api/student/attendance/history')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ 
          limit: 10, 
          offset: 0,
          startDate: today
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
