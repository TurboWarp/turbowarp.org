const path = require('path');

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
