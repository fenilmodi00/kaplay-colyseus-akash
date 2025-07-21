# Deploy Colyseus Games on Akash Network

A practical guide showing how to containerize and prepare your Colyseus multiplayer game for deployment on Akash Network's decentralized cloud infrastructure.

## 📋 Prerequisites

- [Docker](https://www.docker.com/) installed
- [Docker Hub](https://hub.docker.com/) account
- For Akash deployment: Visit [Akash Documentation](https://docs.akash.network/) for complete setup guide

## 📁 Project Structure

This repository contains a complete Colyseus multiplayer game setup optimized for Akash deployment:

```
kaplay-colyseus/
├── server/                          # Colyseus game server
│   ├── src/                        # Server source code
│   ├── Dockerfile                  # Production server container
│   └── package.json               # Server dependencies
├── client/                         # Game client (web-based)
│   ├── src/                       # Client source code
│   ├── Dockerfile                 # Production client container
│   ├── nginx.conf                 # Nginx configuration
│   ├── docker-entrypoint.sh       # Dynamic configuration
│   └── package.json              # Client dependencies
├── deploy.yaml                    # Akash SDL configuration
├── docker-compose.yml            # Local development setup
└── BUILD_AND_DEPLOY.md           # This deployment guide
```

### Key Configuration Files

- **[`server/Dockerfile`](server/Dockerfile)** - Production-ready server container
- **[`client/Dockerfile`](client/Dockerfile)** - Nginx-based client container  
- **[`client/nginx.conf`](client/nginx.conf)** - Proxy and static serving config
- **[`deploy.yaml`](deploy.yaml)** - Akash Network deployment configuration
- **[`docker-compose.yml`](docker-compose.yml)** - Local testing environment

## 🔨 Build Docker Images

### Docker Configuration Files

This project includes production-ready Dockerfiles:

**Server Dockerfile** ([`server/Dockerfile`](server/Dockerfile)):
- Multi-stage build for optimized production image
- Security hardening with non-root user
- Health checks and proper signal handling
- TypeScript compilation and production dependencies only

**Client Dockerfile** ([`client/Dockerfile`](client/Dockerfile)):
- Multi-stage build with Nginx for static serving
- Dynamic configuration injection for Akash deployment
- WebSocket proxy support and asset optimization
- Production-ready with security headers

### 1. Set Up Environment Files
```bash
# Copy and customize server environment
cp server/.env.example server/.env.production
# Edit server/.env.production with your settings

# Copy and customize client environment  
cp client/.env.example client/.env.production
# Edit client/.env.production with your server URLs
```

### 2. Build Server Image
```bash
cd server
docker build -t your-username/kaplay-server:latest .
```

### 3. Build Client Image
```bash
cd client
docker build -t your-username/kaplay-client:latest .
```

### 4. Push to Docker Hub
```bash
# Login to Docker Hub
docker login

# Push images
docker push your-username/kaplay-server:latest
docker push your-username/kaplay-client:latest
```

## 🚀 Deploy to Akash Network

This project includes a complete SDL configuration file that defines how your Colyseus game runs on Akash.

### 📄 Akash SDL Configuration

The **[`deploy.yaml`](deploy.yaml)** file contains everything needed to deploy your game on Akash:

```yaml
# Example from deploy.yaml - Complete configuration included in the file
services:
  server:
    image: your-username/kaplay-colyseus-server:latest
    env:
      - NODE_ENV=production
      - PORT=2567
      - CORS_ORIGIN=*
    expose:
      - port: 2567
        as: 2567
        proto: tcp
        to:
          - global: true

  client:
    image: your-username/kaplay-colyseus-client:latest
    env:
      - SERVER_URL=http://server:2567
      - AKASH_DEPLOYMENT=true
    expose:
      - port: 80
        as: 80
        proto: tcp
        to:
          - global: true
```

### Ready for Deployment

Your containerized Colyseus game is now ready for Akash deployment. The **[`deploy.yaml`](deploy.yaml)** file includes:
- ✅ Server container with health checks and monitoring
- ✅ Client container with Nginx proxy configuration
- ✅ Resource allocation optimized for multiplayer games
- ✅ Network configuration for WebSocket connections
- ✅ Service dependencies and communication setup

### 🎯 Easy Akash Deployment Options

Choose your preferred deployment method:

#### Option 1: Akash Console (Recommended for Beginners)
**[Akash Console](https://console.akash.network/)** - Web-based deployment tool
- ✅ No CLI installation required
- ✅ Visual interface for deployment
- ✅ Built-in wallet integration
- ✅ Real-time deployment monitoring

**Steps:**
1. Visit [console.akash.network](https://console.akash.network/)
2. Connect your wallet (Keplr recommended)
3. Upload your **[`deploy.yaml`](deploy.yaml)** file
4. Review resource allocation and pricing
5. Deploy with one click!

#### Option 2: Akash CLI (For Advanced Users)
**[Akash CLI Documentation](https://docs.akash.network/deployments/akash-cli/installation/)** - Command-line deployment

**Quick CLI Setup:**
```bash
# Install Akash CLI
curl -sSfL https://raw.githubusercontent.com/akash-network/node/master/install.sh | sh

# Create deployment
akash tx deployment create deploy.yaml --from your-wallet --chain-id akashnet-2
```

#### Option 3: Community Tools
- **[Cloudmos Deploy](https://deploy.cloudmos.io/)** - Alternative web interface
- **[Akash Desktop](https://github.com/akash-network/akash-app)** - Desktop application

### 🎉 What You'll Get After Deployment

Once deployed on Akash, you'll receive:
- 🌐 **Public URLs** for your game server and client
- 🔒 **Automatic SSL certificates** (HTTPS/WSS support)
- 🌍 **Global distribution** across Akash providers worldwide
- 💰 **Cost-effective hosting** (~70% cheaper than AWS/GCP/Azure)
- 📊 **Real-time monitoring** through provider dashboards
- 🔄 **Automatic scaling** and container health management

**Example URLs after deployment:**
- Game Client: `https://client-abc123.provider.akash.network`
- Game Server: `https://server-abc123.provider.akash.network`
- WebSocket: `wss://server-abc123.provider.akash.network`

## 💰 Why Choose Akash for Colyseus Games?

### Cost Comparison
| Provider | Small Game (1 CPU, 1GB) | Medium Game (2 CPU, 2GB) | Large Game (4 CPU, 4GB) |
|----------|-------------------------|---------------------------|--------------------------|
| **Akash Network** | ~$3-8/month | ~$10-15/month | ~$25-35/month |
| AWS EC2 | ~$25-35/month | ~$50-70/month | ~$100-140/month |
| Google Cloud | ~$30-40/month | ~$60-80/month | ~$120-160/month |
| Azure | ~$28-38/month | ~$55-75/month | ~$110-150/month |

### Key Benefits
- 💰 **70% Cost Savings**: Significantly cheaper than traditional cloud
- 🌐 **Decentralized**: No single point of failure, global provider network
- 🚀 **Easy Deployment**: Container-based with simple SDL configuration
- 📈 **Scalable**: Adjust resources instantly based on player demand
- 🔒 **Secure**: Built-in SSL, isolated containers, and provider verification
- 🌍 **Global Reach**: Deploy close to your players for low latency

## 🌐 Colyseus + Akash Architecture

This project demonstrates the key patterns needed for Colyseus games on Akash:

### Production-Ready Features
- **Multi-stage Docker builds** for optimized container images
- **Health checks** for reliable container management  
- **WebSocket support** for real-time Colyseus communication
- **CORS configuration** for cross-origin client connections
- **Dynamic configuration** for Akash provider URLs

### Akash-Optimized Setup
- **Container-first design** - works with any Akash provider
- **Resource-efficient** - right-sized for multiplayer workloads
- **Network-aware** - handles dynamic provider URLs
- **Cost-optimized** - pay only for actual usage

## 🎯 Adapt This for Your Colyseus Game

This setup can be adapted for any Colyseus multiplayer game. Here's how to modify it for your project:

### 1. Adapt the Server Dockerfile

Use our production-ready server Dockerfile as a template ([`server/Dockerfile`](server/Dockerfile)):

```dockerfile
# Multi-stage build for Node.js/Colyseus server
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false
COPY . ./
RUN npm run build

FROM node:18-alpine AS production
RUN apk add --no-cache tini wget
RUN addgroup -g 1001 -S nodejs && adduser -S colyseus -u 1001
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/build ./build
RUN chown -R colyseus:nodejs /app
USER colyseus
EXPOSE 2567
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:2567/health || exit 1
ENV NODE_ENV=production
ENV PORT=2567
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "build/index.js"]
```

**Key Features:**
- ✅ Multi-stage build for smaller images
- ✅ Security hardening with non-root user
- ✅ Health checks for container monitoring
- ✅ Proper signal handling with tini
- ✅ Production environment optimization

### 2. Client Configuration Options

**Option A: Web Client (like this project)**
- Use our client Dockerfile ([`client/Dockerfile`](client/Dockerfile))
- Includes Nginx, proxy configuration, and dynamic server discovery
- Perfect for browser-based games

**Option B: Unity/Mobile Client**
- No client container needed
- Configure your Unity/mobile app to connect directly to server URL
- Use the server URL from Akash deployment

**Option C: Desktop Client**
- Package your desktop client separately
- Configure to connect to Akash server URL
- No containerization needed for client

### 3. Essential Server Requirements

For any Colyseus app to work on Akash, ensure your server has:

**Health Check Endpoint:**
```javascript
app.get("/health", (req, res) => {
    res.json({ 
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});
```

**CORS Configuration:**
```javascript
app.use(cors({
    origin: "*", // Or specify your client domains
    credentials: true
}));
```

**Environment Variables Support:**
```javascript
const PORT = process.env.PORT || 2567;
const NODE_ENV = process.env.NODE_ENV || 'production';
```

### 4. Customize SDL Configuration

The included **[`deploy.yaml`](deploy.yaml)** can be customized for your specific game needs:

**Key areas to modify:**
- **Docker images**: Update to your Docker Hub images
  ```yaml
  image: your-username/your-game-server:latest
  ```
- **Environment variables**: Add your game-specific config
  ```yaml
  env:
    - GAME_MODE=production
    - MAX_PLAYERS=100
    - DATABASE_URL=your-db-url
  ```
- **Resource allocation**: Adjust CPU/memory based on player count
  ```yaml
  resources:
    cpu:
      units: 2.0  # Increase for more players
    memory:
      size: 2Gi   # Adjust based on game complexity
  ```
- **Port configuration**: Modify if using different ports
  ```yaml
  expose:
    - port: 3000  # Your custom port
      as: 3000
      proto: tcp
  ```

**📄 Complete Example:** See the full **[`deploy.yaml`](deploy.yaml)** file for a working configuration with both server and client services.

### 5. Resource Sizing Guidelines

**Small Games (2-10 players):**
- CPU: 0.5 units
- Memory: 512Mi
- Cost: ~$1-2/month

**Medium Games (10-50 players):**
- CPU: 1.0 units
- Memory: 1Gi
- Cost: ~$3-8/month

**Large Games (50+ players):**
- CPU: 2.0+ units
- Memory: 2Gi+
- Cost: ~$10-15/month

### 6. Common Adaptations

**For Different Game Types:**

**Turn-based Games:**
- Lower CPU requirements
- Focus on memory for game state
- Longer health check intervals

**Real-time Action Games:**
- Higher CPU requirements
- Optimize for low latency
- Shorter health check intervals

**MMO/Persistent Worlds:**
- Add persistent storage
- Consider multiple server instances
- Implement load balancing

### 7. Testing Your Deployment

Before deploying to Akash, test locally:

```bash
# Test with Docker Compose
docker-compose up --build

# Test health endpoint
curl http://localhost:2567/health

# Test WebSocket connection
# Use your game client or WebSocket testing tool
```

### 8. Deployment Checklist

To deploy your Colyseus game on Akash:

- [ ] Copy and modify the Dockerfiles for your game
- [ ] Add health check endpoint to your server
- [ ] Configure CORS for your client domains  
- [ ] Set up environment variables
- [ ] Customize SDL resource allocation in `deploy.yaml`
- [ ] Test locally with Docker Compose
- [ ] Build and push Docker images to Docker Hub
- [ ] Follow [Akash deployment guide](https://docs.akash.network/) to deploy
- [ ] Update client to connect to Akash URLs
- [ ] Test multiplayer functionality

## 🚀 Get Started with Akash

### New to Akash? Start Here:
1. **[Akash Console](https://console.akash.network/)** - Deploy in minutes with web interface
2. **[Akash Documentation](https://docs.akash.network/)** - Complete guides and tutorials
3. **[Akash Discord](https://discord.akash.network/)** - Active community support
4. **[Akash YouTube](https://www.youtube.com/c/AkashNetwork)** - Video tutorials and demos

### Ready to Deploy?
1. ✅ Use our **[`deploy.yaml`](deploy.yaml)** configuration
2. ✅ Follow the deployment options above
3. ✅ Join the [Akash Discord](https://discord.akash.network/) for help
4. ✅ Share your deployed game with the community!

## 📚 Additional Resources

- **[`deploy.yaml`](deploy.yaml)** - Complete Akash SDL configuration for this project
- **[Akash Network Documentation](https://docs.akash.network/)** - Complete deployment guide
- **[Akash Discord](https://discord.akash.network/)** - Community support and help
- **[Colyseus Documentation](https://docs.colyseus.io/)** - Game framework docs
- **[Docker Documentation](https://docs.docker.com/)** - Containerization guide

---

This project demonstrates how to containerize and deploy Colyseus multiplayer games on Akash Network. The production-ready setup with our **[`deploy.yaml`](deploy.yaml)** configuration ensures your game runs reliably on Akash's decentralized infrastructure while keeping costs low and performance high.