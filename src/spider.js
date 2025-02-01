const isSpider = (userAgent) => {
    if (typeof userAgent !== 'string') {
        return false;
    }

    // This list in in large based on https://github.com/monperrus/crawler-user-agents/blob/master/crawler-user-agents.json
    // which is under this license:
    // The MIT License (MIT)
    // Copyright (c) 2017 Martin Monperrus
    //
    // Permission is hereby granted, free of charge, to any person obtaining a copy of
    // this software and associated documentation files (the "Software"), to deal in
    // the Software without restriction, including without limitation the rights to
    // use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    // the Software, and to permit persons to whom the Software is furnished to do so,
    // subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be included in all
    // copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    // FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    // COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    // IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    // CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    //
    // There are some differences though; this list is much smaller because we only want to include
    // crawlers where the extra open graph tags we put in will actually be useful to end users.
    // So we want things like search engines, social media, and chat apps generating link previews,
    // but don't need to waste time handling AI bots slurping up the entire internet, we have no
    // useful data for them anyways.
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
        userAgent.includes('MojeekBot') ||
        userAgent.includes('Bluesky') ||
        userAgent.includes('Skype') ||
        userAgent.includes('Pinterest') ||
        userAgent.includes('search.marginalia.nu') ||
        userAgent.includes('Valve/Steam') ||
        userAgent.includes('Iframely') ||
        userAgent.includes('opengraph') ||
        userAgent.includes('OpenGraph') ||
        userAgent.includes('GroupMeBot') ||
        userAgent.includes('KeybaseBot')
    );
};

module.exports = isSpider;
