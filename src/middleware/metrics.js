/**
 * Metrics Middleware
 * Automatically tracks HTTP request metrics for Prometheus
 */

import onFinished from 'on-finished';
import metricsService from '../services/monitoring/metricsService.js';

/**
 * Middleware to track HTTP request metrics
 */
export const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Use on-finished to track when response is complete
  // This is more reliable than overriding res.end
  onFinished(res, (err, res) => {
    // Calculate duration in seconds
    const duration = (Date.now() - startTime) / 1000;

    // Get route or path
    const route = req.route ? req.route.path : req.path;
    const { method } = req;
    const status = res.statusCode;

    // Record the HTTP request metrics
    metricsService.recordHttpRequest(method, route, status, duration);
  });

  next();
};

/**
 * Middleware to expose metrics endpoint
 */
export const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', metricsService.getContentType());
    const metrics = await metricsService.getMetrics();
    res.send(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).send('Error generating metrics');
  }
};

export default { metricsMiddleware, metricsEndpoint };
