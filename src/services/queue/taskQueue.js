/**
 * Task Queue Service
 * Redis-backed task queue using Bull.js for robust agent task management
 * Provides priority queues, automatic retry, and comprehensive monitoring
 */

import Queue from 'bull';
import EventEmitter from 'events';
import config from '../../config/index.js';
import AgentMessage from '../../agents/protocol/AgentMessage.js';

class TaskQueueService extends EventEmitter {
  constructor() {
    super();

    // Use URL format for consistency with Redis cache service
    this.redisConfig = config.redis.url || {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
    };

    // Create separate queues for different priorities
    this.queues = {
      critical: new Queue('agent-tasks-critical', {
        redis: this.redisConfig,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000, // Start with 2 seconds
          },
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: false, // Keep failed jobs for analysis
        },
      }),
      high: new Queue('agent-tasks-high', {
        redis: this.redisConfig,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: false,
        },
      }),
      medium: new Queue('agent-tasks-medium', {
        redis: this.redisConfig,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 50,
          removeOnFail: false,
        },
      }),
      low: new Queue('agent-tasks-low', {
        redis: this.redisConfig,
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: 20,
          removeOnFail: false,
        },
      }),
    };

    this.initialized = false;
    this.logger = console;
    this.stats = {
      totalEnqueued: 0,
      totalCompleted: 0,
      totalFailed: 0,
      totalStalled: 0,
      queueSizes: {},
    };

    // Event listeners will be set up after initialization to ensure Redis connection
  }

  /**
   * Initialize the task queue service
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    this.logger.info('[TaskQueue] Initializing task queue service...');

    try {
      // Test Redis connection
      await Promise.all(Object.values(this.queues).map((queue) => queue.isReady()));

      // Set up event listeners after Redis connection is verified
      this.setupEventListeners();

      this.initialized = true;
      this.logger.info('[TaskQueue] Task queue service initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('[TaskQueue] Initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Set up event listeners for all queues
   */
  setupEventListeners() {
    Object.entries(this.queues).forEach(([priority, queue]) => {
      // Job completed
      queue.on('completed', (job, result) => {
        this.stats.totalCompleted++;
        this.logger.info(`[TaskQueue:${priority}] Job ${job.id} completed successfully`);
        this.emit('jobCompleted', { priority, job, result });
      });

      // Job failed
      queue.on('failed', (job, error) => {
        this.stats.totalFailed++;
        this.logger.error(`[TaskQueue:${priority}] Job ${job.id} failed:`, error.message);
        this.emit('jobFailed', { priority, job, error });
      });

      // Job stalled (worker took too long or crashed)
      queue.on('stalled', (job) => {
        this.stats.totalStalled++;
        this.logger.warn(`[TaskQueue:${priority}] Job ${job.id} stalled`);
        this.emit('jobStalled', { priority, job });
      });

      // Job is waiting
      queue.on('waiting', (jobId) => {
        this.logger.debug(`[TaskQueue:${priority}] Job ${jobId} is waiting`);
        this.emit('jobWaiting', { priority, jobId });
      });

      // Job is active
      queue.on('active', (job) => {
        this.logger.debug(`[TaskQueue:${priority}] Job ${job.id} started processing`);
        this.emit('jobActive', { priority, job });
      });

      // Job progress update
      queue.on('progress', (job, progress) => {
        this.logger.debug(`[TaskQueue:${priority}] Job ${job.id} progress: ${progress}%`);
        this.emit('jobProgress', { priority, job, progress });
      });

      // Error in queue processing
      queue.on('error', (error) => {
        this.logger.error(`[TaskQueue:${priority}] Queue error:`, error.message);
        this.emit('queueError', { priority, error });
      });
    });
  }

  /**
   * Add a task to the queue
   * @param {AgentMessage} message - Agent message to queue
   * @returns {Promise<Object>} Job information
   */
  async addTask(message) {
    if (!(message instanceof AgentMessage)) {
      throw new Error('Task must be an AgentMessage instance');
    }

    if (!this.initialized) {
      await this.initialize();
    }

    const { priority } = message;
    const queue = this.queues[priority];

    if (!queue) {
      throw new Error(`Invalid priority: ${priority}`);
    }

    const jobOptions = {
      timeout: message.timeout,
      jobId: message.id, // Use message ID as job ID
    };

    try {
      const job = await queue.add(message.toObject(), jobOptions);
      this.stats.totalEnqueued++;

      this.logger.info(`[TaskQueue] Task ${message.id} added to ${priority} queue`);
      this.emit('taskEnqueued', { message, job });

      return {
        jobId: job.id,
        queueName: queue.name,
        priority,
      };
    } catch (error) {
      this.logger.error('[TaskQueue] Failed to add task:', error.message);
      throw error;
    }
  }

  /**
   * Get a job by ID
   * @param {string} jobId - Job ID
   * @returns {Promise<Object|null>} Job or null if not found
   */
  async getJob(jobId) {
    for (const queue of Object.values(this.queues)) {
      const job = await queue.getJob(jobId);
      if (job) {
        return job;
      }
    }
    return null;
  }

  /**
   * Get job status
   * @param {string} jobId - Job ID
   * @returns {Promise<Object|null>} Job status or null if not found
   */
  async getJobStatus(jobId) {
    const job = await this.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job._progress;

    return {
      id: job.id,
      state,
      progress,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    };
  }

  /**
   * Remove a job from the queue
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} True if removed
   */
  async removeJob(jobId) {
    const job = await this.getJob(jobId);

    if (!job) {
      return false;
    }

    await job.remove();
    this.logger.info(`[TaskQueue] Job ${jobId} removed`);
    return true;
  }

  /**
   * Retry a failed job
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} True if retried
   */
  async retryJob(jobId) {
    const job = await this.getJob(jobId);

    if (!job) {
      return false;
    }

    const state = await job.getState();

    if (state !== 'failed') {
      throw new Error(`Job ${jobId} is not in failed state (current: ${state})`);
    }

    await job.retry();
    this.logger.info(`[TaskQueue] Job ${jobId} retried`);
    return true;
  }

  /**
   * Get queue statistics
   * @returns {Promise<Object>} Queue statistics
   */
  async getStats() {
    const queueStats = {};

    for (const [priority, queue] of Object.entries(this.queues)) {
      const counts = await queue.getJobCounts();
      queueStats[priority] = counts;
    }

    return {
      ...this.stats,
      queueSizes: queueStats,
    };
  }

  /**
   * Pause a queue by priority
   * @param {string} priority - Queue priority
   * @returns {Promise<void>}
   */
  async pauseQueue(priority) {
    const queue = this.queues[priority];

    if (!queue) {
      throw new Error(`Invalid priority: ${priority}`);
    }

    await queue.pause();
    this.logger.info(`[TaskQueue] Queue ${priority} paused`);
    this.emit('queuePaused', { priority });
  }

  /**
   * Resume a queue by priority
   * @param {string} priority - Queue priority
   * @returns {Promise<void>}
   */
  async resumeQueue(priority) {
    const queue = this.queues[priority];

    if (!queue) {
      throw new Error(`Invalid priority: ${priority}`);
    }

    await queue.resume();
    this.logger.info(`[TaskQueue] Queue ${priority} resumed`);
    this.emit('queueResumed', { priority });
  }

  /**
   * Pause all queues
   * @returns {Promise<void>}
   */
  async pauseAll() {
    await Promise.all(Object.keys(this.queues).map((priority) => this.pauseQueue(priority)));
    this.logger.info('[TaskQueue] All queues paused');
  }

  /**
   * Resume all queues
   * @returns {Promise<void>}
   */
  async resumeAll() {
    await Promise.all(Object.keys(this.queues).map((priority) => this.resumeQueue(priority)));
    this.logger.info('[TaskQueue] All queues resumed');
  }

  /**
   * Clean completed jobs from a queue
   * @param {string} priority - Queue priority
   * @param {number} grace - Grace period in milliseconds (default: 0)
   * @returns {Promise<number[]>} Removed job IDs
   */
  async cleanQueue(priority, grace = 0) {
    const queue = this.queues[priority];

    if (!queue) {
      throw new Error(`Invalid priority: ${priority}`);
    }

    const removedJobs = await queue.clean(grace, 'completed');
    this.logger.info(
      `[TaskQueue] Cleaned ${removedJobs.length} completed jobs from ${priority} queue`,
    );
    return removedJobs;
  }

  /**
   * Clean all completed jobs from all queues
   * @param {number} grace - Grace period in milliseconds (default: 0)
   * @returns {Promise<Object>} Counts of removed jobs per priority
   */
  async cleanAll(grace = 0) {
    const results = {};

    for (const priority of Object.keys(this.queues)) {
      const removedJobs = await this.cleanQueue(priority, grace);
      results[priority] = removedJobs.length;
    }

    this.logger.info('[TaskQueue] Cleaned all queues');
    return results;
  }

  /**
   * Clear all jobs from a queue (waiting, active, delayed, failed, completed)
   * @param {string} priority - Queue priority
   * @returns {Promise<void>}
   */
  async clearQueue(priority) {
    const queue = this.queues[priority];

    if (!queue) {
      throw new Error(`Invalid priority: ${priority}`);
    }

    await queue.empty();
    this.logger.info(`[TaskQueue] Queue ${priority} cleared`);
    this.emit('queueCleared', { priority });
  }

  /**
   * Clear all queues
   * @returns {Promise<void>}
   */
  async clearAll() {
    await Promise.all(Object.keys(this.queues).map((priority) => this.clearQueue(priority)));
    this.logger.info('[TaskQueue] All queues cleared');
  }

  /**
   * Get failed jobs from all queues
   * @param {number} limit - Maximum number of jobs to return
   * @returns {Promise<Array>} Failed jobs
   */
  async getFailedJobs(limit = 100) {
    const failedJobs = [];

    for (const [priority, queue] of Object.entries(this.queues)) {
      const jobs = await queue.getFailed(0, limit);
      failedJobs.push(
        ...jobs.map((job) => ({
          priority,
          ...job.toJSON(),
        })),
      );
    }

    return failedJobs.slice(0, limit);
  }

  /**
   * Get active jobs from all queues
   * @returns {Promise<Array>} Active jobs
   */
  async getActiveJobs() {
    const activeJobs = [];

    for (const [priority, queue] of Object.entries(this.queues)) {
      const jobs = await queue.getActive();
      activeJobs.push(
        ...jobs.map((job) => ({
          priority,
          ...job.toJSON(),
        })),
      );
    }

    return activeJobs;
  }

  /**
   * Get waiting jobs from all queues
   * @returns {Promise<Array>} Waiting jobs
   */
  async getWaitingJobs() {
    const waitingJobs = [];

    for (const [priority, queue] of Object.entries(this.queues)) {
      const jobs = await queue.getWaiting();
      waitingJobs.push(
        ...jobs.map((job) => ({
          priority,
          ...job.toJSON(),
        })),
      );
    }

    return waitingJobs;
  }

  /**
   * Close all queue connections
   * @returns {Promise<void>}
   */
  async close() {
    this.logger.info('[TaskQueue] Closing task queue service...');

    await Promise.all(Object.values(this.queues).map((queue) => queue.close()));

    this.initialized = false;
    this.logger.info('[TaskQueue] Task queue service closed');
    this.emit('closed');
  }

  /**
   * Check if queues are healthy
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      queues: {},
    };

    try {
      for (const [priority, queue] of Object.entries(this.queues)) {
        const counts = await queue.getJobCounts();
        const isPaused = await queue.isPaused();

        health.queues[priority] = {
          name: queue.name,
          isPaused,
          counts,
        };
      }
    } catch (error) {
      health.status = 'unhealthy';
      health.error = error.message;
    }

    return health;
  }
}

// Export singleton instance
let taskQueueInstance = null;

export const getTaskQueue = () => {
  if (!taskQueueInstance) {
    taskQueueInstance = new TaskQueueService();
  }
  return taskQueueInstance;
};

export default TaskQueueService;
