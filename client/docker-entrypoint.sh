#!/bin/sh

# Set default server URL if not provided
SERVER_URL=${SERVER_URL:-"http://localhost:2567"}
SERVER_WS_URL=${SERVER_WS_URL:-$(echo $SERVER_URL | sed 's/^http/ws/')}

echo "Configuring client with server URL: $SERVER_URL"

# Inject runtime configuration
/inject-config.sh

# Configure nginx proxy
sed -i "s|SERVER_URL_PLACEHOLDER|${SERVER_URL}|g" /etc/nginx/conf.d/default.conf

# For Akash deployment, disable proxy since services have external URLs
if [ "$AKASH_DEPLOYMENT" = "true" ]; then
    echo "Akash deployment detected - disabling proxy, client will connect directly"
    # Remove the proxy configuration for Akash
    sed -i '/location \/colyseus/,/}/d' /etc/nginx/conf.d/default.conf
fi

# Test nginx configuration
nginx -t

# Start nginx
exec nginx -g "daemon off;"