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
  },
  '.js': {
    type: 'text/javascript',
    encodings: [br, gz]
  },
  '.svg': {
    type: 'image/svg+xml',
    encodings: [br, gz]
  },
  '.cur': {
    type: 'image/x-icon',
  },
  'mp3': {
    type: 'audio/mpeg',
  }
};
