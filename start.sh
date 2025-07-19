#!/bin/bash

# Simple startup script for Kaplay-Colyseus project

echo "Starting Kaplay-Colyseus services..."

# Build and start services
docker-compose up --build -d

echo "Services started successfully!"
echo "Client available at: http://localhost"
echo "Server available at: http://localhost:2567"
echo ""
echo "To stop services, run: docker-compose down"
echo "To view logs, run: docker-compose logs -f"