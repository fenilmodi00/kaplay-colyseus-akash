# Multi-stage build for Node.js/Colyseus server
# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --only=production=false

# Copy server source code
COPY . ./

# Build the TypeScript application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Install tini for proper signal handling (before switching to non-root user)
RUN apk add --no-cache tini wget

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S colyseus -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Change ownership to non-root user
RUN chown -R colyseus:nodejs /app
USER colyseus

# Expose the port that Colyseus uses
EXPOSE 2567

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:2567/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=2567

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the server
CMD ["node", "build/index.js"]