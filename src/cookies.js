/**
 * @param {import("express").Request} req
 * @returns {Map<string, string>}
 */
const parseCookies = (req) => {
    const header = req.header('cookie');
    if (typeof header === 'undefined') {
        return new Map();
    }

    if (header.length > 1000) {
        return new Map();
    }

    // maybe not fully spec compliant, but it's good enough for what we use this for
    const cookies = new Map();
    for (const part of header.split(';')) {
        const equalsIndex = part.indexOf('=');
        if (equalsIndex !== -1) {
            const name = part.substring(0, equalsIndex).trim();
            const value = part.substring(equalsIndex + 1).trim();
            cookies.set(name, value);
        }
    }
    return cookies;
};

module.exports = parseCookies;
