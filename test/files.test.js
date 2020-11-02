const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('serves static files', async () => {
  return request.get('/index.html')
    .set('Host', 'localhost')
    .expect(200)
    .expect('index.html (no encoding)');
});

it('serves index files', async () => {
  return request.get('/')
    .set('Host', 'localhost')
    .expect(200)
    .expect('index.html (no encoding)');
});

it('returns 404 for not found', async () => {
  return request.get('/sdflkjsdgfljksdrgojlikgrdjokigsdjk')
    .set('Host', 'localhost')
    .expect(404);
});

it('is not vulnerable to path traversal', async () => {
  return request.get('/../test/path-traversal.html')
    .set('Host', 'localhost')
    .expect(404);
});
