# Multi-stage build for Vite client application

# Build stage
FROM node:18-alpine AS builder

# Accept build arguments
ARG VITE_SERVER_URL=http://localhost:2567
ARG VITE_SERVER_WS_URL=ws://localhost:2567

# Set environment variables for build
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_SERVER_WS_URL=$VITE_SERVER_WS_URL

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - Serve with Nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and make scripts executable
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY inject-config.sh /inject-config.sh
RUN chmod +x /docker-entrypoint.sh /inject-config.sh

# Install curl for health checks
RUN apk add --no-cache curl

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Use entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]