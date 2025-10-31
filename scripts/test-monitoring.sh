#!/bin/bash
# Test script to verify monitoring setup

echo "🧪 DigitalTide Monitoring Test"
echo "================================"
echo ""

# Check if services are running
echo "1. Checking Docker services..."
docker ps --format "table {{.Names}}\t{{.Status}}" | grep digitaltide

echo ""
echo "2. Testing API health endpoint..."
curl -s http://localhost:3000/health | jq -r '.message'

echo ""
echo "3. Testing metrics endpoint..."
curl -s http://localhost:3000/metrics | head -5

echo ""
echo "4. Checking Prometheus targets..."
curl -s http://localhost:9090/api/v1/targets | jq -r '.data.activeTargets[] | "\(.labels.job): \(.health)"'

echo ""
echo "5. Querying metrics from Prometheus..."
curl -s 'http://localhost:9090/api/v1/query?query=up' | jq -r '.data.result[] | "\(.metric.job): \(.value[1])"'

echo ""
echo "6. Checking Grafana health..."
curl -s http://localhost:3001/api/health | jq -r '"Grafana version: \(.version)"'

echo ""
echo "7. Checking Grafana datasources..."
curl -s -u admin:admin http://localhost:3001/api/datasources | jq -r '.[] | "- \(.name) (\(.type)): \(.url)"'

echo ""
echo "8. Checking Grafana dashboards..."
curl -s -u admin:admin http://localhost:3001/api/search?query=digitaltide | jq -r '.[] | "- \(.title)"'

echo ""
echo "================================"
echo "✅ Monitoring setup verified!"
echo ""
echo "Access URLs:"
echo "  📊 API: http://localhost:3000"
echo "  📈 Prometheus: http://localhost:9090"
echo "  📊 Grafana: http://localhost:3001 (admin/admin)"
echo "  📊 Metrics: http://localhost:3000/metrics"
echo ""
