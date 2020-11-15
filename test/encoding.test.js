const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('txt served with no file encoding', () => {
  return request.get('/test.txt')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect('test.txt (no encoding)')
});

it('js served with no accepted encodings', () => {
  return request.get('/file.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect('Vary', 'Accept-Encoding')
    .expect('file.js (no encoding)');
});

it('js served with gzip', () => {
  return request.get('/file.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', 'gzip')
    .expect('Vary', 'Accept-Encoding')
    .expect('Content-Encoding', 'gzip');
});

it('js served with br', () => {
  return request.get('/file.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', 'br')
    .expect('Vary', 'Accept-Encoding')
    .expect('Content-Encoding', 'br');
});

it('js prefers br over gzip', () => {
  return request.get('/file.js')
    .set('Host', 'localhost')
    .set('Accept-Encoding', 'gzip, br')
    .expect('Vary', 'Accept-Encoding')
    .expect('Content-Encoding', 'br');
});
