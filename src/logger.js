const winston = require('winston');
require('winston-daily-rotate-file');

const environment = require('./environment');

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

const logger = winston.createLogger({
  level: environment.isDevelopment ? 'debug' : 'info',
  format: format
});

logger.add(new winston.transports.DailyRotateFile({
  filename: '%DATE%.log',
  // LOGS_DIRECTORY is used by systemd services with the LogsDirectory= directive
  dirname: process.env.LOGS_DIRECTORY || 'logs',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
  createSymlink: true,
}));

logger.add(new winston.transports.Console({
  format: winston.format.combine(
    // Include color when logging to console, not when logging to file (results in ugly escape codes)
    winston.format.colorize(),
    format
  )
}));

module.exports = logger;
