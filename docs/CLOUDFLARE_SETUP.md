# Cloudflare Setup Guide for DigitalTide

> **Phase 1.5 - CDN and Security Setup**  
> Free tier available - No credit card required!

## 📋 Overview

Cloudflare provides:
- ✅ **Free CDN** - Content delivery network (unlimited bandwidth!)
- ✅ **Free SSL/TLS** - Automatic HTTPS certificates
- ✅ **Free DDoS Protection** - Basic protection against attacks
- ✅ **DNS Management** - Fast, reliable DNS
- ✅ **Web Application Firewall (WAF)** - Basic security rules
- ✅ **Analytics** - Traffic insights
- ✅ **Caching** - Faster page loads globally

**Cost**: **FREE** for basic plan (perfect for DigitalTide!)

---

## 🚀 Step 1: Create Cloudflare Account

1. Go to https://www.cloudflare.com/
2. Click **"Sign Up"** (top right)
3. Enter your email and password
4. **No credit card required!** ✨
5. Verify your email

---

## 🌐 Step 2: Add Your Domain (If You Have One)

### If You Own a Domain (like digitaltide.com):

1. After login, click **"Add a Site"**
2. Enter your domain: `digitaltide.com`
3. Click **"Add site"**
4. Select **"Free"** plan (scroll down)
5. Click **"Continue"**

Cloudflare will:
- Scan your existing DNS records
- Import them automatically
- Show you DNS records to review

6. Click **"Continue"**
7. **Important**: You'll get Cloudflare nameservers (like `ns1.cloudflare.com`)

### Update Your Domain's Nameservers:

Go to your domain registrar (where you bought the domain):
- **GoDaddy**: Domains → Manage → DNS → Nameservers → Change → Custom
- **Namecheap**: Domain List → Manage → Nameservers → Custom DNS
- **Google Domains**: DNS → Name servers → Use custom name servers
- **Other**: Look for "DNS" or "Nameservers" settings

Add the Cloudflare nameservers:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**Note**: DNS propagation takes 1-24 hours (usually 2-4 hours)

---

## 🔧 Step 3: Configure DNS Records

Once your domain is active in Cloudflare:

### For Local Development (No Domain):
Skip this section for now. Cloudflare is mainly for production with a custom domain.

### For Production Deployment:

1. Go to **DNS** tab in Cloudflare dashboard
2. Add these records:

**A Record (for root domain):**
```
Type: A
Name: @ (or your domain)
IPv4 address: Your server IP
Proxy status: Proxied (orange cloud)
TTL: Auto
```

**CNAME Record (for www):**
```
Type: CNAME
Name: www
Target: digitaltide.com
Proxy status: Proxied (orange cloud)
TTL: Auto
```

**CNAME Record (for API subdomain):**
```
Type: CNAME
Name: api
Target: your-cloudrun-url.run.app (when you deploy)
Proxy status: Proxied (orange cloud)
TTL: Auto
```

**Example Setup:**
- `digitaltide.com` → Frontend (later)
- `www.digitaltide.com` → Frontend
- `api.digitaltide.com` → Backend API (Cloud Run)

---

## 🔒 Step 4: Configure SSL/TLS

1. Go to **SSL/TLS** tab
2. Set SSL/TLS encryption mode:

**For Production (Recommended):**
- Select **"Full (strict)"**
- This encrypts traffic between visitors and Cloudflare, and between Cloudflare and your server

**Options Explained:**
- **Off**: No encryption (never use!)
- **Flexible**: Encrypts visitor → Cloudflare (not secure)
- **Full**: Encrypts end-to-end but allows self-signed certs
- **Full (strict)**: Encrypts end-to-end with valid certificates ✅

3. Enable **Always Use HTTPS**:
   - Go to **SSL/TLS** → **Edge Certificates**
   - Toggle **"Always Use HTTPS"** to On
   - This redirects HTTP to HTTPS automatically

4. Enable **Automatic HTTPS Rewrites**:
   - Same page, toggle on
   - Fixes mixed content warnings

5. **Minimum TLS Version**: TLS 1.2 (recommended)

---

## 🛡️ Step 5: Configure Security Settings

### 5.1 Firewall Rules (Free Tier Includes 5 Rules)

1. Go to **Security** → **WAF**
2. Create custom rules:

**Rule 1: Block Bad Bots**
```
Field: Known Bots
Operator: equals
Value: Off
Action: Block
```

**Rule 2: Rate Limiting for Login**
```
Field: URI Path
Operator: contains
Value: /api/v1/auth/login
Action: Challenge (CAPTCHA)
Rate: 5 requests per minute
```

**Rule 3: Block Common Attacks**
```
Field: Security Level
Operator: equals
Value: High
Action: Block
```

### 5.2 Security Level

1. Go to **Security** → **Settings**
2. Set **Security Level**: **Medium** (good balance)
   - Low: Least restrictive
   - Medium: Recommended ✅
   - High: More challenges for visitors
   - I'm Under Attack: Emergency mode

### 5.3 Enable Bot Fight Mode (Free)

1. Go to **Security** → **Bots**
2. Enable **"Bot Fight Mode"**
3. This automatically challenges suspicious bots

---

## ⚡ Step 6: Configure Caching

### 6.1 Caching Level

1. Go to **Caching** → **Configuration**
2. Set **Caching Level**: **Standard**
3. Enable **Browser Cache TTL**: 4 hours (or higher)

### 6.2 Page Rules (Free Tier: 3 Rules)

Create rules for optimal caching:

**Rule 1: Cache Static Assets**
```
URL Pattern: *digitaltide.com/assets/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month
```

**Rule 2: Don't Cache API**
```
URL Pattern: *api.digitaltide.com/*
Settings:
- Cache Level: Bypass
```

**Rule 3: Cache Frontend**
```
URL Pattern: *digitaltide.com/*
Settings:
- Cache Level: Standard
- Browser Cache TTL: 4 hours
```

---

## 🚀 Step 7: Performance Optimization

### 7.1 Auto Minify

1. Go to **Speed** → **Optimization**
2. Enable **Auto Minify**:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML
3. This reduces file sizes automatically

### 7.2 Brotli Compression

1. Same page
2. Enable **Brotli** compression
3. Better than gzip, faster page loads

### 7.3 Early Hints

1. Enable **Early Hints**
2. Speeds up page load by preloading resources

### 7.4 Rocket Loader (Optional)

1. Enable **Rocket Loader**
2. Automatically defers JavaScript loading
3. **Warning**: Can break some sites - test first!

---

## 📊 Step 8: Configure Analytics

1. Go to **Analytics** → **Traffic**
2. View:
   - Requests over time
   - Bandwidth usage
   - Unique visitors
   - Top requests
   - Status codes

Free tier includes:
- Last 24 hours of data
- Basic metrics

**Pro Tip**: Export data regularly for historical tracking

---

## 🌍 Step 9: Configure Global CDN

Cloudflare automatically:
- Distributes content to 300+ data centers worldwide
- Serves cached content from nearest location
- No configuration needed! ✨

**Locations covered**:
- North America
- Europe
- Asia
- South America
- Africa
- Oceania

---

## 🔐 Step 10: Additional Security Features

### 10.1 Enable DNSSEC

1. Go to **DNS** → **Settings**
2. Click **"Enable DNSSEC"**
3. Follow instructions to add DS record at your registrar
4. This prevents DNS hijacking

### 10.2 Enable HTTP Strict Transport Security (HSTS)

1. Go to **SSL/TLS** → **Edge Certificates**
2. Scroll to **HTTP Strict Transport Security (HSTS)**
3. Click **"Enable HSTS"**
4. Settings:
   - Max Age: 6 months
   - Include subdomains: Yes
   - Preload: Yes (after testing)

### 10.3 Enable Authenticated Origin Pulls

1. Go to **SSL/TLS** → **Origin Server**
2. Create origin certificate (valid 15 years)
3. Install certificate on your server
4. Enable **Authenticated Origin Pulls**
5. This ensures only Cloudflare can connect to your server

---

## 📝 Step 11: Configure for DigitalTide API

### For Local Development:

You can't use Cloudflare with localhost, but you can prepare:

1. **Test headers** that Cloudflare adds:
   ```javascript
   // In your Express app
   app.use((req, res, next) => {
     console.log('CF-Connecting-IP:', req.headers['cf-connecting-ip']);
     console.log('CF-Ray:', req.headers['cf-ray']);
     console.log('CF-Country:', req.headers['cf-ipcountry']);
     next();
   });
   ```

2. **Trust Cloudflare IPs** in Express:
   ```javascript
   // src/index.js
   app.set('trust proxy', true);
   ```

### For Production Deployment:

1. Point your domain to your server/Cloud Run
2. Enable **Cloudflare proxy** (orange cloud)
3. Configure **Origin Rules**:
   ```
   Origin Server: your-cloudrun-url.run.app
   SSL: Full (strict)
   ```

---

## 🧪 Step 12: Testing Your Setup

### DNS Test:
```powershell
# Check if DNS is working
nslookup digitaltide.com

# Should show Cloudflare IPs (not your actual server IP)
```

### SSL Test:
```powershell
# Test HTTPS
curl https://digitaltide.com

# Check SSL certificate
# Should be issued by Cloudflare
```

### CDN Test:
```powershell
# Check response headers
curl -I https://digitaltide.com

# Look for:
# CF-Cache-Status: HIT (cached)
# CF-Ray: [ID] (routed through Cloudflare)
# Server: cloudflare
```

---

## 💰 Cost Comparison

### Cloudflare Free Plan:
```
CDN: Unlimited bandwidth - FREE
SSL: Automatic certificates - FREE
DDoS Protection: Basic - FREE
DNS: Unlimited queries - FREE
Page Rules: 3 rules - FREE
Security: Bot Fight Mode - FREE
Analytics: Basic - FREE

Total: $0/month ✨
```

### Cloudflare Pro Plan ($20/month):
- Additional features:
  - WAF custom rules
  - Image optimization
  - Mobile redirect
  - 20 Page Rules
  - Advanced analytics (30 days)

**Recommendation**: Start with **Free** plan, upgrade if needed

---

## 🔄 Step 13: Integration with DigitalTide

### Update Environment Variables:

```bash
# .env.production
CLOUDFLARE_ENABLED=true
CLOUDFLARE_ZONE_ID=your-zone-id
CLOUDFLARE_API_TOKEN=your-api-token

# Trusted proxy (important for getting real visitor IPs)
TRUST_PROXY=true
```

### Get Cloudflare Zone ID:

1. Cloudflare dashboard → Select your domain
2. **Zone ID** shown on right sidebar
3. Copy and add to `.env`

### Create API Token:

1. Go to **My Profile** → **API Tokens**
2. Click **"Create Token"**
3. Use template: **"Edit zone DNS"**
4. Permissions:
   - Zone → DNS → Edit
   - Zone → Cache Purge → Purge
5. Zone Resources: Include → Specific zone → digitaltide.com
6. Click **"Continue to summary"** → **"Create Token"**
7. **Copy token** (shown only once!)
8. Add to `.env`

---

## 🛠️ Step 14: Cloudflare Workers (Optional - Advanced)

Cloudflare Workers let you run code at the edge (before reaching your server).

### Example Use Cases:

1. **Rate Limiting**:
   ```javascript
   // Protect API endpoints
   addEventListener('fetch', event => {
     event.respondWith(handleRequest(event.request))
   })
   ```

2. **A/B Testing**:
   ```javascript
   // Split traffic between versions
   const version = Math.random() < 0.5 ? 'A' : 'B'
   ```

3. **Redirect Rules**:
   ```javascript
   // Custom redirects
   if (url.pathname === '/old-page') {
     return Response.redirect('/new-page', 301)
   }
   ```

**Free Tier**: 100,000 requests/day

---

## 📋 Cloudflare Setup Checklist

- [ ] Create Cloudflare account (free, no credit card)
- [ ] Add domain (if you have one)
- [ ] Update nameservers at domain registrar
- [ ] Wait for DNS propagation (2-24 hours)
- [ ] Configure DNS records (A, CNAME)
- [ ] Set SSL/TLS to "Full (strict)"
- [ ] Enable "Always Use HTTPS"
- [ ] Set Security Level to "Medium"
- [ ] Enable Bot Fight Mode
- [ ] Configure caching rules
- [ ] Enable Auto Minify (JS, CSS, HTML)
- [ ] Enable Brotli compression
- [ ] Create Page Rules (cache static assets, bypass API)
- [ ] Create firewall rules (rate limiting, block bots)
- [ ] Enable HSTS (after testing)
- [ ] Get Zone ID and API Token
- [ ] Update DigitalTide environment variables
- [ ] Test DNS, SSL, and caching
- [ ] Monitor analytics

---

## 🆘 Troubleshooting

### "Too Many Redirects" Error:
- Check SSL/TLS mode (use "Full" or "Full (strict)")
- Disable "Always Use HTTPS" temporarily
- Clear browser cache

### DNS Not Resolving:
- Wait longer (can take up to 24 hours)
- Check nameservers are correct at registrar
- Use `nslookup` to verify

### Content Not Caching:
- Check Page Rules are correct
- Verify Cache-Control headers from your server
- Use "Purge Everything" to clear cache

### Real IP Not Showing:
- Make sure `app.set('trust proxy', true)` in Express
- Use `req.headers['cf-connecting-ip']` for real IP

---

## 🎯 Next Steps After Cloudflare Setup

1. ✅ **Domain configured with Cloudflare**
2. ✅ **SSL/TLS enabled**
3. ✅ **CDN caching configured**
4. ✅ **Security rules active**
5. ⏳ **Deploy DigitalTide to production**
6. ⏳ **Point DNS to Cloud Run**
7. ⏳ **Test performance and security**

---

## 📚 Resources

- Cloudflare Dashboard: https://dash.cloudflare.com
- Cloudflare Docs: https://developers.cloudflare.com
- Community: https://community.cloudflare.com
- Status: https://www.cloudflarestatus.com

---

**Important Note**: Cloudflare is most useful when you have a custom domain deployed to production. For local development, it's not needed. Set it up when you're ready to launch!

---

*Last Updated: October 30, 2025*
