const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('serves static files', async () => {
  return request.get('/index.html')
    .set('Host', 'localhost')
    .expect(200)
    .expect('index.html (no encoding)');
});

it('serves index file for root', async () => {
  return request.get('/')
    .set('Host', 'localhost')
    .expect(200)
    .expect('index.html (no encoding)');
});

it('serves index file for directory', async () => {
  return request.get('/directory/')
    .set('Host', 'localhost')
    .expect(200)
    .expect('index.html in directory (no encoding)');
});

it('returns 404 for not found', async () => {
  return request.get('/sdflkjsdgfljksdrgojlikgrdjokigsdjk')
    .set('Host', 'localhost')
    .expect(404);
});

it('redirects directories', async () => {
  return request.get('/directory')
    .set('Host', 'localhost')
    .expect('Location', '/directory/');
});

it('is not vulnerable to path traversal', async () => {
  return Promise.all([
    request.get('/../www2/test.html')
      .set('Host', 'localhost')
      .expect(404),
    // we're not trying to read /etc/passwd for any malicious reason
    // we're just using a very common unix file to see if path traversal works (we hope it doesn't)
    request.get('/../../../../../../../../../../../../etc/passwd')
      .set('Host', 'localhost')
      .expect(404)
  ]);
});
