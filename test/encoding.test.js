const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('html served with no file encoding', async () => {
  return request.get('/index.html')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect('index.html (no encoding)')
});

it('js served with no encoding', async () => {
  return request.get('/test.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect('test.js (no encoding)');
});

it('js served with gzip', async () => {
  return request.get('/test.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', 'gzip')
    .expect('Content-Encoding', 'gzip');
});

it('js served with br', async () => {
  return request.get('/test.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', 'br')
    .expect('Content-Encoding', 'br');
});

it('js prefers br over gzip', async () => {
  return request.get('/test.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', 'gzip, br')
    .expect('Content-Encoding', 'br');
});
