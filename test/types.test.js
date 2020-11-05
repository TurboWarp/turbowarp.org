const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('serves html with the proper Content-Type', async () => {
  return request.get('/index.html')
    .set('Host', 'localhost')
    .expect('Content-Type', 'text/html');
});

it('serves js with the proper Content-Type', async () => {
  return request.get('/file.js')
    .set('Host', 'localhost')
    .expect('Content-Type', 'text/javascript');
});
