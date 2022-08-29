const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('returns 404 for user page', () => {
  return request.get('/users/griffpatch')
    .set('Host', 'localhost')
    .expect(404, /User Pages Not Supported/);
});
