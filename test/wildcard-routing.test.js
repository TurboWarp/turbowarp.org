const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('serves project page without trailing slash', () => {
  return request.get('/1234')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('index.html (no encoding)');
});

it('serves project page with trailing slash', () => {
  return request.get('/1234/')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('index.html (no encoding)');
});

it('serves editor without trailing slash', () => {
  return request.get('/1234/editor')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('editor.html (no encoding)');
});

it('serves editor with trailing slash', () => {
  return request.get('/1234/editor/')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('editor.html (no encoding)');
});

it('serves embed without trailing slash', () => {
  return request.get('/1234/embed')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('embed.html (no encoding)');
});

it('serves embed with trailing slash', () => {
  return request.get('/1234/embed/')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('embed.html (no encoding)');
});

it('serves fullscreen without trailing slash', () => {
  return request.get('/1234/fullscreen')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('fullscreen.html (no encoding)');
});

it('serves fullscreen with trailing slash', () => {
  return request.get('/1234/fullscreen/')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('fullscreen.html (no encoding)');
});

it('serves addons without trailing slash', () => {
  return request.get('/addons')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('addons.html');
});

it('serves addons with trailing slash', () => {
  return request.get('/addons/')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('addons.html');
});

it('does not serve addons with ID', () => {
  return request.get('/1234/addons/')
    .set('Host', 'localhost')
    .set('Accept-Encoding', '')
    .expect(404)
});

it('serves project page without trailing slash in branch', () => {
  return request.get('/test-branch/1234')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch index.html (no encoding)');
});

it('serves project page with trailing slash in branch', () => {
  return request.get('/test-branch/1234/')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch index.html (no encoding)');
});

it('serves editor without trailing slash in branch', () => {
  return request.get('/test-branch/1234/editor')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch editor.html (no encoding)');
});

it('serves editor with trailing slash in branch', () => {
  return request.get('/test-branch/1234/editor/')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch editor.html (no encoding)');
});

it('serves fullscreen without trailing slash in branch', () => {
  return request.get('/test-branch/1234/fullscreen')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch fullscreen.html (no encoding)');
});

it('serves fullscreen with trailing slash in branch', () => {
  return request.get('/test-branch/1234/fullscreen/')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch fullscreen.html (no encoding)');
});

it('serves embed without trailing slash in branch', () => {
  return request.get('/test-branch/1234/embed')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch embed.html (no encoding)');
});

it('serves embed with trailing slash in branch', () => {
  return request.get('/test-branch/1234/embed/')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('test-branch embed.html (no encoding)');
});

it('serves addons without trailing slash in branch', () => {
  return request.get('/test-branch/addons')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('addons.html (test-branch)');
});

it('serves addons with trailing slash in branch', () => {
  return request.get('/test-branch/addons/')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(200)
    .expect('addons.html (test-branch)');
});

it('when wildcard route file does not exist, return 404', () => {
  return request.get('/new/addons/')
    .set('Host', 'notlocalhost')
    .set('Accept-Encoding', '')
    .expect(404)
});

it('redirects /projects/id to /id', () => {
  return request.get('/projects/104')
    .set('Host', 'localhost')
    .expect('Location', '/104')
});

it('redirects /projects/id/ to /id', () => {
  return request.get('/projects/104/')
    .set('Host', 'localhost')
    .expect('Location', '/104')
});

it('redirects /projects/id to /id with query', () => {
  return request.get('/projects/104?test')
    .set('Host', 'localhost')
    .expect('Location', '/104?test')
});

it('redirects /projects/id/ to /id with query', () => {
  return request.get('/projects/104/?test')
    .set('Host', 'localhost')
    .expect('Location', '/104?test')
});

it('redirects /projects/id to /id', () => {
  return request.get('/projects/104')
    .set('Host', 'localhost')
    .expect('Location', '/104')
});

it('redirects /projects/id/editor to /id/editor', () => {
  return request.get('/projects/104/editor')
    .set('Host', 'localhost')
    .expect('Location', '/104/editor');
});

it('redirects /projects/id/editor/ to /id/editor', () => {
  return request.get('/projects/104/editor/')
    .set('Host', 'localhost')
    .expect('Location', '/104/editor');
});

it('redirects /projects/id/fullscreen/ to /id/fullscreen', () => {
  return request.get('/projects/104/fullscreen/')
    .set('Host', 'localhost')
    .expect('Location', '/104/fullscreen');
});

it('redirects /projects/id/fullscreen to /id/fullscreen', () => {
  return request.get('/projects/104/fullscreen')
    .set('Host', 'localhost')
    .expect('Location', '/104/fullscreen');
});

it('redirects /projects/id/embed to /id/embed', () => {
  return request.get('/projects/104/embed')
    .set('Host', 'localhost')
    .expect('Location', '/104/embed');
});

it('redirects /projects/id/embed to /id/embed/', () => {
  return request.get('/projects/104/embed/')
    .set('Host', 'localhost')
    .expect('Location', '/104/embed');
});

it('redirects /https://scratch.mit.edu/projects/id to /id', () => {
  return request.get('/https://scratch.mit.edu/projects/104')
    .set('Host', 'localhost')
    .expect('Location', '/104')
});

it('redirects /https://scratch.mit.edu/projects/id/ to /id', () => {
  return request.get('/https://scratch.mit.edu/projects/104')
    .set('Host', 'localhost')
    .expect('Location', '/104')
});

it('redirects /https://scratch.mit.edu/projects/id/editor to /id/editor', () => {
  return request.get('/https://scratch.mit.edu/projects/104/editor')
    .set('Host', 'localhost')
    .expect('Location', '/104/editor')
});

it('redirects /https://scratch.mit.edu/projects/id/editor/ to /id/editor', () => {
  return request.get('/https://scratch.mit.edu/projects/104/editor/')
    .set('Host', 'localhost')
    .expect('Location', '/104/editor')
});

it('redirects /https://scratch.mit.edu/projects/id/fullscreen/ to /id/fullscreen', () => {
  return request.get('/https://scratch.mit.edu/projects/104/fullscreen/')
    .set('Host', 'localhost')
    .expect('Location', '/104/fullscreen')
});

it('redirects /https://scratch.mit.edu/projects/id/fullscreen/ to /id/fullscreen', () => {
  return request.get('/https://scratch.mit.edu/projects/104/fullscreen/')
    .set('Host', 'localhost')
    .expect('Location', '/104/fullscreen')
});

it('redirects /https://scratch.mit.edu/projects/id/embed/ to /id/embed', () => {
  return request.get('/https://scratch.mit.edu/projects/104/embed/')
    .set('Host', 'localhost')
    .expect('Location', '/104/embed')
});

it('redirects /https://scratch.mit.edu/projects/id/embed/ to /id/embed', () => {
  return request.get('/https://scratch.mit.edu/projects/104/embed/')
    .set('Host', 'localhost')
    .expect('Location', '/104/embed')
});
