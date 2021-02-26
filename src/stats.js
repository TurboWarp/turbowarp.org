const logger = require('./logger');

const INTERVAL = 1000 * 5;

class Paths {
  constructor () {
    this.map = new Map();
  }

  increment(path) {
    if (this.map.has(path)) {
      this.map.set(path, this.map.get(path) + 1);
    } else if (this.map.size < 1000) {
      this.map.set(path, 1);
    }
  }
}

const createRequestData = () => ({
  total: 0,
  notFound: 0,
});

const createBrowserData = () => ({
  chrome: 0,
  firefox: 0,
  safari: 0,
  other: 0,
  none: 0
});

const createOSData = () => ({
  windows: 0,
  macos: 0,
  chromeos: 0,
  linux: 0,
  android: 0,
  ios: 0,
  other: 0,
  none: 0
});

let requests = createRequestData();
let browser = createBrowserData();
let os = createOSData();
let paths = new Paths();

const reset = () => {
  requests = createRequestData();
  browser = createBrowserData();
  os = createOSData();
  paths = new Paths();
};

const getData = () => ({
  requests,
  browser,
  os,
  paths
});

const print = () => {
  logger.info(`*** ${new Date().toUTCString()} ***`);

  logger.info('--- Requests ---');
  logger.info(`Requests: ${requests.total}`);
  logger.info(`     404: ${requests.notFound}`);

  logger.info('--- Paths ---');
  // TODO: this is going to be quite verbose
  for (const [path, hits] of paths.map.entries()) {
    logger.info(`${path} - ${hits}`);
  }

  logger.info('--- OS ---');
  logger.info(` Windows: ${os.windows}`);
  logger.info(`   macOS: ${os.macos}`);
  logger.info(`   Linux: ${os.linux}`);
  logger.info(`ChromeOS: ${os.chromeos}`);
  logger.info(` Android: ${os.android}`);
  logger.info(`     iOS: ${os.ios}`);
  logger.info(`   Other: ${os.other}`);
  logger.info(`    None: ${os.none}`);

  logger.info('--- Browsers ---');
  logger.info(`  Chrome: ${browser.chrome}`);
  logger.info(` Firefox: ${browser.firefox}`);
  logger.info(`  Safari: ${browser.safari}`);
  logger.info(`   Other: ${browser.other}`);
  logger.info(`    None: ${browser.none}`);

  reset();
};

if (process.env.NODE_ENV !== 'test') {
  setInterval(print, INTERVAL);
}

const handleRequest = (req) => {
  const dnt = req.headers['dnt'];
  if (dnt === '1') {
    return;
  }

  const userAgent = req.headers['user-agent'];
  if (typeof userAgent === 'string') {
    if (userAgent.indexOf('Chrome') !== -1) {
      browser.chrome++;
    } else if (userAgent.indexOf('Firefox') !== -1) {
      browser.firefox++;
    } else if (userAgent.indexOf('Safari') !== -1) {
      browser.safari++;
    } else {
      browser.other++;
    }

    if (userAgent.indexOf('Windows') !== -1) {
      os.windows++;
    } else if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPod') !== -1 || userAgent.indexOf('iPad') !== -1) {
      os.ios++;
    } else if (userAgent.indexOf('Mac OS') !== -1) {
      os.macos++;
    } else if (userAgent.indexOf('CrOS') !== -1) {
      os.chromeos++;
    } else if (userAgent.indexOf('Android') !== -1) {
      os.android++;
    } else if (userAgent.indexOf('Linux') !== -1) {
      os.linux++;
    } else {
      os.other++;
    }
  } else {
    browser.none++;
    os.none++;
  }
};

const handleServedFile = (path) => {
  requests.total++;
  paths.increment(path);
};

const handleNotFound = (path) => {
  requests.notFound++;
};

module.exports = {
  handleRequest,
  handleServedFile,
  handleNotFound,
  reset,
  getData
};
