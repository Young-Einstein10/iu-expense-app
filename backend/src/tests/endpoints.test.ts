import request from 'supertest';
import { app } from '../server';

describe('API Endpoint Validation', () => {
  describe('Health and Info', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);
      
      expect(response.body).toHaveProperty('name', 'IU Expense Tracker API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('Auth Endpoints', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User'
    };

    it('should signup a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(testUser)
        .expect(201);
      
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
    });

    it('should reject invalid login credentials', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should reject signup with invalid data', async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'invalid-email',
          password: '123'
        })
        .expect(400);
    });
  });

  describe('Protected Routes', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
      
      authToken = loginResponse.body.tokens.accessToken;
    });

    it('should access protected route with valid token', async () => {
      await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should reject protected route without token', async () => {
      await request(app)
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should reject protected route with invalid token', async () => {
      await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Expense Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
      
      authToken = loginResponse.body.tokens.accessToken;
    });

    it('should get expense summary', async () => {
      await request(app)
        .get('/api/v1/expenses/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should get expense stats', async () => {
      await request(app)
        .get('/api/v1/expenses/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should get expenses list', async () => {
      await request(app)
        .get('/api/v1/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should create a new expense', async () => {
      const expenseData = {
        amount: 50.00,
        description: 'Test expense',
        categoryId: 'test-category-id',
        date: new Date().toISOString()
      };

      await request(app)
        .post('/api/v1/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);
    });

    it('should reject expense creation with invalid data', async () => {
      await request(app)
        .post('/api/v1/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 'invalid',
          description: ''
        })
        .expect(400);
    });
  });

  describe('Category Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
      
      authToken = loginResponse.body.tokens.accessToken;
    });

    it('should get categories', async () => {
      await request(app)
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should create default categories', async () => {
      await request(app)
        .post('/api/v1/categories/default')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);
    });

    it('should get category stats', async () => {
      await request(app)
        .get('/api/v1/categories/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Analytics Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
      
      authToken = loginResponse.body.tokens.accessToken;
    });

    it('should get dashboard stats', async () => {
      await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should get spending trends', async () => {
      await request(app)
        .get('/api/v1/analytics/spending-trends')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should get category breakdown', async () => {
      await request(app)
        .get('/api/v1/analytics/category-breakdown')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should get monthly report', async () => {
      await request(app)
        .get('/api/v1/analytics/monthly-report')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should get yearly report', async () => {
      await request(app)
        .get('/api/v1/analytics/yearly-report')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/v1/non-existent')
        .expect(404);
    });

    it('should handle invalid HTTP methods', async () => {
      await request(app)
        .patch('/api/v1/auth/login')
        .expect(404);
    });
  });
});
