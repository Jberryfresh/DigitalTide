# News APIs Quick Reference

## 🔑 API Keys Checklist

- [ ] **SerpAPI** (Google News)
  - Sign up: https://serpapi.com/
  - Dashboard: https://serpapi.com/manage-api-key
  - Free: 100 searches/month
  - Key format: `abc123def456...`
  - Add to `.env`: `SERPAPI_KEY=your_key` or `GOOGLE_NEWS_API_KEY=your_key`

- [ ] **NewsAPI.org**
  - Sign up: https://newsapi.org/
  - Dashboard: https://newsapi.org/account
  - Free: 100 requests/day
  - Key format: `abc123def456...`
  - Add to `.env`: `NEWSAPI_KEY=your_key`

- [ ] **MediaStack**
  - Sign up: https://mediastack.com/
  - Dashboard: https://mediastack.com/dashboard
  - Free: 500 requests/month
  - Key format: `abc123def456...`
  - Add to `.env`: `MEDIASTACK_API_KEY=your_key`

---

## 📋 Quick Setup Steps

### 1. Create Accounts (15 minutes)
```bash
# Open these URLs in your browser:
1. https://serpapi.com/ → Sign Up → Get API Key
2. https://newsapi.org/ → Get API Key → Verify Email → Copy Key
3. https://mediastack.com/ → Sign Up Free → Verify Email → Copy Key
```

### 2. Add Keys to .env
```bash
# Copy .env.example if not already done
cp .env.example .env

# Edit .env and add your keys:
nano .env  # or use your favorite editor

# Add these lines with your actual keys:
SERPAPI_KEY=your_serpapi_key_here
GOOGLE_NEWS_API_KEY=your_serpapi_key_here
NEWSAPI_KEY=your_newsapi_key_here
MEDIASTACK_API_KEY=your_mediastack_key_here
```

### 3. Test APIs
```bash
# Install dependencies if needed
npm install

# Run test script
node scripts/test-news-apis.js

# Expected output:
# ✅ SerpAPI: SUCCESS
# ✅ NewsAPI: SUCCESS  
# ✅ MediaStack: SUCCESS
# 🎉 All APIs are working correctly!
```

### 4. Add to GitHub Secrets
```bash
# Go to: https://github.com/Jberryfresh/DigitalTide/settings/secrets/actions
# Click "New repository secret" for each:

SERPAPI_KEY → your_serpapi_key
NEWSAPI_KEY → your_newsapi_key
MEDIASTACK_API_KEY → your_mediastack_key
```

---

## 🚀 Usage Examples

### SerpAPI (Google News)
```javascript
import axios from 'axios';

const response = await axios.get('https://serpapi.com/search.json', {
  params: {
    engine: 'google_news',
    q: 'artificial intelligence',
    gl: 'us',
    hl: 'en',
    num: 10,
    api_key: process.env.SERPAPI_KEY
  }
});

// Returns: { news_results: [...] }
```

### NewsAPI.org
```javascript
const response = await axios.get('https://newsapi.org/v2/top-headlines', {
  params: {
    country: 'us',
    category: 'technology',
    pageSize: 10,
    apiKey: process.env.NEWSAPI_KEY
  }
});

// Returns: { status: 'ok', totalResults: 38, articles: [...] }
```

### MediaStack
```javascript
const response = await axios.get('http://api.mediastack.com/v1/news', {
  params: {
    access_key: process.env.MEDIASTACK_API_KEY,
    countries: 'us',
    categories: 'technology',
    limit: 10
  }
});

// Returns: { pagination: {...}, data: [...] }
```

---

## 📊 Rate Limits

| API | Free Tier Limit | Upgrade Cost |
|-----|----------------|--------------|
| SerpAPI | 100/month | $50/mo (5K searches) |
| NewsAPI | 100/day | $449/mo (250K/day) |
| MediaStack | 500/month | $9.99/mo (10K/month) |

**Pro Tip**: Use caching (Redis) to reduce API calls!

---

## ❓ Troubleshooting

### ❌ "401 Unauthorized"
- Check API key is correct
- Verify key is active (not expired)
- Ensure `.env` file is loaded

```bash
# Test if env vars are loaded:
node -e "require('dotenv').config(); console.log(process.env.NEWSAPI_KEY ? 'Key found!' : 'Key missing!')"
```

### ❌ "429 Too Many Requests"
- You've hit rate limit
- Wait before retrying
- Implement caching
- Consider upgrading plan

### ❌ "Module not found: axios"
```bash
npm install axios
```

### ❌ Test script shows "API key not found"
```bash
# Check .env file exists
ls -la .env

# Check it contains keys
cat .env | grep "API_KEY"

# Make sure to run from project root
pwd  # Should show: /path/to/DigitalTide
```

---

## 🔒 Security Reminders

✅ **DO:**
- Store keys in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables: `process.env.API_KEY`
- Add keys to GitHub Secrets for CI/CD
- Rotate keys every 90 days

❌ **DON'T:**
- Hardcode keys in source code
- Commit `.env` to git
- Share keys in chat/email
- Use keys in frontend JavaScript
- Expose keys in public repositories

---

## 📚 Documentation Links

- **SerpAPI**: https://serpapi.com/google-news-api
- **NewsAPI**: https://newsapi.org/docs
- **MediaStack**: https://mediastack.com/documentation

---

## 🎯 Next Steps After Setup

1. ✅ Verify all 3 APIs work: `node scripts/test-news-apis.js`
2. ✅ Add keys to GitHub Secrets
3. ✅ Implement news fetching service: `src/services/news/`
4. ✅ Add Redis caching for API responses
5. ✅ Create AI agents for content curation
6. ✅ Set up rate limiting and error handling
7. ✅ Build news aggregation pipeline

---

**Quick Test Command:**
```bash
node scripts/test-news-apis.js
```

**Full Documentation:**
- See `docs/NEWS_API_SETUP.md` for complete guide

**Support:**
- Issues: https://github.com/Jberryfresh/DigitalTide/issues
- Phase 1.5 Task List: `.agents/PROJECT_TODO.md`
