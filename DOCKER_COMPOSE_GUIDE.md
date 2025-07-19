# Docker Compose Guide

This guide explains how to use Docker Compose for local development and testing of the Kaplay-Colyseus application.

## Prerequisites

- Docker and Docker Compose installed
- Environment configuration files set up (see ENVIRONMENT_CONFIG.md)

## Quick Start

### Using Utility Scripts

**Linux/macOS:**
```bash
# Start development environment
./docker-compose.sh up dev

# Start production environment
./docker-compose.sh up prod

# View logs
./docker-compose.sh logs

# Stop services
./docker-compose.sh down
```

**Windows PowerShell:**
```powershell
# Start development environment
.\docker-compose.ps1 up dev

# Start production environment
.\docker-compose.ps1 up prod

# View logs
.\docker-compose.ps1 logs

# Stop services
.\docker-compose.ps1 down
```

### Manual Docker Compose Commands

**Development:**
```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

**Production:**
```bash
# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Service Configuration

### Server Service

- **Container Name:** `kaplay-colyseus-server`
- **Port:** `2567`
- **Health Check:** `http://localhost:2567/health`
- **Environment Variables:** Loaded from `.env.development` or `.env.production`

### Client Service

- **Container Name:** `kaplay-colyseus-client`
- **Development Port:** `5173` (Vite dev server)
- **Production Port:** `3000` (Nginx)
- **Health Check:** HTTP request to root path

## Environment Configurations

### Development Mode

- Server runs with hot reload
- Client runs Vite dev server with hot reload
- Debug port exposed (9229) for server debugging
- Source code mounted as volumes for live editing
- CORS configured for both ports (3000 and 5173)

### Production Mode

- Server runs optimized production build
- Client served via Nginx
- Resource limits applied
- Production environment variables used
- Security headers enabled

## Networking

- **Network Name:** `kaplay-colyseus-network`
- **Driver:** Bridge
- Services can communicate using service names as hostnames

## Volume Mounts

### Development
- `./server/src:/app/src:ro` - Server source code (read-only)
- `./client/src:/app/src:ro` - Client source code (read-only)
- Environment files mounted as needed

### Production
- Only environment files mounted
- Application code built into images

## Health Checks

Both services include health checks:
- **Interval:** 30 seconds
- **Timeout:** 10 seconds (server), 3 seconds (client)
- **Retries:** 3
- **Start Period:** 40 seconds (server), 10 seconds (client)

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Ensure ports 2567, 3000, and 5173 are not in use
   - Check with `netstat -an | grep :2567`

2. **Build Failures**
   - Clean Docker cache: `docker system prune -f`
   - Rebuild without cache: `docker-compose build --no-cache`

3. **Service Dependencies**
   - Client waits for server health check to pass
   - If server fails to start, client won't start

4. **Environment Variables**
   - Ensure `.env.development` and `.env.production` files exist
   - Check environment file syntax

### Useful Commands

```bash
# View service status
docker-compose ps

# View resource usage
docker stats

# Access container shell
docker exec -it kaplay-colyseus-server sh
docker exec -it kaplay-colyseus-client sh

# View container logs
docker logs kaplay-colyseus-server
docker logs kaplay-colyseus-client

# Restart specific service
docker-compose restart server
docker-compose restart client
```

## Development Workflow

1. **Start Development Environment:**
   ```bash
   ./docker-compose.sh up dev
   ```

2. **Make Code Changes:**
   - Edit files in `./server/src/` or `./client/src/`
   - Changes are automatically reflected (hot reload)

3. **View Logs:**
   ```bash
   ./docker-compose.sh logs server
   ./docker-compose.sh logs client
   ```

4. **Test Changes:**
   - Client: http://localhost:5173
   - Server API: http://localhost:2567
   - Monitor: http://localhost:2567/colyseus

5. **Stop Services:**
   ```bash
   ./docker-compose.sh down
   ```

## Production Testing

1. **Build and Start:**
   ```bash
   ./docker-compose.sh build
   ./docker-compose.sh up prod
   ```

2. **Access Application:**
   - Client: http://localhost:3000
   - Server: http://localhost:2567

3. **Monitor Performance:**
   ```bash
   docker stats
   ```

4. **Check Logs:**
   ```bash
   ./docker-compose.sh logs
   ```

## Cleanup

```bash
# Stop and remove containers
./docker-compose.sh down

# Complete cleanup (removes volumes and networks)
./docker-compose.sh clean
```

## Next Steps

After successful local testing with Docker Compose:
1. Push images to a container registry
2. Create Akash deployment manifests
3. Deploy to Akash Network

See the main deployment documentation for Akash-specific instructions.