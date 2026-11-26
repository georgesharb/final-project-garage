// API tests with Supertest: real HTTP requests to our Express app.
// None of these requests reaches the database, so they run without SQL Server.
// (They check security: tokens, roles, input checks, headers, rate limit.)
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';               // a fake secret, only for the tests
process.env.FRONTEND_URL = 'http://localhost:5173';
const { default: app } = await import('../app.js');  // import AFTER setting the values above

const ownerToken = jwt.sign({ id: 1, role: 'owner', clientId: null }, 'test-secret');
const clientToken = jwt.sign({ id: 2, role: 'client', clientId: 1 }, 'test-secret');

describe('API routes (no database needed)', () => {

  it('GET / says the API is running', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
  });

  it('adds security headers (helmet)', async () => {
    const res = await request(app).get('/');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-powered-by'], undefined);
  });

  it('allows our React site (CORS)', async () => {
    const res = await request(app).get('/').set('Origin', 'http://localhost:5173');
    assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173');
  });

  it('blocks other websites (CORS)', async () => {
    const res = await request(app).get('/').set('Origin', 'http://evil.example');
    assert.equal(res.headers['access-control-allow-origin'], undefined);
  });

  it('returns 404 for an unknown route', async () => {
    const res = await request(app).get('/api/nothing-here');
    assert.equal(res.status, 404);
  });

  it('refuses owner pages without a token (401)', async () => {
    const res = await request(app).get('/api/owner/clients');
    assert.equal(res.status, 401);
  });

  it('refuses a fake token (401)', async () => {
    const res = await request(app).get('/api/owner/clients').set('Authorization', 'Bearer fake.token.here');
    assert.equal(res.status, 401);
  });

  it('refuses a token signed with another secret (401)', async () => {
    const forged = jwt.sign({ id: 1, role: 'owner' }, 'wrong-secret');
    const res = await request(app).get('/api/owner/clients').set('Authorization', `Bearer ${forged}`);
    assert.equal(res.status, 401);
  });

  it('a client cannot open owner pages (403)', async () => {
    const res = await request(app).get('/api/owner/clients').set('Authorization', `Bearer ${clientToken}`);
    assert.equal(res.status, 403);
  });

  it('the owner cannot open client pages (403)', async () => {
    const res = await request(app).get('/api/me/cars').set('Authorization', `Bearer ${ownerToken}`);
    assert.equal(res.status, 403);
  });

  it('refuses an unknown appointment status filter (400)', async () => {
    const res = await request(app)
      .get('/api/owner/appointments?status=hacked')
      .set('Authorization', `Bearer ${ownerToken}`);
    assert.equal(res.status, 400);
  });

  it('refuses a sign up with missing fields (400)', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Name and phone are required');
  });

  it('refuses a sign up with a short password (400)', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'John', phone: '03 123 456', email: 'john@gmail.com', password: '123' });
    assert.equal(res.status, 400);
  });

  it('refuses invalid JSON (400)', async () => {
    const res = await request(app).post('/api/auth/register')
      .set('Content-Type', 'application/json').send('{bad json');
    assert.equal(res.status, 400);
  });

  it('refuses a login with missing fields (400)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: '', password: '' });
    assert.equal(res.status, 400);
  });

  // Keep this test last: it uses up the login attempts
  it('blocks too many login attempts (429)', async () => {
    let res;
    for (let i = 0; i < 11; i++) {
      res = await request(app).post('/api/auth/login').send({});
    }
    assert.equal(res.status, 429);
    assert.equal(res.body.error, 'Too many login attempts, try again in 15 minutes');
  });

});
