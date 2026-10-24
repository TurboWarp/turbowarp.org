const { it } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('serves static files from localhost', () => {
  return request.get('/index.html')
    .set('Host', 'localhost')
    .expect(200);
});

it('serves static files from notlocalhost', () => {
  return request.get('/test.html')
    .set('Host', 'notlocalhost')
    .expect(200);
});

it('returns 400 if invalid host', () => {
  return request.get('/')
    .set('Host', 'lskdfksldfjlksdfjlksdflskdf.com')
    .expect(400);
});

it('returns 400 if no host', () => {
  return request.get('/')
    .expect(400);
});

it('ignores X-Forwarded-Host', async () => {
  await request.get('/index.html')
    .set('Host', 'localhost')
    .set('X-Forwarded-Host', 'notlocalhost')
    .expect(200);
  await request.get('/test.html')
    .set('Host', 'localhost')
    .set('X-Forwarded-Host', 'notlocalhost')
    .expect(404);
});
