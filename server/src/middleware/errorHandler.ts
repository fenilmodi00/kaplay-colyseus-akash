/**
 * Error handling middleware for Express and Colyseus
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Express error handling middleware
 */
export function errorHandler(
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error with context
  logger.error('Express Error', {
    method: req.method,
    url: req.url,
    status,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    ip: req.ip || req.connection.remoteAddress,
  }, err);

  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  const responseMessage = isProduction && status === 500 ? 'Internal Server Error' : message;

  res.status(status).json({
    error: {
      message: responseMessage,
      status,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  logger.warn('Route Not Found', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    ip: req.ip || req.connection.remoteAddress,
  });

  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Process-level error handlers
 */
export function setupProcessErrorHandlers(): void {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {}, error);
    // Give time for logs to flush before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason?.toString(),
      promise: promise?.toString(),
    });
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal: string) => {
    logger.info('Graceful Shutdown Initiated', { signal });
    
    // Give time for cleanup and log flushing
    setTimeout(() => {
      logger.info('Graceful Shutdown Complete');
      process.exit(0);
    }, 5000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}