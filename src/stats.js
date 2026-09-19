const logger = require('./logger');
const environment = require('./environment');
const metrics = require('./metrics');

const INTERVAL = 1000 * 60 * 60;

const createPathsData = () => new Map();

const createUniquesData = () => new Set();

let paths = createPathsData();
let uniques = createUniquesData();
const reset = () => {
  paths = createPathsData();
  uniques = createUniquesData();
};

const print = () => {
  logger.info(`*** ${new Date().toUTCString()} ***`);

  logger.info(` Uniques: ${uniques.size}`);

  logger.info('--- Paths ---');
  const entries = Array.from(paths.entries()).sort((a, b) => b[1] - a[1]);
  for (const [path, hits] of entries) {
    logger.info(`${path} - ${hits}`);
  }

  reset();
};

if (!environment.isTest) {
  setInterval(print, INTERVAL);
}

const handleRequest = (req) => {
  // We will interpret these headers as a sign that the user is privacy-conscious and doesn't
  // want to be tracked at all. This isn't really tracking but we will respect them anyways.
  if (req.headers['dnt'] !== '1' && req.headers['sec-gpc'] !== '1') {
    const ip = req.ip;
    uniques.add(ip);
  }

  const userAgent = req.headers['user-agent'];
  let browser;
  let os;
  if (typeof userAgent === 'string') {
    if (userAgent.indexOf('Chrome') !== -1) {
      browser = 'chrome';
    } else if (userAgent.indexOf('Firefox') !== -1) {
      browser = 'firefox';
    } else if (userAgent.indexOf('Safari') !== -1) {
      browser = 'safari';
    } else {
      browser = 'other';
    }

    if (userAgent.indexOf('Windows') !== -1) {
      os = 'windows';
    } else if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPod') !== -1 || userAgent.indexOf('iPad') !== -1) {
      os = 'ios';
    } else if (userAgent.indexOf('Mac OS') !== -1) {
      os = 'macos';
    } else if (userAgent.indexOf('CrOS') !== -1) {
      os = 'chromeos';
    } else if (userAgent.indexOf('Android') !== -1) {
      os = 'android';
    } else if (userAgent.indexOf('Linux') !== -1) {
      os = 'linux';
    } else {
      os = 'other';
    }
  } else {
    browser = 'none';
    os = 'none';
  }

  metrics.userAgents.inc({
    browser,
    os
  });
};

const handleServedFile = (path) => {
  if (paths.has(path)) {
    paths.set(path, paths.get(path) + 1);
  } else {
    paths.set(path, 1);
  }
};

module.exports = {
  handleRequest,
  handleServedFile
};
