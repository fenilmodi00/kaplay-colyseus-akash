/**
 * Environment configuration validation and setup
 */

export interface ServerConfig {
  NODE_ENV: 'development' | 'production';
  PORT: number;
  CORS_ORIGIN: string;
  MONITOR_PASSWORD?: string;
}

export function validateEnvironment(): ServerConfig {
  const config: ServerConfig = {
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production') || 'development',
    PORT: parseInt(process.env.PORT || '2567', 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    MONITOR_PASSWORD: process.env.MONITOR_PASSWORD,
  };

  // Validate PORT
  if (isNaN(config.PORT) || config.PORT < 1 || config.PORT > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}. Must be a number between 1 and 65535.`);
  }

  // Warn about security issues in production
  if (config.NODE_ENV === 'production') {
    if (!config.MONITOR_PASSWORD) {
      console.warn('WARNING: MONITOR_PASSWORD not set in production. Monitor endpoint will be unprotected.');
    }
    
    if (config.CORS_ORIGIN === '*') {
      console.warn('WARNING: CORS_ORIGIN is set to "*" in production. Consider restricting to specific origins.');
    }
  }

  console.log(`Server configuration loaded:`, {
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    CORS_ORIGIN: config.CORS_ORIGIN,
    MONITOR_PASSWORD: config.MONITOR_PASSWORD ? '[SET]' : '[NOT SET]'
  });

  return config;
}