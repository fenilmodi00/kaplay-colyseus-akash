/**
 * Basic test for monitoring and logging functionality
 */
import assert from 'assert';
import { logger } from '../src/utils/logger';
import { monitoring } from '../src/services/monitoring';

describe('Monitoring and Logging', () => {
  it('should log messages correctly', () => {
    // Test basic logging - if no errors are thrown, logging works
    logger.info('Test info message', { test: true });
    logger.warn('Test warning message', { test: true });
    logger.error('Test error message', { test: true }, new Error('Test error'));
    logger.debug('Test debug message', { test: true });
    
    // Test passes if no errors are thrown
    assert.ok(true, 'Logging functions executed without errors');
  });

  it('should track metrics', () => {
    const metrics = monitoring.getMetrics();
    
    // Verify metrics structure
    assert.ok(metrics.hasOwnProperty('uptime'), 'Metrics should have uptime');
    assert.ok(metrics.hasOwnProperty('memory'), 'Metrics should have memory');
    assert.ok(metrics.hasOwnProperty('connections'), 'Metrics should have connections');
    assert.ok(metrics.hasOwnProperty('rooms'), 'Metrics should have rooms');
    assert.ok(metrics.hasOwnProperty('timestamp'), 'Metrics should have timestamp');
    
    assert.strictEqual(typeof metrics.uptime, 'number', 'Uptime should be a number');
    assert.strictEqual(typeof metrics.memory.used, 'number', 'Memory used should be a number');
    assert.strictEqual(typeof metrics.memory.total, 'number', 'Memory total should be a number');
    assert.strictEqual(typeof metrics.memory.percentage, 'number', 'Memory percentage should be a number');
  });

  it('should provide health status', () => {
    const health = monitoring.getHealthStatus();
    
    // Verify health status structure
    assert.ok(health.hasOwnProperty('status'), 'Health should have status');
    assert.ok(health.hasOwnProperty('checks'), 'Health should have checks');
    assert.ok(health.hasOwnProperty('metrics'), 'Health should have metrics');
    assert.ok(health.hasOwnProperty('timestamp'), 'Health should have timestamp');
    
    assert.ok(['healthy', 'degraded', 'unhealthy'].includes(health.status), 'Status should be valid');
    assert.strictEqual(typeof health.checks.memory, 'boolean', 'Memory check should be boolean');
    assert.strictEqual(typeof health.checks.uptime, 'boolean', 'Uptime check should be boolean');
    assert.strictEqual(typeof health.checks.connections, 'boolean', 'Connections check should be boolean');
  });

  it('should track connection events', () => {
    const sessionId = 'test-session-123';
    
    // Get initial metrics
    const initialMetrics = monitoring.getMetrics();
    const initialActive = initialMetrics.connections.active;
    const initialTotal = initialMetrics.connections.total;
    
    // Test connection tracking
    monitoring.onConnectionJoin(sessionId);
    let metrics = monitoring.getMetrics();
    assert.strictEqual(metrics.connections.active, initialActive + 1, 'Active connections should increase');
    assert.strictEqual(metrics.connections.total, initialTotal + 1, 'Total connections should increase');
    
    monitoring.onConnectionLeave(sessionId);
    metrics = monitoring.getMetrics();
    assert.strictEqual(metrics.connections.active, initialActive, 'Active connections should decrease');
    assert.strictEqual(metrics.connections.total, initialTotal + 1, 'Total connections should remain');
  });

  it('should track room events', () => {
    const roomId = 'test-room-123';
    
    // Get initial metrics
    const initialMetrics = monitoring.getMetrics();
    const initialActive = initialMetrics.rooms.active;
    const initialTotal = initialMetrics.rooms.total;
    
    // Test room tracking
    monitoring.onRoomCreate(roomId);
    let metrics = monitoring.getMetrics();
    assert.strictEqual(metrics.rooms.active, initialActive + 1, 'Active rooms should increase');
    assert.strictEqual(metrics.rooms.total, initialTotal + 1, 'Total rooms should increase');
    
    monitoring.onRoomDispose(roomId);
    metrics = monitoring.getMetrics();
    assert.strictEqual(metrics.rooms.active, initialActive, 'Active rooms should decrease');
    assert.strictEqual(metrics.rooms.total, initialTotal + 1, 'Total rooms should remain');
  });
});