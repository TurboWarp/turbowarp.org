const SPIDERS = [
    'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
];

const isSpider = (userAgent) => {
    return SPIDERS.includes(userAgent);
};

module.exports = isSpider;
