/**
 * tests/student.test.js
 * ------------------------
 * Integration tests that drive the real Express `app` (see src/app.js)
 * through supertest, with the MODEL layer mocked out via jest.mock.
 *
 * Why mock the model instead of hitting a real test database:
 * This keeps the test suite fast and runnable in CI without needing a
 * provisioned MySQL instance for every run, while still exercising the
 * real routing, validation, and error-handling middleware end-to-end —
 * the layer most likely to have integration bugs. A smaller set of
 * dedicated tests against a real (Dockerized) test database is the
 * natural next addition — see docs/ARCHITECTURE.md "Future Roadmap".
 */

jest.mock('../src/models/student.model');

const request = require('supertest');
const app = require('../src/app');
const studentModel = require('../src/models/student.model');

const sampleStudent = {
  id: 1,
  full_name: 'Ali Raza',
  email: 'ali.raza@example.com',
  phone: '+92-300-1234567',
  course: 'BS Computer Science',
  enrollment_date: '2026-01-15',
  created_at: '2026-01-15T10:00:00.000Z',
  updated_at: '2026-01-15T10:00:00.000Z',
};

const validPayload = {
  fullName: 'Ali Raza',
  email: 'ali.raza@example.com',
  phone: '+92-300-1234567',
  course: 'BS Computer Science',
  enrollmentDate: '2026-01-15',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/students', () => {
  it('creates a student and returns 201 when the payload is valid', async () => {
    studentModel.findByEmail.mockResolvedValue(null);
    studentModel.create.mockResolvedValue(sampleStudent);

    const response = await request(app).post('/api/students').send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(sampleStudent);
  });

  it('returns 409 when the email is already registered', async () => {
    studentModel.findByEmail.mockResolvedValue(sampleStudent);

    const response = await request(app).post('/api/students').send(validPayload);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(studentModel.create).not.toHaveBeenCalled();
  });

  it('returns 400 with field-level details when required fields are missing', async () => {
    const response = await request(app).post('/api/students').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.details)).toBe(true);
    expect(response.body.details.length).toBeGreaterThan(0);
  });

  it('returns 400 when the email is malformed', async () => {
    const response = await request(app)
      .post('/api/students')
      .send({ ...validPayload, email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body.details.some((detail) => detail.field === 'email')).toBe(true);
  });

  it('returns 400 when the enrollment date is in the future', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const response = await request(app)
      .post('/api/students')
      .send({ ...validPayload, enrollmentDate: futureDate.toISOString().slice(0, 10) });

    expect(response.status).toBe(400);
    expect(response.body.details.some((detail) => detail.field === 'enrollmentDate')).toBe(true);
  });
});

describe('GET /api/students/:id', () => {
  it('returns the student when found', async () => {
    studentModel.findById.mockResolvedValue(sampleStudent);

    const response = await request(app).get('/api/students/1');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(sampleStudent);
  });

  it('returns 404 when the student does not exist', async () => {
    studentModel.findById.mockResolvedValue(null);

    const response = await request(app).get('/api/students/999');

    expect(response.status).toBe(404);
  });

  it('returns 400 when the id is not a positive integer', async () => {
    const response = await request(app).get('/api/students/abc');
    expect(response.status).toBe(400);
  });
});

describe('GET /api/students', () => {
  it('returns a paginated list with default page/limit', async () => {
    studentModel.findAll.mockResolvedValue({ rows: [sampleStudent], total: 1 });

    const response = await request(app).get('/api/students');

    expect(response.status).toBe(200);
    expect(response.body.data.students).toHaveLength(1);
    expect(response.body.data.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });
});

describe('PATCH /api/students/:id', () => {
  it('updates a student with a partial payload', async () => {
    studentModel.findById.mockResolvedValue(sampleStudent);
    studentModel.update.mockResolvedValue({ ...sampleStudent, course: 'BS Data Science' });

    const response = await request(app).patch('/api/students/1').send({ course: 'BS Data Science' });

    expect(response.status).toBe(200);
    expect(response.body.data.course).toBe('BS Data Science');
  });

  it('returns 404 when updating a non-existent student', async () => {
    studentModel.findById.mockResolvedValue(null);

    const response = await request(app).patch('/api/students/999').send({ course: 'X' });

    expect(response.status).toBe(404);
  });

  it('returns 400 when the update payload is empty', async () => {
    studentModel.findById.mockResolvedValue(sampleStudent);

    const response = await request(app).patch('/api/students/1').send({});

    expect(response.status).toBe(400);
  });

  it('returns 409 when updating to an email already used by another student', async () => {
    studentModel.findById.mockResolvedValue(sampleStudent);
    studentModel.findByEmail.mockResolvedValue({ ...sampleStudent, id: 2 });

    const response = await request(app)
      .patch('/api/students/1')
      .send({ email: 'someone.else@example.com' });

    expect(response.status).toBe(409);
  });
});

describe('DELETE /api/students/:id', () => {
  it('deletes an existing student', async () => {
    studentModel.remove.mockResolvedValue(true);

    const response = await request(app).delete('/api/students/1');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ id: 1 });
  });

  it('returns 404 when deleting a non-existent student', async () => {
    studentModel.remove.mockResolvedValue(false);

    const response = await request(app).delete('/api/students/999');

    expect(response.status).toBe(404);
  });
});

describe('GET /api/health', () => {
  it('returns 200 with a healthy status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe('Unknown routes', () => {
  it('returns 404 for an unmatched route', async () => {
    const response = await request(app).get('/api/does-not-exist');
    expect(response.status).toBe(404);
  });
});
