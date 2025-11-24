const request = require('supertest');
const app = require('../../src/index');

describe('Report Generation Endpoints', () => {
  let adminToken;
  let testStudentId;

  beforeAll(async () => {
    // Login admin
    const response = await request(app)
      .post('/api/auth/admin/login')
      .send({
        username: 'admin',
        password: 'Admin123!'
      });
    
    adminToken = response.body.data.accessToken;

    // Get a test student ID
    const searchResponse = await request(app)
      .get('/api/admin/students/search')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ query: 'student' });
    
    if (searchResponse.body.data.students.length > 0) {
      testStudentId = searchResponse.body.data.students[0].id;
    }
  });

  describe('GET /api/admin/reports/daily', () => {
    it('should generate daily report with valid date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await request(app)
        .get('/api/admin/reports/daily')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ date: today });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('date');
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data).toHaveProperty('entries');
    });

    it('should export daily report as CSV', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await request(app)
        .get('/api/admin/reports/daily')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ date: today, format: 'csv' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
    });

    it('should reject request without date parameter', async () => {
      const response = await request(app)
        .get('/api/admin/reports/daily')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app)
        .get('/api/admin/reports/daily')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ date: 'invalid-date' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/reports/weekly', () => {
    it('should generate weekly report', async () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      const startDate = monday.toISOString().split('T')[0];

      const response = await request(app)
        .get('/api/admin/reports/weekly')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ startDate });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('startDate');
      expect(response.body.data).toHaveProperty('endDate');
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data).toHaveProperty('dailySummary');
    });

    it('should export weekly report as CSV', async () => {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];

      const response = await request(app)
        .get('/api/admin/reports/weekly')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ startDate, format: 'csv' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
    });
  });

  describe('GET /api/admin/reports/monthly', () => {
    it('should generate monthly report', async () => {
      const today = new Date();
      const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      const response = await request(app)
        .get('/api/admin/reports/monthly')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ month });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('month');
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data.statistics).toHaveProperty('totalEntries');
      expect(response.body.data.statistics).toHaveProperty('attendancePercentage');
    });

    it('should reject invalid month format', async () => {
      const response = await request(app)
        .get('/api/admin/reports/monthly')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ month: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/reports/student/:studentId', () => {
    it('should generate per-student report', async () => {
      if (!testStudentId) {
        console.log('Skipping: No test student available');
        return;
      }

      const response = await request(app)
        .get(`/api/admin/reports/student/${testStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('student');
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data).toHaveProperty('entries');
    });

    it('should reject invalid student ID', async () => {
      const response = await request(app)
        .get('/api/admin/reports/student/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should export student report as CSV', async () => {
      if (!testStudentId) {
        console.log('Skipping: No test student available');
        return;
      }

      const response = await request(app)
        .get(`/api/admin/reports/student/${testStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ format: 'csv' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/csv|application\/octet-stream/);
    });
  });

  describe('GET /api/admin/attendance/logs', () => {
    it('should retrieve paginated attendance logs', async () => {
      const response = await request(app)
        .get('/api/admin/attendance/logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('logs');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.logs)).toBe(true);
    });

    it('should filter logs by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await request(app)
        .get('/api/admin/attendance/logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ 
          page: 1, 
          limit: 10,
          startDate: today
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should filter logs by student ID', async () => {
      if (!testStudentId) {
        console.log('Skipping: No test student available');
        return;
      }

      const response = await request(app)
        .get('/api/admin/attendance/logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ 
          page: 1, 
          limit: 10,
          studentId: testStudentId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/students/search', () => {
    it('should search students by query', async () => {
      const response = await request(app)
        .get('/api/admin/students/search')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ query: 'student' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('students');
      expect(response.body.data).toHaveProperty('count');
      expect(Array.isArray(response.body.data.students)).toBe(true);
    });

    it('should return empty results for non-matching query', async () => {
      const response = await request(app)
        .get('/api/admin/students/search')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ query: 'nonexistentxyz123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(0);
    });
  });

  describe('Authorization', () => {
    it('should reject requests without admin token', async () => {
      const response = await request(app)
        .get('/api/admin/reports/daily')
        .query({ date: '2024-01-01' });

      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/reports/daily')
        .set('Authorization', 'Bearer invalid_token')
        .query({ date: '2024-01-01' });

      expect(response.status).toBe(401);
    });
  });
});
