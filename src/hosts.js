const path = require('path');

if (process.env.NODE_ENV !== 'test') {
  try {
    const hosts = require('../hosts.js');
    module.exports = hosts;
  } catch (e) {
    if (e && typeof e === 'object' && e.code !== 'MODULE_NOT_FOUND') {
      console.error('could not read private hosts file');
      console.error(e);
      process.exit(1);
    }
  }
}

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
