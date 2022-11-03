const supertest = require('supertest');
const app = require('../src/server');
const request = supertest(app);

const BOT_USER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

it('returns opengraph to spider on index', async () => {
    return request.get('/437419376')
        .set('User-Agent', BOT_USER_AGENT)
        .set('Host', 'opengraph')
        .expect(200)
        .expect(/<meta property="og:title" content="Bouncing/)
        .expect(/<meta property="og:image" content="https:\/\/trampoline\.turbowarp\.org\/thumbnails\//);
});

it('returns opengraph to spider in editor', async () => {
    return request.get('/437419376/editor')
        .set('User-Agent', BOT_USER_AGENT)
        .set('Host', 'opengraph')
        .expect(200)
        .expect(/<meta property="og:title" content="Bouncing/);
});

it('returns opengraph to spider in fullscreen', async () => {
    return request.get('/437419376/fullscreen')
        .set('User-Agent', BOT_USER_AGENT)
        .set('Host', 'opengraph')
        .expect(200)
        .expect(/<meta property="og:title" content="Bouncing/);
});
