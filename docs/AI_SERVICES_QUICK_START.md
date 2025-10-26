# AI Services Quick Start Guide

⚡ **Fast Setup**: Get your AI services running in 20 minutes

---

## 📋 API Keys Checklist

### 1. OpenAI (Required)
- [ ] Sign up: https://platform.openai.com/signup
- [ ] Add payment method: https://platform.openai.com/account/billing
- [ ] Create API key: https://platform.openai.com/api-keys
- [ ] Key format: `sk-proj-...` or `sk-...`
- [ ] Free: $5 credit (3 months)
- [ ] Add to `.env`: `OPENAI_API_KEY=your-key-here`

### 2. Anthropic (Required)
- [ ] Sign up: https://console.anthropic.com/
- [ ] Add payment method: https://console.anthropic.com/settings/billing
- [ ] Create API key: https://console.anthropic.com/settings/keys
- [ ] Key format: `sk-ant-api03-...`
- [ ] Free: Check for promotional credits
- [ ] Add to `.env`: `ANTHROPIC_API_KEY=your-key-here`

### 3. Google AI (Optional)
- [ ] Sign up: https://ai.google.dev/
- [ ] Create API key: In Google AI Studio
- [ ] Key format: `AIza...`
- [ ] Free: 15 requests/minute
- [ ] Add to `.env`: `GOOGLE_AI_API_KEY=your-key-here`

---

## 🚀 Quick Setup Steps

### Step 1: Create Accounts (10 minutes)

Open these URLs in separate tabs:
1. OpenAI: https://platform.openai.com/signup
2. Anthropic: https://console.anthropic.com/
3. Google AI (optional): https://ai.google.dev/

Complete signup for each and add payment methods where required.

### Step 2: Get API Keys (5 minutes)

**OpenAI**:
```
1. Go to https://platform.openai.com/api-keys
2. Click "+ Create new secret key"
3. Name it "DigitalTide-Production"
4. Copy the key (starts with sk-proj- or sk-)
```

**Anthropic**:
```
1. Go to https://console.anthropic.com/settings/keys
2. Click "+ Create Key"
3. Name it "DigitalTide Production"
4. Copy the key (starts with sk-ant-api03-)
```

### Step 3: Configure Environment (2 minutes)

```bash
# Copy example to .env
cp .env.example .env

# Edit .env file
nano .env  # or use your favorite editor
```

Add your keys:
```bash
# OpenAI
OPENAI_API_KEY=sk-proj-your-actual-key-here
OPENAI_MODEL=gpt-4-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=4096

# Optional: Google AI
GOOGLE_AI_API_KEY=AIza-your-key-here
GOOGLE_AI_MODEL=gemini-1.5-pro
```

### Step 4: Install Dependencies (1 minute)

```bash
npm install openai @anthropic-ai/sdk @google/generative-ai
```

### Step 5: Test APIs (2 minutes)

```bash
node scripts/test-ai-services.js
```

**Expected output**:
```
╔════════════════════════════════════════════════════╗
║      Testing DigitalTide AI Services              ║
╚════════════════════════════════════════════════════╝

1️⃣  Testing OpenAI GPT API...
✅ Status: SUCCESS
🤖 Model: gpt-3.5-turbo
💬 Response: Hello from DigitalTide!...

2️⃣  Testing OpenAI Embeddings API...
✅ Status: SUCCESS
🤖 Model: text-embedding-3-small

3️⃣  Testing Anthropic Claude API...
✅ Status: SUCCESS
🤖 Model: claude-3-haiku-20240307

╔════════════════════════════════════════════════════╗
║                  Test Summary                      ║
╚════════════════════════════════════════════════════╝
✅ Successful: 3/3 services

🎉 All AI services are working correctly!
```

### Step 6: Add to GitHub Secrets

```bash
# Go to your repository settings
https://github.com/Jberryfresh/DigitalTide/settings/secrets/actions

# Add each secret:
Name: OPENAI_API_KEY
Value: [paste your OpenAI key]

Name: ANTHROPIC_API_KEY
Value: [paste your Anthropic key]
```

---

## 💡 Usage Examples

### OpenAI Chat

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [
    { role: "system", content: "You are a news analyst." },
    { role: "user", content: "Summarize this article: ..." }
  ],
  temperature: 0.7,
  max_tokens: 500
});

console.log(completion.choices[0].message.content);
```

### OpenAI Embeddings

```javascript
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Article content here..."
});

console.log(embedding.data[0].embedding); // [0.1, -0.2, ...]
```

### Anthropic Claude

```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Analyze this article for bias..." }
  ]
});

console.log(message.content[0].text);
```

### Streaming Response

```javascript
// OpenAI
const stream = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [{ role: "user", content: "Write a summary..." }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}

// Anthropic
const stream = await anthropic.messages.stream({
  model: "claude-3-5-sonnet-20241022",
  messages: [{ role: "user", content: "Write a summary..." }],
  max_tokens: 1024
});

for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    process.stdout.write(event.delta.text);
  }
}
```

---

## 💰 Cost Estimates

### Per-Request Costs

| Task | Tokens | OpenAI (GPT-3.5) | OpenAI (GPT-4) | Anthropic (Haiku) | Anthropic (Sonnet) |
|------|--------|------------------|----------------|-------------------|-------------------|
| Summary (500 tokens) | 500 | $0.001 | $0.010 | $0.0006 | $0.008 |
| Analysis (1000 tokens) | 1000 | $0.002 | $0.020 | $0.001 | $0.015 |
| Generation (2000 tokens) | 2000 | $0.004 | $0.040 | $0.002 | $0.030 |

### Monthly Estimates (1,000 articles/day)

- **Light usage** (summaries only): $30-50/month
- **Medium usage** (summaries + analysis): $100-200/month
- **Heavy usage** (full AI pipeline): $300-500/month

**💡 Pro Tip**: Start with GPT-3.5-Turbo and Claude Haiku for cost-effective testing.

---

## 🔧 Troubleshooting

### ❌ 401 Unauthorized

**Problem**: API key is invalid or expired

**Solutions**:
- Check key is correct in `.env` file
- Verify key format: OpenAI `sk-proj-...`, Anthropic `sk-ant-api03-...`
- Confirm key is active in dashboard
- Test command: `node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY)"`

### ❌ 429 Rate Limit Exceeded

**Problem**: Too many requests or quota reached

**Solutions**:
- Wait 60 seconds and try again
- Check usage in dashboard
- Implement rate limiting with Bottleneck
- Add caching with Redis
- Consider upgrading to higher tier

### ❌ 400 Bad Request

**Problem**: Invalid model name or parameters

**Solutions**:
- Verify model name is correct:
  - OpenAI: `gpt-4-turbo`, `gpt-3.5-turbo`
  - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-haiku-20240307`
- Check `max_tokens` is within model limits
- Ensure message format is correct

### ❌ Module not found: 'openai'

**Problem**: AI SDK packages not installed

**Solutions**:
```bash
npm install openai @anthropic-ai/sdk @google/generative-ai
```

### ❌ Billing Issues

**Problem**: Payment method declined or missing

**Solutions**:
- Add/update payment method in dashboard
- Check card is not expired
- Verify billing address is correct
- Add usage limits to prevent unexpected charges

### ❌ Slow Responses

**Problem**: API taking too long to respond

**Solutions**:
- Reduce `max_tokens` parameter
- Use faster models (GPT-3.5, Claude Haiku)
- Implement streaming for long responses
- Check internet connection
- Optimize prompt length

---

## 🔒 Security Checklist

### ✅ DO:
- Store API keys in `.env` file
- Add `.env` to `.gitignore`
- Use `process.env.API_KEY` in code
- Add keys to GitHub Secrets
- Rotate keys every 90 days
- Set up usage alerts
- Monitor costs regularly

### ❌ DON'T:
- Hardcode API keys in source code
- Commit `.env` to git repository
- Share keys in chat/email
- Use keys in frontend/client-side code
- Expose keys in public repositories
- Ignore usage alerts
- Use same key for dev/prod

---

## 📚 Quick Reference

### Model Selection Guide

**For Summaries**:
- Quick: `gpt-3.5-turbo` or `claude-3-haiku-20240307`
- Quality: `gpt-4-turbo` or `claude-3-5-sonnet-20241022`

**For Analysis**:
- Standard: `claude-3-5-sonnet-20241022`
- Deep: `claude-3-opus-20240229` or `gpt-4`

**For Embeddings**:
- Cost-effective: `text-embedding-3-small`
- High quality: `text-embedding-3-large`

**For Long Context**:
- Best: `claude-3-5-sonnet-20241022` (200K tokens)
- Alternative: `gemini-1.5-pro` (2M tokens)

### Rate Limits (Tier 1)

| Service | Requests/Min | Tokens/Min | Tokens/Day |
|---------|--------------|------------|------------|
| OpenAI GPT-3.5 | 60 | 60,000 | 200,000 |
| OpenAI GPT-4 | 10 | 10,000 | 150,000 |
| Anthropic Claude | 50 | 50,000 | 100,000 |

### Useful Commands

```bash
# Test all AI services
node scripts/test-ai-services.js

# Test specific service
node scripts/test-ai-services.js --service openai

# Check API key in environment
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY)"

# Monitor usage (OpenAI)
curl https://api.openai.com/v1/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## 🎯 Next Steps

After successful setup:

1. ✅ Verify all tests pass: `node scripts/test-ai-services.js`
2. ✅ Add API keys to GitHub Secrets
3. ✅ Set up usage alerts in dashboards
4. ✅ Implement AI services in `src/services/ai/`
5. ✅ Create AI agent network for content curation
6. ✅ Add cost tracking and monitoring
7. ✅ Configure rate limiting with Bottleneck
8. ✅ Implement caching with Redis
9. ✅ Build fallback strategies
10. ✅ Test with sample articles

---

## 📖 Documentation

- **Full Setup Guide**: `docs/AI_SERVICES_SETUP.md`
- **OpenAI Docs**: https://platform.openai.com/docs
- **Anthropic Docs**: https://docs.anthropic.com/
- **Google AI Docs**: https://ai.google.dev/docs

---

## 🆘 Support

**Need help?**
- Check full documentation: `docs/AI_SERVICES_SETUP.md`
- Review troubleshooting section above
- Test with provided examples
- Check API status pages
- Contact support if needed

---

**⏱️ Setup Time**: ~20 minutes  
**💰 Initial Cost**: $5-10 free credits  
**🎯 Status**: Ready for Production

---

**Last Updated**: October 26, 2024  
**Phase**: 1.5 - External Services  
**Priority**: P1-CRITICAL
