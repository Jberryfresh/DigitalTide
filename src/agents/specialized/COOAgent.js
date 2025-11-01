/**
 * Chief Operations Officer (COO) Agent
 * Master orchestrator and direct business interface for CEO-level communication
 * Handles natural language queries, strategic planning, and agent coordination
 */

import Agent from '../base/Agent.js';
import claudeService from '../../services/ai/claudeService.js';

class COOAgent extends Agent {
  constructor(config = {}) {
    super('COO', config);

    this.businessContext = {
      goals: [],
      metrics: {},
      activeProjects: [],
      recentDecisions: [],
    };

    this.performanceMetrics = {
      contentPublished: 0,
      trafficTrends: [],
      revenueTrends: [],
      agentHealthScores: {},
    };

    this.orchestrator = null;
  }

  async initialize() {
    this.logger.info('[COO] Initializing Chief Operations Officer Agent...');

    // Check if Claude AI is available
    const hasClaudeAPI = claudeService && claudeService.client;
    if (!hasClaudeAPI) {
      this.logger.warn('[COO] Claude AI not configured - NLP features limited');
    }

    this.initialized = true;
    this.logger.info('[COO] Ready for executive communications');
  }

  async execute(task) {
    const { type, query, context, details } = task;

    switch (type) {
      case 'business_query':
        return await this.processBusinessQuery(query);

      case 'performance_report':
        return await this.generatePerformanceReport();

      case 'agent_status':
        return await this.getAgentStatus();

      case 'strategic_planning':
        return await this.processStrategicPlanning(context);

      case 'crisis_response':
        return await this.handleCrisisResponse(details);

      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  async processBusinessQuery(query) {
    this.logger.info(`[COO] Processing query: "${query}"`);

    const understanding = await this.understandQuery(query);
    let response;

    switch (understanding.intent) {
      case 'performance_inquiry':
        response = await this.handlePerformanceInquiry(understanding);
        break;
      case 'strategic_planning':
        response = await this.handleStrategicPlanning(understanding);
        break;
      case 'agent_management':
        response = await this.handleAgentManagement(understanding);
        break;
      case 'crisis_response':
        response = await this.handleCrisisResponse(understanding);
        break;
      case 'reporting':
        response = await this.generateReport(understanding);
        break;
      default:
        response = await this.handleGeneralQuery(understanding);
    }

    // Store for learning
    this.businessContext.recentDecisions.push({
      query,
      intent: understanding.intent,
      response,
      timestamp: new Date(),
    });

    if (this.businessContext.recentDecisions.length > 50) {
      this.businessContext.recentDecisions.shift();
    }

    return response;
  }

  async understandQuery(query) {
    // Check if Claude AI is available
    const hasClaudeAPI = claudeService && claudeService.client;
    if (!hasClaudeAPI) {
      return this.fallbackQueryParsing(query);
    }

    const prompt = `Analyze this CEO query and extract:
1. Intent (performance_inquiry, strategic_planning, agent_management, crisis_response, reporting, general)
2. Key entities
3. Urgency level

Query: "${query}"

Respond in JSON:
{
  "intent": "type",
  "entities": {},
  "urgency": "level",
  "summary": "brief understanding"
}`;

    try {
      const response = await claudeService.chat([{ role: 'user', content: prompt }], {
        temperature: 0.3,
        max_tokens: 1000,
      });

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : this.fallbackQueryParsing(query);
    } catch (error) {
      this.logger.warn('[COO] AI parsing failed, using fallback');
      return this.fallbackQueryParsing(query);
    }
  }

  fallbackQueryParsing(query) {
    const lower = query.toLowerCase();
    let intent = 'general';

    if (lower.includes('perform') || lower.includes('metric')) intent = 'performance_inquiry';
    else if (lower.includes('plan') || lower.includes('strategy')) intent = 'strategic_planning';
    else if (lower.includes('agent') || lower.includes('status')) intent = 'agent_management';
    else if (lower.includes('crisis') || lower.includes('urgent')) intent = 'crisis_response';
    else if (lower.includes('report') || lower.includes('summary')) intent = 'reporting';

    return {
      intent,
      entities: {},
      urgency: 'medium',
      summary: query,
    };
  }

  async handlePerformanceInquiry(understanding) {
    const systemHealth = this.getSystemHealth();

    return {
      success: true,
      type: 'performance_report',
      data: {
        systemHealth,
        contentMetrics: this.performanceMetrics,
        recommendations: this.generateRecommendations(systemHealth),
      },
      summary: `${systemHealth.totalAgents} agents, ${systemHealth.totalTasks} tasks, ${(systemHealth.successRate * 100).toFixed(1)}% success`,
    };
  }

  async handleStrategicPlanning(understanding) {
    return {
      success: true,
      type: 'strategic_planning',
      data: {
        currentGoals: this.businessContext.goals,
        nextSteps: [
          'Deploy Crawler Agent',
          'Deploy Research Agent',
          'Deploy Writer Agent',
          'Deploy Quality Control Agent',
          'Deploy Publisher Agent',
        ],
      },
      summary: 'Phase 3 deployment strategy ready',
    };
  }

  async handleAgentManagement(understanding) {
    const agents = this.orchestrator
      ? Array.from(this.orchestrator.agents.entries()).map(([name, agent]) => ({
          name,
          status: agent.status,
          stats: agent.stats,
        }))
      : [];

    return {
      success: true,
      type: 'agent_management',
      data: { agents, totalAgents: agents.length },
      summary: `${agents.length} agents operational`,
    };
  }

  async handleCrisisResponse(details) {
    this.logger.error('[COO] CRISIS MODE ACTIVATED');

    return {
      success: true,
      type: 'crisis_response',
      status: 'alert',
      actions: ['Assessing system', 'Notifying agents', 'Preparing report'],
      summary: 'Crisis response initiated',
    };
  }

  async generateReport(understanding) {
    const systemHealth = this.getSystemHealth();

    return {
      success: true,
      type: 'comprehensive_report',
      data: {
        executiveSummary: `${systemHealth.totalAgents} agents, ${systemHealth.totalTasks} tasks processed`,
        systemHealth,
        businessMetrics: this.performanceMetrics,
        recommendations: this.generateRecommendations(systemHealth),
      },
    };
  }

  async handleGeneralQuery(understanding) {
    return {
      success: true,
      type: 'general_response',
      summary: 'Could you provide more specific details?',
    };
  }

  getSystemHealth() {
    if (!this.orchestrator) {
      return {
        totalAgents: 0,
        totalTasks: this.stats.tasksExecuted,
        successRate:
          this.stats.tasksExecuted > 0 ? this.stats.tasksSucceeded / this.stats.tasksExecuted : 1,
        agents: [],
      };
    }

    const agents = Array.from(this.orchestrator.agents.entries()).map(([name, agent]) => ({
      name,
      status: agent.status,
      health: {
        tasksExecuted: agent.stats.tasksExecuted,
        successRate:
          agent.stats.tasksExecuted > 0
            ? agent.stats.tasksSucceeded / agent.stats.tasksExecuted
            : 1,
      },
    }));

    return {
      totalAgents: agents.length,
      totalTasks: this.orchestrator.stats.totalTasks,
      successRate:
        this.orchestrator.stats.totalTasks > 0
          ? this.orchestrator.stats.completedTasks / this.orchestrator.stats.totalTasks
          : 1,
      agents,
    };
  }

  generateRecommendations(systemHealth) {
    const recommendations = [];

    if (systemHealth.successRate < 0.95) {
      recommendations.push({
        priority: 'high',
        area: 'reliability',
        message: 'Success rate below target',
      });
    }

    if (systemHealth.totalAgents === 0) {
      recommendations.push({
        priority: 'medium',
        area: 'deployment',
        message: 'Begin deploying specialized agents',
      });
    }

    return recommendations;
  }

  async generatePerformanceReport() {
    return this.handlePerformanceInquiry({});
  }

  async getAgentStatus() {
    return this.handleAgentManagement({});
  }

  async processStrategicPlanning(context) {
    return this.handleStrategicPlanning({ context });
  }

  async start() {
    if (!this.initialized) {
      await this.initialize();
    }
    this.status = 'idle';
    return true;
  }

  async stop() {
    this.status = 'stopped';
    return true;
  }

  async pause() {
    this.status = 'paused';
    return true;
  }

  async resume() {
    this.status = 'idle';
    return true;
  }

  getStatus() {
    return {
      name: this.name,
      status: this.status,
      stats: this.stats,
      businessContext: {
        goalsCount: this.businessContext.goals.length,
        activeProjects: this.businessContext.activeProjects.length,
        recentDecisions: this.businessContext.recentDecisions.length,
      },
    };
  }
}

export default COOAgent;
