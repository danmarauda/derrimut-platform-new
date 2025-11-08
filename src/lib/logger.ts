/**
 * Structured Logger Utility
 *
 * Provides consistent, structured logging across the application
 * Uses Winston for server-side logging and console for client-side
 */

import winston from 'winston';

/**
 * Log levels (ordered by severity)
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug',
}

/**
 * Log context interface
 */
export interface LogContext {
  [key: string]: any;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    message: string;
    name: string;
    stack?: string;
  };
}

/**
 * Winston Logger Configuration (Server-side)
 */
const createWinstonLogger = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isServer = typeof window === 'undefined';

  if (!isServer) {
    // Return null for client-side (will use console fallback)
    return null;
  }

  return winston.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          ...meta,
        });
      })
    ),
    defaultMeta: {
      service: 'derrimut-platform',
      environment: process.env.NODE_ENV || 'development',
    },
    transports: [
      // Console transport for all environments
      new winston.transports.Console({
        format: isDevelopment
          ? winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                return `${timestamp} [${level}]: ${message} ${metaStr}`;
              })
            )
          : winston.format.json(),
      }),
      // File transport for errors
      ...(process.env.LOG_FILE_PATH
        ? [
            new winston.transports.File({
              filename: `${process.env.LOG_FILE_PATH}/error.log`,
              level: 'error',
              maxsize: 10485760, // 10MB
              maxFiles: 5,
            }),
            new winston.transports.File({
              filename: `${process.env.LOG_FILE_PATH}/combined.log`,
              maxsize: 10485760, // 10MB
              maxFiles: 5,
            }),
          ]
        : []),
    ],
    exceptionHandlers: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ],
    rejectionHandlers: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ],
  });
};

/**
 * Client-side console logger
 */
const consoleLogger = {
  error: (message: string, context?: LogContext) => {
    console.error(`[ERROR] ${message}`, context || '');
  },
  warn: (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${message}`, context || '');
  },
  info: (message: string, context?: LogContext) => {
    console.info(`[INFO] ${message}`, context || '');
  },
  http: (message: string, context?: LogContext) => {
    console.log(`[HTTP] ${message}`, context || '');
  },
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  },
};

// Create Winston logger instance (server-side only)
const winstonLogger = createWinstonLogger();

/**
 * Unified Logger Class
 */
class Logger {
  private useWinston = typeof window === 'undefined' && winstonLogger !== null;

  /**
   * Log error messages
   */
  error(message: string, context?: LogContext) {
    if (this.useWinston && winstonLogger) {
      winstonLogger.error(message, context);
    } else {
      consoleLogger.error(message, context);
    }

    // Send to external error tracking (Sentry) if available
    if (typeof window !== 'undefined' && (window as any).Sentry && context?.error) {
      (window as any).Sentry.captureException(new Error(message), {
        contexts: { additional: context },
        level: 'error',
      });
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext) {
    if (this.useWinston && winstonLogger) {
      winstonLogger.warn(message, context);
    } else {
      consoleLogger.warn(message, context);
    }
  }

  /**
   * Log info messages
   */
  info(message: string, context?: LogContext) {
    if (this.useWinston && winstonLogger) {
      winstonLogger.info(message, context);
    } else {
      consoleLogger.info(message, context);
    }
  }

  /**
   * Log HTTP requests
   */
  http(message: string, context?: LogContext) {
    if (this.useWinston && winstonLogger) {
      winstonLogger.http(message, context);
    } else {
      consoleLogger.http(message, context);
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: LogContext) {
    if (this.useWinston && winstonLogger) {
      winstonLogger.debug(message, context);
    } else {
      consoleLogger.debug(message, context);
    }
  }

  /**
   * Performance logging
   */
  performance(operation: string, duration: number, context?: LogContext) {
    this.info(`Performance: ${operation}`, {
      ...context,
      duration,
      performance: true,
    });
  }

  /**
   * API request logging
   */
  apiRequest(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    this.http(`${method} ${path} ${statusCode}`, {
      ...context,
      method,
      path,
      statusCode,
      duration,
    });
  }

  /**
   * Database query logging
   */
  query(operation: string, duration: number, context?: LogContext) {
    this.debug(`Database: ${operation}`, {
      ...context,
      duration,
      database: true,
    });
  }

  /**
   * Security event logging
   */
  security(event: string, context?: LogContext) {
    this.warn(`Security: ${event}`, {
      ...context,
      security: true,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types
export type { LogContext };

// Default export
export default logger;
