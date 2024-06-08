const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

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

it('redirects /id) to /id', () => {
  return request.get('/104)')
    .set('Host', 'localhost')
    .expect('Location', '/104');
});

it('redirects /id/editor) to /id/editor', () => {
  return request.get('/104/editor)')
    .set('Host', 'localhost')
    .expect('Location', '/104/editor');
});

it('redirects /id/editor/) to /id', () => {
  return request.get('/104/editor/)')
    .set('Host', 'localhost')
    .expect('Location', '/104/editor');
});

it('redirects /id)))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))) to /id', () => {
  return request.get('/104))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))')
    .set('Host', 'localhost')
    .expect('Location', '/104');
});
