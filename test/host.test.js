const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('serves static files from localhost', async () => {
  return request.get('/index.html')
    .set('Host', 'localhost')
    .expect(200);
});

it('serves static files from notlocalhost', async () => {
  return request.get('/test.html')
    .set('Host', 'notlocalhost')
    .expect(200);
});

it('returns 400 if invalid host', async () => {
  return request.get('/')
    .set('Host', 'lskdfksldfjlksdfjlksdflskdf.com')
    .expect(400);
});
