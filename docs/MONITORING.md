# DigitalTide Monitoring and Observability

## Overview

DigitalTide implements a comprehensive monitoring and observability stack using Prometheus and Grafana to track system health, performance metrics, and alert on critical issues.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DigitalTide Application                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Metrics Service (prom-client)                       │   │
│  │  • HTTP request metrics                              │   │
│  │  • Database connection pool                          │   │
│  │  • Redis cache metrics                               │   │
│  │  • Agent task metrics                                │   │
│  │  • Node.js process metrics                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          │ /metrics endpoint                 │
│                          ▼                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP scrape (every 15s)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       Prometheus                            │
│  • Collects metrics from /metrics endpoint                  │
│  • Stores time-series data                                  │
│  • Evaluates alert rules                                    │
│  • Provides PromQL query interface                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ PromQL queries
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        Grafana                              │
│  • Visualizes metrics in dashboards                         │
│  • Pre-configured dashboards:                               │
│    - API Performance                                        │
│    - System Health                                          │
│  • Alert annotations                                        │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Automatic Metrics Collection
- **Zero-configuration**: Metrics are automatically collected via middleware
- **Real-time**: Metrics updated in real-time as requests are processed
- **Low overhead**: Minimal performance impact

### 2. Comprehensive Dashboards
- **API Performance**: Request rates, response times, error rates
- **System Health**: CPU, memory, event loop, garbage collection
- **Database Monitoring**: Connection pool, query performance
- **Redis Monitoring**: Cache hit rates, connection status

### 3. Intelligent Alerting
- **Multi-level severity**: Critical, Warning, Low priority alerts
- **Configurable thresholds**: Customize alert conditions
- **Alert history**: Track alert patterns over time

## Metrics Categories

### HTTP Request Metrics

#### `http_requests_total`
Counter tracking total HTTP requests.
- **Labels**: `method`, `route`, `status`
- **Usage**: Request rate by endpoint

#### `http_request_duration_seconds`
Histogram tracking request duration.
- **Labels**: `method`, `route`, `status`
- **Buckets**: 0.01s, 0.05s, 0.1s, 0.5s, 1s, 2s, 5s
- **Usage**: Response time percentiles

### Node.js Process Metrics

All prefixed with `nodejs_`:
- `nodejs_heap_size_total_bytes`: Total heap size
- `nodejs_heap_size_used_bytes`: Used heap size
- `nodejs_external_memory_bytes`: External memory
- `nodejs_eventloop_lag_seconds`: Event loop lag
- `nodejs_gc_duration_seconds`: Garbage collection duration

### Database Metrics

#### `nodejs_external_db_pool_connections_active`
Active database connections.

#### `nodejs_external_db_pool_connections_idle`
Idle database connections.

#### `nodejs_external_db_pool_connections_max`
Maximum allowed connections.

#### `db_query_duration_seconds`
Histogram of database query durations.
- **Labels**: `operation`
- **Buckets**: 0.001s to 2s

### Redis Metrics

#### `redis_connected_clients`
Number of connected Redis clients.

#### `redis_cache_hits_total`
Total cache hits.

#### `redis_cache_misses_total`
Total cache misses.

**Derived metric - Cache Hit Rate**:
```promql
rate(redis_cache_hits_total[5m]) / 
(rate(redis_cache_hits_total[5m]) + rate(redis_cache_misses_total[5m]))
```

### Agent Task Metrics

#### `agent_tasks_pending`
Current number of pending tasks.

#### `agent_tasks_processed_total`
Total processed tasks.
- **Labels**: `agent`, `status`

#### `agent_tasks_failed_total`
Total failed tasks.
- **Labels**: `agent`

#### `agent_task_duration_seconds`
Histogram of task durations.
- **Labels**: `agent`
- **Buckets**: 1s, 5s, 10s, 30s, 60s, 120s, 300s

## Alert Rules

### Critical Alerts

#### APIDown
```yaml
expr: up{job="digitaltide-api"} == 0
for: 1m
```
**Triggers when**: API is unreachable for more than 1 minute
**Action**: Immediate investigation required

#### RedisConnectionFailed
```yaml
expr: redis_connected_clients == 0
for: 2m
```
**Triggers when**: No Redis connections for 2 minutes
**Action**: Check Redis service, restart if necessary

### Warning Alerts

#### HighErrorRate
```yaml
expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
for: 5m
```
**Triggers when**: Error rate exceeds 5% for 5 minutes
**Action**: Review error logs, check dependencies

#### HighResponseTime
```yaml
expr: http_request_duration_seconds{quantile="0.95"} > 1
for: 5m
```
**Triggers when**: 95th percentile response time > 1 second
**Action**: Check for slow queries, optimize endpoints

#### HighMemoryUsage
```yaml
expr: process_resident_memory_bytes / 1024 / 1024 > 512
for: 10m
```
**Triggers when**: Memory usage exceeds 512MB for 10 minutes
**Action**: Check for memory leaks, restart if necessary

#### DatabaseConnectionPoolHigh
```yaml
expr: nodejs_external_db_pool_connections_active / 
      nodejs_external_db_pool_connections_max > 0.8
for: 5m
```
**Triggers when**: Connection pool > 80% full
**Action**: Increase pool size or optimize queries

#### AgentTaskQueueHigh
```yaml
expr: agent_tasks_pending > 100
for: 15m
```
**Triggers when**: More than 100 pending tasks
**Action**: Scale up agents or investigate failures

#### AgentTaskFailureRateHigh
```yaml
expr: rate(agent_tasks_failed_total[10m]) > 0.1
for: 10m
```
**Triggers when**: Task failure rate > 0.1/second
**Action**: Review agent logs, check external dependencies

## Dashboards

### API Performance Dashboard

**Purpose**: Monitor API health and performance

**Key Panels**:
1. **Request Rate** - Requests per second
2. **95th Percentile Response Time** - Latency monitoring
3. **Error Rate** - Percentage of failed requests
4. **Request Rate by Endpoint** - Identify hot endpoints
5. **Response Time Percentiles** - p50, p95, p99

**When to Use**:
- Performance optimization
- Capacity planning
- Incident investigation
- SLA monitoring

### System Health Dashboard

**Purpose**: Monitor system resources and health

**Key Panels**:
1. **CPU Usage** - Process CPU utilization
2. **Memory Usage** - RSS memory consumption
3. **API Status** - Up/down status
4. **Active DB Connections** - Connection pool usage
5. **Memory Usage Over Time** - Trend analysis
6. **Database Connection Pool** - Active vs idle
7. **Event Loop Lag** - Node.js performance
8. **Garbage Collection Rate** - GC frequency

**When to Use**:
- Resource planning
- Performance tuning
- Memory leak detection
- Scaling decisions

## Using Prometheus

### Query Examples

#### Request Rate
```promql
# Overall request rate
rate(http_requests_total[5m])

# Request rate by status code
sum by (status) (rate(http_requests_total[5m]))

# Request rate for specific endpoint
rate(http_requests_total{route="/api/v1/articles"}[5m])
```

#### Error Monitoring
```promql
# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Error percentage
(rate(http_requests_total{status=~"5.."}[5m]) / 
 rate(http_requests_total[5m])) * 100

# 4xx vs 5xx errors
sum by (status) (rate(http_requests_total{status=~"[45].."}[5m]))
```

#### Performance Analysis
```promql
# Average response time
rate(http_request_duration_seconds_sum[5m]) / 
rate(http_request_duration_seconds_count[5m])

# 95th percentile response time
histogram_quantile(0.95, 
  rate(http_request_duration_seconds_bucket[5m]))

# Slowest endpoints
topk(5, 
  rate(http_request_duration_seconds_sum[5m]) / 
  rate(http_request_duration_seconds_count[5m]))
```

#### Resource Monitoring
```promql
# Memory usage in MB
process_resident_memory_bytes / 1024 / 1024

# CPU usage percentage
rate(process_cpu_user_seconds_total[5m]) * 100

# Database connection pool utilization
(nodejs_external_db_pool_connections_active / 
 nodejs_external_db_pool_connections_max) * 100
```

#### Cache Efficiency
```promql
# Cache hit rate
rate(redis_cache_hits_total[5m]) / 
(rate(redis_cache_hits_total[5m]) + 
 rate(redis_cache_misses_total[5m]))

# Cache miss rate
rate(redis_cache_misses_total[5m])
```

## Best Practices

### 1. Metric Naming
- Use snake_case: `http_request_duration_seconds`
- Include unit in name: `_seconds`, `_bytes`, `_total`
- Be descriptive: `agent_task_duration_seconds` vs `duration`

### 2. Label Usage
- Keep cardinality low (avoid user IDs, timestamps)
- Use for filtering and aggregation
- Common labels: `method`, `status`, `endpoint`, `agent`

### 3. Alert Configuration
- Set appropriate thresholds based on baseline
- Use `for:` clause to avoid flapping
- Include context in annotations
- Test alerts before deploying

### 4. Dashboard Design
- Show most important metrics first
- Use appropriate visualizations
- Include time comparisons
- Add helpful descriptions

### 5. Performance
- Minimize label cardinality
- Use rate() instead of increase() for ratios
- Aggregate before visualizing
- Set appropriate retention policies

## Troubleshooting

### Issue: Metrics Not Updating

**Symptoms**: Stale metrics in Prometheus/Grafana

**Solutions**:
1. Check API is running: `curl http://localhost:3000/metrics`
2. Verify Prometheus scraping: Check targets at http://localhost:9090/targets
3. Check scrape interval in prometheus.yml
4. Review Prometheus logs: `docker-compose logs prometheus`

### Issue: High Cardinality

**Symptoms**: Prometheus using excessive memory

**Solutions**:
1. Review metric labels
2. Remove dynamic labels (user IDs, timestamps)
3. Increase aggregation level
4. Reduce retention period

### Issue: Alerts Not Firing

**Symptoms**: Expected alerts not triggering

**Solutions**:
1. Check alert rules syntax
2. Test query in Prometheus UI
3. Verify `for:` duration
4. Check alert evaluation interval
5. Review Prometheus logs

### Issue: Dashboard Shows No Data

**Symptoms**: Grafana panels empty

**Solutions**:
1. Verify time range
2. Check datasource configuration
3. Test query in Prometheus
4. Verify metric names
5. Check panel query syntax

## Integration Points

### Adding Metrics to Existing Code

```javascript
import metricsService from './services/monitoring/metricsService.js';

// Record custom event
metricsService.recordApiEndpointCall('/custom-endpoint', 'POST');

// Update gauge
metricsService.updateAgentTasksPending(taskQueue.length);

// Record timing
const start = Date.now();
await performOperation();
const duration = (Date.now() - start) / 1000;
metricsService.recordAgentTaskDuration('agent-name', duration);
```

### Adding to Database Operations

Already integrated in database pool. For custom metrics:

```javascript
import metricsService from '../services/monitoring/metricsService.js';

async function customQuery() {
  const start = Date.now();
  try {
    const result = await pool.query('SELECT ...');
    const duration = (Date.now() - start) / 1000;
    metricsService.recordDbQuery('custom_query', duration);
    return result;
  } catch (error) {
    throw error;
  }
}
```

### Adding to Cache Operations

```javascript
import metricsService from '../services/monitoring/metricsService.js';

async function cacheGet(key) {
  const value = await redis.get(key);
  if (value) {
    metricsService.recordCacheHit();
  } else {
    metricsService.recordCacheMiss();
  }
  return value;
}
```

## Production Considerations

### Security
- Enable authentication on all monitoring UIs
- Use HTTPS for Prometheus and Grafana
- Restrict /metrics endpoint access
- Rotate credentials regularly
- Use secrets management for sensitive configs

### High Availability
- Run multiple Prometheus instances
- Use Prometheus federation
- Configure Grafana HA cluster
- Set up Alertmanager cluster

### Data Retention
- Configure retention based on storage capacity
- Use downsampling for long-term storage
- Consider Thanos or Cortex for long-term storage
- Archive critical metrics

### Alerting
- Configure Alertmanager
- Set up notification channels (email, Slack, PagerDuty)
- Define on-call schedules
- Create runbooks for common alerts
- Test alert delivery

### Scalability
- Monitor Prometheus resource usage
- Increase scrape intervals for less critical metrics
- Use recording rules for complex queries
- Implement metric federation for large deployments

## Future Enhancements

### Phase 1 (Completed)
- ✅ Basic metrics collection
- ✅ Prometheus integration
- ✅ Grafana dashboards
- ✅ Alert rules

### Phase 2 (Planned)
- [ ] Alertmanager integration
- [ ] Email/Slack notifications
- [ ] Custom business metrics
- [ ] Distributed tracing (Jaeger)

### Phase 3 (Future)
- [ ] Log aggregation (ELK stack)
- [ ] APM integration
- [ ] Custom metrics for AI agents
- [ ] Real-time anomaly detection

## Resources

- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [Alert Rule Examples](https://awesome-prometheus-alerts.grep.to/)

---

**Monitoring Implementation**: Phase 1.6 Complete ✅
**Last Updated**: 2025-10-27
