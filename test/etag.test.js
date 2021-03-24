const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

let indexEtag;

it('returns etags', () => {
  return request.get('/')
    .set('Host', 'localhost')
    .then((res) => {
      const etag = res.headers['etag'];
      expect(etag).toMatch(/^W\//);
      indexEtag = etag;
    })
});

it('returns 304 when unmodified', () => {
  if (!indexEtag) throw new Error('(previous test failed, skipping)');
  return request.get('/')
    .set('Host', 'localhost')
    .set('If-None-Match', indexEtag)
    .expect(304)
    .expect('ETag', indexEtag)
    .expect('Vary', /^.+$/)
    .expect('Cache-Control', /^.+$/);
});
