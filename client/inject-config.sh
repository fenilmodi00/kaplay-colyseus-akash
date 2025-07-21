#!/bin/sh

# Script to inject configuration into built client files
# Used during Docker build process

# Replace placeholder values in built files with environment variables
find /app/dist -name "*.js" -type f -exec sed -i "s|VITE_SERVER_URL_PLACEHOLDER|${VITE_SERVER_URL:-http://localhost:2567}|g" {} \;
find /app/dist -name "*.js" -type f -exec sed -i "s|VITE_SERVER_WS_URL_PLACEHOLDER|${VITE_SERVER_WS_URL:-ws://localhost:2567}|g" {} \;

echo "Configuration injected successfully"