const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

it('returns opengraph to spider on index', async () => {
    return request.get('/437419376')
        .set('User-Agent', 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)')
        .set('Host', 'opengraph')
        .expect(200)
        .expect(/<meta property="og:title" content="Bouncing/)
        .expect(/<meta property="og:image" content="https:\/\/cdn2\.scratch\.mit\.edu\//);
});

it('returns opengraph to spider in editor', async () => {
    return request.get('/437419376/editor')
        .set('User-Agent', 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)')
        .set('Host', 'opengraph')
        .expect(200)
        .expect(/<meta property="og:title" content="Bouncing/);
});

it('returns opengraph to spider in fullscreen', async () => {
    return request.get('/437419376/fullscreen')
        .set('User-Agent', 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)')
        .set('Host', 'opengraph')
        .expect(200)
        .expect(/<meta property="og:title" content="Bouncing/);
});
