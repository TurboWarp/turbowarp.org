const path = require('path');

if (process.env.NODE_ENV !== 'test') {
  try {
    const hosts = require('../hosts.js');
    module.exports = hosts;
  } catch (e) {
    // ignore
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
