const winston = require('winston');
const path = require('path');

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(logColors);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Define file format (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports = [
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  }),
  
  // File transport for error logs only
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  }),
];

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: process.env.LOG_LEVEL || 'debug'
    })
  );
}

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels: logLevels,
  format: fileFormat,
  transports,
  exitOnError: false
});

// Create child loggers for different modules
const createModuleLogger = (module) => {
  return logger.child({ module });
};

// Morgan stream for HTTP logs
const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Helper functions
const logError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    code: error.code || 'UNKNOWN_ERROR',
    statusCode: error.statusCode || 500,
    timestamp: new Date().toISOString()
  };

  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.user?.id || 'anonymous',
      requestId: req.requestId
    };
  }

  logger.error('Application Error', errorInfo);
};

const logInfo = (message, meta = {}) => {
  logger.info(message, {
    timestamp: new Date().toISOString(),
    ...meta
  });
};

const logWarn = (message, meta = {}) => {
  logger.warn(message, {
    timestamp: new Date().toISOString(),
    ...meta
  });
};

const logDebug = (message, meta = {}) => {
  logger.debug(message, {
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Database query logger
const logQuery = (query, params = [], duration = null) => {
  const logData = {
    query: query.replace(/\s+/g, ' ').trim(),
    params,
    timestamp: new Date().toISOString()
  };

  if (duration !== null) {
    logData.duration = `${duration}ms`;
  }

  logger.debug('Database Query', logData);
};

// API request logger
const logApiRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    user: req.user?.id || 'anonymous',
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  };

  if (req.body && Object.keys(req.body).length > 0) {
    // Log body but mask sensitive fields
    const maskedBody = { ...req.body };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    
    sensitiveFields.forEach(field => {
      if (maskedBody[field]) {
        maskedBody[field] = '***masked***';
      }
    });
    
    logData.body = maskedBody;
  }

  if (res.statusCode >= 400) {
    logger.warn('API Request', logData);
  } else {
    logger.info('API Request', logData);
  }
};

// Audit logger
const logAudit = (action, resource, user, details = {}) => {
  logger.info('Audit Log', {
    action,
    resource,
    user: user?.id || 'anonymous',
    userEmail: user?.email,
    details,
    timestamp: new Date().toISOString()
  });
};

// Performance logger
const logPerformance = (operation, duration, meta = {}) => {
  logger.info('Performance Log', {
    operation,
    duration: `${duration}ms`,
    ...meta,
    timestamp: new Date().toISOString()
  });
};

// Security logger
const logSecurity = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Export logger and utilities
module.exports = {
  logger,
  createModuleLogger,
  morganStream,
  logError,
  logInfo,
  logWarn,
  logDebug,
  logQuery,
  logApiRequest,
  logAudit,
  logPerformance,
  logSecurity,
  
  // Helper to create logger instance
  createLogger: () => logger
};