const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('serves serves project page without trailing slash', async () => {
  return request.get('/1234')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('index.html (no encoding)');
});

it('serves serves project page with trailing slash', async () => {
  return request.get('/1234/')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('index.html (no encoding)');
});

it('serves serves editor without trailing slash', async () => {
  return request.get('/1234/editor')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('editor.html (no encoding)');
});

it('serves serves editor with trailing slash', async () => {
  return request.get('/1234/editor/')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('editor.html (no encoding)');
});

it('serves serves fullscreen without trailing slash', async () => {
  return request.get('/1234/fullscreen')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('fullscreen.html (no encoding)');
});

it('serves serves fullscreen with trailing slash', async () => {
  return request.get('/1234/fullscreen/')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('fullscreen.html (no encoding)');
});

it('serves serves project page without trailing slash in branch', async () => {
  return request.get('/test-branch/1234')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch index.html (no encoding)');
});

it('serves serves project page with trailing slash in branch', async () => {
  return request.get('/test-branch/1234/')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch index.html (no encoding)');
});

it('serves serves editor without trailing slash in branch', async () => {
  return request.get('/test-branch/1234/editor')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch editor.html (no encoding)');
});

it('serves serves editor with trailing slash in branch', async () => {
  return request.get('/test-branch/1234/editor/')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch editor.html (no encoding)');
});

it('serves serves fullscreen without trailing slash in branch', async () => {
  return request.get('/test-branch/1234/fullscreen')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch fullscreen.html (no encoding)');
});

it('serves serves fullscreen with trailing slash in branch', async () => {
  return request.get('/test-branch/1234/fullscreen/')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch fullscreen.html (no encoding)');
});
