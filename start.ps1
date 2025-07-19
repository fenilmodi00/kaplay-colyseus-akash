# Simple startup script for Kaplay-Colyseus project (PowerShell)

Write-Host "Starting Kaplay-Colyseus services..." -ForegroundColor Blue

# Build and start services
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "Services started successfully!" -ForegroundColor Green
    Write-Host "Client available at: http://localhost" -ForegroundColor Yellow
    Write-Host "Server available at: http://localhost:2567" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To stop services, run: docker-compose down" -ForegroundColor Cyan
    Write-Host "To view logs, run: docker-compose logs -f" -ForegroundColor Cyan
} else {
    Write-Host "Failed to start services!" -ForegroundColor Red
}