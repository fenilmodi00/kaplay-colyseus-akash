# Akash Deployment Steps

## Step-by-Step Deployment Guide

### 1. Deploy the SDL

Use the provided `deploy.yaml` file to create your deployment:

```bash
akash tx deployment create deploy.yaml \
  --from your-wallet \
  --chain-id akashnet-2 \
  --node https://rpc.akash.network:443
```

### 2. Get the Service URLs

After deployment, get the service URLs:

```bash
akash provider lease-status \
  --from your-wallet \
  --dseq DEPLOYMENT_SEQUENCE \
  --provider PROVIDER_ADDRESS
```

You'll get URLs like:
- **Server**: `https://server-abc123.provider.akash.network`
- **Client**: `https://client-def456.provider.akash.network`

### 3. Update Client Configuration (Important!)

The client needs to know the server URL. You have two options:

#### Option A: Update and Redeploy (Recommended)

1. Update your `deploy.yaml` with the actual server URL:

```yaml
services:
  client:
    image: fenildocker/kaplay-colyseus-client:latest
    env:
      - SERVER_URL=https://your-actual-server-url.provider.akash.network
      - AKASH_DEPLOYMENT=true
```

2. Close the current deployment and redeploy:

```bash
# Close current deployment
akash tx deployment close --from your-wallet --dseq DEPLOYMENT_SEQUENCE

# Deploy with updated configuration
akash tx deployment create deploy.yaml --from your-wallet
```

#### Option B: Use Runtime Configuration

The client will automatically try to construct the server URL by replacing the subdomain. This works if your provider uses consistent subdomain patterns.

### 4. Test the Deployment

1. Open the client URL in your browser
2. Check browser console for connection logs
3. Try creating/joining a game room

### Troubleshooting

#### Connection Issues

If you see connection errors:

1. **Check the server URL**: Make sure the client can reach the server
2. **Check CORS**: The server allows all origins (`CORS_ORIGIN=*`)
3. **Check logs**: Use `akash provider lease-logs` to see container logs

#### Common Fixes

1. **Update SERVER_URL**: Set the exact server URL in the client environment
2. **Check provider networking**: Some providers may have different networking setups
3. **Try different providers**: If one provider doesn't work, try another

### Example Working Configuration

```yaml
services:
  server:
    image: fenildocker/kaplay-colyseus-server:latest
    env:
      - NODE_ENV=production
      - PORT=2567
      - CORS_ORIGIN=*
      - MONITOR_PASSWORD=your_secure_password
    expose:
      - port: 2567
        as: 2567
        proto: tcp
        to:
          - global: true

  client:
    image: fenildocker/kaplay-colyseus-client:latest
    env:
      - SERVER_URL=https://your-server-url.provider.akash.network
      - AKASH_DEPLOYMENT=true
    expose:
      - port: 80
        as: 80
        proto: tcp
        to:
          - global: true
    depends_on:
      - server
```

### Monitoring

- **Server Health**: `https://your-server-url/health`
- **Server Monitor**: `https://your-server-url/colyseus` (requires password)
- **Client Health**: `https://your-client-url/health`

### Cost Optimization

- **Server**: 1 CPU, 1Gi RAM (~$5-15/month)
- **Client**: 0.5 CPU, 512Mi RAM (~$3-8/month)
- **Total**: ~$8-23/month depending on provider

Adjust resources in the `profiles.compute` section if needed.