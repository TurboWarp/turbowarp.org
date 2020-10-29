const br = {
  name: 'br',
  extension: 'br'
};
const gz = {
  name: 'gzip',
  extension: 'gz'
};

module.exports = {
  '.html': {
    type: 'text/html',
    encodings: [br, gz]
  },
  '.js': {
    type: 'text/javascript',
    encodings: [br, gz]
  }
};
