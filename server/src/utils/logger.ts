/**
 * Structured logging utility for production monitoring
 */

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Human-readable format for development
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
      const errorStr = entry.error ? ` ERROR: ${entry.error.message}` : '';
      return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}${errorStr}`;
    } else {
      // JSON format for production structured logging
      return JSON.stringify(entry);
    }
  }

  private log(level: LogEntry['level'], message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    const logOutput = this.formatLog(entry);

    switch (level) {
      case 'error':
        console.error(logOutput);
        break;
      case 'warn':
        console.warn(logOutput);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(logOutput);
        }
        break;
      default:
        console.log(logOutput);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  // Specific logging methods for common scenarios
  gameEvent(event: string, context?: LogContext): void {
    this.info(`Game Event: ${event}`, { ...context, category: 'game' });
  }

  connectionEvent(event: string, sessionId?: string, context?: LogContext): void {
    this.info(`Connection Event: ${event}`, { 
      ...context, 
      category: 'connection', 
      sessionId 
    });
  }

  performanceMetric(metric: string, value: number, unit: string, context?: LogContext): void {
    this.info(`Performance Metric: ${metric}`, { 
      ...context, 
      category: 'performance', 
      metric, 
      value, 
      unit 
    });
  }

  securityEvent(event: string, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, { ...context, category: 'security' });
  }
}

export const logger = new Logger();