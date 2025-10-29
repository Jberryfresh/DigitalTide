/**
 * Agent Orchestrator
 * Manages and coordinates all AI agents in the system
 * Handles agent lifecycle, task distribution, and monitoring
 */

import EventEmitter from 'events';
import ContentCuratorAgent from '../specialized/ContentCuratorAgent.js';
import WriterAgent from '../specialized/WriterAgent.js';
import QualityControlAgent from '../specialized/QualityControlAgent.js';
import SEOAgent from '../specialized/SEOAgent.js';

class AgentOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = config;
    this.agents = new Map();
    this.taskQueue = [];
    this.isProcessing = false;
    this.stats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      activeAgents: 0,
    };
    this.logger = console;
  }

  /**
   * Initialize the orchestrator and all agents
   */
  async initialize() {
    this.logger.info('[Orchestrator] Initializing agent system...');

    try {
      // Register available agents
      await this.registerAgent('contentCurator', new ContentCuratorAgent(this.config.contentCurator));
      await this.registerAgent('writer', new WriterAgent(this.config.writer));
      await this.registerAgent('qualityControl', new QualityControlAgent(this.config.qualityControl));
      await this.registerAgent('seo', new SEOAgent(this.config.seo));

      // TODO: Register other agents as they're implemented
      // await this.registerAgent('research', new ResearchAgent(this.config.research));
      // await this.registerAgent('publisher', new PublisherAgent(this.config.publisher));

      this.logger.info(`[Orchestrator] Initialized with ${this.agents.size} agents`);
      this.stats.activeAgents = this.agents.size;

      // Set up event listeners for all agents
      for (const [name, agent] of this.agents) {
        this.setupAgentListeners(name, agent);
      }

      return true;
    } catch (error) {
      this.logger.error('[Orchestrator] Initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Register and start an agent
   * @param {string} name - Agent name
   * @param {Agent} agent - Agent instance
   */
  async registerAgent(name, agent) {
    this.logger.info(`[Orchestrator] Registering agent: ${name}`);
    
    // Start the agent
    const started = await agent.start();
    
    if (started) {
      this.agents.set(name, agent);
      this.logger.info(`[Orchestrator] Agent ${name} registered successfully`);
    } else {
      throw new Error(`Failed to start agent: ${name}`);
    }
  }

  /**
   * Set up event listeners for an agent
   * @param {string} name - Agent name
   * @param {Agent} agent - Agent instance
   */
  setupAgentListeners(name, agent) {
    agent.on('taskStarted', (task) => {
      this.logger.info(`[Orchestrator] Agent ${name} started task: ${task.id || 'unknown'}`);
      this.emit('agentTaskStarted', { agent: name, task });
    });

    agent.on('taskCompleted', ({ task, result, duration }) => {
      this.logger.info(`[Orchestrator] Agent ${name} completed task in ${duration}ms`);
      this.stats.completedTasks++;
      this.emit('agentTaskCompleted', { agent: name, task, result, duration });
    });

    agent.on('taskFailed', ({ task, error, duration }) => {
      this.logger.error(`[Orchestrator] Agent ${name} task failed:`, error.message);
      this.stats.failedTasks++;
      this.emit('agentTaskFailed', { agent: name, task, error, duration });
    });

    agent.on('error', ({ context, error }) => {
      this.logger.error(`[Orchestrator] Agent ${name} error in ${context}:`, error.message);
      this.emit('agentError', { agent: name, context, error });
    });
  }

  /**
   * Get an agent by name
   * @param {string} name - Agent name
   * @returns {Agent|null} Agent instance or null
   */
  getAgent(name) {
    return this.agents.get(name) || null;
  }

  /**
   * Execute a task with a specific agent
   * @param {string} agentName - Name of the agent to use
   * @param {Object} task - Task to execute
   * @returns {Promise<Object>} Task result
   */
  async executeTask(agentName, task) {
    const agent = this.getAgent(agentName);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    this.stats.totalTasks++;
    
    try {
      const result = await agent.run(task);
      return result;
    } catch (error) {
      this.logger.error(`[Orchestrator] Task execution failed:`, error.message);
      throw error;
    }
  }

  /**
   * Add task to queue
   * @param {string} agentName - Agent to execute the task
   * @param {Object} task - Task data
   */
  queueTask(agentName, task) {
    this.taskQueue.push({ agentName, task, id: this.generateTaskId() });
    this.logger.info(`[Orchestrator] Task queued for ${agentName}: ${task.type || 'unknown'}`);
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process task queue
   */
  async processQueue() {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.logger.info(`[Orchestrator] Processing queue (${this.taskQueue.length} tasks)`);

    while (this.taskQueue.length > 0) {
      const queuedTask = this.taskQueue.shift();
      const { agentName, task, id } = queuedTask;

      try {
        this.logger.info(`[Orchestrator] Executing queued task ${id} with ${agentName}`);
        const result = await this.executeTask(agentName, { ...task, id });
        this.emit('queuedTaskCompleted', { id, agentName, task, result });
      } catch (error) {
        this.logger.error(`[Orchestrator] Queued task ${id} failed:`, error.message);
        this.emit('queuedTaskFailed', { id, agentName, task, error });
      }
    }

    this.isProcessing = false;
    this.logger.info('[Orchestrator] Queue processing complete');
  }

  /**
   * Execute a workflow (sequence of tasks across multiple agents)
   * @param {Array} workflow - Array of workflow steps
   * @returns {Promise<Object>} Workflow result
   */
  async executeWorkflow(workflow) {
    this.logger.info(`[Orchestrator] Executing workflow with ${workflow.length} steps`);

    const results = [];
    let previousResult = null;

    for (let i = 0; i < workflow.length; i++) {
      const step = workflow[i];
      const { agentName, task, usesPreviousResult } = step;

      this.logger.info(`[Orchestrator] Workflow step ${i + 1}/${workflow.length}: ${agentName}`);

      // Inject previous result if needed
      const taskData = usesPreviousResult && previousResult
        ? { ...task, previousResult }
        : task;

      try {
        const result = await this.executeTask(agentName, taskData);
        results.push({ step: i + 1, agentName, result });
        previousResult = result.result;
      } catch (error) {
        this.logger.error(`[Orchestrator] Workflow failed at step ${i + 1}:`, error.message);
        throw new Error(`Workflow failed at step ${i + 1} (${agentName}): ${error.message}`);
      }
    }

    this.logger.info('[Orchestrator] Workflow completed successfully');

    return {
      success: true,
      steps: results,
      finalResult: previousResult,
    };
  }

  /**
   * Get system status
   * @returns {Object} System status
   */
  getStatus() {
    const agentStatuses = {};
    
    for (const [name, agent] of this.agents) {
      agentStatuses[name] = agent.getHealth();
    }

    return {
      orchestrator: {
        activeAgents: this.stats.activeAgents,
        queuedTasks: this.taskQueue.length,
        isProcessing: this.isProcessing,
      },
      stats: this.stats,
      agents: agentStatuses,
    };
  }

  /**
   * Get detailed statistics
   * @returns {Object} Detailed statistics
   */
  getStats() {
    const agentStats = {};
    
    for (const [name, agent] of this.agents) {
      agentStats[name] = agent.getStats();
    }

    return {
      system: {
        ...this.stats,
        successRate: this.stats.totalTasks > 0
          ? (this.stats.completedTasks / this.stats.totalTasks) * 100
          : 0,
      },
      agents: agentStats,
      queue: {
        length: this.taskQueue.length,
        isProcessing: this.isProcessing,
      },
    };
  }

  /**
   * Pause all agents
   */
  pauseAll() {
    this.logger.info('[Orchestrator] Pausing all agents...');
    
    for (const [name, agent] of this.agents) {
      agent.pause();
    }
    
    this.isProcessing = false;
  }

  /**
   * Resume all agents
   */
  resumeAll() {
    this.logger.info('[Orchestrator] Resuming all agents...');
    
    for (const [name, agent] of this.agents) {
      agent.resume();
    }
    
    if (this.taskQueue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Stop all agents and cleanup
   */
  async shutdown() {
    this.logger.info('[Orchestrator] Shutting down agent system...');

    // Clear queue
    this.taskQueue = [];
    this.isProcessing = false;

    // Stop all agents
    for (const [name, agent] of this.agents) {
      try {
        await agent.stop();
        this.logger.info(`[Orchestrator] Agent ${name} stopped`);
      } catch (error) {
        this.logger.error(`[Orchestrator] Error stopping agent ${name}:`, error.message);
      }
    }

    this.agents.clear();
    this.stats.activeAgents = 0;

    this.logger.info('[Orchestrator] Shutdown complete');
  }

  /**
   * Generate unique task ID
   * @returns {string} Task ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Health check for all agents
   * @returns {Object} Health check result
   */
  async healthCheck() {
    const health = {
      orchestrator: 'healthy',
      timestamp: new Date().toISOString(),
      agents: {},
    };

    let degradedCount = 0;
    let criticalCount = 0;

    for (const [name, agent] of this.agents) {
      const agentHealth = agent.getHealth();
      health.agents[name] = agentHealth;

      if (agentHealth.health === 'degraded') degradedCount++;
      if (agentHealth.health === 'critical') criticalCount++;
    }

    if (criticalCount > 0) {
      health.orchestrator = 'critical';
    } else if (degradedCount > 0) {
      health.orchestrator = 'degraded';
    }

    return health;
  }
}

// Export singleton instance
let orchestratorInstance = null;

export const getOrchestrator = (config = {}) => {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator(config);
  }
  return orchestratorInstance;
};

export default AgentOrchestrator;
