# Kaplay-Colyseus Deployment Guide

This guide covers deploying the Kaplay-Colyseus multiplayer game to Akash Network.

## Prerequisites

1. **Docker Hub Account**: Create account at [hub.docker.com](https://hub.docker.com)
2. **Akash CLI**: Install from [docs.akash.network](https://docs.akash.network/guides/cli)
3. **Akash Wallet**: Set up with AKT tokens for deployment

## Step 1: Push Images to Docker Hub

### Login to Docker Hub
```bash
docker login
```

### Push Images (Windows PowerShell)
```powershell
.\push-to-dockerhub.ps1 YOUR_DOCKERHUB_USERNAME
```

### Push Images (Linux/macOS)
```bash
chmod +x push-to-dockerhub.sh
./push-to-dockerhub.sh YOUR_DOCKERHUB_USERNAME
```

### Manual Push (Alternative)
```bash
# Tag images
docker tag kaplay-colyseus-server:latest YOUR_USERNAME/kaplay-colyseus-server:latest
docker tag kaplay-colyseus-client:latest YOUR_USERNAME/kaplay-colyseus-client:latest

# Push images
docker push YOUR_USERNAME/kaplay-colyseus-server:latest
docker push YOUR_USERNAME/kaplay-colyseus-client:latest
```

## Step 2: Update Deployment Configuration

Edit `deploy.yaml` and replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username:

```yaml
services:
  server:
    image: yourusername/kaplay-colyseus-server:latest
    # ... rest of config

  client:
    image: yourusername/kaplay-colyseus-client:latest
    # ... rest of config
```

## Step 3: Deploy to Akash Network

### Create Deployment
```bash
akash tx deployment create deploy.yaml \
  --from YOUR_WALLET_NAME \
  --chain-id akashnet-2 \
  --node https://rpc.akash.network:443 \
  --gas-prices 0.025uakt \
  --gas auto \
  --gas-adjustment 1.5
```

### Check Deployment Status
```bash
akash query deployment list --owner YOUR_AKASH_ADDRESS
```

### View Bids
```bash
akash query market bid list --owner YOUR_AKASH_ADDRESS
```

### Create Lease (Accept a Bid)
```bash
akash tx market lease create \
  --from YOUR_WALLET_NAME \
  --chain-id akashnet-2 \
  --node https://rpc.akash.network:443 \
  --dseq DEPLOYMENT_SEQUENCE \
  --provider PROVIDER_ADDRESS \
  --gas-prices 0.025uakt \
  --gas auto \
  --gas-adjustment 1.5
```

### Get Service Status
```bash
akash provider lease-status \
  --from YOUR_WALLET_NAME \
  --dseq DEPLOYMENT_SEQUENCE \
  --provider PROVIDER_ADDRESS
```

## Step 4: Access Your Deployed Game

After successful deployment, you'll receive URLs like:
- **Game Client**: `https://client.random-subdomain.provider.akash.network`
- **Game Server**: `https://server.random-subdomain.provider.akash.network`

## Configuration Options

### Environment Variables

**Server Configuration**:
- `NODE_ENV`: Set to `production`
- `PORT`: Server port (default: 2567)
- `CORS_ORIGIN`: Set to `*` for open access
- `MONITOR_PASSWORD`: Password for Colyseus monitoring panel

### Resource Allocation

Current configuration:
- **Server**: 1 CPU, 1Gi RAM, 1Gi storage
- **Client**: 0.5 CPU, 512Mi RAM

Adjust in `deploy.yaml` under `profiles.compute` if needed.

### Pricing

Current bid prices:
- **Server**: 1000 uAKT
- **Client**: 500 uAKT

Adjust in `deploy.yaml` under `profiles.placement.dcloud.pricing` if needed.

## Troubleshooting

### Common Issues

1. **Image Pull Errors**: Ensure images are public on Docker Hub
2. **Resource Constraints**: Increase CPU/memory if deployment fails
3. **Network Issues**: Check CORS configuration for client-server communication

### Logs and Debugging

```bash
# Get deployment logs
akash provider lease-logs \
  --from YOUR_WALLET_NAME \
  --dseq DEPLOYMENT_SEQUENCE \
  --provider PROVIDER_ADDRESS

# Get specific service logs
akash provider lease-logs \
  --from YOUR_WALLET_NAME \
  --dseq DEPLOYMENT_SEQUENCE \
  --provider PROVIDER_ADDRESS \
  --service server
```

### Health Checks

Once deployed, test these endpoints:
- Client health: `https://your-client-url/health`
- Server health: `https://your-server-url/health`
- Server monitor: `https://your-server-url/colyseus` (requires auth)

## Updating Deployment

To update your deployment:

1. Build and push new Docker images
2. Update `deploy.yaml` with new image tags
3. Close existing lease
4. Create new deployment

```bash
# Close lease
akash tx market lease close \
  --from YOUR_WALLET_NAME \
  --dseq DEPLOYMENT_SEQUENCE \
  --provider PROVIDER_ADDRESS

# Close deployment
akash tx deployment close \
  --from YOUR_WALLET_NAME \
  --dseq DEPLOYMENT_SEQUENCE
```

## Cost Estimation

Typical monthly costs on Akash Network:
- **Server**: ~$5-15/month
- **Client**: ~$3-8/month
- **Total**: ~$8-23/month

Actual costs depend on:
- Provider pricing
- Resource usage
- Network traffic
- Uptime requirements

## Support

For issues:
1. Check Akash Network documentation
2. Join Akash Discord community
3. Review deployment logs
4. Test locally first with Docker Compose

## Security Notes

- Change default `MONITOR_PASSWORD` in production
- Consider restricting `CORS_ORIGIN` for production use
- Monitor resource usage and costs
- Keep Docker images updated for security patches