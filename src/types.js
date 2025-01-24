const br = {
  name: 'br',
  extension: 'br'
};
const gz = {
  name: 'gzip',
  extension: 'gz'
};
const zstd = {
  name: 'zstd',
  extension: 'zst'
};

module.exports = {
  '.html': {
    type: 'text/html; charset=utf-8',
    encodings: [br, zstd, gz]
  },
  '.js': {
    type: 'text/javascript; charset=utf-8',
    encodings: [br, zstd, gz]
  },
  '.txt': {
    type: 'text/plain'
  },
  '.map': {
    type: 'application/json',
    encodings: [gz]
  },
  '.webmanifest': {
    type: 'application/json'
  },
  '.svg': {
    type: 'image/svg+xml',
    encodings: [br, zstd, gz]
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
    type: 'image/x-icon'
  },
  '.mp3': {
    type: 'audio/mpeg'
  },
  '.wav': {
    type: 'audio/wav'
  },
  '.ogg': {
    type: 'audio/ogg'
  },
  '.ttf': {
    type: 'font/ttf',
    encodings: [br, zstd, gz]
  },
  '.otf': {
    type: 'font/otf',
    encodings: [br, zstd, gz]
  },
  '.woff': {
    type: 'font/woff'
  },
  '.woff2': {
    type: 'font/woff2'
  },
  '.hex': {
    type: 'application/octet-stream'
  }
};
