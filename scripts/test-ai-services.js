/**
 * AI Services Test Script
 * Tests OpenAI and Anthropic API connections and basic functionality
 * 
 * Usage: node scripts/test-ai-services.js
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test all AI services
 */
async function testAIServices() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║      Testing DigitalTide AI Services              ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  let successCount = 0;
  let failureCount = 0;
  const results = [];

  // Test 1: OpenAI
  console.log('1️⃣  Testing OpenAI GPT API...');
  console.log('─'.repeat(50));
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000
    });

    const startTime = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for the DigitalTide news platform."
        },
        {
          role: "user",
          content: "Say 'Hello from DigitalTide!' and confirm you're working."
        }
      ],
      max_tokens: 50,
      temperature: 0.7
    });

    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Status: SUCCESS`);
    console.log(`🤖 Model: ${completion.model}`);
    console.log(`💬 Response: ${completion.choices[0].message.content}`);
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`📊 Tokens: ${completion.usage.prompt_tokens} in / ${completion.usage.completion_tokens} out / ${completion.usage.total_tokens} total`);
    console.log(`💰 Estimated cost: $${estimateCost('openai', completion.model, completion.usage).toFixed(6)}`);
    
    successCount++;
    results.push({
      service: 'OpenAI',
      status: 'success',
      model: completion.model,
      responseTime,
      tokens: completion.usage.total_tokens
    });
  } catch (error) {
    console.log(`❌ Status: FAILED`);
    console.log(`💥 Error: ${error.message}`);
    
    if (error.status) {
      console.log(`📄 Status Code: ${error.status}`);
    }
    
    if (error.status === 401) {
      console.log(`🔑 Hint: Check your OPENAI_API_KEY in .env file`);
    } else if (error.status === 429) {
      console.log(`⏰ Hint: Rate limit exceeded or quota reached. Check billing.`);
    } else if (error.status === 400) {
      console.log(`⚠️  Hint: Invalid request. Check model name and parameters.`);
    }
    
    failureCount++;
    results.push({
      service: 'OpenAI',
      status: 'failed',
      error: error.message
    });
  }

  console.log('\n');

  // Test 2: OpenAI Embeddings
  console.log('2️⃣  Testing OpenAI Embeddings API...');
  console.log('─'.repeat(50));
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000
    });

    const startTime = Date.now();
    
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "DigitalTide is an AI-powered news curation platform."
    });

    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Status: SUCCESS`);
    console.log(`🤖 Model: ${embedding.model}`);
    console.log(`📏 Dimensions: ${embedding.data[0].embedding.length}`);
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`📊 Tokens used: ${embedding.usage.total_tokens}`);
    console.log(`💰 Estimated cost: $${estimateCost('openai', embedding.model, embedding.usage).toFixed(6)}`);
    console.log(`🔢 Sample vector: [${embedding.data[0].embedding.slice(0, 5).map(n => n.toFixed(4)).join(', ')}, ...]`);
    
    successCount++;
    results.push({
      service: 'OpenAI Embeddings',
      status: 'success',
      model: embedding.model,
      responseTime,
      dimensions: embedding.data[0].embedding.length
    });
  } catch (error) {
    console.log(`❌ Status: FAILED`);
    console.log(`💥 Error: ${error.message}`);
    
    if (error.status) {
      console.log(`📄 Status Code: ${error.status}`);
    }
    
    failureCount++;
    results.push({
      service: 'OpenAI Embeddings',
      status: 'failed',
      error: error.message
    });
  }

  console.log('\n');

  // Test 3: Anthropic Claude
  console.log('3️⃣  Testing Anthropic Claude API...');
  console.log('─'.repeat(50));
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not found in environment variables');
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 30000
    });

    const startTime = Date.now();
    
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Say 'Hello from DigitalTide!' and confirm you're working."
        }
      ]
    });

    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Status: SUCCESS`);
    console.log(`🤖 Model: ${message.model}`);
    console.log(`💬 Response: ${message.content[0].text}`);
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`📊 Tokens: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out`);
    console.log(`💰 Estimated cost: $${estimateCost('anthropic', message.model, {
      prompt_tokens: message.usage.input_tokens,
      completion_tokens: message.usage.output_tokens
    }).toFixed(6)}`);
    console.log(`🔄 Stop reason: ${message.stop_reason}`);
    
    successCount++;
    results.push({
      service: 'Anthropic',
      status: 'success',
      model: message.model,
      responseTime,
      tokens: message.usage.input_tokens + message.usage.output_tokens
    });
  } catch (error) {
    console.log(`❌ Status: FAILED`);
    console.log(`💥 Error: ${error.message}`);
    
    if (error.status) {
      console.log(`📄 Status Code: ${error.status}`);
    }
    
    if (error.status === 401) {
      console.log(`🔑 Hint: Check your ANTHROPIC_API_KEY in .env file`);
    } else if (error.status === 429) {
      console.log(`⏰ Hint: Rate limit exceeded. Implement exponential backoff.`);
    }
    
    failureCount++;
    results.push({
      service: 'Anthropic',
      status: 'failed',
      error: error.message
    });
  }

  console.log('\n');

  // Summary
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║                  Test Summary                      ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log(`✅ Successful: ${successCount}/3 services`);
  console.log(`❌ Failed: ${failureCount}/3 services`);
  console.log('');

  // Detailed results
  if (results.length > 0) {
    console.log('📋 Detailed Results:');
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.service}: ${result.status === 'success' ? '✅' : '❌'} ${result.status.toUpperCase()}`);
      if (result.status === 'success') {
        console.log(`      Model: ${result.model}`);
        console.log(`      Response time: ${result.responseTime}ms`);
        if (result.tokens) console.log(`      Tokens: ${result.tokens}`);
        if (result.dimensions) console.log(`      Dimensions: ${result.dimensions}`);
      } else {
        console.log(`      Error: ${result.error}`);
      }
    });
    console.log('');
  }

  // Final message
  if (successCount === 3) {
    console.log('🎉 All AI services are working correctly!');
    console.log('');
    console.log('✨ You can now use these services in DigitalTide:');
    console.log('   • Content summarization');
    console.log('   • Sentiment analysis');
    console.log('   • Fact-checking');
    console.log('   • Content categorization');
    console.log('   • Semantic search (embeddings)');
  } else if (successCount > 0) {
    console.log('⚠️  Some AI services failed. Check errors above.');
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Verify API keys are correct in .env file');
    console.log('2. Check billing/payment method is set up');
    console.log('3. Ensure keys are not expired');
    console.log('4. Verify usage limits not exceeded');
    console.log('5. Check internet connectivity');
  } else {
    console.log('❌ All AI services failed!');
    console.log('');
    console.log('Troubleshooting checklist:');
    console.log('1. 📁 Check .env file exists in project root');
    console.log('2. 🔑 Verify API keys are present:');
    console.log('   - OPENAI_API_KEY=sk-proj-...');
    console.log('   - ANTHROPIC_API_KEY=sk-ant-api03-...');
    console.log('3. 💳 Confirm billing is set up in both dashboards');
    console.log('4. 🌐 Test internet connection');
    console.log('5. 📖 Review docs/AI_SERVICES_SETUP.md for detailed setup');
  }

  console.log('');
  console.log('📚 For more information, see: docs/AI_SERVICES_SETUP.md');
  console.log('');

  // Exit with appropriate code for CI/CD
  process.exit(failureCount > 0 ? 1 : 0);
}

/**
 * Estimate API call cost
 */
function estimateCost(provider, model, usage) {
  const pricing = {
    openai: {
      'gpt-4': { input: 30, output: 60 },
      'gpt-4-turbo': { input: 10, output: 30 },
      'gpt-4-turbo-preview': { input: 10, output: 30 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
      'gpt-3.5-turbo-16k': { input: 3, output: 4 },
      'text-embedding-3-small': { input: 0.02, output: 0 },
      'text-embedding-3-large': { input: 0.13, output: 0 },
      'text-embedding-ada-002': { input: 0.10, output: 0 }
    },
    anthropic: {
      'claude-3-opus-20240229': { input: 15, output: 75 },
      'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'claude-3-sonnet-20240229': { input: 3, output: 15 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 }
    }
  };

  // Find matching pricing
  let rates = null;
  if (provider === 'openai') {
    rates = pricing.openai[model] || pricing.openai['gpt-3.5-turbo'];
  } else if (provider === 'anthropic') {
    // Match model family if exact model not found
    const modelFamily = Object.keys(pricing.anthropic).find(key => model.includes(key.split('-')[2]));
    rates = pricing.anthropic[model] || pricing.anthropic[modelFamily] || pricing.anthropic['claude-3-haiku-20240307'];
  }

  if (!rates) {
    return 0;
  }

  // Calculate cost per million tokens
  const inputCost = ((usage.prompt_tokens || 0) / 1_000_000) * rates.input;
  const outputCost = ((usage.completion_tokens || 0) / 1_000_000) * rates.output;

  return inputCost + outputCost;
}

// Run tests
testAIServices().catch((error) => {
  console.error('❌ Fatal error running tests:');
  console.error(error);
  process.exit(1);
});
