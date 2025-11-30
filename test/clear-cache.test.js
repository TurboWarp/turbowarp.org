const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('does not serve clear-site-data by default', async () => {
  const data = await request.get('/').set('Host', 'localhost');
  expect(data.headers['clear-site-data']).toBeUndefined();
});

it('servers clear-site-data for cookie', async () => {
  await request.get('/')
    .set('Host', 'localhost')
    .set('Cookie', 'tw_clear_cache_once=1')
    .expect('clear-site-data', '"cache"')
    .expect('set-cookie', /tw_clear_cache_once=;/);
});

it('servers clear-site-data for slightly strange cookie', async () => {
  await request.get('/')
    .set('Host', 'localhost')
    .set('Cookie', 'a = b  ; tw_clear_cache_once = 1     ; c=   d')
    .expect('clear-site-data', '"cache"')
    .expect('set-cookie', /tw_clear_cache_once=;/);
});
