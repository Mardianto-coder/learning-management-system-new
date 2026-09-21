# Script to stop all Node.js processes and free port 3000

Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow

# Stop all Node.js processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Check if port 3000 is still in use
$portInUse = netstat -ano | findstr :3000

if ($portInUse) {
    Write-Host "Port 3000 is still in use. Finding process..." -ForegroundColor Red
    $lines = $portInUse -split "`n"
    foreach ($line in $lines) {
        if ($line -match '\s+(\d+)\s*$') {
            $pid = $matches[1]
            Write-Host "Stopping process with PID: $pid" -ForegroundColor Yellow
            taskkill /F /PID $pid 2>$null
        }
    }
    Start-Sleep -Seconds 2
}

# Final check
$stillInUse = netstat -ano | findstr :3000
if ($stillInUse) {
    Write-Host "Warning: Port 3000 may still be in use." -ForegroundColor Red
    Write-Host "Try running: netstat -ano | findstr :3000" -ForegroundColor Yellow
} else {
    Write-Host "Port 3000 is now free!" -ForegroundColor Green
    Write-Host "You can now run: npm start" -ForegroundColor Green
}

