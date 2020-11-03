const path = require('path');

let applyDefaults = true;

if (process.env.NODE_ENV !== 'test') {
  try {
    // require() will throw if file does not exist, syntax error, etc.
    const hosts = require('../hosts.js');
    applyDefaults = false;
    module.exports = hosts;
  } catch (e) {
    if (e && typeof e === 'object' && e.code !== 'MODULE_NOT_FOUND') {
      console.error('could not read private hosts file');
      console.error(e);
      process.exit(1);
    }
  }
}

if (applyDefaults) {
  module.exports = {
    'localhost': {
      root: path.resolve('www'),
      branches: false
    },
    'example.com': {
      root: path.resolve('www2'),
      branches: true
    }
  };
}
