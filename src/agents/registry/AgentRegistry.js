/**
 * Agent Registry
 * Central registry for agent discovery, load balancing, and system-wide statistics
 * Provides agent lookup, capability-based routing, and health monitoring
 */

import EventEmitter from 'events';
import AgentMessage from '../protocol/AgentMessage.js';

class AgentRegistry extends EventEmitter {
  constructor() {
    super();

    // Map of registered agents: name -> agent instance
    this.agents = new Map();

    // Map of agent capabilities: capability -> array of agent names
    this.capabilities = new Map();

    // Map of agent types: type -> array of agent names
    this.types = new Map();

    // Agent metadata
    this.metadata = new Map();

    this.logger = console;
    this.initialized = false;
  }

  /**
   * Initialize the registry
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    this.logger.info('[AgentRegistry] Initializing agent registry...');
    this.initialized = true;
    this.emit('initialized');
    this.logger.info('[AgentRegistry] Agent registry initialized');
  }

  /**
   * Register an agent
   * @param {string} name - Unique agent name
   * @param {Agent} agent - Agent instance
   * @param {Object} options - Registration options
   * @param {string} options.type - Agent type (e.g., 'crawler', 'writer')
   * @param {Array<string>} options.capabilities - Agent capabilities
   * @param {Object} options.metadata - Additional metadata
   * @returns {Promise<boolean>} True if registered successfully
   */
  async register(name, agent, options = {}) {
    if (this.agents.has(name)) {
      throw new Error(`Agent ${name} is already registered`);
    }

    this.logger.info(`[AgentRegistry] Registering agent: ${name}`);

    // Start the agent if not already started
    if (!agent.initialized) {
      const started = await agent.start();
      if (!started) {
        throw new Error(`Failed to start agent: ${name}`);
      }
    }

    // Register agent
    this.agents.set(name, agent);

    // Store metadata
    const metadata = {
      name,
      type: options.type || 'generic',
      capabilities: options.capabilities || [],
      registeredAt: new Date().toISOString(),
      metadata: options.metadata || {},
      loadScore: 0, // For load balancing
    };

    this.metadata.set(name, metadata);

    // Index by type
    const { type } = metadata;
    if (!this.types.has(type)) {
      this.types.set(type, []);
    }
    this.types.get(type).push(name);

    // Index by capabilities
    for (const capability of metadata.capabilities) {
      if (!this.capabilities.has(capability)) {
        this.capabilities.set(capability, []);
      }
      this.capabilities.get(capability).push(name);
    }

    // Set up event listeners
    this.setupAgentListeners(name, agent);

    this.logger.info(`[AgentRegistry] Agent ${name} registered successfully`);
    this.emit('agentRegistered', { name, metadata });

    return true;
  }

  /**
   * Unregister an agent
   * @param {string} name - Agent name
   * @returns {Promise<boolean>} True if unregistered successfully
   */
  async unregister(name) {
    const agent = this.agents.get(name);
    if (!agent) {
      return false;
    }

    this.logger.info(`[AgentRegistry] Unregistering agent: ${name}`);

    // Stop the agent
    await agent.stop();

    // Remove from main registry
    this.agents.delete(name);

    // Remove metadata
    const metadata = this.metadata.get(name);
    this.metadata.delete(name);

    // Remove from type index
    if (metadata) {
      const typeAgents = this.types.get(metadata.type);
      if (typeAgents) {
        const index = typeAgents.indexOf(name);
        if (index > -1) {
          typeAgents.splice(index, 1);
        }
      }

      // Remove from capability index
      for (const capability of metadata.capabilities) {
        const capabilityAgents = this.capabilities.get(capability);
        if (capabilityAgents) {
          const index = capabilityAgents.indexOf(name);
          if (index > -1) {
            capabilityAgents.splice(index, 1);
          }
        }
      }
    }

    this.logger.info(`[AgentRegistry] Agent ${name} unregistered`);
    this.emit('agentUnregistered', { name });

    return true;
  }

  /**
   * Set up event listeners for an agent
   * @param {string} name - Agent name
   * @param {Agent} agent - Agent instance
   */
  setupAgentListeners(name, agent) {
    agent.on('taskStarted', () => {
      this.updateLoadScore(name, 1);
    });

    agent.on('taskCompleted', () => {
      this.updateLoadScore(name, -1);
    });

    agent.on('taskFailed', () => {
      this.updateLoadScore(name, -1);
    });

    agent.on('error', ({ error }) => {
      this.logger.error(`[AgentRegistry] Agent ${name} error:`, error.message);
      this.emit('agentError', { name, error });
    });
  }

  /**
   * Update agent load score for load balancing
   * @param {string} name - Agent name
   * @param {number} delta - Change in load score
   */
  updateLoadScore(name, delta) {
    const metadata = this.metadata.get(name);
    if (metadata) {
      metadata.loadScore = Math.max(0, metadata.loadScore + delta);
    }
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
   * Get agents by type
   * @param {string} type - Agent type
   * @returns {Array<Agent>} Array of agent instances
   */
  getAgentsByType(type) {
    const agentNames = this.types.get(type) || [];
    return agentNames.map(name => this.agents.get(name)).filter(Boolean);
  }

  /**
   * Get agents by capability
   * @param {string} capability - Capability name
   * @returns {Array<Agent>} Array of agent instances
   */
  getAgentsByCapability(capability) {
    const agentNames = this.capabilities.get(capability) || [];
    return agentNames.map(name => this.agents.get(name)).filter(Boolean);
  }

  /**
   * Find the best agent for a task (load balancing)
   * @param {string} type - Agent type
   * @returns {Agent|null} Best available agent or null
   */
  findBestAgent(type) {
    const agentNames = this.types.get(type) || [];

    if (agentNames.length === 0) {
      return null;
    }

    // Sort by load score (lowest first) and filter only healthy agents
    const sortedAgents = agentNames
      .map(name => ({
        name,
        agent: this.agents.get(name),
        metadata: this.metadata.get(name),
      }))
      .filter(({ agent }) => agent && agent.status === 'idle')
      .sort((a, b) => a.metadata.loadScore - b.metadata.loadScore);

    if (sortedAgents.length === 0) {
      return null;
    }

    return sortedAgents[0].agent;
  }

  /**
   * Find the best agent by capability (load balancing)
   * @param {string} capability - Capability name
   * @returns {Agent|null} Best available agent or null
   */
  findBestAgentByCapability(capability) {
    const agentNames = this.capabilities.get(capability) || [];

    if (agentNames.length === 0) {
      return null;
    }

    // Sort by load score (lowest first) and filter only healthy agents
    const sortedAgents = agentNames
      .map(name => ({
        name,
        agent: this.agents.get(name),
        metadata: this.metadata.get(name),
      }))
      .filter(({ agent }) => agent && agent.status === 'idle')
      .sort((a, b) => a.metadata.loadScore - b.metadata.loadScore);

    if (sortedAgents.length === 0) {
      return null;
    }

    return sortedAgents[0].agent;
  }

  /**
   * Route a message to the appropriate agent
   * @param {AgentMessage} message - Message to route
   * @returns {Promise<Object>} Routing result
   */
  async routeMessage(message) {
    if (!(message instanceof AgentMessage)) {
      throw new Error('Message must be an AgentMessage instance');
    }

    const agent = this.getAgent(message.receiver);

    if (!agent) {
      throw new Error(`Agent not found: ${message.receiver}`);
    }

    this.logger.info(`[AgentRegistry] Routing message ${message.id} to ${message.receiver}`);

    message.markProcessing();

    try {
      // Execute task
      const result = await agent.run(message.data);
      message.markCompleted(result);

      return {
        success: true,
        message,
        result,
      };
    } catch (error) {
      message.markFailed(error);
      throw error;
    }
  }

  /**
   * Get all registered agents
   * @returns {Array<Object>} Array of agent info objects
   */
  getAllAgents() {
    return Array.from(this.agents.entries()).map(([name, agent]) => ({
      name,
      agent,
      metadata: this.metadata.get(name),
    }));
  }

  /**
   * Get registry statistics
   * @returns {Object} Registry statistics
   */
  getStats() {
    const agentStats = {};
    const typeStats = {};
    const capabilityStats = {};

    // Aggregate agent stats
    for (const [name, agent] of this.agents) {
      agentStats[name] = agent.getStats();
    }

    // Count agents by type
    for (const [type, agents] of this.types) {
      typeStats[type] = agents.length;
    }

    // Count agents by capability
    for (const [capability, agents] of this.capabilities) {
      capabilityStats[capability] = agents.length;
    }

    return {
      totalAgents: this.agents.size,
      totalTypes: this.types.size,
      totalCapabilities: this.capabilities.size,
      agents: agentStats,
      byType: typeStats,
      byCapability: capabilityStats,
    };
  }

  /**
   * Get registry health status
   * @returns {Object} Health status
   */
  getHealth() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      totalAgents: this.agents.size,
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
      health.status = 'critical';
    } else if (degradedCount > 0) {
      health.status = 'degraded';
    }

    health.degradedCount = degradedCount;
    health.criticalCount = criticalCount;

    return health;
  }

  /**
   * Pause all agents
   */
  pauseAll() {
    this.logger.info('[AgentRegistry] Pausing all agents...');

    for (const [name, agent] of this.agents) {
      agent.pause();
      this.logger.info(`[AgentRegistry] Agent ${name} paused`);
    }

    this.emit('allAgentsPaused');
  }

  /**
   * Resume all agents
   */
  resumeAll() {
    this.logger.info('[AgentRegistry] Resuming all agents...');

    for (const [name, agent] of this.agents) {
      agent.resume();
      this.logger.info(`[AgentRegistry] Agent ${name} resumed`);
    }

    this.emit('allAgentsResumed');
  }

  /**
   * Shutdown the registry and all agents
   */
  async shutdown() {
    this.logger.info('[AgentRegistry] Shutting down agent registry...');

    // Unregister all agents
    const agentNames = Array.from(this.agents.keys());
    for (const name of agentNames) {
      await this.unregister(name);
    }

    this.agents.clear();
    this.metadata.clear();
    this.types.clear();
    this.capabilities.clear();

    this.initialized = false;
    this.emit('shutdown');
    this.logger.info('[AgentRegistry] Agent registry shutdown complete');
  }
}

// Export singleton instance
let registryInstance = null;

export const getRegistry = () => {
  if (!registryInstance) {
    registryInstance = new AgentRegistry();
  }
  return registryInstance;
};

export default AgentRegistry;
