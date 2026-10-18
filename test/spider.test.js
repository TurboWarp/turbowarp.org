const { it } = require('node:test');
const assert = require('node:assert/strict');
const isSpider = require('../src/spider');

it('validates spider', () => {
    assert.equal(isSpider(undefined), false);
    assert.equal(isSpider(null), false);
    assert.equal(isSpider(''), false);
    assert.equal(isSpider('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0'), false);
    assert.equal(isSpider('Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'), true);
});
