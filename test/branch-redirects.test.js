const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('home redirects', async () => {
  const req = await request.get('/old/')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('/new/');
});

it('home redirects', async () => {
  const req = await request.get('/old')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('/new');
});

it('file redirects', async () => {
  const req = await request.get('/old/editor.html')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('/new/editor.html');
});

it('project id redirects', async () => {
  const req = await request.get('/old/1234/editor')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('/new/1234/editor');
});

it('nonsense txt redirects', async () => {
  const req = await request.get('/old/slkdjfskldfkjlsdfjklsdflkjs.txt')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('/new/slkdjfskldfkjlsdfjklsdflkjs.txt');
});

it('preserves query', async () => {
  const req = await request.get('/old/1234?fps=60')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('/new/1234?fps=60');
});

it('preserves empty query', async () => {
  const req = await request.get('/old/1234?')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('/new/1234?');
});

it('preserves complex query', async () => {
  const req = await request.get('/old/1234?fps=60&project_url=https://example.com/project.sb3&turbo')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('/new/1234?fps=60&project_url=https://example.com/project.sb3&turbo');
});

it('new does not redirect to old', () => {
  return request.get('/new/')
    .set('Host', 'notlocalhost')
    .expect(200);
});
