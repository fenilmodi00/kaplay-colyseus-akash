# Akash Network Deployment Guide

This guide explains how to deploy the Kaplay-Colyseus application to Akash Network using the provided SDL (Stack Definition Language) manifests.

## Prerequisites

1. **Akash CLI installed** - Follow the [official installation guide](https://docs.akash.network/guides/cli)
2. **Akash wallet with AKT tokens** - For deployment costs
3. **Docker images pushed to a public registry** - DockerHub, GitHub Container Registry, etc.
4. **Certificate created** - For secure deployments

## Available Deployment Configurations

### 1. Standard Production (`deploy.yaml`)
- **Server**: 1 CPU, 1GB RAM, 1GB storage
- **Client**: 0.5 CPU, 512MB RAM
- **Use case**: Standard production deployment
- **Cost**: ~1500 uAKT per block

### 2. Development/Testing (`deploy-dev.yaml`)
- **Server**: 0.5 CPU, 512MB RAM, 512MB storage
- **Client**: 0.25 CPU, 256MB RAM
- **Use case**: Development and testing
- **Cost**: ~750 uAKT per block

### 3. High Availability (`deploy-ha.yaml`)
- **Server**: 2 CPU, 2GB RAM, 2GB storage (2 instances)
- **Client**: 1 CPU, 1GB RAM (2 instances)
- **Use case**: High-traffic production with redundancy
- **Cost**: ~6000 uAKT per block

## Deployment Steps

### Step 1: Prepare Docker Images

First, build and push your Docker images to a public registry:

```bash
# Build images
docker build -t your-registry/kaplay-colyseus-server:latest ./server
docker build -t your-registry/kaplay-colyseus-client:latest ./client

# Push images
docker push your-registry/kaplay-colyseus-server:latest
docker push your-registry/kaplay-colyseus-client:latest
```

### Step 2: Update SDL Manifest

Update the image references in your chosen SDL file:

```yaml
services:
  server:
    image: your-registry/kaplay-colyseus-server:latest
  client:
    image: your-registry/kaplay-colyseus-client:latest
```

### Step 3: Create Deployment

```bash
# Create deployment (example with standard production)
akash tx deployment create deploy.yaml --from your-wallet --chain-id akashnet-2 --node https://rpc.akash.forbole.com:443 --fees 5000uakt

# Get deployment ID from the transaction output
export DEPLOYMENT_ID=<your-deployment-id>
```

### Step 4: Create Lease

```bash
# Query bids
akash query market bid list --owner your-address --dseq $DEPLOYMENT_ID

# Create lease with chosen provider
akash tx market lease create --owner your-address --dseq $DEPLOYMENT_ID --gseq 1 --oseq 1 --provider <provider-address> --from your-wallet --chain-id akashnet-2 --fees 5000uakt
```

### Step 5: Send Manifest

```bash
# Send manifest to provider
akash provider send-manifest deploy.yaml --owner your-address --dseq $DEPLOYMENT_ID --provider <provider-address> --home ~/.akash
```

### Step 6: Check Status

```bash
# Check deployment status
akash provider lease-status --owner your-address --dseq $DEPLOYMENT_ID --gseq 1 --oseq 1 --provider <provider-address>

# Get service URLs
akash provider lease-events --owner your-address --dseq $DEPLOYMENT_ID --gseq 1 --oseq 1 --provider <provider-address>
```

## Service Configuration

### Server Service
- **Port**: 2567 (mapped to 80 externally)
- **Protocol**: TCP
- **Environment**: Production optimized
- **Storage**: Persistent volume for game data
- **Health Check**: Available at `/health` endpoint

### Client Service
- **Port**: 80 (mapped to 8080 externally)
- **Protocol**: TCP
- **Content**: Static files served by Nginx
- **Dependencies**: Waits for server to be ready

## Environment Variables

### Server Environment Variables
- `NODE_ENV`: Set to `production` for production deployments
- `PORT`: Internal port (2567)
- `CORS_ORIGIN`: Set to `*` for public access (configure as needed)
- `MONITOR_PASSWORD`: Secure password for monitoring endpoint

### Client Environment Variables
- Configured at build time through Docker build args
- Server URL will be automatically configured based on Akash deployment

## Resource Requirements

### Minimum Requirements
- **Server**: 0.5 CPU, 512MB RAM
- **Client**: 0.25 CPU, 256MB RAM
- **Storage**: 512MB for basic operation

### Recommended Production
- **Server**: 1 CPU, 1GB RAM, 1GB storage
- **Client**: 0.5 CPU, 512MB RAM

### High Availability
- **Server**: 2 CPU, 2GB RAM, 2GB storage (multiple instances)
- **Client**: 1 CPU, 1GB RAM (multiple instances)

## Cost Estimation

Costs are approximate and vary based on:
- Provider pricing
- Resource usage
- Network demand
- Deployment duration

| Configuration | CPU Total | RAM Total | Storage | Est. Cost/Block |
|---------------|-----------|-----------|---------|-----------------|
| Development   | 0.75      | 768MB     | 512MB   | ~750 uAKT       |
| Production    | 1.5       | 1.5GB     | 1GB     | ~1500 uAKT      |
| High Availability | 6     | 6GB       | 4GB     | ~6000 uAKT      |

## Monitoring and Maintenance

### Health Checks
- **Server**: `http://your-server-url/health`
- **Client**: `http://your-client-url/` (returns HTML)

### Logs
```bash
# View deployment logs
akash provider lease-logs --owner your-address --dseq $DEPLOYMENT_ID --gseq 1 --oseq 1 --provider <provider-address>
```

### Updates
To update the deployment:
1. Build and push new Docker images
2. Update the SDL manifest
3. Send updated manifest to provider

## Troubleshooting

### Common Issues

1. **Image Pull Errors**
   - Ensure images are public or credentials are configured
   - Verify image tags exist in registry

2. **Resource Constraints**
   - Increase CPU/memory limits in SDL
   - Check provider resource availability

3. **Network Connectivity**
   - Verify port configurations
   - Check CORS settings for cross-origin requests

4. **Service Dependencies**
   - Ensure client waits for server readiness
   - Check service discovery configuration

### Debug Commands
```bash
# Check deployment details
akash query deployment get --owner your-address --dseq $DEPLOYMENT_ID

# View provider status
akash provider status --provider <provider-address>

# Check lease details
akash query market lease get --owner your-address --dseq $DEPLOYMENT_ID --gseq 1 --oseq 1 --provider <provider-address>
```

## Security Considerations

1. **Environment Variables**: Use secure passwords for production
2. **CORS Configuration**: Restrict origins in production if needed
3. **Image Security**: Use minimal base images and scan for vulnerabilities
4. **Network Security**: Configure appropriate firewall rules
5. **Data Persistence**: Ensure sensitive data is properly secured

## Next Steps

After successful deployment:
1. Configure domain names (optional)
2. Set up monitoring and alerting
3. Implement backup strategies for persistent data
4. Configure auto-scaling if needed
5. Set up CI/CD for automated deployments