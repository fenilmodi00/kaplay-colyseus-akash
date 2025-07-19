/**
 * Monitoring service for tracking server health and metrics
 */
import { logger } from '../utils/logger';

export interface ServerMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  connections: {
    active: number;
    total: number;
  };
  rooms: {
    active: number;
    total: number;
  };
  timestamp: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    memory: boolean;
    uptime: boolean;
    connections: boolean;
  };
  metrics: ServerMetrics;
  timestamp: string;
}

class MonitoringService {
  private startTime: number;
  private totalConnections: number = 0;
  private activeConnections: number = 0;
  private totalRooms: number = 0;
  private activeRooms: number = 0;
  private metricsInterval?: NodeJS.Timeout;

  constructor() {
    this.startTime = Date.now();
    this.setupMetricsLogging();
  }

  private setupMetricsLogging(): void {
    // Log metrics every 5 minutes in production, every minute in development
    const interval = process.env.NODE_ENV === 'production' ? 5 * 60 * 1000 : 60 * 1000;
    
    this.metricsInterval = setInterval(() => {
      const metrics = this.getMetrics();
      logger.performanceMetric('server_metrics', 0, 'snapshot', {
        uptime: metrics.uptime,
        memory_usage: metrics.memory.percentage,
        active_connections: metrics.connections.active,
        active_rooms: metrics.rooms.active,
      });
    }, interval);
  }

  getMetrics(): ServerMetrics {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal + memUsage.external;
    const usedMemory = memUsage.heapUsed;

    return {
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: Math.round((usedMemory / totalMemory) * 100),
      },
      connections: {
        active: this.activeConnections,
        total: this.totalConnections,
      },
      rooms: {
        active: this.activeRooms,
        total: this.totalRooms,
      },
      timestamp: new Date().toISOString(),
    };
  }

  getHealthStatus(): HealthStatus {
    const metrics = this.getMetrics();
    
    // Health check thresholds
    const memoryThreshold = 90; // 90% memory usage
    const uptimeThreshold = 30; // 30 seconds minimum uptime
    const connectionThreshold = 1000; // Maximum 1000 active connections

    const checks = {
      memory: metrics.memory.percentage < memoryThreshold,
      uptime: metrics.uptime > uptimeThreshold,
      connections: metrics.connections.active < connectionThreshold,
    };

    let status: HealthStatus['status'] = 'healthy';
    const failedChecks = Object.values(checks).filter(check => !check).length;

    if (failedChecks > 0) {
      status = failedChecks >= 2 ? 'unhealthy' : 'degraded';
    }

    return {
      status,
      checks,
      metrics,
      timestamp: new Date().toISOString(),
    };
  }

  // Connection tracking methods
  onConnectionJoin(sessionId: string): void {
    this.activeConnections++;
    this.totalConnections++;
    logger.connectionEvent('client_connected', sessionId, {
      active_connections: this.activeConnections,
      total_connections: this.totalConnections,
    });
  }

  onConnectionLeave(sessionId: string): void {
    this.activeConnections = Math.max(0, this.activeConnections - 1);
    logger.connectionEvent('client_disconnected', sessionId, {
      active_connections: this.activeConnections,
    });
  }

  // Room tracking methods
  onRoomCreate(roomId: string): void {
    this.activeRooms++;
    this.totalRooms++;
    logger.gameEvent('room_created', {
      room_id: roomId,
      active_rooms: this.activeRooms,
      total_rooms: this.totalRooms,
    });
  }

  onRoomDispose(roomId: string): void {
    this.activeRooms = Math.max(0, this.activeRooms - 1);
    logger.gameEvent('room_disposed', {
      room_id: roomId,
      active_rooms: this.activeRooms,
    });
  }

  // Error tracking
  onError(error: Error, context?: any): void {
    logger.error('Server Error', context, error);
  }

  // Security event tracking
  onSecurityEvent(event: string, context?: any): void {
    logger.securityEvent(event, context);
  }

  // Cleanup
  destroy(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }
}

export const monitoring = new MonitoringService();