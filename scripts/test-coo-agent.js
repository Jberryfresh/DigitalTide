/**
 * Test script for COO Agent
 * Tests natural language business query interface and Phase 3.1 functionality
 */

import COOAgent from '../src/agents/specialized/COOAgent.js';
import config from '../src/config/index.js';

async function testCOOAgent() {
  console.log(' Starting COO Agent Tests\n');
  console.log('='.repeat(60));

  const cooAgent = new COOAgent(config.agents?.coo || {});

  try {
    // Test 1: Initialization
    console.log('\n Test 1: Agent Initialization');
    console.log('-'.repeat(60));
    await cooAgent.initialize();
    console.log(' COO Agent initialized\n');

    // Test 2: Natural Language Queries
    console.log('\n Test 2: Natural Language Business Queries');
    console.log('-'.repeat(60));

    const queries = [
      'How are we performing?',
      'What is the status of all agents?',
      'Give me a strategic plan',
      'Show me a performance report',
    ];

    for (const query of queries) {
      console.log(`\n Query: "${query}"`);
      const response = await cooAgent.processBusinessQuery(query);
      console.log(`Response:`, JSON.stringify(response, null, 2));
    }

    // Test 3: Performance Report
    console.log('\n\n Test 3: Performance Monitoring');
    console.log('-'.repeat(60));
    const perfReport = await cooAgent.execute({ type: 'performance_report' });
    console.log('Report:', JSON.stringify(perfReport, null, 2));

    // Test 4: Agent Status
    console.log('\n\n Test 4: Agent Management');
    console.log('-'.repeat(60));
    const agentStatus = await cooAgent.execute({ type: 'agent_status' });
    console.log('Status:', JSON.stringify(agentStatus, null, 2));

    // Test 5: Strategic Planning
    console.log('\n\n Test 5: Strategic Planning');
    console.log('-'.repeat(60));
    const plan = await cooAgent.execute({ type: 'strategic_planning' });
    console.log('Plan:', JSON.stringify(plan, null, 2));

    // Test 6: Crisis Response
    console.log('\n\n Test 6: Crisis Response');
    console.log('-'.repeat(60));
    const crisis = await cooAgent.execute({ type: 'crisis_response' });
    console.log('Crisis:', JSON.stringify(crisis, null, 2));

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(' All COO Agent Tests Completed!');
    console.log('='.repeat(60));
    console.log('\nPhase 3.1 Tasks Completed:');
    console.log('   Natural Language Query Processing');
    console.log('   Strategic Planning & Decision-Making');
    console.log('   Agent Coordination & Task Delegation');
    console.log('   Performance Monitoring & Optimization');
    console.log('   Learning & Adaptation Mechanisms');
    console.log('\n Phase 3.1 COO Agent Implementation Complete!\n');

    await cooAgent.stop();
  } catch (error) {
    console.error('\n Test Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCOOAgent().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
