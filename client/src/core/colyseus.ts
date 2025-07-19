import { Client } from "colyseus.js";
import { clientLogger } from "../utils/logger";
import { clientMonitoring } from "../services/monitoring";

// Extend window object for runtime configuration
declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      SERVER_URL?: string;
      SERVER_WS_URL?: string;
    };
  }
}

// Get server URL from environment variables with proper Akash service discovery
const getServerUrl = () => {
  // In development, use the proxy setup
  if (import.meta.env.DEV) {
    return `${location.protocol}//${location.host}/colyseus`;
  }
  
  // Check for explicit server URL (set during build or runtime)
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  
  // If we have an explicit server URL, use it directly
  if (serverUrl && serverUrl !== 'http://localhost:2567') {
    clientLogger.info(`Connecting to configured server: ${serverUrl}`);
    return serverUrl;
  }
  
  // For local Docker deployment, use proxy
  if (serverUrl && (serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1'))) {
    const proxyUrl = `${location.protocol}//${location.host}/colyseus`;
    clientLogger.info(`Using local proxy setup: ${proxyUrl}`);
    return proxyUrl;
  }
  
  // Check if there's a runtime server URL (injected by deployment)
  if (window.RUNTIME_CONFIG?.SERVER_URL) {
    clientLogger.info(`Using runtime server URL: ${window.RUNTIME_CONFIG.SERVER_URL}`);
    return window.RUNTIME_CONFIG.SERVER_URL;
  }
  
  // Fallback: try to detect if we're in a cloud deployment
  // If the hostname is not localhost, assume we need direct connection
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    // Try to construct server URL by replacing the first part of hostname
    // This works for many cloud providers that use subdomain patterns
    const parts = location.hostname.split('.');
    if (parts.length > 1) {
      parts[0] = 'server'; // Replace first part with 'server'
      const serverHostname = parts.join('.');
      const constructedUrl = `${location.protocol}//${serverHostname}`;
      clientLogger.info(`Cloud deployment detected, trying constructed URL: ${constructedUrl}`);
      return constructedUrl;
    }
  }
  
  // Final fallback for local production builds
  const fallbackUrl = `${location.protocol}//${location.host}/colyseus`;
  clientLogger.warn(`Using proxy fallback: ${fallbackUrl}`);
  return fallbackUrl;
};

// Get WebSocket URL for explicit WebSocket connections
const getWebSocketUrl = () => {
  // In development, use the proxy setup
  if (import.meta.env.DEV) {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${location.host}/colyseus`;
  }
  
  // Check for explicit WebSocket URL
  const wsUrl = import.meta.env.VITE_SERVER_WS_URL;
  
  // If we have an explicit WebSocket URL, use it directly
  if (wsUrl && wsUrl !== 'ws://localhost:2567') {
    console.log(`WebSocket URL configured: ${wsUrl}`);
    return wsUrl;
  }
  
  // For local Docker deployment, use proxy
  if (wsUrl && (wsUrl.includes('localhost') || wsUrl.includes('127.0.0.1'))) {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const proxyWsUrl = `${protocol}//${location.host}/colyseus`;
    console.log(`Using local proxy WebSocket: ${proxyWsUrl}`);
    return proxyWsUrl;
  }
  
  // Check if there's a runtime WebSocket URL
  if (window.RUNTIME_CONFIG?.SERVER_WS_URL) {
    console.log(`Using runtime WebSocket URL: ${window.RUNTIME_CONFIG.SERVER_WS_URL}`);
    return window.RUNTIME_CONFIG.SERVER_WS_URL;
  }
  
  // Fallback: construct from server URL
  const serverUrl = getServerUrl();
  const wsUrl_constructed = serverUrl.replace(/^https?:/, location.protocol === 'https:' ? 'wss:' : 'ws:');
  console.log(`Constructed WebSocket URL: ${wsUrl_constructed}`);
  return wsUrl_constructed;
};

// Create Colyseus client with proper configuration
export const colyseusSDK = new Client(getServerUrl());

// Add connection monitoring
const originalJoinOrCreate = colyseusSDK.joinOrCreate.bind(colyseusSDK);
colyseusSDK.joinOrCreate = async function(roomName: string, options?: any) {
  clientMonitoring.onConnectionAttempt();
  
  try {
    const startTime = performance.now();
    const room = await originalJoinOrCreate(roomName, options);
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    clientMonitoring.onConnectionSuccess(latency);
    
    // Monitor room events
    room.onError((code, message) => {
      clientLogger.error('Room Error', {
        room_name: roomName,
        error_code: code,
        error_message: message,
      });
      clientMonitoring.onConnectionError(new Error(`Room error ${code}: ${message}`));
    });

    room.onLeave((code) => {
      clientLogger.info('Left Room', {
        room_name: roomName,
        leave_code: code,
      });
      clientMonitoring.onConnectionClose(code);
    });

    room.onStateChange((state) => {
      clientMonitoring.onGameEvent('state_change', {
        room_name: roomName,
        players_count: state.players?.size || 0,
      });
    });

    clientLogger.info('Room Joined Successfully', {
      room_name: roomName,
      session_id: room.sessionId,
      latency,
    });

    return room;
  } catch (error) {
    clientMonitoring.onConnectionError(error as Error);
    clientLogger.error('Failed to join room', {
      room_name: roomName,
      options,
    }, error as Error);
    throw error;
  }
};

// Export URLs for debugging and monitoring
export const serverConfig = {
  serverUrl: getServerUrl(),
  webSocketUrl: getWebSocketUrl(),
  isDevelopment: import.meta.env.DEV,
  environment: import.meta.env.MODE
};

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('Colyseus Client Configuration:', serverConfig);
}

