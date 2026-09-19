const http = require('http');
const client = require('@prometheus-io/client');
const logger = require('./logger');

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status']
});

const userAgents = new client.Counter({
  name: 'turbowarp_user_agents_total',
  help: 'Requests by browser and OS',
  labelNames: ['browser', 'os']
});

const getLowCardinalityPath = (req) => {
  // Explicit route name
  if (req.metricsRoute) {
    return req.metricsRoute;
  }
  // Express route
  if (req.route && typeof req.route.path === 'string') {
    return (req.baseUrl || '') + req.route.path;
  }
  // Fallback - don't let 404 explode cardinality
  return 'other';
};

const middleware = (req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('close', () => {
    try {
      const labels = {
        method: req.method,
        route: getLowCardinalityPath(req),
        status: res.writableFinished ? res.statusCode : 'aborted'
      };
      httpRequests.inc(labels);
      end(labels);
    } catch (error) {
      logger.error('' + ((error && error.stack) || error));
    }
  });
  next();
};

const listen = () => {
  if (!process.env.METRICS_PORT) {
    return;
  }

  const port = +process.env.METRICS_PORT;
  client.collectDefaultMetrics();

  const metricsServer = http.createServer((req, res) => {
    client.register.metrics()
      .then((body) => {
        res.setHeader('Content-Type', client.register.contentType);
        res.end(body);
      })
      .catch((error) => {
        logger.error('' + ((error && error.stack) || error));
        res.statusCode = 500;
        res.end();
      });
  });

  metricsServer.listen(port, '127.0.0.1', () => {
    logger.info(`Metrics on port ${port}`);
  });
};

module.exports = {
  userAgents,
  middleware,
  listen
};
