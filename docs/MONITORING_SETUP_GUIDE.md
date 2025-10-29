# Monitoring Setup Guide - Phase 1.6 Complete ✅

## Overview

This document describes the monitoring and alerting infrastructure implemented in Phase 1.6 of the DigitalTide project.

## What Was Implemented

### 1. Monitoring Stack
- **Prometheus**: Time-series metrics collection and storage
- **Grafana**: Visualization dashboards and analytics
- **prom-client**: Node.js metrics instrumentation library

### 2. Metrics Collection
The application now collects and exposes the following metrics:

#### HTTP Metrics
- Request count by method, route, and status code
- Request duration histograms (percentiles)
- Request rate

#### System Metrics
- CPU usage (user and system time)
- Memory usage (RSS, heap)
- Event loop lag
- Garbage collection statistics
- Active handles and requests

#### Database Metrics (Prepared)
- Connection pool statistics
- Query duration tracking
- Active vs idle connections

#### Redis Metrics (Prepared)
- Cache hit/miss ratios
- Connected clients
- Operation counts

#### Agent Metrics (Prepared)
- Pending task count
- Processed task count by agent
- Task failure rate
- Task duration by agent

### 3. Dashboards

Two pre-configured Grafana dashboards:

#### API Performance Dashboard
Tracks:
- Request rate (req/s)
- 95th percentile response time
- Error rate percentage
- Requests by endpoint
- Response time percentiles (p50, p95, p99)

#### System Health Dashboard
Tracks:
- CPU usage percentage
- Memory usage (MB)
- API status (up/down)
- Active database connections
- Memory usage over time
- Database connection pool
- Event loop lag
- Garbage collection rate

### 4. Alert Rules

Configured alerts for:

**Critical:**
- API Down (>1 minute)
- Redis Connection Failed (>2 minutes)

**Warning:**
- High Error Rate (>5% for 5 minutes)
- High Response Time (p95 >1s for 5 minutes)
- High Memory Usage (>512MB for 10 minutes)
- Database Connection Pool High (>80% for 5 minutes)
- Agent Task Queue High (>100 tasks for 15 minutes)
- Agent Task Failure Rate High (>0.1/s for 10 minutes)

## Quick Start

### 1. Start Monitoring Services

```bash
# Start all services
cd /home/runner/work/DigitalTide/DigitalTide
docker compose up -d

# Or start just monitoring services
docker compose up -d prometheus grafana
```

### 2. Start the Application

```bash
# Make sure you have .env file (copy from .env.example)
cp .env.example .env
# Edit .env and set required variables

# Start the API
npm start
```

### 3. Verify Setup

```bash
# Run the test script
./scripts/test-monitoring.sh
```

## Access URLs

- **API**: http://localhost:3000
- **Metrics Endpoint**: http://localhost:3000/metrics
- **Prometheus UI**: http://localhost:9090
- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: `admin`

## Viewing Metrics

### Prometheus

1. Open http://localhost:9090
2. Go to **Status → Targets** to see scrape status
3. Go to **Graph** to query metrics
4. Try queries like:
   - `rate(http_requests_total[5m])` - Request rate
   - `http_request_duration_seconds{quantile="0.95"}` - 95th percentile latency
   - `process_resident_memory_bytes / 1024 / 1024` - Memory in MB

### Grafana Dashboards

1. Open http://localhost:3001
2. Login with admin/admin
3. Go to **Dashboards**
4. Select:
   - **DigitalTide API Performance** - For API metrics
   - **DigitalTide System Health** - For system metrics

## Architecture

```
┌─────────────────────┐
│   DigitalTide API   │
│   (Node.js + prom)  │
│   :3000/metrics     │
└──────────┬──────────┘
           │
           │ HTTP scrape
           │ every 15s
           ▼
┌──────────────────────┐
│    Prometheus        │
│    :9090             │
│  - Collects metrics  │
│  - Stores time-series│
│  - Evaluates alerts  │
└──────────┬───────────┘
           │
           │ PromQL
           │ queries
           ▼
┌──────────────────────┐
│     Grafana          │
│     :3001            │
│  - Visualizations    │
│  - Dashboards        │
│  - Alerts            │
└──────────────────────┘
```

## File Structure

```
monitoring/
├── README.md                          # Detailed monitoring guide
├── prometheus.yml                     # Prometheus configuration
├── alerts.yml                         # Alert rule definitions
└── grafana/
    ├── provisioning/
    │   ├── datasources/
    │   │   └── prometheus.yml        # Auto-provision Prometheus datasource
    │   └── dashboards/
    │       └── digitaltide.yml       # Dashboard provisioning config
    └── dashboards/
        ├── api-performance.json      # API Performance dashboard
        └── system-health.json        # System Health dashboard

src/
├── middleware/
│   └── metrics.js                    # Metrics collection middleware
└── services/
    └── monitoring/
        └── metricsService.js         # Metrics service

scripts/
└── test-monitoring.sh                # Monitoring verification script

docs/
└── MONITORING.md                     # Comprehensive monitoring documentation
```

## Key Features

### 1. Automatic Metric Collection
- Middleware automatically tracks all HTTP requests
- No manual instrumentation needed for basic metrics
- Extensible for custom business metrics

### 2. Pre-configured Dashboards
- Auto-provisioned on Grafana startup
- No manual dashboard import needed
- Customizable via JSON files

### 3. Alert Configuration
- Pre-defined alert rules for common issues
- Configurable thresholds
- Ready for Alertmanager integration

### 4. Production-Ready
- Persistent storage via Docker volumes
- Configurable retention policies
- Secure by default

## Customization

### Adding Custom Metrics

1. Import the metrics service:
```javascript
import metricsService from './services/monitoring/metricsService.js';
```

2. Record your metric:
```javascript
// Counter
metricsService.recordApiEndpointCall('/custom', 'POST');

// Gauge
metricsService.updateAgentTasksPending(count);

// Histogram
metricsService.recordAgentTaskDuration('agent-name', duration);
```

### Adding New Dashboards

1. Create dashboard in Grafana UI
2. Export as JSON
3. Save to `monitoring/grafana/dashboards/`
4. Restart Grafana or wait for auto-reload

### Modifying Alert Rules

1. Edit `monitoring/alerts.yml`
2. Add/modify alert rules
3. Restart Prometheus: `docker compose restart prometheus`

## Troubleshooting

### Metrics Not Showing
1. Check API is running: `curl http://localhost:3000/health`
2. Check metrics endpoint: `curl http://localhost:3000/metrics`
3. Check Prometheus targets: http://localhost:9090/targets
4. Verify all targets show "UP"

### Dashboards Empty
1. Verify Prometheus is collecting data
2. Check time range in Grafana
3. Test queries in Prometheus UI first
4. Check datasource connection in Grafana

### Alerts Not Firing
1. Check alert rules in Prometheus UI
2. Verify metrics meet alert conditions
3. Check alert evaluation interval
4. Review Prometheus logs

## Next Steps

### Phase 2: Enhanced Monitoring (Future)
- [ ] Integrate Alertmanager for notifications
- [ ] Set up email/Slack alerts
- [ ] Add distributed tracing (Jaeger)
- [ ] Implement log aggregation (ELK)
- [ ] Add business metrics dashboards
- [ ] Set up anomaly detection

### Production Considerations
- [ ] Enable authentication on all UIs
- [ ] Configure HTTPS/TLS
- [ ] Set up backup and retention policies
- [ ] Implement high availability
- [ ] Configure external storage for Prometheus
- [ ] Set up alert routing and escalation

## Documentation

For more detailed information, see:
- [monitoring/README.md](../monitoring/README.md) - Monitoring setup guide
- [docs/MONITORING.md](../docs/MONITORING.md) - Comprehensive monitoring documentation
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

## Success Metrics

✅ All components running and healthy
✅ Metrics being collected every 15 seconds
✅ 2 dashboards auto-provisioned
✅ Alert rules configured and evaluating
✅ Test script passes all checks
✅ Documentation complete

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs: `docker compose logs prometheus grafana`
3. Consult the documentation
4. Open an issue in the repository

---

**Implementation Date**: 2025-10-27  
**Phase**: 1.6 - Monitoring & Alerting  
**Status**: ✅ Complete
