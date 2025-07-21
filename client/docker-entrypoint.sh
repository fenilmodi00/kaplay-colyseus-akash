#!/bin/sh

# Docker entrypoint script for client
# This script handles dynamic configuration for Akash deployment

# Set default values if environment variables are not provided
SERVER_URL=${SERVER_URL:-"http://localhost:2567"}
AKASH_DEPLOYMENT=${AKASH_DEPLOYMENT:-"false"}

# Create runtime configuration
cat > /usr/share/nginx/html/config.js << EOF
window.CONFIG = {
  SERVER_URL: "${SERVER_URL}",
  AKASH_DEPLOYMENT: ${AKASH_DEPLOYMENT}
};
EOF

echo "Client configuration created:"
echo "SERVER_URL: ${SERVER_URL}"
echo "AKASH_DEPLOYMENT: ${AKASH_DEPLOYMENT}"

# Start nginx
exec nginx -g 'daemon off;'