/**
 * Base Agent Class
 * Abstract base class for all AI agents in the DigitalTide system
 * Provides common functionality for agent lifecycle, error handling, and logging
 */

import EventEmitter from 'events';

class Agent extends EventEmitter {
  constructor(name, config = {}) {
    super();

    if (new.target === Agent) {
      throw new TypeError('Cannot instantiate abstract class Agent directly');
    }

    this.name = name;
    this.config = config;
    this.status = 'idle'; // idle, running, paused, stopped, error
    this.stats = {
      tasksExecuted: 0,
      tasksSucceeded: 0,
      tasksFailed: 0,
      totalExecutionTime: 0,
      lastExecutionTime: null,
      errors: [],
    };
    this.initialized = false;
    this.logger = console; // Can be replaced with a proper logger

    // Heartbeat configuration
    this.heartbeatEnabled = config.heartbeatEnabled !== false; // Default: true
    this.heartbeatInterval = config.heartbeatInterval || 30000; // Default: 30 seconds
    this.heartbeatTimer = null;
    this.lastHeartbeat = null;
    this.missedHeartbeats = 0;
    this.maxMissedHeartbeats = config.maxMissedHeartbeats || 3;
  }

  /**
   * Initialize the agent
   * Must be implemented by subclasses
   * @abstract
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Execute a task
   * Must be implemented by subclasses
   * @abstract
   * @param {Object} task - Task object containing task data
   * @returns {Promise<Object>} Task result
   */
  async execute(task) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Cleanup agent resources
   * Can be overridden by subclasses for custom cleanup
   * @returns {Promise<void>}
   */
  async cleanup() {
    this.status = 'stopped';
    this.logger.info(`[${this.name}] Agent cleaned up`);
  }

  /**
   * Start the agent
   * @returns {Promise<boolean>}
   */
  async start() {
    try {
      this.logger.info(`[${this.name}] Starting agent...`);

      if (!this.initialized) {
        await this.initialize();
        this.initialized = true;
      }

      this.status = 'idle';
      this.emit('started');

      // Start heartbeat if enabled
      if (this.heartbeatEnabled) {
        this.startHeartbeat();
      }

      this.logger.info(`[${this.name}] Agent started successfully`);

      return true;
    } catch (error) {
      this.status = 'error';
      this.handleError(error, 'start');
      return false;
    }
  }

  /**
   * Stop the agent
   * @returns {Promise<boolean>}
   */
  async stop() {
    try {
      this.logger.info(`[${this.name}] Stopping agent...`);

      // Stop heartbeat
      this.stopHeartbeat();

      await this.cleanup();
      this.emit('stopped');
      this.logger.info(`[${this.name}] Agent stopped successfully`);

      return true;
    } catch (error) {
      this.handleError(error, 'stop');
      return false;
    }
  }

  /**
   * Run a task with error handling and statistics tracking
   * @param {Object} task - Task to execute
   * @returns {Promise<Object>} Task result
   */
  async run(task) {
    if (this.status !== 'idle') {
      throw new Error(`Agent ${this.name} is not ready (status: ${this.status})`);
    }

    const startTime = Date.now();
    this.status = 'running';
    this.emit('taskStarted', task);

    try {
      this.logger.info(`[${this.name}] Executing task: ${task.id || 'unknown'}`);

      // Execute the task (implemented by subclass)
      const result = await this.execute(task);

      const duration = Date.now() - startTime;

      // Update statistics
      this.stats.tasksExecuted++;
      this.stats.tasksSucceeded++;
      this.stats.totalExecutionTime += duration;
      this.stats.lastExecutionTime = duration;

      this.status = 'idle';
      this.emit('taskCompleted', { task, result, duration });

      this.logger.info(`[${this.name}] Task completed in ${duration}ms`);

      return {
        success: true,
        result,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Update statistics
      this.stats.tasksExecuted++;
      this.stats.tasksFailed++;
      this.stats.totalExecutionTime += duration;
      this.stats.lastExecutionTime = duration;
      this.stats.errors.push({
        task: task.id || 'unknown',
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 10 errors
      if (this.stats.errors.length > 10) {
        this.stats.errors = this.stats.errors.slice(-10);
      }

      this.status = 'idle';
      this.emit('taskFailed', { task, error, duration });

      throw error;
    }
  }

  /**
   * Handle errors consistently
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   */
  handleError(error, context) {
    this.logger.error(`[${this.name}] Error in ${context}:`, error.message);
    this.emit('error', { context, error });
  }

  /**
   * Get agent statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      name: this.name,
      status: this.status,
      initialized: this.initialized,
      stats: {
        ...this.stats,
        successRate:
          this.stats.tasksExecuted > 0
            ? (this.stats.tasksSucceeded / this.stats.tasksExecuted) * 100
            : 0,
        averageExecutionTime:
          this.stats.tasksExecuted > 0
            ? this.stats.totalExecutionTime / this.stats.tasksExecuted
            : 0,
      },
    };
  }

  /**
   * Get agent health status
   * @returns {Object} Health status
   */
  getHealth() {
    const recentErrors = this.stats.errors.slice(-5);
    const errorRate =
      this.stats.tasksExecuted > 0 ? (this.stats.tasksFailed / this.stats.tasksExecuted) * 100 : 0;

    let health = 'healthy';
    if (this.status === 'error') {
      health = 'critical';
    } else if (errorRate > 50) {
      health = 'degraded';
    } else if (errorRate > 20) {
      health = 'warning';
    }

    return {
      name: this.name,
      health,
      status: this.status,
      errorRate,
      recentErrors,
      uptime: this.initialized,
    };
  }

  /**
   * Pause agent execution
   */
  pause() {
    if (this.status === 'idle' || this.status === 'running') {
      this.status = 'paused';
      this.emit('paused');
      this.logger.info(`[${this.name}] Agent paused`);
    }
  }

  /**
   * Resume agent execution
   */
  resume() {
    if (this.status === 'paused') {
      this.status = 'idle';
      this.emit('resumed');
      this.logger.info(`[${this.name}] Agent resumed`);
    }
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    if (!this.heartbeatEnabled || this.heartbeatTimer) {
      return;
    }

    this.lastHeartbeat = new Date().toISOString();
    this.missedHeartbeats = 0;

    this.heartbeatTimer = setInterval(() => {
      // Check if previous heartbeat was missed before sending new one
      if (this.isHeartbeatOverdue()) {
        this.missedHeartbeats++;
        this.logger.warn(
          `[${this.name}] Missed heartbeat detected (total missed: ${this.missedHeartbeats})`
        );

        // Emit warning if approaching threshold
        if (this.missedHeartbeats >= this.maxMissedHeartbeats - 1) {
          this.emit('heartbeat:degraded', {
            agent: this.name,
            missedHeartbeats: this.missedHeartbeats,
            maxMissedHeartbeats: this.maxMissedHeartbeats,
          });
        }

        // Emit critical if threshold exceeded
        if (this.missedHeartbeats >= this.maxMissedHeartbeats) {
          this.emit('heartbeat:critical', {
            agent: this.name,
            missedHeartbeats: this.missedHeartbeats,
            maxMissedHeartbeats: this.maxMissedHeartbeats,
          });
        }
      }

      this.sendHeartbeat();
    }, this.heartbeatInterval);

    this.logger.debug(
      `[${this.name}] Heartbeat monitoring started (interval: ${this.heartbeatInterval}ms)`
    );
  }

  /**
   * Stop heartbeat monitoring
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
      this.logger.debug(`[${this.name}] Heartbeat monitoring stopped`);
    }
  }

  /**
   * Send heartbeat signal
   */
  sendHeartbeat() {
    const now = new Date().toISOString();
    const heartbeatData = {
      agent: this.name,
      timestamp: now,
      status: this.status,
      stats: this.getStats(),
    };

    this.lastHeartbeat = now;
    this.missedHeartbeats = 0;
    this.emit('heartbeat', heartbeatData);
  }

  /**
   * Check if agent is responsive (based on heartbeats)
   * @returns {boolean} True if agent is responsive
   */
  isResponsive() {
    if (!this.heartbeatEnabled) {
      return true; // Always responsive if heartbeat is disabled
    }

    return this.missedHeartbeats < this.maxMissedHeartbeats;
  }

  /**
   * Get time since last heartbeat in milliseconds
   * @returns {number|null} Time in milliseconds or null if no heartbeat yet
   */
  getTimeSinceLastHeartbeat() {
    if (!this.lastHeartbeat) {
      return null;
    }

    return Date.now() - new Date(this.lastHeartbeat).getTime();
  }

  /**
   * Check if heartbeat is overdue
   * @returns {boolean} True if heartbeat is overdue
   */
  isHeartbeatOverdue() {
    if (!this.heartbeatEnabled || !this.lastHeartbeat) {
      return false;
    }

    const timeSince = this.getTimeSinceLastHeartbeat();
    return timeSince > this.heartbeatInterval * 2; // Overdue if 2x interval passed
  }
}

export default Agent;
