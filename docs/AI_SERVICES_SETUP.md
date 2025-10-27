# AI Service Accounts Setup Guide

## Overview

DigitalTide uses multiple AI services for content generation, analysis, and agent intelligence. This document provides step-by-step instructions for creating accounts and obtaining API keys for AI services.

**Primary Services:**
1. OpenAI (GPT-4, GPT-3.5-Turbo, Embeddings)
2. Anthropic (Claude 3.5 Sonnet, Claude 3 Opus/Haiku)

**Optional Services:**
3. Google AI (Gemini Pro)
4. Cohere (Command, Embed)
5. Hugging Face (Various models)

---

## Table of Contents

1. [Service Comparison](#service-comparison)
2. [OpenAI Setup](#openai-setup)
3. [Anthropic Setup](#anthropic-setup)
4. [Google AI Setup](#google-ai-setup-optional)
5. [Configuration](#configuration)
6. [Testing APIs](#testing-apis)
7. [Pricing & Usage](#pricing--usage)
8. [Best Practices](#best-practices)
9. [Cost Management](#cost-management)

---

## Service Comparison

| Feature | OpenAI | Anthropic | Google AI |
|---------|--------|-----------|-----------|
| **Best Model** | GPT-4 Turbo | Claude 3.5 Sonnet | Gemini 1.5 Pro |
| **Context Window** | 128K tokens | 200K tokens | 2M tokens |
| **Input Cost** (1M tokens) | $2.50-$10 | $3-$15 | $1.25-$7 |
| **Output Cost** (1M tokens) | $10-$30 | $15-$75 | $5-$21 |
| **Function Calling** | ✅ Yes | ✅ Yes | ✅ Yes |
| **JSON Mode** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Streaming** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Embeddings** | ✅ Yes | ❌ No | ✅ Yes |
| **Vision** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Best For** | General purpose, embeddings | Long context, analysis | Cost-effective, large context |

**Recommendation**: Start with OpenAI (GPT-4 Turbo) and Anthropic (Claude 3.5 Sonnet) for redundancy and capability diversity.

---

## OpenAI Setup

### Step 1: Create Account

1. Go to [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Sign up with:
   - Email address, or
   - Google account, or
   - Microsoft account
3. Verify your email if using email signup
4. Complete phone verification (required for API access)

### Step 2: Add Payment Method

**⚠️ Important**: OpenAI requires a payment method for API access.

1. Navigate to [https://platform.openai.com/account/billing/overview](https://platform.openai.com/account/billing/overview)
2. Click **"Add payment details"**
3. Enter credit card information
4. Set up usage limits (recommended: $50-100/month initially)
5. Enable auto-recharge or manual top-up

**Free Credits**:
- New accounts: $5 free credit (expires after 3 months)
- Use for testing before adding payment method

### Step 3: Create API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **"+ Create new secret key"**
3. Name your key: `DigitalTide-Production` or `DigitalTide-Development`
4. Set permissions:
   - **All** (recommended for development)
   - Or restrict to specific models
5. Click **"Create secret key"**
6. **⚠️ COPY THE KEY IMMEDIATELY** - You won't see it again!
7. Format: `sk-proj-...` (new format) or `sk-...` (legacy)

### Step 4: Configure Usage Limits

1. Go to [Billing > Limits](https://platform.openai.com/account/limits)
2. Set monthly budget: $50-100 (adjust based on needs)
3. Enable email notifications at 75%, 90%, 100%
4. Set hard limit to prevent overages

### Step 5: Test the API

```bash
# PowerShell
$apiKey = "YOUR_OPENAI_API_KEY"
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $apiKey"
}
$body = @{
    model = "gpt-3.5-turbo"
    messages = @(
        @{
            role = "user"
            content = "Say 'Hello from DigitalTide!'"
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.openai.com/v1/chat/completions" `
    -Method Post -Headers $headers -Body $body | ConvertTo-Json
```

### Available Models

#### Chat Models (Recommended)

| Model | Context | Input Cost | Output Cost | Best For |
|-------|---------|------------|-------------|----------|
| **gpt-4-turbo** | 128K | $10/1M | $30/1M | Complex tasks, high quality |
| **gpt-4** | 8K | $30/1M | $60/1M | Legacy, still powerful |
| **gpt-3.5-turbo** | 16K | $0.50/1M | $1.50/1M | Fast, cost-effective |
| **gpt-3.5-turbo-16k** | 16K | $3/1M | $4/1M | Longer contexts |

#### Embedding Models

| Model | Dimensions | Cost | Best For |
|-------|------------|------|----------|
| **text-embedding-3-large** | 3072 | $0.13/1M | Highest quality |
| **text-embedding-3-small** | 1536 | $0.02/1M | Cost-effective |
| **text-embedding-ada-002** | 1536 | $0.10/1M | Legacy |

### Code Example

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Chat completion
const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [
    { role: "system", content: "You are a helpful news analyst." },
    { role: "user", content: "Summarize this article: ..." }
  ],
  temperature: 0.7,
  max_tokens: 500
});

console.log(completion.choices[0].message.content);

// Embeddings
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Article content here..."
});

console.log(embedding.data[0].embedding);
```

---

## Anthropic Setup

### Step 1: Create Account

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with:
   - Email address, or
   - Google account
4. Verify your email address
5. Complete account setup

### Step 2: Add Payment Method

1. Navigate to [Settings > Billing](https://console.anthropic.com/settings/billing)
2. Click **"Add payment method"**
3. Enter credit card information
4. Choose billing plan:
   - **Pay-as-you-go**: No commitment, pay for usage
   - **Subscription**: Fixed monthly fee + overage
5. Set up usage alerts

**Free Credits**:
- New accounts may receive promotional credits
- Check console for current offers

### Step 3: Create API Key

1. Go to [Settings > API Keys](https://console.anthropic.com/settings/keys)
2. Click **"+ Create Key"**
3. Name your key: `DigitalTide Production`
4. Set workspace (if using workspaces)
5. Click **"Create Key"**
6. **⚠️ COPY THE KEY IMMEDIATELY** - You won't see it again!
7. Format: `sk-ant-api03-...`

### Step 4: Configure Usage Limits

1. Go to [Settings > Limits](https://console.anthropic.com/settings/limits)
2. Set monthly spend limit: $50-100
3. Enable notification emails
4. Configure rate limits per model

### Step 5: Test the API

```bash
# PowerShell
$apiKey = "YOUR_ANTHROPIC_API_KEY"
$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = $apiKey
    "anthropic-version" = "2023-06-01"
}
$body = @{
    model = "claude-3-5-sonnet-20241022"
    max_tokens = 1024
    messages = @(
        @{
            role = "user"
            content = "Say 'Hello from DigitalTide!'"
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.anthropic.com/v1/messages" `
    -Method Post -Headers $headers -Body $body | ConvertTo-Json
```

### Available Models

| Model | Context | Input Cost | Output Cost | Best For |
|-------|---------|------------|-------------|----------|
| **claude-3-5-sonnet-20241022** | 200K | $3/1M | $15/1M | Best overall, fast, intelligent |
| **claude-3-opus-20240229** | 200K | $15/1M | $75/1M | Most capable, deep analysis |
| **claude-3-sonnet-20240229** | 200K | $3/1M | $15/1M | Balanced performance |
| **claude-3-haiku-20240307** | 200K | $0.25/1M | $1.25/1M | Fast, cost-effective |

**Recommendation**: Use Claude 3.5 Sonnet for most tasks, Claude 3 Haiku for simple/fast operations.

### Code Example

```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Create message
const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: "Analyze this news article for bias and factual accuracy: ..."
    }
  ]
});

console.log(message.content[0].text);

// Streaming
const stream = await anthropic.messages.stream({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Write a summary..." }]
});

for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta') {
    process.stdout.write(chunk.delta.text);
  }
}
```

---

## Google AI Setup (Optional)

### Step 1: Create Account

1. Go to [https://ai.google.dev/](https://ai.google.dev/)
2. Click **"Get API key in Google AI Studio"**
3. Sign in with Google account
4. Accept terms of service

### Step 2: Create API Key

1. In Google AI Studio, click **"Get API key"**
2. Select or create a Google Cloud project
3. Click **"Create API key"**
4. Copy your API key
5. Format: `AIza...`

### Step 3: Enable Billing (Optional)

- Free tier: 15 requests/minute
- For higher limits, enable billing in Google Cloud Console

### Available Models

| Model | Context | Cost | Best For |
|-------|---------|------|----------|
| **gemini-1.5-pro** | 2M | $1.25-$7/1M | Large context, complex tasks |
| **gemini-1.5-flash** | 1M | $0.075-$0.30/1M | Fast, cost-effective |
| **gemini-1.0-pro** | 32K | Free (limited) | Testing, low volume |

### Code Example

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const result = await model.generateContent("Summarize this article: ...");
console.log(result.response.text());
```

---

## Configuration

### Environment Variables

Add to `.env` file:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_ORG_ID=org-your-org-id-here  # Optional
OPENAI_MODEL=gpt-4-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=4096

# Google AI (Optional)
GOOGLE_AI_API_KEY=AIza-your-key-here
GOOGLE_AI_MODEL=gemini-1.5-pro

# AI Configuration
AI_TIMEOUT=30000              # Request timeout (30 seconds)
AI_RETRY_ATTEMPTS=3           # Number of retry attempts
AI_RATE_LIMIT=60              # Max requests per minute
AI_CACHE_TTL=3600             # Cache TTL in seconds (1 hour)
AI_FALLBACK_ENABLED=true      # Enable fallback to alternative AI service
```

### Update .env.example

The AI service keys are already in `.env.example`. Verify they match:

```bash
# AI SERVICES
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-opus-20240229
```

### GitHub Secrets

Add to GitHub repository secrets:

1. Go to: https://github.com/Jberryfresh/DigitalTide/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each:
   - `OPENAI_API_KEY` → Your OpenAI key
   - `ANTHROPIC_API_KEY` → Your Anthropic key
   - `GOOGLE_AI_API_KEY` → Your Google AI key (if using)

---

## Testing APIs

### Create Test Script

Create `scripts/test-ai-services.js`:

```javascript
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const testAIServices = async () => {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   Testing DigitalTide AI Services   ║');
  console.log('╚══════════════════════════════════════╝\n');

  let successCount = 0;
  let failureCount = 0;

  // Test OpenAI
  console.log('1️⃣  Testing OpenAI...');
  console.log('─'.repeat(40));
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('API key not found');
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const startTime = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say 'Hello from DigitalTide!'" }],
      max_tokens: 20
    });

    const responseTime = Date.now() - startTime;
    console.log(`✅ Status: SUCCESS`);
    console.log(`🤖 Model: ${completion.model}`);
    console.log(`💬 Response: ${completion.choices[0].message.content}`);
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`📊 Tokens used: ${completion.usage.total_tokens}`);
    successCount++;
  } catch (error) {
    console.log(`❌ Status: FAILED`);
    console.log(`💥 Error: ${error.message}`);
    failureCount++;
  }

  console.log('\n');

  // Test Anthropic
  console.log('2️⃣  Testing Anthropic...');
  console.log('─'.repeat(40));
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('API key not found');
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const startTime = Date.now();
    
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 20,
      messages: [{ role: "user", content: "Say 'Hello from DigitalTide!'" }]
    });

    const responseTime = Date.now() - startTime;
    console.log(`✅ Status: SUCCESS`);
    console.log(`🤖 Model: ${message.model}`);
    console.log(`💬 Response: ${message.content[0].text}`);
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`📊 Tokens: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out`);
    successCount++;
  } catch (error) {
    console.log(`❌ Status: FAILED`);
    console.log(`💥 Error: ${error.message}`);
    failureCount++;
  }

  // Summary
  console.log('\n');
  console.log('╔══════════════════════════════════════╗');
  console.log('║           Test Summary              ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`✅ Successful: ${successCount}/2`);
  console.log(`❌ Failed: ${failureCount}/2`);
  console.log('');

  if (successCount === 2) {
    console.log('🎉 All AI services are working correctly!');
  } else if (successCount > 0) {
    console.log('⚠️  Some AI services failed. Check errors above.');
  } else {
    console.log('❌ All AI services failed!');
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Verify API keys in .env file');
    console.log('2. Check billing/payment method is set up');
    console.log('3. Verify keys are not expired');
    console.log('4. Check usage limits not exceeded');
  }

  console.log('');
  process.exit(failureCount > 0 ? 1 : 0);
};

testAIServices().catch(console.error);
```

### Install Dependencies

```bash
npm install openai @anthropic-ai/sdk @google/generative-ai
```

### Run Test

```bash
node scripts/test-ai-services.js
```

---

## Pricing & Usage

### Cost Estimates for DigitalTide

**Typical Article Processing**:
- Article summary (500 tokens): $0.001-0.005
- Sentiment analysis (200 tokens): $0.0005-0.002
- Fact-checking (1000 tokens): $0.002-0.010
- Content generation (2000 tokens): $0.005-0.020

**Monthly Estimates** (1,000 articles/day):
- Light usage (summaries only): $30-50/month
- Medium usage (summaries + analysis): $100-200/month
- Heavy usage (full AI pipeline): $300-500/month

### Cost Optimization Tips

1. **Use appropriate models**:
   - GPT-3.5-Turbo for simple tasks (10x cheaper than GPT-4)
   - Claude Haiku for fast, simple operations
   - GPT-4/Claude Opus only for complex tasks

2. **Implement caching**:
   - Cache embeddings (never recompute)
   - Cache summaries for unchanged articles
   - Use Redis with TTL

3. **Batch processing**:
   - Process multiple items in one request when possible
   - Use async/await with Promise.all()

4. **Token optimization**:
   - Truncate long inputs
   - Use system prompts efficiently
   - Request only needed tokens

5. **Rate limiting**:
   - Spread requests over time
   - Use queues (Bull/Redis)
   - Implement exponential backoff

---

## Best Practices

### 1. API Key Security

```javascript
// ❌ BAD
const apiKey = 'sk-proj-abc123...';

// ✅ GOOD
const apiKey = process.env.OPENAI_API_KEY;

// ✅ BETTER - Validate key exists
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY not configured');
}
```

### 2. Error Handling

```javascript
async function generateWithFallback(prompt) {
  try {
    // Try OpenAI first
    return await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }]
    });
  } catch (error) {
    if (error.status === 429) {
      console.log('Rate limit hit, trying Anthropic...');
      // Fallback to Anthropic
      return await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        messages: [{ role: "user", content: prompt }]
      });
    }
    throw error;
  }
}
```

### 3. Token Counting

```javascript
import { encode } from 'gpt-tokenizer';

function countTokens(text) {
  return encode(text).length;
}

function truncateToTokenLimit(text, maxTokens) {
  const tokens = encode(text);
  if (tokens.length <= maxTokens) return text;
  
  const truncated = tokens.slice(0, maxTokens);
  return decode(truncated);
}
```

### 4. Streaming Responses

```javascript
// OpenAI streaming
const stream = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [{ role: "user", content: "Write a long article..." }],
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(content);
}

// Anthropic streaming
const stream = await anthropic.messages.stream({
  model: "claude-3-5-sonnet-20241022",
  messages: [{ role: "user", content: "Write a long article..." }],
  max_tokens: 4096
});

for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    process.stdout.write(event.delta.text);
  }
}
```

### 5. Rate Limiting

```javascript
import Bottleneck from 'bottleneck';

// OpenAI rate limiter (60 req/min for tier 1)
const openaiLimiter = new Bottleneck({
  minTime: 1000,  // 1 second between requests
  maxConcurrent: 5
});

const rateLimitedOpenAI = openaiLimiter.wrap(
  async (prompt) => await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }]
  })
);
```

---

## Cost Management

### Set Up Alerts

**OpenAI**:
1. Go to [Billing](https://platform.openai.com/account/billing/overview)
2. Set usage limits ($50-100/month)
3. Enable email alerts at 75%, 90%, 100%
4. Set hard limit to stop at threshold

**Anthropic**:
1. Go to [Settings > Limits](https://console.anthropic.com/settings/limits)
2. Set monthly spend limit
3. Configure notification emails
4. Set per-model rate limits

### Monitor Usage

```javascript
// Track costs in your application
import winston from 'winston';

const costLogger = winston.createLogger({
  transports: [new winston.transports.File({ filename: 'ai-costs.log' })]
});

async function generateWithCostTracking(prompt, model = 'gpt-4-turbo') {
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }]
  });

  const costs = {
    model,
    inputTokens: response.usage.prompt_tokens,
    outputTokens: response.usage.completion_tokens,
    totalTokens: response.usage.total_tokens,
    estimatedCost: calculateCost(model, response.usage),
    timestamp: new Date()
  };

  costLogger.info(costs);
  return response;
}

function calculateCost(model, usage) {
  const pricing = {
    'gpt-4-turbo': { input: 10, output: 30 },  // per 1M tokens
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    'claude-3-5-sonnet-20241022': { input: 3, output: 15 }
  };

  const rates = pricing[model] || { input: 0, output: 0 };
  const inputCost = (usage.prompt_tokens / 1_000_000) * rates.input;
  const outputCost = (usage.completion_tokens / 1_000_000) * rates.output;
  
  return inputCost + outputCost;
}
```

---

## Troubleshooting

### Common Issues

**1. 401 Unauthorized**
- API key is invalid or expired
- Check key format: OpenAI starts with `sk-`, Anthropic with `sk-ant-`
- Verify key in dashboard

**2. 429 Rate Limit**
- You've exceeded requests per minute
- Implement exponential backoff
- Upgrade to higher tier
- Use fallback to another service

**3. 400 Bad Request**
- Invalid model name
- Missing required parameters
- Token limit exceeded
- Check API documentation for model names

**4. Billing Issues**
- Payment method declined
- Usage limit reached
- Add/update payment method
- Increase usage limits

**5. Slow Responses**
- Large token counts
- Complex prompts
- Use streaming for long outputs
- Optimize prompt length

---

## Additional Resources

### Documentation
- **OpenAI**: https://platform.openai.com/docs
- **Anthropic**: https://docs.anthropic.com/
- **Google AI**: https://ai.google.dev/docs

### Pricing
- **OpenAI**: https://openai.com/pricing
- **Anthropic**: https://www.anthropic.com/pricing
- **Google AI**: https://ai.google.dev/pricing

### Status Pages
- **OpenAI**: https://status.openai.com/
- **Anthropic**: https://status.anthropic.com/

### Community
- **OpenAI Discord**: https://discord.gg/openai
- **Anthropic Support**: support@anthropic.com

---

## Next Steps

After setting up AI services:

1. ✅ Create OpenAI account and get API key
2. ✅ Create Anthropic account and get API key
3. ✅ Add API keys to `.env` file
4. ✅ Add API keys to GitHub Secrets
5. ✅ Install AI SDKs: `npm install openai @anthropic-ai/sdk`
6. ✅ Run test script: `node scripts/test-ai-services.js`
7. ✅ Implement AI agent services in `src/services/ai/`
8. ✅ Set up cost tracking and monitoring
9. ✅ Configure rate limiting and fallbacks
10. ✅ Build AI agent network for content curation

---

**Last Updated**: October 26, 2024  
**Phase**: 1.5 - External Services  
**Status**: Ready for Implementation
