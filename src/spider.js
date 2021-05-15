const isSpider = (userAgent) => {
    if (typeof userAgent !== 'string') {
        return false;
    }
    return (
        userAgent.includes('Googlebot') ||
        userAgent.includes('Discordbot') ||
        userAgent.includes('bingbot') ||
        userAgent.includes('Twitterbot')
    );
};

module.exports = isSpider;
