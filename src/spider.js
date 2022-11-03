const isSpider = (userAgent) => {
    if (typeof userAgent !== 'string') {
        return false;
    }
    return (
        userAgent.includes('Googlebot') ||
        userAgent.includes('Discordbot') ||
        userAgent.includes('bingbot') ||
        userAgent.includes('YandexBot') ||
        userAgent.includes('Applebot') ||
        userAgent.includes('Embedly') ||
        userAgent.includes('Slackbot') ||
        userAgent.includes('redditbot') ||
        userAgent.includes('WhatsApp') ||
        userAgent.includes('TelegramBot') ||
        userAgent.includes('Twitterbot') ||
        userAgent.includes('Mastodon') ||
        userAgent.includes('LinkedInBot') ||
        userAgent.includes('Baiduspider') ||
        userAgent.includes('DuckDuckBot') ||
        userAgent.includes('facebookexternalhit') ||
        userAgent.includes('Applebot') ||
        userAgent.includes('MojeekBot')
    );
};

module.exports = isSpider;
