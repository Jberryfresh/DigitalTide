/**
 * Agent Framework Test Script
 * Comprehensive tests for the advanced agent framework
 * Tests: AgentMessage protocol, TaskQueue, AgentRegistry, heartbeat monitoring
 */

import TestAgent from '../src/agents/implementations/TestAgent.js';
import AgentMessage from '../src/agents/protocol/AgentMessage.js';
import { getTaskQueue } from '../src/services/queue/taskQueue.js';
import { getRegistry } from '../src/agents/registry/AgentRegistry.js';

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

/**
 * Run a test and track results
 */
async function test(name, fn) {
  try {
    console.log(`${colors.blue}Running:${colors.reset} ${name}`);
    await fn();
    results.passed++;
    results.tests.push({ name, passed: true });
    console.log(`${colors.green}✓ PASSED:${colors.reset} ${name}\n`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, passed: false, error: error.message });
    console.log(`${colors.red}✗ FAILED:${colors.reset} ${name}`);
    console.log(`${colors.gray}  Error: ${error.message}${colors.reset}\n`);
  }
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Test suite: AgentMessage Protocol
 */
async function testAgentMessage() {
  await test('AgentMessage - Create message with required fields', async () => {
    const message = new AgentMessage({
      sender: 'TestAgent',
      receiver: 'TargetAgent',
      type: AgentMessage.TYPE.TASK,
      data: { test: 'data' },
    });

    assert(message.id, 'Message should have UUID');
    assert(message.sender === 'TestAgent', 'Sender should match');
    assert(message.receiver === 'TargetAgent', 'Receiver should match');
    assert(message.type === AgentMessage.TYPE.TASK, 'Type should match');
    assert(message.status === AgentMessage.STATUS.PENDING, 'Initial status should be PENDING');
  });

  await test('AgentMessage - Validate message types', async () => {
    const validTypes = Object.values(AgentMessage.TYPE);
    for (const type of validTypes) {
      const message = new AgentMessage({
        sender: 'A',
        receiver: 'B',
        type,
        data: {},
      });
      assert(message.type === type, `Type ${type} should be valid`);
    }
  });

  await test('AgentMessage - Priority levels', async () => {
    const priorities = Object.values(AgentMessage.PRIORITY);
    for (const priority of priorities) {
      const message = new AgentMessage({
        sender: 'A',
        receiver: 'B',
        type: AgentMessage.TYPE.TASK,
        data: {},
        priority,
      });
      assert(message.priority === priority, `Priority ${priority} should be set`);
    }
  });

  await test('AgentMessage - Status transitions', async () => {
    const message = new AgentMessage({
      sender: 'A',
      receiver: 'B',
      type: AgentMessage.TYPE.TASK,
      data: {},
    });

    message.markProcessing();
    assert(message.status === AgentMessage.STATUS.PROCESSING, 'Status should be PROCESSING');
    assert(message.processedAt, 'ProcessedAt should be set');

    message.markCompleted({ result: 'success' });
    assert(message.status === AgentMessage.STATUS.COMPLETED, 'Status should be COMPLETED');
    assert(message.completedAt, 'CompletedAt should be set');
  });

  await test('AgentMessage - Retry logic', async () => {
    const message = new AgentMessage({
      sender: 'A',
      receiver: 'B',
      type: AgentMessage.TYPE.TASK,
      data: {},
    });

    message.markFailed('Test failure');
    assert(message.canRetry(), 'Should be able to retry after failure');

    const retried = message.retry();
    assert(retried, 'Retry should succeed');
    assert(message.retryCount === 1, 'Retry count should increment');
    assert(message.status === AgentMessage.STATUS.PENDING, 'Status should reset to PENDING');
  });

  await test('AgentMessage - Serialization/Deserialization', async () => {
    const original = new AgentMessage({
      sender: 'A',
      receiver: 'B',
      type: AgentMessage.TYPE.TASK,
      data: { key: 'value' },
      priority: AgentMessage.PRIORITY.HIGH,
    });

    const json = original.toJSON();
    const deserialized = AgentMessage.fromJSON(json);

    assert(deserialized.id === original.id, 'ID should match');
    assert(deserialized.sender === original.sender, 'Sender should match');
    assert(deserialized.receiver === original.receiver, 'Receiver should match');
    assert(deserialized.type === original.type, 'Type should match');
    assert(deserialized.priority === original.priority, 'Priority should match');
  });
}

/**
 * Test suite: Task Queue Service
 */
async function testTaskQueue() {
  const taskQueue = getTaskQueue();

  await test('TaskQueue - Initialize service', async () => {
    await taskQueue.initialize();
    assert(taskQueue.initialized, 'TaskQueue should be initialized');
  });

  await test('TaskQueue - Add task to queue', async () => {
    const message = new AgentMessage({
      sender: 'TestSender',
      receiver: 'TestReceiver',
      type: AgentMessage.TYPE.TASK,
      data: { test: 'data' },
      priority: AgentMessage.PRIORITY.MEDIUM,
    });

    const job = await taskQueue.addTask(message);
    assert(job.jobId, 'Job should have ID');
    assert(job.priority === 'medium', 'Priority should match');
  });

  await test('TaskQueue - Get queue statistics', async () => {
    const stats = await taskQueue.getStats();
    assert(stats.totalEnqueued >= 1, 'Should have enqueued tasks');
    assert(stats.queueSizes, 'Should have queue sizes');
  });

  await test('TaskQueue - Health check', async () => {
    const health = await taskQueue.healthCheck();
    assert(health.status, 'Health status should exist');
    assert(health.queues, 'Queue health info should exist');
  });
}

/**
 * Test suite: Agent Registry
 */
async function testAgentRegistry() {
  const registry = getRegistry();

  await test('AgentRegistry - Initialize registry', async () => {
    await registry.initialize();
    assert(registry.initialized, 'Registry should be initialized');
  });

  await test('AgentRegistry - Register agent', async () => {
    const agent = new TestAgent({ delay: 50 });
    await registry.register('test-agent-1', agent, {
      type: 'test',
      capabilities: ['testing', 'validation'],
      metadata: { version: '1.0' },
    });

    const retrieved = registry.getAgent('test-agent-1');
    assert(retrieved, 'Agent should be retrievable');
    assert(retrieved.name === 'TestAgent', 'Agent name should match');
  });

  await test('AgentRegistry - Get agents by type', async () => {
    const agents = registry.getAgentsByType('test');
    assert(agents.length > 0, 'Should find agents by type');
  });

  await test('AgentRegistry - Get agents by capability', async () => {
    const agents = registry.getAgentsByCapability('testing');
    assert(agents.length > 0, 'Should find agents by capability');
  });

  await test('AgentRegistry - Load balancing', async () => {
    // Register another test agent
    const agent2 = new TestAgent({ delay: 50 });
    await registry.register('test-agent-2', agent2, {
      type: 'test',
      capabilities: ['testing'],
    });

    const bestAgent = registry.findBestAgent('test');
    assert(bestAgent, 'Should find best agent');
  });

  await test('AgentRegistry - Get statistics', async () => {
    const stats = registry.getStats();
    assert(stats.totalAgents >= 2, 'Should have registered agents');
    assert(stats.byType, 'Should have type statistics');
    assert(stats.byCapability, 'Should have capability statistics');
  });

  await test('AgentRegistry - Health check', async () => {
    const health = registry.getHealth();
    assert(health.status, 'Health status should exist');
    assert(health.agents, 'Agent health info should exist');
  });
}

/**
 * Test suite: Agent Heartbeat Monitoring
 */
async function testHeartbeat() {
  await test('Heartbeat - Agent starts heartbeat on initialization', async () => {
    const agent = new TestAgent({ delay: 50, heartbeatEnabled: true });
    await agent.start();

    assert(agent.heartbeatEnabled, 'Heartbeat should be enabled');
    assert(agent.heartbeatTimer, 'Heartbeat timer should be set');
    assert(agent.lastHeartbeat, 'Should have initial heartbeat');

    await agent.stop();
  });

  await test('Heartbeat - Agent emits heartbeat events', async () =>
    new Promise(async (resolve, reject) => {
      const agent = new TestAgent({
        delay: 50,
        heartbeatEnabled: true,
        heartbeatInterval: 100,
      });

      let heartbeatReceived = false;

      agent.on('heartbeat', data => {
        heartbeatReceived = true;
        assert(data.agent === 'TestAgent', 'Heartbeat should include agent name');
        assert(data.timestamp, 'Heartbeat should have timestamp');
        assert(data.status, 'Heartbeat should include status');
        agent.stop().then(() => resolve());
      });

      await agent.start();

      // Timeout if heartbeat not received
      setTimeout(() => {
        agent.stop();
        if (!heartbeatReceived) {
          reject(new Error('Heartbeat not received within timeout'));
        }
      }, 500);
    }));

  await test('Heartbeat - Agent stops heartbeat on stop', async () => {
    const agent = new TestAgent({ delay: 50, heartbeatEnabled: true });
    await agent.start();
    await agent.stop();

    assert(!agent.heartbeatTimer, 'Heartbeat timer should be cleared');
  });

  await test('Heartbeat - Responsive check', async () => {
    const agent = new TestAgent({ delay: 50, heartbeatEnabled: true });
    await agent.start();

    assert(agent.isResponsive(), 'Agent should be responsive');

    await agent.stop();
  });
}

/**
 * Test suite: Integration Tests
 */
async function testIntegration() {
  const registry = getRegistry();
  const taskQueue = getTaskQueue();

  await test('Integration - Route message through registry', async () => {
    const agent = registry.getAgent('test-agent-1');
    assert(agent, 'Test agent should exist in registry');

    const message = new AgentMessage({
      sender: 'TestSender',
      receiver: 'test-agent-1',
      type: AgentMessage.TYPE.TASK,
      data: { test: 'integration' },
    });

    const result = await registry.routeMessage(message);
    assert(result.success, 'Message routing should succeed');
    assert(message.status === AgentMessage.STATUS.COMPLETED, 'Message should be completed');
  });

  await test('Integration - End-to-end task processing', async () => {
    const message = new AgentMessage({
      sender: 'IntegrationTest',
      receiver: 'test-agent-1',
      type: AgentMessage.TYPE.TASK,
      data: { action: 'process' },
      priority: AgentMessage.PRIORITY.HIGH,
    });

    // Add to queue
    const job = await taskQueue.addTask(message);
    assert(job, 'Job should be created');

    // Verify job status
    const jobStatus = await taskQueue.getJobStatus(message.id);
    assert(jobStatus, 'Job status should be retrievable');
  });
}

/**
 * Cleanup after tests
 */
async function cleanup() {
  console.log(`\n${colors.yellow}Cleaning up...${colors.reset}`);

  try {
    const registry = getRegistry();
    await registry.shutdown();

    const taskQueue = getTaskQueue();
    await taskQueue.close();

    console.log(`${colors.green}Cleanup complete${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Cleanup error: ${error.message}${colors.reset}`);
  }
}

/**
 * Print test summary
 */
function printSummary() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}TEST SUMMARY${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);

  if (results.failed > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    results.tests
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  ✗ ${t.name}`);
        console.log(`    ${colors.gray}${t.error}${colors.reset}`);
      });
  }

  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}AGENT FRAMEWORK TEST SUITE${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  try {
    console.log(`${colors.yellow}1. Testing AgentMessage Protocol${colors.reset}\n`);
    await testAgentMessage();

    console.log(`\n${colors.yellow}2. Testing Task Queue Service${colors.reset}\n`);
    await testTaskQueue();

    console.log(`\n${colors.yellow}3. Testing Agent Registry${colors.reset}\n`);
    await testAgentRegistry();

    console.log(`\n${colors.yellow}4. Testing Heartbeat Monitoring${colors.reset}\n`);
    await testHeartbeat();

    console.log(`\n${colors.yellow}5. Running Integration Tests${colors.reset}\n`);
    await testIntegration();
  } catch (error) {
    console.error(`\n${colors.red}Fatal error running tests: ${error.message}${colors.reset}`);
  } finally {
    await cleanup();
    printSummary();

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  process.exit(1);
});
