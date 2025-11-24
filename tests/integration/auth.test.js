const request = require('supertest');
const app = require('../../src/index');

describe('Authentication Endpoints', () => {

  describe('POST /api/auth/student/register', () => {
    it('should register a new student successfully', async () => {
      const uniqueId = `TEST${Date.now()}`;
      const response = await request(app)
        .post('/api/auth/student/register')
        .send({
          student_id: uniqueId,
          name: 'Test Student',
          email: `new.student.${Date.now()}@school.com`,
          password: 'Password123',
          grade: '10',
          phone: '1234567890'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.student).toHaveProperty('id');
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/student/register')
        .send({
          student_id: 'TEST002',
          name: 'Test Student 2',
          email: 'john.doe@school.com',
          password: 'Password123',
          grade: '10'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/student/login', () => {
    it('should login student with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/student/login')
        .send({
          email: 'john.doe@school.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/student/login')
        .send({
          email: 'test.student@school.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/parent/register', () => {
    it('should register a new parent with student link', async () => {
      const response = await request(app)
        .post('/api/auth/parent/register')
        .send({
          name: 'Test Parent',
          email: `new.parent.${Date.now()}@example.com`,
          password: 'Password123',
          phone: '9876543210',
          studentIds: [1]
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });
  });

  describe('POST /api/auth/admin/login', () => {
    it('should login admin with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          username: 'admin',
          password: 'Admin123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });
  });
});
