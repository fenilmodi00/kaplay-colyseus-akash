import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import * as dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

// Validate environment configuration
import { validateEnvironment } from "./config/environment";
const serverConfig = validateEnvironment();

// Import monitoring and logging utilities
import { logger } from "./utils/logger";
import { monitoring } from "./services/monitoring";
import { errorHandler, notFoundHandler, setupProcessErrorHandlers, asyncHandler } from "./middleware/errorHandler";

// Setup process-level error handlers
setupProcessErrorHandlers();

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";

export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('my_room', MyRoom);

        /**
         * Setup monitoring for game server events
         */
        gameServer.onShutdown(() => {
            logger.info('Game Server Shutdown');
            monitoring.destroy();
        });

        // Note: Colyseus doesn't expose room lifecycle events directly on gameServer
        // Room tracking is handled within individual room classes

        logger.info('Game Server Initialized', {
            environment: serverConfig.NODE_ENV,
            port: serverConfig.PORT,
        });
    },

    initializeExpress: (app) => {
        /**
         * Configure CORS for Akash deployment
         */
        const corsOptions = {
            origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
                // Allow requests with no origin (mobile apps, Postman, etc.)
                if (!origin) return callback(null, true);
                
                // In development, allow all origins
                if (serverConfig.NODE_ENV === 'development') {
                    return callback(null, true);
                }
                
                // In production, handle CORS_ORIGIN configuration
                if (serverConfig.CORS_ORIGIN === "*") {
                    return callback(null, true);
                }
                
                // Check against allowed origins list
                const allowedOrigins = serverConfig.CORS_ORIGIN.split(",").map(o => o.trim());
                const isAllowed = allowedOrigins.some(allowedOrigin => {
                    // Support wildcard subdomains for Akash
                    if (allowedOrigin.startsWith('*.')) {
                        const domain = allowedOrigin.slice(2);
                        return origin.endsWith(domain);
                    }
                    return origin === allowedOrigin;
                });
                
                if (isAllowed) {
                    callback(null, true);
                } else {
                    console.warn(`CORS blocked origin: ${origin}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            optionsSuccessStatus: 200 // For legacy browser support
        };
        
        app.use(cors(corsOptions));

        /**
         * Security headers for production
         */
        if (serverConfig.NODE_ENV === "production") {
            app.use((req, res, next) => {
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('X-Frame-Options', 'DENY');
                res.setHeader('X-XSS-Protection', '1; mode=block');
                next();
            });
        }

        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */
        app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Enhanced health check endpoint for monitoring
         */
        app.get("/health", asyncHandler((req: any, res: any) => {
            const healthStatus = monitoring.getHealthStatus();
            const statusCode = healthStatus.status === 'healthy' ? 200 : 
                              healthStatus.status === 'degraded' ? 200 : 503;
            
            logger.debug('Health Check Requested', {
                status: healthStatus.status,
                ip: req.ip || req.connection.remoteAddress,
            });

            res.status(statusCode).json(healthStatus);
        }));

        /**
         * Detailed metrics endpoint for monitoring systems
         */
        app.get("/metrics", asyncHandler((req: any, res: any) => {
            const metrics = monitoring.getMetrics();
            
            logger.debug('Metrics Requested', {
                ip: req.ip || req.connection.remoteAddress,
            });

            res.json(metrics);
        }));

        /**
         * Client error reporting endpoint
         */
        app.post("/client-error", asyncHandler((req: any, res: any) => {
            const clientError = req.body;
            
            logger.error('Client Error Report', {
                client_url: clientError.url,
                client_user_agent: clientError.userAgent,
                client_timestamp: clientError.timestamp,
                client_context: clientError.context,
                ip: req.ip || req.connection.remoteAddress,
            }, clientError.error ? new Error(clientError.error.message) : undefined);

            res.status(200).json({ received: true });
        }));

        /**
         * Network configuration endpoint for debugging
         */
        app.get("/network-info", (req, res) => {
            if (serverConfig.NODE_ENV === 'production') {
                return res.status(404).send('Not found');
            }
            
            res.json({
                server_config: {
                    port: serverConfig.PORT,
                    cors_origin: serverConfig.CORS_ORIGIN,
                    environment: serverConfig.NODE_ENV
                },
                request_info: {
                    origin: req.get('Origin'),
                    host: req.get('Host'),
                    user_agent: req.get('User-Agent'),
                    forwarded_for: req.get('X-Forwarded-For'),
                    real_ip: req.get('X-Real-IP')
                }
            });
        });

        /**
         * WebSocket connection test endpoint
         */
        app.get("/ws-test", (req, res) => {
            res.json({
                message: "WebSocket endpoint available",
                websocket_url: `${req.protocol === 'https' ? 'wss' : 'ws'}://${req.get('Host')}`,
                timestamp: new Date().toISOString()
            });
        });

        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        if (serverConfig.NODE_ENV !== "production") {
            app.use("/", playground());
        }

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
        if (serverConfig.MONITOR_PASSWORD) {
            // Use basic auth middleware for monitor protection
            app.use("/colyseus", (req, res, next) => {
                const auth = req.headers.authorization;
                if (!auth || !auth.startsWith('Basic ')) {
                    monitoring.onSecurityEvent('monitor_access_denied', {
                        ip: req.ip || req.connection.remoteAddress,
                        reason: 'no_auth_header',
                    });
                    res.setHeader('WWW-Authenticate', 'Basic realm="Monitor"');
                    return res.status(401).send('Authentication required');
                }
                
                const credentials = Buffer.from(auth.slice(6), 'base64').toString();
                const [username, password] = credentials.split(':');
                
                if (username === 'admin' && password === serverConfig.MONITOR_PASSWORD) {
                    logger.info('Monitor Access Granted', {
                        ip: req.ip || req.connection.remoteAddress,
                    });
                    next();
                } else {
                    monitoring.onSecurityEvent('monitor_access_denied', {
                        ip: req.ip || req.connection.remoteAddress,
                        reason: 'invalid_credentials',
                        username,
                    });
                    res.setHeader('WWW-Authenticate', 'Basic realm="Monitor"');
                    return res.status(401).send('Invalid credentials');
                }
            });
        }
        app.use("/colyseus", monitor());

        /**
         * Request logging middleware
         */
        app.use((req, res, next) => {
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
                
                logger[logLevel]('HTTP Request', {
                    method: req.method,
                    url: req.url,
                    status: res.statusCode,
                    duration,
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent'),
                });
            });
            
            next();
        });

        /**
         * Error handling middleware (must be last)
         */
        app.use(notFoundHandler);
        app.use(errorHandler);
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
