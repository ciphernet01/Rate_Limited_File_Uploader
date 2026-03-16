const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const path = require('path');
const request = require('supertest');
const uploadRateLimiter = require('../src/middlewares/uploadRateLimiter');

const testDbPath = path.join(__dirname, 'test-db.json');

process.env.DATA_FILE = testDbPath;
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

const app = require('../src/app');

async function resetDb() {
  await fs.writeFile(testDbPath, JSON.stringify({ users: [], projects: [] }, null, 2));
}

test.beforeEach(async () => {
  await resetDb();
  uploadRateLimiter._resetForTests();
});

test.after(async () => {
  try {
    await fs.unlink(testDbPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
});

test('register, login, and manage own project', async () => {
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123',
      tenantId: 'tenant-acme'
    })
    .expect(201);

  assert.equal(registerResponse.body.success, true);
  assert.ok(registerResponse.body.data.token);

  const token = registerResponse.body.data.token;

  const createResponse = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Launch v2',
      description: 'Coordinate release work across teams.',
      status: 'planned'
    })
    .expect(201);

  assert.equal(createResponse.body.data.title, 'Launch v2');
  const projectId = createResponse.body.data.id;

  const listResponse = await request(app)
    .get('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(listResponse.body.data.length, 1);
  assert.equal(listResponse.body.data[0].id, projectId);

  const updateResponse = await request(app)
    .patch(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'completed' })
    .expect(200);

  assert.equal(updateResponse.body.data.status, 'completed');

  await request(app)
    .delete(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204);
});

test('prevents one user from modifying another user project', async () => {
  const ownerRegister = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Owner',
      email: 'owner@example.com',
      password: 'Password123',
      tenantId: 'tenant-acme'
    })
    .expect(201);

  const attackerRegister = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Attacker',
      email: 'attacker@example.com',
      password: 'Password123',
      tenantId: 'tenant-acme'
    })
    .expect(201);

  const project = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${ownerRegister.body.data.token}`)
    .send({
      title: 'Protected project',
      description: 'Only the owner can change me.',
      status: 'planned'
    })
    .expect(201);

  await request(app)
    .patch(`/api/projects/${project.body.data.id}`)
    .set('Authorization', `Bearer ${attackerRegister.body.data.token}`)
    .send({ status: 'archived' })
    .expect(403);
});

test('uploads a valid text file and returns metadata with word count', async () => {
  const response = await request(app)
    .post('/api/uploads')
    .attach('file', Buffer.from('hello world from uploader'), 'sample.txt')
    .expect(200);

  assert.equal(response.body.success, true);
  assert.equal(response.body.data.fileName, 'sample.txt');
  assert.equal(response.body.data.fileSize, Buffer.from('hello world from uploader').length);
  assert.equal(response.body.data.wordCount, 4);
});

test('rate limits uploads to 5 requests per minute per client', async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await request(app)
      .post('/api/uploads')
      .attach('file', Buffer.from(`content ${attempt}`), `file-${attempt}.txt`)
      .expect(200);
  }

  const blockedResponse = await request(app)
    .post('/api/uploads')
    .attach('file', Buffer.from('too many attempts'), 'blocked.txt')
    .expect(429);

  assert.equal(blockedResponse.body.success, false);
});
