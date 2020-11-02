const fs = require('fs');
const app = require('./server');

const port = process.env.PORT || 8888;
app.listen(port, () => {
  // Update permissions of unix sockets
  if (typeof port === 'string' && port.startsWith('/')) {
    fs.chmod(port, 0o777, (err) => {
      if (err) {
        console.error(`could not chmod unix socket: ${err}`);
        process.exit(1);
      }
    });
  }
  console.log(`Listening on port ${port}`);
});
