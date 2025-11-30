const fs = require('fs');
const app = require('./server');
const logger = require('./logger');

const port = process.env.PORT || 8888;
app.listen(port, (err) => {
  if (err) {
    throw err;
  }

  // Update permissions of unix sockets
  if (typeof port === 'string' && port.startsWith('/')) {
    fs.chmod(port, 0o777, (err) => {
      if (err) {
        logger.error(`could not chmod unix socket: ${err}`);
        process.exit(1);
      }
    });
  }

  logger.info(`Listening on port ${port}`);
});
