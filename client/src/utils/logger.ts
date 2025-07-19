/**
 * Client-side logging utility for monitoring and debugging
 */

export interface ClientLogContext {
  [key: string]: any;
}

export interface ClientLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: ClientLogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  url?: string;
  userAgent?: string;
}

class ClientLogger {
  private isDevelopment: boolean;
  private logs: ClientLogEntry[] = [];
  private maxLogs: number = 100; // Keep last 100 logs in memory

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.setupErrorHandlers();
  }

  private setupErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('Uncaught Error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, event.error);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason?.toString(),
      });
    });
  }

  private formatLog(entry: ClientLogEntry): string {
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

  private log(level: ClientLogEntry['level'], message: string, context?: ClientLogContext, error?: Error): void {
    const entry: ClientLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Store in memory (for potential server reporting)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
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

    // In production, consider sending critical errors to server
    if (!this.isDevelopment && level === 'error') {
      this.reportErrorToServer(entry);
    }
  }

  private async reportErrorToServer(entry: ClientLogEntry): Promise<void> {
    try {
      // Only report in production and if server is available
      const serverUrl = import.meta.env.VITE_SERVER_URL;
      if (!serverUrl) return;

      await fetch(`${serverUrl}/client-error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silently fail - don't create error loops
      });
    } catch {
      // Silently fail - don't create error loops
    }
  }

  info(message: string, context?: ClientLogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: ClientLogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: ClientLogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  debug(message: string, context?: ClientLogContext): void {
    this.log('debug', message, context);
  }

  // Specific logging methods for common scenarios
  gameEvent(event: string, context?: ClientLogContext): void {
    this.info(`Game Event: ${event}`, { ...context, category: 'game' });
  }

  connectionEvent(event: string, context?: ClientLogContext): void {
    this.info(`Connection Event: ${event}`, { ...context, category: 'connection' });
  }

  performanceMetric(metric: string, value: number, unit: string, context?: ClientLogContext): void {
    this.info(`Performance Metric: ${metric}`, { 
      ...context, 
      category: 'performance', 
      metric, 
      value, 
      unit 
    });
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): ClientLogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }
}

export const clientLogger = new ClientLogger();