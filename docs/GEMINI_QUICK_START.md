# Quick Start: Google Gemini Setup (FREE)

## 🎯 Get Your Free Gemini API Key (5 minutes)

### Step 1: Visit Google AI Studio
Go to: **https://aistudio.google.com/app/apikey**

### Step 2: Sign In
- Sign in with your Google account (any Gmail account works)
- No payment method required!

### Step 3: Create API Key
1. Click **"Create API key"** button
2. Select **"Create API key in new project"** (or use existing project)
3. Copy your API key immediately (looks like: `AIzaSyC...`)

### Step 4: Add to Your .env File
Open `c:\DigitalTide-MAIN\DigitalTide\.env` and add:

```bash
# Google Gemini (FREE)
GEMINI_API_KEY=AIzaSyC_your_actual_key_here
AI_PROVIDER=gemini
```

### Step 5: Test It!
Run the test script:
```powershell
node scripts/test-writer-agent.js
```

## ✅ What You Get (FREE Forever)

- **15 requests per minute** (900 per hour)
- **Gemini 1.5 Pro** model (excellent quality)
- **2 million token context window** (huge!)
- **No payment method required**
- **No expiration**

## 💰 Paid Tier (Optional - Super Cheap)

If you need more than 15 req/min:
- **$0.075 per million input tokens**
- **$0.30 per million output tokens**
- About **10x cheaper than Claude/GPT-4**

Example: 1,000 articles = ~$5-10

## 🔄 Smart Hybrid Strategy

Your current setup (already configured):
1. **Primary**: Gemini (free, fast, good quality)
2. **Fallback**: Claude 3.5 Sonnet (when you fund it)
3. **Automatic switching** if one fails

## 🚀 Next Steps

1. **Right now**: Get Gemini API key (5 min)
2. **This week**: Apply for Microsoft for Startups ($2,500 free credits)
3. **Next month**: Test with Azure OpenAI/Claude using Microsoft credits

## 📞 Need Help?

If you have any issues:
1. Make sure you're signed into a Google account
2. Check that GEMINI_API_KEY in .env has no quotes or spaces
3. Restart your development server: `npm run dev`

## 🎉 Why This Is Amazing

- **Zero cost** to test all Writer Agent features right now
- **Production ready** - Gemini quality is excellent
- **Scalable** - 900 requests/hour free forever
- **No lock-in** - Easy to switch to Claude/GPT-4 later

Get your key now and let's test! 🚀
