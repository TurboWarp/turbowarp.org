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
  '.txt': {
    type: 'text/plain'
  },
  '.map': {
    type: 'application/json'
  },
  '.webmanifest': {
    type: 'application/json'
  },
  '.svg': {
    type: 'image/svg+xml',
    encodings: [br, gz]
  },
  '.png': {
    type: 'image/png'
  },
  '.jpg': {
    type: 'image/jpeg'
  },
  '.gif': {
    type: 'image/gif'
  },
  '.ico': {
    type: 'image/x-icon'
  },
  '.cur': {
    type: 'image/x-icon',
  },
  '.mp3': {
    type: 'audio/mpeg',
  },
  '.wav': {
    type: 'audio/wav'
  },
  '.ogg': {
    type: 'audio/ogg'
  }
};
