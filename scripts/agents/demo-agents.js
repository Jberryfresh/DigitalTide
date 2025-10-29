/**
 * Agent System Demo
 * Demonstrates the usage of the AI agent system
 * Run with: node scripts/agents/demo-agents.js
 */

import { createAgentSystem } from '../../src/agents/index.js';

async function demonstrateAgentSystem() {
  console.log('🤖 DigitalTide AI Agent System Demo\n');
  console.log('=' .repeat(60));

  try {
    // Initialize the agent system
    console.log('\n📋 Step 1: Initializing Agent System...');
    const orchestrator = await createAgentSystem({
      contentCurator: {
        categories: ['technology', 'science'],
        limit: 5,
      },
      writer: {
        style: 'professional',
        length: 'medium',
      },
      qualityControl: {
        minQualityScore: 0.7,
      },
      seo: {
        maxKeywords: 5,
      },
    });

    console.log('✅ Agent system initialized successfully!');
    console.log(`   Active agents: ${orchestrator.stats.activeAgents}`);

    // Get system status
    console.log('\n📊 Step 2: Checking System Status...');
    const status = orchestrator.getStatus();
    console.log('   System status:', JSON.stringify(status.orchestrator, null, 2));
    
    // List available agents
    console.log('\n🤖 Step 3: Available Agents:');
    for (const [name, agent] of orchestrator.agents) {
      const health = agent.getHealth();
      console.log(`   - ${name}: ${health.health} (${health.status})`);
    }

    // Demonstrate Content Curator Agent
    console.log('\n📰 Step 4: Content Curation Demo...');
    const curationResult = await orchestrator.executeTask('contentCurator', {
      id: 'demo-curate-1',
      type: 'discover',
      params: {
        categories: ['technology'],
        limit: 3,
        useCache: true,
      },
    });
    console.log('✅ Discovered', curationResult.result.uniqueCount, 'unique articles');

    // Demonstrate Writer Agent
    console.log('\n✍️  Step 5: Content Writing Demo...');
    const writingResult = await orchestrator.executeTask('writer', {
      id: 'demo-write-1',
      type: 'write',
      params: {
        topic: 'The Future of AI in Journalism',
        style: 'professional',
        length: 'short',
        keywords: ['AI', 'journalism', 'automation'],
        targetAudience: 'general',
      },
    });
    console.log('✅ Article written:', writingResult.result.headline?.substring(0, 60) + '...');

    // Demonstrate Quality Control Agent
    console.log('\n🔍 Step 6: Quality Control Demo...');
    const qcResult = await orchestrator.executeTask('qualityControl', {
      id: 'demo-qc-1',
      type: 'score',
      params: {
        title: writingResult.result.headline || 'Test Article',
        content: writingResult.result.content || 'Test content...',
        excerpt: writingResult.result.excerpt || '',
      },
    });
    console.log('✅ Quality score:', qcResult.result.overall, '(Grade:', qcResult.result.grade + ')');

    // Demonstrate SEO Agent
    console.log('\n🔎 Step 7: SEO Optimization Demo...');
    const seoResult = await orchestrator.executeTask('seo', {
      id: 'demo-seo-1',
      type: 'analyze',
      params: {
        title: writingResult.result.headline || 'Test Article',
        content: writingResult.result.content || 'Test content...',
        excerpt: writingResult.result.excerpt || '',
        keywords: ['AI', 'journalism'],
      },
    });
    console.log('✅ SEO score:', seoResult.result.overallScore, '(Grade:', seoResult.result.grade + ')');

    // Demonstrate workflow execution
    console.log('\n🔄 Step 8: Multi-Agent Workflow Demo...');
    console.log('   Executing: Discover → Curate → Write → Quality Check → SEO → Publish');
    
    // Note: This is a simplified demo. In production, you'd pass data between steps
    const workflowResult = await orchestrator.executeWorkflow([
      {
        agentName: 'contentCurator',
        task: {
          type: 'discover',
          params: { categories: ['technology'], limit: 1 },
        },
      },
      {
        agentName: 'seo',
        task: {
          type: 'generateSlug',
          params: { title: 'AI Technology News' },
        },
      },
    ]);
    console.log('✅ Workflow completed:', workflowResult.steps.length, 'steps executed');

    // Get final statistics
    console.log('\n📈 Step 9: Final Statistics...');
    const stats = orchestrator.getStats();
    console.log('   Total tasks executed:', stats.system.totalTasks);
    console.log('   Success rate:', Math.round(stats.system.successRate) + '%');
    console.log('   Queue length:', stats.queue.length);

    // Agent-specific stats
    console.log('\n   Agent Statistics:');
    for (const [name, agentStats] of Object.entries(stats.agents)) {
      if (agentStats.stats.tasksExecuted > 0) {
        console.log(`   - ${name}:`);
        console.log(`     • Tasks: ${agentStats.stats.tasksExecuted}`);
        console.log(`     • Success rate: ${Math.round(agentStats.stats.successRate)}%`);
        console.log(`     • Avg time: ${Math.round(agentStats.stats.averageExecutionTime)}ms`);
      }
    }

    // Cleanup
    console.log('\n🧹 Step 10: Shutting down...');
    await orchestrator.shutdown();
    console.log('✅ Agent system shut down successfully');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Demo completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the demo
demonstrateAgentSystem().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
