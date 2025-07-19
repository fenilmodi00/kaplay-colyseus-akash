#!/bin/sh

# Script to inject runtime configuration into the client
# This allows the client to know the server URL at runtime

CONFIG_FILE="/usr/share/nginx/html/config.js"

echo "Injecting runtime configuration..."

# Create runtime config based on environment variables
cat > $CONFIG_FILE << EOF
// Runtime configuration injected at deployment time
window.RUNTIME_CONFIG = {
  SERVER_URL: "${SERVER_URL}",
  SERVER_WS_URL: "${SERVER_WS_URL}",
  DEPLOYMENT_TYPE: "${AKASH_DEPLOYMENT:+akash}"
};

console.log('Runtime config loaded:', window.RUNTIME_CONFIG);
EOF

echo "Runtime configuration injected:"
cat $CONFIG_FILE