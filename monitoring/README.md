# DigitalTide Monitoring Setup

This directory contains the monitoring and observability configuration for DigitalTide using Prometheus and Grafana.

## Overview

The monitoring stack includes:
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization dashboards
- **prom-client**: Node.js metrics collection library

## Platform-Specific Configuration

### Docker Host Access

Prometheus needs to reach the Node.js application running on your host machine. The configuration varies by platform:

- **Mac/Windows (Docker Desktop)**: Use `host.docker.internal:3000` (default in `prometheus.yml`)
- **Linux**: Use `172.17.0.1:3000` (use `prometheus.linux.yml`)

**For Linux users**, replace the prometheus configuration:
```bash
# Copy Linux-specific config
cp monitoring/prometheus.linux.yml monitoring/prometheus.yml

# Then start services
docker-compose up -d
```

Alternatively, you can manually edit `monitoring/prometheus.yml` and change `host.docker.internal:3000` to `172.17.0.1:3000` in both job configurations.

## Quick Start

### 1. Start Monitoring Services

```bash
# Start all services including monitoring
npm run docker:up

# Or start just Prometheus and Grafana
docker-compose up -d prometheus grafana
```

### 2. Access Dashboards

- **Prometheus UI**: http://localhost:9090
- **Grafana**: http://localhost:3001
  - Default credentials: `admin` / `admin` (change via `GRAFANA_ADMIN_PASSWORD` env var)
  - Dashboards are auto-provisioned on first start

- **Metrics Endpoint**: http://localhost:3000/metrics

## Metrics Collected

### Default Node.js Metrics
- Memory usage (heap, RSS)
- CPU usage
- Event loop lag
- Garbage collection stats
- Active handles and requests

### HTTP Metrics
- `http_requests_total`: Total HTTP requests by method, route, and status
- `http_request_duration_seconds`: Request duration histogram

### Database Metrics
- `nodejs_external_db_pool_connections_active`: Active DB connections
- `nodejs_external_db_pool_connections_idle`: Idle DB connections
- `nodejs_external_db_pool_connections_max`: Max DB connections
- `db_query_duration_seconds`: Database query duration

### Redis Metrics
- `redis_connected_clients`: Number of connected Redis clients
- `redis_cache_hits_total`: Total cache hits
- `redis_cache_misses_total`: Total cache misses

### Agent Metrics
- `agent_tasks_pending`: Number of pending agent tasks
- `agent_tasks_processed_total`: Total processed tasks by agent and status
- `agent_tasks_failed_total`: Total failed tasks by agent
- `agent_task_duration_seconds`: Task duration by agent

## Pre-configured Dashboards

### 1. API Performance Dashboard
**Access**: Grafana → Dashboards → DigitalTide API Performance

Monitors:
- Request rate (requests/second)
- Response time percentiles (p50, p95, p99)
- Error rate
- Requests by endpoint

### 2. System Health Dashboard
**Access**: Grafana → Dashboards → DigitalTide System Health

Monitors:
- CPU usage
- Memory usage (RSS, Heap)
- API status (up/down)
- Database connection pool
- Event loop lag
- Garbage collection rate

## Alerting Rules

Alert rules are defined in `alerts.yml` and include:

### Critical Alerts
- **APIDown**: API has been down for more than 1 minute
- **RedisConnectionFailed**: No clients connected to Redis

### Warning Alerts
- **HighErrorRate**: Error rate > 5% for 5 minutes
- **HighResponseTime**: 95th percentile > 1 second for 5 minutes
- **HighMemoryUsage**: Memory usage > 512MB for 10 minutes
- **DatabaseConnectionPoolHigh**: Connection pool > 80% full
- **AgentTaskQueueHigh**: More than 100 pending tasks for 15 minutes
- **AgentTaskFailureRateHigh**: Task failure rate > 0.1/second

### View Active Alerts
1. Open Prometheus UI: http://localhost:9090
2. Navigate to **Alerts** tab
3. See active and pending alerts

## Configuration Files

### prometheus.yml
Prometheus main configuration:
- Scrape interval: 15 seconds
- Targets: DigitalTide API at http://host.docker.internal:3000/metrics
- Alert rules loaded from `alerts.yml`

### alerts.yml
Alert rule definitions organized by category:
- API alerts
- Database alerts
- Redis alerts
- Agent alerts

### Grafana Provisioning
- **datasources/prometheus.yml**: Auto-configures Prometheus datasource
- **dashboards/digitaltide.yml**: Auto-provisions dashboards
- **dashboards/*.json**: Dashboard JSON definitions

## Customization

### Adding New Metrics

1. **Define the metric** in `src/services/monitoring/metricsService.js`:
```javascript
const myCustomMetric = new promClient.Counter({
  name: 'my_custom_metric_total',
  help: 'Description of my metric',
  labelNames: ['label1', 'label2'],
});
```

2. **Register the metric**:
```javascript
register.registerMetric(myCustomMetric);
```

3. **Add helper method** to MetricsService class:
```javascript
recordCustomMetric(label1, label2) {
  this.metrics.myCustomMetric.inc({ label1, label2 });
}
```

4. **Use in your code**:
```javascript
import metricsService from './services/monitoring/metricsService.js';
metricsService.recordCustomMetric('value1', 'value2');
```

### Creating Custom Dashboards

1. Create a dashboard in Grafana UI
2. Export as JSON (Dashboard Settings → JSON Model)
3. Save to `monitoring/grafana/dashboards/`
4. Restart Grafana or wait for auto-reload

### Adding New Alert Rules

Edit `monitoring/alerts.yml`:

```yaml
- alert: MyNewAlert
  expr: my_metric > threshold
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Brief description"
    description: "Detailed description with {{ $value }}"
```

Reload Prometheus configuration:
```bash
docker-compose restart prometheus
```

## Troubleshooting

### Metrics Not Appearing
1. Check if the API is running: `curl http://localhost:3000/health`
2. Check metrics endpoint: `curl http://localhost:3000/metrics`
3. Check Prometheus targets: http://localhost:9090/targets
4. Verify Docker networking: `docker network inspect digitaltide_digitaltide-network`

### Grafana Not Showing Data
1. Check datasource configuration in Grafana
2. Verify Prometheus is accessible: http://localhost:9090
3. Check dashboard queries for errors
4. Verify time range in dashboard

### Alerts Not Firing
1. Check Prometheus alert rules: http://localhost:9090/alerts
2. Verify alert expressions with Prometheus query browser
3. Check alert duration (`for:` clause)
4. Review Prometheus logs: `docker-compose logs prometheus`

### Docker Networking Issues
If Prometheus can't reach the API:
1. Ensure API is running on host: `http://localhost:3000`
2. For Docker Desktop (Mac/Windows): Use `host.docker.internal:3000`
3. For Linux: Use `172.17.0.1:3000` or host machine's IP
4. Check `prometheus.yml` targets configuration

## Production Recommendations

### Security
1. Enable authentication on Grafana (change default password)
2. Use environment variables for sensitive configuration
3. Enable HTTPS/TLS for Prometheus and Grafana
4. Restrict access to monitoring endpoints (use firewall rules)

### Persistence
- Prometheus data is persisted in Docker volume `prometheus_data`
- Grafana data is persisted in Docker volume `grafana_data`
- Back up these volumes regularly

### Scaling
For production environments, consider:
1. **Prometheus Federation**: Multiple Prometheus instances
2. **Long-term Storage**: Integrate with Thanos or Cortex
3. **High Availability**: Run multiple Grafana instances
4. **Alert Manager**: Set up Alertmanager for alert routing and deduplication

### Alerting Integrations
Configure Alertmanager to send alerts to:
- Email (SMTP)
- Slack
- PagerDuty
- Discord
- Webhook endpoints

## Useful Queries

### API Performance
```promql
# Request rate
rate(http_requests_total[5m])

# Error rate percentage
(rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])) * 100

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Resource Usage
```promql
# Memory usage in MB
process_resident_memory_bytes / 1024 / 1024

# CPU usage percentage
rate(process_cpu_user_seconds_total[5m]) * 100

# Event loop lag
nodejs_eventloop_lag_seconds
```

### Database
```promql
# Active connections percentage
(nodejs_external_db_pool_connections_active / nodejs_external_db_pool_connections_max) * 100

# Query duration
rate(db_query_duration_seconds_sum[5m]) / rate(db_query_duration_seconds_count[5m])
```

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [prom-client Documentation](https://github.com/siimon/prom-client)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)

## Support

For issues or questions:
1. Check this README
2. Review Prometheus/Grafana logs
3. Consult the official documentation
4. Open an issue in the project repository
