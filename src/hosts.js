const path = require('path');
const environment = require('./environment');

const readPrivateHosts = () => {
  try {
    // require() will throw if file does not exist, syntax error, etc.
    const hosts = require('../hosts.js');
    if (hosts) {
      return hosts;
    }
  } catch (e) {
    // If there was an error that wasn't caused by the file not existing, stop the process.
    if (e && typeof e === 'object' && e.code !== 'MODULE_NOT_FOUND') {
      console.error('could not read private hosts file');
      console.error(e);
      process.exit(1);
    }
  }
  return null;
};

if (environment.isTest) {
  module.exports = {
    'localhost': {
      root: path.join(__dirname, '../test/localhost'),
      branches: false
    },
    'notlocalhost': {
      root: path.join(__dirname, '../test/notlocalhost'),
      branches: true
    }
  };
} else {
  const privateHosts = readPrivateHosts();
  const defaultHosts = {
    'localhost': {
      root: path.resolve('www'),
      branches: false
    }
  };
  module.exports = privateHosts || defaultHosts;
}
