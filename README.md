# Colyseus Game on Akash Network

A production-ready multiplayer game built with [Colyseus](https://colyseus.io/) and [Kaplay](https://kaplayjs.com/), optimized for deployment on [Akash Network](https://akash.network/)'s decentralized cloud infrastructure.

## 🙏 Built Upon

This project is based on the excellent [kaplay-colyseus](https://github.com/imaginarny/kaplay-colyseus) repository by [@imaginarny](https://github.com/imaginarny). We've extended their foundational work to demonstrate how Colyseus multiplayer games can be deployed on Akash Network's decentralized cloud infrastructure.

**What we added:**

- Production-ready Docker containers with multi-stage builds
- Akash Network SDL configuration and deployment guide
- Health checks and monitoring for cloud deployment
- Dynamic configuration for decentralized hosting
- Complete containerization setup for both client and server

## 🎮 Features

- **Real-time Multiplayer**: Built on Colyseus for seamless real-time gameplay
- **Modern Game Engine**: Powered by Kaplay for rich 2D game experiences
- **Production-Ready**: Docker containers with health checks and monitoring
- **Akash-Optimized**: Complete SDL configuration for decentralized deployment
- **Cost-Effective**: ~70% cheaper hosting than traditional cloud providers
- **Scalable**: Designed to handle multiple concurrent players efficiently

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd kaplay-colyseus
   ```

2. **Install dependencies**

   ```bash
   # Install server dependencies
   cd server
   npm install
   cd ..

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the development servers**

   ```bash
   # Terminal 1: Start the game server
   cd server
   npm run dev

   # Terminal 2: Start the client (in a new terminal)
   cd client
   npm run dev
   ```

4. **Access the application**
   - Game Client: http://localhost:5173
   - Game Server: http://localhost:2567
   - Colyseus Monitor: http://localhost:2567/colyseus

### Docker Development (Optional)

For testing the production Docker setup locally:

```bash
# 1. Set up environment files (first time only)
cp server/.env.example server/.env.production
cp client/.env.example client/.env.production

# 2. Start both services with Docker Compose
docker-compose up --build

# 3. Access the application
# - Game Client: http://localhost
# - Game Server: http://localhost:2567

# 4. Stop services
docker-compose down
```

## Multiplayer Features

### How to Play with Friends

1. **Quick Join**: Click "Quick Join" to join any available game
2. **Private Room**: Click "Create Private Room" to create a room you can share
3. **Share URL**: When you create or join a room, share the URL with friends
4. **Room URLs**: URLs look like `http://localhost?room=ROOM_ID`

### Game Features

- **Real-time multiplayer**: Up to 2 players per room
- **Automatic matchmaking**: Quick join finds available games
- **Private rooms**: Create rooms to play with specific friends
- **URL sharing**: Share room URLs for easy joining
- **Live player count**: See how many players are in your room
- **Cross-platform**: Works on desktop and mobile browsers

## 🚀 Akash Network Deployment

This project is production-ready for deployment on Akash Network, a decentralized cloud computing marketplace that offers significant cost savings over traditional cloud providers.

### Why Akash for Colyseus Games?

- **Cost Effective**: ~70% cheaper than AWS/GCP/Azure
- **Decentralized**: No single point of failure
- **Global**: Deploy close to your players worldwide
- **Container-Native**: Perfect for Colyseus applications

### Complete Deployment Guide

For detailed instructions on containerizing and deploying your Colyseus game to Akash Network:

**📖 [BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md)** - Complete Akash deployment guide

This comprehensive guide covers:

- Docker image building and optimization
- Production-ready container configuration
- Akash SDL setup and customization
- Resource sizing for different game scales
- Cost optimization strategies
- Troubleshooting deployment issues

## 📁 Project Structure

```
kaplay-colyseus/
├── client/                    # Kaplay game client
│   ├── src/                  # Client source code
│   ├── Dockerfile           # Production container
│   ├── docker-entrypoint.sh # Docker startup script
│   ├── inject-config.sh     # Configuration injection
│   ├── .env.example         # Environment template
│   └── package.json         # Client dependencies
├── server/                   # Colyseus game server
│   ├── src/                 # Server source code
│   ├── Dockerfile          # Production container
│   ├── .env.example        # Environment template
│   └── package.json        # Server dependencies
├── docker-compose.yml      # Docker development setup
├── deploy.yaml            # Akash deployment configuration
└── BUILD_AND_DEPLOY.md    # Complete deployment guide
```

## 🛠 Development Scripts

### Server Scripts

```bash
cd server
npm run dev              # Start development server with hot reload
npm run build           # Build TypeScript to JavaScript
npm run start           # Start production server
npm test               # Run test suite
npm run loadtest       # Run Colyseus load testing
```

### Client Scripts

```bash
cd client
npm run dev             # Start development client with hot reload
npm run build          # Build for production
npm run preview        # Preview production build locally
```

## ⚙️ Configuration

### Development Configuration

The project works out of the box for local development. The client automatically connects to `localhost:2567` for the game server.

### Docker/Production Configuration

For Docker builds and Akash deployment:

1. **Server Environment** - Copy and customize:
   ```bash
   cp server/.env.example server/.env.production
   # Edit server/.env.production with your settings
   ```

2. **Client Environment** - Copy and customize:
   ```bash
   cp client/.env.example client/.env.production
   # Edit client/.env.production with your server URLs
   ```

### Environment Files

- **`server/.env.example`** - Server configuration template
- **`client/.env.example`** - Client configuration template
- **`docker-compose.yml`** - Local Docker development
- **`deploy.yaml`** - Akash production deployment

See **[BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md)** for complete Docker and Akash deployment instructions.

## Monitoring and Health Checks

- **Health Endpoints**: Both client and server include health check endpoints
- **Colyseus Monitor**: Built-in monitoring dashboard at `/colyseus`
- **Docker Health Checks**: Automated container health monitoring

## 🔧 Troubleshooting

### Common Development Issues

1. **Port conflicts**: Ensure ports 5173 (client) and 2567 (server) are available
2. **Dependencies**: Run `npm install` in both client and server directories
3. **Node.js version**: Ensure you're using Node.js v18 or higher

### Development Logs

```bash
# Server logs (in server directory)
npm run dev

# Client logs (in client directory)
npm run dev

# Docker logs (if using Docker)
docker-compose logs -f
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Resources

- **[BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md)** - Complete Akash deployment guide
- **[Colyseus Documentation](https://docs.colyseus.io/)** - Game framework docs
- **[Kaplay Documentation](https://kaplayjs.com/guides/)** - Game engine docs
- **[Akash Network Documentation](https://docs.akash.network/)** - Deployment platform
- **[Akash Discord](https://discord.akash.network/)** - Community support
