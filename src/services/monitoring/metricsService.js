/**
 * Prometheus Metrics Service
 * Collects and exposes application metrics for monitoring
 */

import promClient from 'prom-client';

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default Node.js metrics (memory, CPU, event loop, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Custom metrics for DigitalTide

// HTTP Request metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Database metrics
const dbPoolConnectionsActive = new promClient.Gauge({
  name: 'nodejs_external_db_pool_connections_active',
  help: 'Number of active database connections',
});

const dbPoolConnectionsIdle = new promClient.Gauge({
  name: 'nodejs_external_db_pool_connections_idle',
  help: 'Number of idle database connections',
});

const dbPoolConnectionsMax = new promClient.Gauge({
  name: 'nodejs_external_db_pool_connections_max',
  help: 'Maximum number of database connections',
});

const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2],
});

// Redis metrics
const redisConnected = new promClient.Gauge({
  name: 'redis_connected_clients',
  help: 'Number of connected Redis clients',
});

const redisCacheHits = new promClient.Counter({
  name: 'redis_cache_hits_total',
  help: 'Total number of Redis cache hits',
});

const redisCacheMisses = new promClient.Counter({
  name: 'redis_cache_misses_total',
  help: 'Total number of Redis cache misses',
});

// Agent task metrics
const agentTasksPending = new promClient.Gauge({
  name: 'agent_tasks_pending',
  help: 'Number of pending agent tasks',
});

const agentTasksProcessed = new promClient.Counter({
  name: 'agent_tasks_processed_total',
  help: 'Total number of processed agent tasks',
  labelNames: ['agent', 'status'],
});

const agentTasksFailed = new promClient.Counter({
  name: 'agent_tasks_failed_total',
  help: 'Total number of failed agent tasks',
  labelNames: ['agent'],
});

const agentTaskDuration = new promClient.Histogram({
  name: 'agent_task_duration_seconds',
  help: 'Duration of agent tasks in seconds',
  labelNames: ['agent'],
  buckets: [1, 5, 10, 30, 60, 120, 300],
});

// API endpoint metrics
const apiEndpointCalls = new promClient.Counter({
  name: 'api_endpoint_calls_total',
  help: 'Total number of API endpoint calls',
  labelNames: ['endpoint', 'method'],
});

// Register all custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(dbPoolConnectionsActive);
register.registerMetric(dbPoolConnectionsIdle);
register.registerMetric(dbPoolConnectionsMax);
register.registerMetric(dbQueryDuration);
register.registerMetric(redisConnected);
register.registerMetric(redisCacheHits);
register.registerMetric(redisCacheMisses);
register.registerMetric(agentTasksPending);
register.registerMetric(agentTasksProcessed);
register.registerMetric(agentTasksFailed);
register.registerMetric(agentTaskDuration);
register.registerMetric(apiEndpointCalls);

/**
 * Metrics Service
 */
class MetricsService {
  constructor() {
    this.register = register;
    this.metrics = {
      httpRequestDuration,
      httpRequestsTotal,
      dbPoolConnectionsActive,
      dbPoolConnectionsIdle,
      dbPoolConnectionsMax,
      dbQueryDuration,
      redisConnected,
      redisCacheHits,
      redisCacheMisses,
      agentTasksPending,
      agentTasksProcessed,
      agentTasksFailed,
      agentTaskDuration,
      apiEndpointCalls,
    };
  }

  /**
   * Get all metrics in Prometheus format
   */
  async getMetrics() {
    return this.register.metrics();
  }

  /**
   * Get metrics content type
   */
  getContentType() {
    return this.register.contentType;
  }

  /**
   * Record HTTP request
   */
  recordHttpRequest(method, route, status, duration) {
    this.metrics.httpRequestsTotal.inc({ method, route, status });
    this.metrics.httpRequestDuration.observe({ method, route, status }, duration);
  }

  /**
   * Update database connection pool metrics
   */
  updateDbPoolMetrics(active, idle, max) {
    this.metrics.dbPoolConnectionsActive.set(active);
    this.metrics.dbPoolConnectionsIdle.set(idle);
    this.metrics.dbPoolConnectionsMax.set(max);
  }

  /**
   * Record database query duration
   */
  recordDbQuery(operation, duration) {
    this.metrics.dbQueryDuration.observe({ operation }, duration);
  }

  /**
   * Update Redis connection status
   */
  updateRedisConnected(clients) {
    this.metrics.redisConnected.set(clients);
  }

  /**
   * Record Redis cache hit
   */
  recordCacheHit() {
    this.metrics.redisCacheHits.inc();
  }

  /**
   * Record Redis cache miss
   */
  recordCacheMiss() {
    this.metrics.redisCacheMisses.inc();
  }

  /**
   * Update pending agent tasks
   */
  updateAgentTasksPending(count) {
    this.metrics.agentTasksPending.set(count);
  }

  /**
   * Record agent task processed
   */
  recordAgentTaskProcessed(agent, status) {
    this.metrics.agentTasksProcessed.inc({ agent, status });
  }

  /**
   * Record agent task failure
   */
  recordAgentTaskFailed(agent) {
    this.metrics.agentTasksFailed.inc({ agent });
  }

  /**
   * Record agent task duration
   */
  recordAgentTaskDuration(agent, duration) {
    this.metrics.agentTaskDuration.observe({ agent }, duration);
  }

  /**
   * Record API endpoint call
   */
  recordApiEndpointCall(endpoint, method) {
    this.metrics.apiEndpointCalls.inc({ endpoint, method });
  }
}

// Export singleton instance
const metricsService = new MetricsService();
export default metricsService;
