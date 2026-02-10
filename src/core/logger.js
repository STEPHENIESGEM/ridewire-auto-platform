import winston from 'winston';
import config from './config.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`;
  }
  
  return msg;
});

// Create Winston logger instance
const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { service: 'ridewire-auto' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      ),
    }),
    
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ],
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Helper methods for common logging patterns
logger.diagnostic = (message, data) => {
  logger.info(`[DIAGNOSTIC] ${message}`, data);
};

logger.simulation = (message, data) => {
  logger.info(`[SIMULATION] ${message}`, data);
};

logger.agent = (agentName, message, data) => {
  logger.info(`[AGENT:${agentName}] ${message}`, data);
};

logger.api = (method, endpoint, status, duration) => {
  logger.info(`[API] ${method} ${endpoint} - ${status} (${duration}ms)`);
};

logger.nova = (message, data) => {
  logger.info(`[NOVA] ${message}`, data);
};

logger.ecommerce = (action, data) => {
  logger.info(`[E-COMMERCE] ${action}`, data);
};

// Performance logging
logger.performance = (operation, duration, metadata = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  logger.log(level, `[PERFORMANCE] ${operation} took ${duration}ms`, metadata);
};

// Security logging
logger.security = (event, data) => {
  logger.warn(`[SECURITY] ${event}`, data);
};

export default logger;
