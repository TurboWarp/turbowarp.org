const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('interpolation: index redirects', async () => {
  const req = await request.get('/interpolation/')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('https://turbowarp.org/?interpolate');
});
it('interpolation: project id redirects preserving query', async () => {
  const req = await request.get('/interpolation/1234/editor?fps=60&turbo')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('https://turbowarp.org/1234/editor?fps=60&turbo&interpolate');
});
it('interpolated-60: index redirects', async () => {
  const req = await request.get('/interpolated-60/')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('https://turbowarp.org/?interpolate');
});
it('interpolated-60: project id redirects preserving query', async () => {
  const req = await request.get('/interpolated-60/1234/editor?fps=60&turbo')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('https://turbowarp.org/1234/editor?fps=60&turbo&interpolate');
});
it('sounds-no-yield: index redirects', async () => {
  const req = await request.get('/sounds-no-yield/')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('https://turbowarp.org/?limitless');
});
it('sounds-no-yield: project id redirects preserving query', async () => {
  const req = await request.get('/sounds-no-yield/1234/editor?fps=60&turbo')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('https://turbowarp.org/1234/editor?fps=60&turbo&limitless');
});
it('no-limits: index redirects', async () => {
  const req = await request.get('/no-limits/')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('https://turbowarp.org/?limitless');
});
it('no-limits: project id redirects preserving query', async () => {
  const req = await request.get('/no-limits/1234/editor?fps=60&turbo')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('https://turbowarp.org/1234/editor?fps=60&turbo&limitless');
});

it('unsandboxed-extensions: redirects', async () => {
  const req = await request.get('/unsandboxed-extensions/editor?extension=https://extensions.turbowarp.org/fetch.js')
    .set('Host', 'notlocalhost')
    .expect(302);
  expect(req.headers['location']).toBe('https://turbowarp.org/editor?extension=https://extensions.turbowarp.org/fetch.js');
});
