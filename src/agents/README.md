# DigitalTide AI Agent System

## Overview

The DigitalTide AI Agent System is a sophisticated multi-agent orchestration framework designed to automate the entire content creation pipeline from discovery to publication. Built on a modular architecture, it provides specialized AI agents that work together seamlessly to produce high-quality news articles.

## Architecture

### Agent Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│           Agent Orchestrator (Coordinator)              │
│  - Agent lifecycle management                           │
│  - Task queue processing                                │
│  - Workflow execution                                   │
│  - System monitoring                                    │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴──────────┬──────────────┐
        │                      │              │
┌───────▼─────┐     ┌──────────▼──────┐   ┌─▼──────────┐
│   Content   │     │    Research     │   │   Writer   │
│   Curator   │────▶│     Agent       │──▶│   Agent    │
└─────────────┘     └─────────────────┘   └────┬───────┘
                                                │
                    ┌───────────────────────────┘
                    │
        ┌───────────▼──────────┬──────────────┐
        │                      │              │
┌───────▼─────┐     ┌──────────▼──────┐   ┌─▼──────────┐
│   Quality   │     │      SEO        │   │ Publisher  │
│   Control   │────▶│     Agent       │──▶│   Agent    │
└─────────────┘     └─────────────────┘   └────────────┘
```

## Available Agents

### 1. Content Curator Agent
**Purpose**: Discovers and curates relevant news content from multiple sources.

**Capabilities:**
- Multi-source content discovery (SerpAPI, MediaStack)
- Quality-based scoring and filtering
- Article deduplication
- Database content analytics

**Task Types:**
- `discover` - Find new content from news sources
- `curate` - Filter and score discovered content
- `analyze` - Analyze existing database content

**Example Usage:**
```javascript
await orchestrator.executeTask('contentCurator', {
  type: 'discover',
  params: {
    categories: ['technology', 'science'],
    limit: 10,
    useCache: true,
  },
});
```

### 2. Research Agent
**Purpose**: Conducts research and verifies facts using web search and AI analysis.

**Capabilities:**
- Topic research and information gathering
- Fact verification with confidence scoring
- Source quality assessment
- Multi-source analysis

**Task Types:**
- `search` - Search for information on a topic
- `verify` - Verify facts and claims
- `gather` - Gather sources on a topic
- `analyze` - Analyze gathered sources

**Example Usage:**
```javascript
await orchestrator.executeTask('research', {
  type: 'verify',
  params: {
    content: 'Article content to verify...',
    claims: ['Claim 1', 'Claim 2'],
  },
});
```

### 3. Writer Agent
**Purpose**: Generates high-quality content using AI with multiple writing styles.

**Capabilities:**
- AI-powered article generation
- Multiple writing styles (professional, casual, technical, editorial)
- Flexible length options (short, medium, long)
- Content rewriting and expansion
- Article summarization

**Task Types:**
- `write` - Write a new article from scratch
- `rewrite` - Rewrite existing content with new style
- `expand` - Expand article with additional content
- `summarize` - Create article summary

**Example Usage:**
```javascript
await orchestrator.executeTask('writer', {
  type: 'write',
  params: {
    topic: 'The Future of AI in Journalism',
    style: 'professional',
    length: 'medium',
    keywords: ['AI', 'journalism', 'automation'],
    targetAudience: 'general',
  },
});
```

### 4. Quality Control Agent
**Purpose**: Ensures content meets quality standards through validation and review.

**Capabilities:**
- Content validation against standards
- Grammar and spelling checks
- Fact-checking with AI
- Quality scoring (readability, structure, depth, engagement, SEO)
- Comprehensive content review

**Task Types:**
- `validate` - Validate content against quality standards
- `score` - Calculate quality scores
- `review` - Comprehensive AI-powered review
- `factCheck` - Verify factual claims

**Example Usage:**
```javascript
await orchestrator.executeTask('qualityControl', {
  type: 'validate',
  params: {
    title: 'Article Title',
    content: 'Article content...',
    excerpt: 'Brief summary...',
    minimumWordCount: 300,
  },
});
```

### 5. SEO Agent
**Purpose**: Optimizes content for search engines and improves discoverability.

**Capabilities:**
- Complete SEO analysis
- Meta tag generation (title, description, OG, Twitter cards)
- Keyword extraction and suggestions
- URL slug generation
- Readability assessment
- Structure analysis

**Task Types:**
- `optimize` - Full SEO optimization
- `analyze` - Analyze SEO metrics
- `generateMeta` - Generate meta tags
- `suggestKeywords` - Suggest relevant keywords
- `generateSlug` - Create SEO-friendly slug

**Example Usage:**
```javascript
await orchestrator.executeTask('seo', {
  type: 'optimize',
  params: {
    title: 'Article Title',
    content: 'Article content...',
    excerpt: 'Brief summary...',
    keywords: ['keyword1', 'keyword2'],
    category: 'Technology',
  },
});
```

### 6. Publisher Agent
**Purpose**: Handles content publishing, scheduling, and distribution.

**Capabilities:**
- Database article publishing
- Multi-status workflow (draft, scheduled, published, archived)
- Tag management with auto-creation
- Content scheduling
- Backup system (MCP filesystem ready)
- Version control (MCP github ready)

**Task Types:**
- `publish` - Publish article to database
- `schedule` - Schedule future publication
- `update` - Update existing article
- `archive` - Archive article
- `backup` - Backup content

**Example Usage:**
```javascript
await orchestrator.executeTask('publisher', {
  type: 'publish',
  params: {
    articleData: {
      title: 'Article Title',
      content: 'Article content...',
      excerpt: 'Summary...',
    },
    authorId: 1,
    categoryId: 3,
    tags: ['AI', 'technology'],
    status: 'published',
  },
});
```

## Getting Started

### Installation

The agent system is built into the DigitalTide application. No additional installation is required.

### Initialization

```javascript
import { createAgentSystem } from './src/agents/index.js';

// Initialize with configuration
const orchestrator = await createAgentSystem({
  contentCurator: {
    categories: ['technology', 'business', 'science'],
    limit: 10,
    minQualityScore: 0.7,
  },
  writer: {
    style: 'professional',
    length: 'medium',
  },
  qualityControl: {
    minQualityScore: 0.7,
    checkGrammar: true,
    checkFacts: true,
  },
  seo: {
    maxKeywords: 5,
    targetKeywordDensity: 0.02,
  },
  publisher: {
    autoPublish: false,
    requireApproval: true,
  },
});
```

### Execute Single Task

```javascript
const result = await orchestrator.executeTask('writer', {
  id: 'task-001',
  type: 'write',
  params: {
    topic: 'AI Technology Trends',
    style: 'professional',
    length: 'medium',
  },
});

console.log('Article written:', result.result.headline);
```

### Execute Multi-Agent Workflow

```javascript
const workflow = await orchestrator.executeWorkflow([
  {
    agentName: 'contentCurator',
    task: {
      type: 'discover',
      params: { categories: ['technology'], limit: 5 },
    },
  },
  {
    agentName: 'writer',
    task: {
      type: 'write',
      params: { topic: 'AI News', style: 'professional' },
    },
    usesPreviousResult: true,
  },
  {
    agentName: 'qualityControl',
    task: {
      type: 'validate',
      params: {},
    },
    usesPreviousResult: true,
  },
  {
    agentName: 'seo',
    task: {
      type: 'optimize',
      params: {},
    },
    usesPreviousResult: true,
  },
  {
    agentName: 'publisher',
    task: {
      type: 'publish',
      params: { status: 'draft' },
    },
    usesPreviousResult: true,
  },
]);

console.log('Workflow completed:', workflow.success);
```

### Task Queue

```javascript
// Add tasks to queue for async processing
orchestrator.queueTask('writer', {
  type: 'write',
  params: { topic: 'Topic 1' },
});

orchestrator.queueTask('writer', {
  type: 'write',
  params: { topic: 'Topic 2' },
});

// Queue will be processed automatically
```

### Monitoring

```javascript
// Get system status
const status = orchestrator.getStatus();
console.log('Active agents:', status.orchestrator.activeAgents);
console.log('Queued tasks:', status.orchestrator.queuedTasks);

// Get detailed statistics
const stats = orchestrator.getStats();
console.log('Total tasks:', stats.system.totalTasks);
console.log('Success rate:', stats.system.successRate + '%');

// Get agent-specific stats
for (const [name, agentStats] of Object.entries(stats.agents)) {
  console.log(`${name}:`, {
    tasks: agentStats.stats.tasksExecuted,
    successRate: agentStats.stats.successRate,
    avgTime: agentStats.stats.averageExecutionTime,
  });
}

// Health check
const health = await orchestrator.healthCheck();
console.log('System health:', health.orchestrator);
```

### Event Handling

```javascript
// Listen to system events
orchestrator.on('agentTaskStarted', ({ agent, task }) => {
  console.log(`Agent ${agent} started task ${task.id}`);
});

orchestrator.on('agentTaskCompleted', ({ agent, task, result, duration }) => {
  console.log(`Agent ${agent} completed task in ${duration}ms`);
});

orchestrator.on('agentTaskFailed', ({ agent, task, error }) => {
  console.error(`Agent ${agent} failed:`, error.message);
});
```

### Cleanup

```javascript
// Shutdown the system gracefully
await orchestrator.shutdown();
```

## Demo Script

Run the comprehensive demo to see the agent system in action:

```bash
node scripts/agents/demo-agents.js
```

The demo showcases:
- System initialization
- Individual agent execution
- Multi-agent workflows
- Statistics and monitoring
- Health checks
- Graceful shutdown

## Integration with Existing Services

The agent system integrates seamlessly with:

- **News Service**: Content discovery via SerpAPI and MediaStack
- **Claude AI Service**: Content generation and analysis
- **PostgreSQL Database**: Article storage and retrieval
- **Redis Cache**: Performance optimization

## Phase 3 Integration (MCP Servers)

The agent system is ready for Phase 3 MCP integration:

- **Research Agent**: Will use MCP brave-search and fetch
- **Publisher Agent**: Will use MCP github and filesystem
- **Quality Control Agent**: Will use MCP sequential-thinking

## Best Practices

### Error Handling

```javascript
try {
  const result = await orchestrator.executeTask('writer', {
    type: 'write',
    params: { topic: 'AI News' },
  });
} catch (error) {
  console.error('Task failed:', error.message);
  // Handle error appropriately
}
```

### Configuration

- Set appropriate timeout values for long-running tasks
- Configure quality score thresholds based on content requirements
- Adjust keyword density and SEO parameters for target audience

### Performance

- Use task queue for batch processing
- Enable caching where appropriate
- Monitor agent statistics to identify bottlenecks

### Testing

- Test agents individually before building workflows
- Validate agent outputs at each workflow step
- Monitor error rates and health status

## Troubleshooting

### Agent Not Responding

Check agent health status:
```javascript
const health = agent.getHealth();
console.log('Health:', health.health);
console.log('Status:', health.status);
```

### High Error Rate

Review recent errors:
```javascript
const stats = agent.getStats();
console.log('Recent errors:', stats.stats.errors);
```

### Workflow Failures

Check which step failed:
```javascript
try {
  await orchestrator.executeWorkflow(steps);
} catch (error) {
  console.error('Workflow failed:', error.message);
  // Error message includes failed step information
}
```

## API Reference

### Agent Base Class

All agents extend the base `Agent` class:

**Methods:**
- `async initialize()` - Initialize agent resources
- `async execute(task)` - Execute a task (implemented by subclasses)
- `async cleanup()` - Cleanup agent resources
- `async start()` - Start the agent
- `async stop()` - Stop the agent
- `async run(task)` - Run task with error handling
- `getStats()` - Get agent statistics
- `getHealth()` - Get agent health status
- `pause()` - Pause agent execution
- `resume()` - Resume agent execution

### AgentOrchestrator

**Methods:**
- `async initialize()` - Initialize orchestrator and agents
- `async registerAgent(name, agent)` - Register a new agent
- `getAgent(name)` - Get agent by name
- `async executeTask(agentName, task)` - Execute single task
- `queueTask(agentName, task)` - Add task to queue
- `async executeWorkflow(workflow)` - Execute multi-agent workflow
- `getStatus()` - Get system status
- `getStats()` - Get detailed statistics
- `async healthCheck()` - Check system health
- `pauseAll()` - Pause all agents
- `resumeAll()` - Resume all agents
- `async shutdown()` - Shutdown system

## Contributing

When adding new agents:

1. Extend the `Agent` base class
2. Implement required methods: `initialize()`, `execute()`
3. Add agent to orchestrator initialization
4. Update exports in `index.js`
5. Add documentation and examples

## License

MIT License - Part of the DigitalTide project

## Support

For questions or issues, please create a GitHub issue or contact the development team.
