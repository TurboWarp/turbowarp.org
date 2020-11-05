const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('html served with no file encoding', async () => {
  return request.get('/index.html')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect('index.html (no encoding)')
});

it('js served with no accepted encodings', async () => {
  return request.get('/file.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect('Vary', 'Accept-Encoding')
    .expect('file.js (no encoding)');
});

it('js served with gzip', async () => {
  return request.get('/file.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', 'gzip')
    .expect('Vary', 'Accept-Encoding')
    .expect('Content-Encoding', 'gzip');
});

it('js served with br', async () => {
  return request.get('/file.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', 'br')
    .expect('Vary', 'Accept-Encoding')
    .expect('Content-Encoding', 'br');
});

it('js prefers br over gzip', async () => {
  return request.get('/file.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', 'gzip, br')
    .expect('Vary', 'Accept-Encoding')
    .expect('Content-Encoding', 'br');
});
