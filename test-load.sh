#!/bin/bash

# Load generator script for testing the monitoring system

echo "🔄 Starting load generation for microservices monitoring system"
echo "=================================================="

SERVICES=("localhost:5000" "localhost:5001" "localhost:5002")
DURATION=${1:-60}  # Default 60 seconds

echo "Duration: ${DURATION} seconds"
echo "Services: ${SERVICES[@]}"
echo ""

END_TIME=$(($(date +%s) + DURATION))

REQUEST_COUNT=0

while [ $(date +%s) -lt $END_TIME ]; do
    for SERVICE in "${SERVICES[@]}"; do
        # Random endpoint selection
        RAND=$((RANDOM % 4))
        
        case $RAND in
            0)
                ENDPOINT="/"
                ;;
            1)
                ENDPOINT="/health"
                ;;
            2)
                ENDPOINT="/api/data"
                ;;
            3)
                ENDPOINT="/api/error"
                ;;
        esac
        
        # Make async request
        curl -s "http://${SERVICE}${ENDPOINT}" > /dev/null 2>&1 &
        REQUEST_COUNT=$((REQUEST_COUNT + 1))
        
    done
    
    # Small delay between batches
    sleep 0.1
done

# Wait for background jobs to complete
wait

echo ""
echo "✅ Load generation completed"
echo "Total requests sent: ${REQUEST_COUNT}"
echo ""
echo "Check the following URLs for results:"
echo "  - Dashboard: http://localhost:8080"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3000"
