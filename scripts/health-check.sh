#!/bin/bash

# Health Check Script for Student Management System
# This script checks the health of all services

set -e

echo "🏥 Running health checks..."

# Check if services are running
check_service() {
    local service_name=$1
    local port=$2
    local health_endpoint=$3
    
    echo "Checking $service_name..."
    
    if curl -f "http://localhost:$port$health_endpoint" > /dev/null 2>&1; then
        echo "✅ $service_name is healthy"
        return 0
    else
        echo "❌ $service_name is unhealthy"
        return 1
    fi
}

# Check frontend
check_service "Frontend" 3001 "/"

# Check backend
check_service "Backend" 8081 "/api/health"

# Check Neon DB connection
echo "Checking Neon DB connection..."
if curl -f "http://localhost:8081/api/health" > /dev/null 2>&1; then
    echo "✅ Neon DB connection is healthy"
else
    echo "❌ Neon DB connection is unhealthy"
fi

echo "🏥 Health check completed!"
