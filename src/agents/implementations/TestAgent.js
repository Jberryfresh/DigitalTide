/**
 * Test Agent
 * Simple test agent for framework validation and development
 * Provides configurable behavior for testing various scenarios
 */

import Agent from '../base/Agent.js';

class TestAgent extends Agent {
  constructor(config = {}) {
    super('TestAgent', config);

    // Test configuration
    this.delay = config.delay || 100; // Simulated processing delay
    this.failureRate = config.failureRate || 0; // 0-1, probability of failure
    this.taskCounter = 0;
  }

  /**
   * Initialize the test agent
   */
  async initialize() {
    this.logger.info('[TestAgent] Initializing test agent...');
    // Simulate async initialization
    await new Promise(resolve => setTimeout(resolve, 50));
    this.logger.info('[TestAgent] Test agent initialized');
  }

  /**
   * Execute a test task
   * @param {Object} task - Task to execute
   * @returns {Promise<Object>} Task result
   */
  async execute(task) {
    this.taskCounter++;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, this.delay));

    // Simulate random failures based on failure rate
    if (Math.random() < this.failureRate) {
      throw new Error(`Test agent task ${this.taskCounter} failed (simulated failure)`);
    }

    // Return test result
    return {
      taskId: task.id || this.taskCounter,
      input: task.data || task,
      processed: true,
      timestamp: new Date().toISOString(),
      message: `Test agent successfully processed task ${this.taskCounter}`,
    };
  }

  /**
   * Cleanup test agent resources
   */
  async cleanup() {
    this.logger.info('[TestAgent] Cleaning up test agent...');
    this.taskCounter = 0;
    await super.cleanup();
  }

  /**
   * Get test agent specific stats
   * @returns {Object} Extended stats
   */
  getStats() {
    const baseStats = super.getStats();
    return {
      ...baseStats,
      testStats: {
        taskCounter: this.taskCounter,
        delay: this.delay,
        failureRate: this.failureRate,
      },
    };
  }
}

export default TestAgent;
