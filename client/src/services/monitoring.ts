/**
 * Client-side monitoring service for tracking performance and connection health
 */
import { clientLogger } from '../utils/logger';

export interface ClientMetrics {
    connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
    latency: number;
    frameRate: number;
    memoryUsage?: number;
    timestamp: string;
}

export interface PerformanceMetrics {
    loadTime: number;
    renderTime: number;
    networkLatency: number;
    memoryUsage: number;
}

class ClientMonitoringService {
    private startTime: number;
    private connectionStatus: ClientMetrics['connectionStatus'] = 'disconnected';
    private latency: number = 0;
    private frameRate: number = 0;
    private lastFrameTime: number = 0;
    private frameCount: number = 0;
    private metricsInterval?: number;
    private performanceObserver?: PerformanceObserver;

    constructor() {
        this.startTime = Date.now();
        this.setupPerformanceMonitoring();
        this.setupMetricsLogging();
    }

    private setupPerformanceMonitoring(): void {
        // Monitor frame rate
        const updateFrameRate = () => {
            const now = performance.now();
            this.frameCount++;

            if (now - this.lastFrameTime >= 1000) {
                this.frameRate = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
                this.frameCount = 0;
                this.lastFrameTime = now;
            }

            requestAnimationFrame(updateFrameRate);
        };
        requestAnimationFrame(updateFrameRate);

        // Monitor performance entries if available
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'navigation') {
                            const navEntry = entry as PerformanceNavigationTiming;
                            clientLogger.performanceMetric('page_load', navEntry.loadEventEnd - navEntry.fetchStart, 'ms', {
                                dns_lookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
                                tcp_connect: navEntry.connectEnd - navEntry.connectStart,
                                request_response: navEntry.responseEnd - navEntry.requestStart,
                                dom_processing: navEntry.domContentLoadedEventEnd - navEntry.responseEnd,
                            });
                        }
                    }
                });

                this.performanceObserver.observe({ entryTypes: ['navigation', 'measure'] });
            } catch (error) {
                clientLogger.debug('Performance Observer not supported', {
                    error_message: (error as Error).message,
                    error_name: (error as Error).name,
                });
            }
        }
    }

    private setupMetricsLogging(): void {
        // Log metrics every 30 seconds in production, every 10 seconds in development
        const interval = import.meta.env.DEV ? 10000 : 30000;

        this.metricsInterval = window.setInterval(() => {
            const metrics = this.getMetrics();
            clientLogger.performanceMetric('client_metrics', 0, 'snapshot', {
                connection_status: metrics.connectionStatus,
                latency: metrics.latency,
                frame_rate: metrics.frameRate,
                memory_usage: metrics.memoryUsage,
            });
        }, interval);
    }

    getMetrics(): ClientMetrics {
        return {
            connectionStatus: this.connectionStatus,
            latency: this.latency,
            frameRate: this.frameRate,
            memoryUsage: this.getMemoryUsage(),
            timestamp: new Date().toISOString(),
        };
    }

    private getMemoryUsage(): number | undefined {
        // @ts-ignore - performance.memory is not in all browsers
        if ('memory' in performance) {
            // @ts-ignore
            return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024); // MB
        }
        return undefined;
    }

    // Connection monitoring methods
    onConnectionAttempt(): void {
        this.connectionStatus = 'connecting';
        clientLogger.connectionEvent('connection_attempt', {
            timestamp: new Date().toISOString(),
        });
    }

    onConnectionSuccess(latency?: number): void {
        this.connectionStatus = 'connected';
        if (latency !== undefined) {
            this.latency = latency;
        }
        clientLogger.connectionEvent('connection_success', {
            latency: this.latency,
            timestamp: new Date().toISOString(),
        });
    }

    onConnectionError(error: Error): void {
        this.connectionStatus = 'error';
        clientLogger.connectionEvent('connection_error', {
            error_message: error.message,
            timestamp: new Date().toISOString(),
        });
    }

    onConnectionClose(code?: number, reason?: string): void {
        this.connectionStatus = 'disconnected';
        clientLogger.connectionEvent('connection_closed', {
            code,
            reason,
            timestamp: new Date().toISOString(),
        });
    }

    // Game event monitoring
    onGameEvent(event: string, context?: any): void {
        clientLogger.gameEvent(event, context);
    }

    // Performance monitoring
    measurePerformance(name: string, fn: () => void): void {
        const start = performance.now();
        fn();
        const end = performance.now();
        const duration = end - start;

        clientLogger.performanceMetric(name, duration, 'ms');
    }

    async measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
        const start = performance.now();
        try {
            const result = await fn();
            const end = performance.now();
            const duration = end - start;

            clientLogger.performanceMetric(name, duration, 'ms');
            return result;
        } catch (error) {
            const end = performance.now();
            const duration = end - start;

            clientLogger.performanceMetric(name, duration, 'ms', {
                error: true,
                error_message: (error as Error).message,
            });
            throw error;
        }
    }

    // Network latency measurement
    async measureLatency(url?: string): Promise<number> {
        const testUrl = url || `${window.location.origin}/health`;
        const start = performance.now();

        try {
            await fetch(testUrl, { method: 'HEAD' });
            const end = performance.now();
            const latency = end - start;
            this.latency = latency;
            return latency;
        } catch (error) {
            clientLogger.error('Latency measurement failed', { url: testUrl }, error as Error);
            return -1;
        }
    }

    // Cleanup
    destroy(): void {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
    }
}

export const clientMonitoring = new ClientMonitoringService();