import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import app from '../src/server';
import { Task } from '../src/models/taskModel';
import { User } from '../src/models/userModel';

// ─── Test Setup ───────────────────────────────────────────────────────────────

let authToken: string;
let testUserId: string;

beforeAll(async () => {
  // Use a separate test DB
  const testUri =
    process.env.MONGODB_URI_TEST ??
    process.env.MONGODB_URI ??
    'mongodb://localhost:27017/taskmanagement_test';

  await mongoose.connect(testUri);

  // Create a test user
  const user = await User.create({
    name: 'Test User',
    email: `testuser_${Date.now()}@example.com`,
    password: 'TestPass123',
  });
  testUserId = user._id.toString();

  // Generate JWT for the test user
  authToken = jwt.sign(
    { userId: testUserId, email: user.email },
    process.env.JWT_SECRET ?? 'test_secret',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  // Clean up test data
  await Task.deleteMany({ user_id: new mongoose.Types.ObjectId(testUserId) });
  await User.findByIdAndDelete(testUserId);
  await mongoose.connection.close();
});

// ─── Task API Tests ───────────────────────────────────────────────────────────

describe('Task API — /api/tasks', () => {
  let createdTaskId: string;

  // ── POST /api/tasks ────────────────────────────────────────────────────────

  describe('POST /api/tasks', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).post('/api/tasks').send({ title: 'Unauthorized Task' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'No title provided' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should create a task successfully with valid data', async () => {
      const taskData = {
        title: 'Write unit tests',
        description: 'Cover all critical API endpoints',
        status: 'in-progress',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(taskData.title);
      expect(res.body.data.status).toBe('in-progress');
      expect(res.body.data.user_id).toBe(testUserId);

      createdTaskId = res.body.data._id;
    });
  });

  // ── GET /api/tasks ─────────────────────────────────────────────────────────

  describe('GET /api/tasks', () => {
    it('should retrieve tasks for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=in-progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((t: { status: string }) => t.status === 'in-progress')).toBe(true);
    });

    it('should support live search by title', async () => {
      const res = await request(app)
        .get('/api/tasks?search=unit+tests')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(
        res.body.data.some((t: { title: string }) =>
          t.title.toLowerCase().includes('unit tests')
        )
      ).toBe(true);
    });
  });

  // ── PUT /api/tasks/:id ─────────────────────────────────────────────────────

  describe('PUT /api/tasks/:id', () => {
    it('should update a task status to done', async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'done' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('done');
    });

    it('should return 404 for a non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'done' });

      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /api/tasks/:id ──────────────────────────────────────────────────

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
