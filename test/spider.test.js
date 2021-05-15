const isSpider = require('../src/spider');

it('validates spider', () => {
    expect(isSpider(undefined)).toBe(false);
    expect(isSpider(null)).toBe(false);
    expect(isSpider('')).toBe(false);
    expect(isSpider('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0')).toBe(false);
    expect(isSpider('Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)')).toBe(true);
});
