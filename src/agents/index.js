/**
 * AI Agents Index
 * Central export point for all agents and orchestrator
 */

// Base classes
export { default as Agent } from './base/Agent.js';

// Specialized agents
export { default as ContentCuratorAgent } from './specialized/ContentCuratorAgent.js';
export { default as ResearchAgent } from './specialized/ResearchAgent.js';
export { default as WriterAgent } from './specialized/WriterAgent.js';
export { default as QualityControlAgent } from './specialized/QualityControlAgent.js';
export { default as SEOAgent } from './specialized/SEOAgent.js';
export { default as PublisherAgent } from './specialized/PublisherAgent.js';

// Orchestrator
export { default as AgentOrchestrator, getOrchestrator } from './AgentOrchestrator.js';

/**
 * Factory function to create and initialize orchestrator with all agents
 * @param {Object} config - Configuration for all agents
 * @returns {Promise<AgentOrchestrator>} Initialized orchestrator
 */
export async function createAgentSystem(config = {}) {
  const { getOrchestrator } = await import('./AgentOrchestrator.js');
  const orchestrator = getOrchestrator(config);
  await orchestrator.initialize();
  return orchestrator;
}
