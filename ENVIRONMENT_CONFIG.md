# Environment Configuration Guide

This document explains how environment variables are configured for both the client and server applications.

## Server Configuration

### Environment Files

- `.env.development` - Development environment settings
- `.env.production` - Production environment settings

### Available Variables

| Variable           | Description                   | Default       | Required                        |
| ------------------ | ----------------------------- | ------------- | ------------------------------- |
| `NODE_ENV`         | Environment mode              | `development` | No                              |
| `PORT`             | Server port                   | `2567`        | No                              |
| `CORS_ORIGIN`      | CORS allowed origins          | `*`           | No                              |
| `MONITOR_PASSWORD` | Password for monitor endpoint | -             | No (recommended for production) |

### Development Configuration

```bash
NODE_ENV=development
PORT=2567
CORS_ORIGIN=http://localhost:5173
MONITOR_PASSWORD=
```

### Production Configuration

```bash
NODE_ENV=production
PORT=2567
CORS_ORIGIN=*
MONITOR_PASSWORD=secure_monitor_password_change_me
```

## Client Configuration

### Environment Files

- `.env.development` - Development environment settings
- `.env.production` - Production environment settings

### Available Variables

| Variable             | Description          | Default | Required |
| -------------------- | -------------------- | ------- | -------- |
| `VITE_SERVER_URL`    | Server HTTP URL      | -       | Yes      |
| `VITE_SERVER_WS_URL` | Server WebSocket URL | -       | Yes      |

### Development Configuration

```bash
VITE_SERVER_URL=http://localhost:2567
VITE_SERVER_WS_URL=ws://localhost:2567
```

### Production Configuration

```bash
VITE_SERVER_URL=https://your-akash-server-url.com
VITE_SERVER_WS_URL=wss://your-akash-server-url.com
```

## Usage

### Server

The server automatically loads the appropriate environment file based on the `NODE_ENV` variable. The scripts use `cross-env` for Windows compatibility:

```bash
# Development
npm start

# Production (requires build first)
npm run build
npm run start:prod
```

### Client

The client uses Vite's built-in environment variable handling:

```bash
# Development build
npm run dev
npm run build:dev

# Production build
npm run build
```

## Security Considerations

1. **CORS Configuration**: In production, consider restricting `CORS_ORIGIN` to specific domains instead of using `*`
2. **Monitor Password**: Always set a strong `MONITOR_PASSWORD` in production
3. **Environment Files**: Never commit production environment files with sensitive data to version control
4. **HTTPS**: Use HTTPS/WSS URLs in production for secure communication

## Akash Deployment

For Akash Network deployment, update the production environment files with the actual deployment URLs:

1. Deploy the server and get the public endpoint
2. Update `client/.env.production` with the server URLs
3. Rebuild the client with production configuration
4. Deploy both services to Akash Network
