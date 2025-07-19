# Kaplay-Colyseus Game Server

A real-time multiplayer game server built with [Colyseus](https://colyseus.io/) and [Kaplay](https://kaplayjs.com/), designed for deployment on [Akash Network](https://akash.network/).

## Features

- **Real-time Multiplayer**: Built on Colyseus for seamless real-time gameplay
- **Modern Game Engine**: Powered by Kaplay for rich 2D game experiences
- **Cloud-Native**: Containerized and ready for deployment on Akash Network
- **Monitoring**: Built-in health checks and monitoring capabilities
- **Scalable**: Designed to handle multiple concurrent players

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose

### Local Deployment

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd kaplay-colyseus
   ```

2. **Start with Docker Compose**
   ```bash
   # Linux/macOS
   ./start.sh
   
   # Windows PowerShell
   .\start.ps1
   
   # Or directly with docker-compose
   docker-compose up --build -d
   ```

3. **Access the application**
   - Game Client: http://localhost
   - Game Server: http://localhost:2567
   - Colyseus Monitor: http://localhost:2567/colyseus

4. **Stop services**
   ```bash
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

## Akash Network Deployment

This project is optimized for deployment on Akash Network, a decentralized cloud computing marketplace.

### Quick Deploy to Akash

1. **Push to Docker Hub**
   ```bash
   # Windows PowerShell
   .\push-to-dockerhub.ps1 YOUR_DOCKERHUB_USERNAME
   
   # Linux/macOS
   ./push-to-dockerhub.sh YOUR_DOCKERHUB_USERNAME
   ```

2. **Update deployment configuration**
   Edit `deploy.yaml` and replace `YOUR_DOCKERHUB_USERNAME` with your Docker Hub username.

3. **Deploy to Akash**
   ```bash
   akash tx deployment create deploy.yaml --from your-wallet --chain-id akashnet-2 --node https://rpc.akash.network:443
   ```

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Project Structure

```
kaplay-colyseus/
├── client/                 # Kaplay game client
│   ├── src/               # Client source code
│   ├── Dockerfile         # Client container configuration
│   └── package.json       # Client dependencies
├── server/                # Colyseus game server
│   ├── src/               # Server source code
│   ├── Dockerfile         # Server container configuration
│   └── package.json       # Server dependencies
├── docker-compose.yml     # Docker Compose configuration
├── deploy.yaml           # Akash deployment configuration
├── start.sh              # Linux/macOS startup script
└── start.ps1             # Windows startup script
```

## Configuration

### Environment Variables

**Server Configuration** (server/.env.production):
- `NODE_ENV=production`
- `PORT=2567`
- `CORS_ORIGIN=*`
- `MONITOR_PASSWORD=secure_monitor_password_change_me`

**Client Configuration** (client/.env.production):
- `VITE_SERVER_URL=https://your-server-url.com`
- `VITE_SERVER_WS_URL=wss://your-server-url.com`

## Monitoring and Health Checks

- **Health Endpoints**: Both client and server include health check endpoints
- **Colyseus Monitor**: Built-in monitoring dashboard at `/colyseus`
- **Docker Health Checks**: Automated container health monitoring

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80 and 2567 are available
2. **Docker issues**: Try `docker system prune` to clean up containers

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
docker-compose logs -f client
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [Colyseus Documentation](https://docs.colyseus.io/)
- [Kaplay Documentation](https://kaplayjs.com/doc)
- [Akash Network Documentation](https://docs.akash.network/)