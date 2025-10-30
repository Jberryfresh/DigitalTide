# Azure Cloud Provider Setup Guide

> **Phase 1.5 - External Services & Account Setup**  
> Complete guide for configuring Azure cloud services for DigitalTide

## 📋 Overview

This guide walks you through setting up all Azure services needed for DigitalTide's production deployment. Since we're using Docker for local development, these Azure services are for **staging and production environments only**.

### Services We'll Configure:
1. ✅ **Resource Group** - Container for all resources
2. ✅ **App Service Plan** - Hosting infrastructure
3. ✅ **App Service (Web App)** - Node.js backend
4. ✅ **Storage Account** - Images, media, backups
5. ✅ **Key Vault** - Secrets management
6. ⏳ **Azure Database for PostgreSQL** - Production database (optional for now)
7. ⏳ **Azure Cache for Redis** - Production cache (optional for now)
8. ⏳ **Application Insights** - Monitoring and analytics

---

## 🎯 Prerequisites

- ✅ Azure account (you have this)
- ✅ Active subscription: `331632e0-cac5-448a-ae27-515749f774b1`
- ✅ Resource group created: `digitaltide-dev`
- ⚠️ **Note**: Your subscription has quota limits - we'll work around these

---

## 📦 Step 1: Create App Service Plan

**What it is**: The infrastructure tier that hosts your web app (like choosing server specs).

### Via Azure Portal:

1. Navigate to **Azure Portal** → Search for **"App Service Plans"**
2. Click **"+ Create"**

**Configuration**:
```
Subscription: Azure subscription 1
Resource Group: digitaltide-dev
Name: digitaltide-plan
Operating System: Linux
Region: East US (or West US - choose closest to users)

Pricing Tier:
- Development: F1 (Free) - 1GB RAM, 60 min/day
- Testing: B1 (Basic) - $13/month, 1.75GB RAM, always on
- Production: S1 (Standard) - $70/month, auto-scaling, deployment slots
```

**Recommendation**: Start with **F1 (Free)** for testing, upgrade to B1 when ready.

3. Click **"Review + Create"** → **"Create"**

### Quota Issue Workaround:
If you get quota errors, try:
- Different regions (try all: East US, West US 2, Central US)
- Request quota increase: Portal → **"Quotas"** → Search "App Service" → Request increase
- Or use Azure for Students credits if eligible

---

## 🌐 Step 2: Create App Service (Web App)

**What it is**: Your actual Node.js application hosting environment.

### Via Azure Portal:

1. Navigate to **"App Services"** → Click **"+ Create"**

**Basics Tab**:
```
Subscription: Azure subscription 1
Resource Group: digitaltide-dev
Name: digitaltide (or digitaltide-api if taken)
  → This becomes: https://digitaltide.azurewebsites.net

Publish: Code (not Docker Container - for now)
Runtime stack: Node 20 LTS
Operating System: Linux
Region: Same as your App Service Plan

App Service Plan: digitaltide-plan (select existing)
```

**Deployment Tab** (Skip for now):
- We'll set up GitHub Actions deployment later

**Networking Tab** (Default):
- Enable public access: On
- Network injection: Off

**Monitoring Tab**:
```
Enable Application Insights: Yes
Application Insights Name: digitaltide-insights
Region: Same as App Service
```

2. Click **"Review + Create"** → **"Create"**
3. Wait 2-3 minutes for deployment
4. Click **"Go to resource"**

---

## ⚙️ Step 3: Configure App Service Settings

After creating the App Service, configure environment variables:

### 3.1 Application Settings

1. In your App Service, go to **"Configuration"** (left menu)
2. Click **"Application settings"** tab
3. Click **"+ New application setting"** for each:

```bash
# Node.js Configuration
NODE_ENV = production
PORT = 8080
# Note: Azure uses port 8080 by default, not 3000

# Database (Keep using Docker PostgreSQL for dev)
DB_HOST = host.docker.internal  # For local dev
DB_PORT = 5432
DB_NAME = digitaltide
DB_USER = postgres
DB_PASSWORD = your-local-docker-password

# Redis (Keep using Docker Redis for dev)
REDIS_HOST = host.docker.internal
REDIS_PORT = 6379

# JWT Secrets (copy from your .env file)
JWT_SECRET = your-jwt-secret-here
JWT_REFRESH_SECRET = your-refresh-secret-here
JWT_ACCESS_EXPIRATION = 15m
JWT_REFRESH_EXPIRATION = 7d

# News APIs (from Phase 1.5)
SERPAPI_KEY = your-serpapi-key
MEDIASTACK_API_KEY = your-mediastack-key
# NEWSAPI_KEY = (add when you fix NewsAPI setup)

# AI Services (from Phase 1.5)
ANTHROPIC_API_KEY = your-anthropic-key
# OPENAI_API_KEY = (add when you add payment method)

# CORS Configuration
CORS_ORIGIN = https://digitaltide.azurewebsites.net
```

4. Click **"Save"** at the top after adding all settings
5. App will restart automatically

### 3.2 General Settings

Still in **"Configuration"**:
1. Go to **"General settings"** tab
2. Configure:
```
Stack: Node
Major version: 20
Minor version: LTS
Startup Command: node src/index.js

Always On: On (Important! Prevents app from sleeping)
ARR affinity: On
HTTPS Only: On (Redirect HTTP to HTTPS)
Minimum TLS Version: 1.2
```

3. Click **"Save"**

---

## 💾 Step 4: Create Storage Account

**What it is**: Cloud storage for images, media files, article backups.

### Via Azure Portal:

1. Search for **"Storage accounts"** → Click **"+ Create"**

**Configuration**:
```
Subscription: Azure subscription 1
Resource Group: digitaltide-dev
Storage account name: digitaltidestore (must be globally unique, lowercase, no hyphens)
Region: Same as App Service
Performance: Standard
Redundancy: LRS (Locally-redundant storage) - cheapest option

Advanced settings (defaults are fine):
- Secure transfer required: Enabled
- Blob public access: Disabled
- Storage account key access: Enabled
```

2. Click **"Review + Create"** → **"Create"**

### 4.1 Create Blob Containers

After storage account is created:
1. Go to storage account → **"Containers"** (left menu)
2. Click **"+ Container"** and create these:

```
articles-images (Private)
  → For article thumbnail images

media-assets (Private)
  → For video thumbnails, audio files

backups (Private)
  → For database backups

public-assets (Blob - public read access)
  → For logos, favicons, public images
```

### 4.2 Get Connection String

1. Go to **"Access keys"** (left menu)
2. Click **"Show"** next to key1
3. Copy the **"Connection string"**
4. Add to App Service Configuration:
```
AZURE_STORAGE_CONNECTION_STRING = [paste connection string]
AZURE_STORAGE_ACCOUNT_NAME = digitaltidestore
```

---

## 🔐 Step 5: Create Key Vault (Optional but Recommended)

**What it is**: Secure storage for secrets, API keys, certificates.

### Via Azure Portal:

1. Search for **"Key vaults"** → Click **"+ Create"**

**Configuration**:
```
Subscription: Azure subscription 1
Resource Group: digitaltide-dev
Key vault name: digitaltide-vault (must be globally unique)
Region: Same as App Service
Pricing tier: Standard

Access configuration:
- Permission model: Vault access policy
- Azure Virtual Machines for deployment: Disabled
- Azure Resource Manager for template deployment: Disabled
- Azure Disk Encryption for volume encryption: Disabled
```

2. Click **"Review + Create"** → **"Create"**

### 5.1 Grant App Service Access

1. Go to Key Vault → **"Access policies"**
2. Click **"+ Create"**
3. **Permissions**: Select **"Get"** and **"List"** for Secrets
4. **Principal**: Search for your App Service name (digitaltide)
5. Click **"Review + create"** → **"Create"**

### 5.2 Add Secrets

1. Go to **"Secrets"** (left menu)
2. Click **"+ Generate/Import"**
3. Add your sensitive values:

```
jwt-secret = [your JWT secret]
jwt-refresh-secret = [your refresh secret]
serpapi-key = [your SerpAPI key]
anthropic-key = [your Anthropic key]
db-password = [future Azure PostgreSQL password]
```

### 5.3 Reference in App Service

In App Service Configuration, use Key Vault references:
```
JWT_SECRET = @Microsoft.KeyVault(SecretUri=https://digitaltide-vault.vault.azure.net/secrets/jwt-secret/)
```

---

## 📊 Step 6: Application Insights (Already Created)

**What it is**: Application performance monitoring, logging, analytics.

✅ You should already have `digitaltide-insights` created with the App Service.

### Verify Configuration:

1. Go to App Service → **"Application Insights"** (left menu)
2. Should show: **Connected to digitaltide-insights**
3. Copy the **Instrumentation Key**
4. Add to App Service Configuration:
```
APPINSIGHTS_INSTRUMENTATIONKEY = [instrumentation key]
APPLICATION_INSIGHTS_CONNECTION_STRING = [connection string]
```

### View Metrics:

- **Live Metrics**: Real-time request/response data
- **Failures**: Exception tracking
- **Performance**: Response times, dependencies
- **Logs**: Application logs and traces

---

## 🗄️ Step 7: Azure Database for PostgreSQL (Optional - For Production)

**Current Setup**: Using Docker PostgreSQL locally (free, fast, good for dev)  
**When to Add Azure DB**: When you're ready to deploy to production

### If You Want to Add Now:

1. Search for **"Azure Database for PostgreSQL"** → **"Flexible Server"**
2. Click **"+ Create"**

**Configuration**:
```
Subscription: Azure subscription 1
Resource Group: digitaltide-dev
Server name: digitaltide-db
Region: Same as App Service
PostgreSQL version: 15

Compute + Storage:
- Workload type: Development (cheapest)
- Compute tier: Burstable
- Compute size: B1ms (1 vCore, 2GB RAM) - ~$30/month
- Storage: 32 GB
- Backup retention: 7 days

Authentication:
- Admin username: digitaltideadmin
- Password: [create strong password and save it!]
```

3. **Networking**:
   - Connectivity method: **Public access**
   - Firewall rules: Click **"+ Add current client IP address"**
   - Also add: **"Allow Azure services"** (for App Service access)

4. Click **"Review + Create"** → **"Create"** (takes 10-15 minutes)

### After Creation:

1. Get connection string from database **"Connect"** page
2. Update App Service Configuration:
```
DB_HOST = digitaltide-db.postgres.database.azure.com
DB_PORT = 5432
DB_NAME = digitaltide
DB_USER = digitaltideadmin
DB_PASSWORD = [your password]
DB_SSL = true
```

3. Run migrations to Azure database:
```powershell
# Update .env with Azure DB credentials temporarily
npm run db:migrate
npm run db:seed
```

**Cost**: ~$30-50/month for Basic tier

---

## 🔴 Step 8: Azure Cache for Redis (Optional - For Production)

**Current Setup**: Using Docker Redis locally (free, good for dev)  
**When to Add Azure Redis**: When you need shared cache across multiple app instances

### If You Want to Add Now:

1. Search for **"Azure Cache for Redis"** → Click **"+ Create"**

**Configuration**:
```
Subscription: Azure subscription 1
Resource Group: digitaltide-dev
DNS name: digitaltide-cache
Location: Same as App Service

Cache type:
- Development: Basic C0 (250MB) - ~$16/month
- Production: Standard C1 (1GB) - ~$55/month with redundancy

Clustering policy: OSS cluster policy
Non-TLS port: Disabled (use TLS only)
```

2. Click **"Review + Create"** → **"Create"** (takes 15-20 minutes)

### After Creation:

1. Go to Redis → **"Access keys"**
2. Copy **Primary connection string**
3. Update App Service Configuration:
```
REDIS_HOST = digitaltide-cache.redis.cache.windows.net
REDIS_PORT = 6380
REDIS_PASSWORD = [primary key]
REDIS_TLS = true
```

**Cost**: ~$16-55/month depending on tier

---

## 🚀 Step 9: Deploy Your Application

### Option A: Manual Deployment (Quick Test)

1. Build your app locally:
```powershell
npm install
npm run build  # If you have a build step
```

2. In Azure Portal, go to App Service → **"Deployment Center"**
3. Choose **"Local Git"** or **"FTP"**
4. Follow instructions to push code

### Option B: GitHub Actions (Recommended)

We'll set this up in Phase 2 - automated deployment on every push to main.

**Preview of GitHub Actions workflow**:
```yaml
# .github/workflows/azure-deploy.yml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: azure/webapps-deploy@v2
        with:
          app-name: digitaltide
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
```

---

## 🔧 Step 10: Test Your Deployment

### 10.1 Check App Service Health

1. Go to App Service → **"Overview"**
2. Click on your URL: `https://digitaltide.azurewebsites.net`
3. Should see your app or default page

### 10.2 Check Logs

1. App Service → **"Log stream"** (left menu)
2. Watch for startup errors or Node.js logs

### 10.3 Test Endpoints

Once deployed:
```bash
# Health check
curl https://digitaltide.azurewebsites.net/health

# API endpoints
curl https://digitaltide.azurewebsites.net/api/v1/articles
```

---

## 💰 Cost Estimation

### Development Setup (Minimal):
```
App Service: F1 (Free) - $0/month
Storage Account: LRS with minimal data - ~$2/month
Application Insights: First 5GB free - ~$0-5/month
Key Vault: Standard - ~$0.03/10,000 operations

Total: ~$2-7/month
```

### Production Setup (Full):
```
App Service: S1 Standard - $70/month
Storage Account: LRS with 100GB - ~$20/month
PostgreSQL: B1ms Burstable - $30/month
Redis: Basic C0 - $16/month
Application Insights: 10GB data - ~$10/month
Key Vault: Standard - ~$1/month

Total: ~$147/month
```

### Cost Optimization Tips:
- Start with Free/Basic tiers, scale up as needed
- Use Docker locally for development (free)
- Only add Azure Database/Redis when deploying to production
- Set up budget alerts in Azure Portal
- Delete unused resources

---

## 📝 Step 11: Update .env Files

### Local Development (.env):
```bash
# Keep using Docker services locally - FREE!
NODE_ENV=development
PORT=3000

# Docker PostgreSQL (local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digitaltide
DB_USER=postgres
DB_PASSWORD=postgres

# Docker Redis (local)
REDIS_HOST=localhost
REDIS_PORT=6379

# API Keys
SERPAPI_KEY=your-key
ANTHROPIC_API_KEY=your-key
```

### Azure Production (.env.production):
```bash
# Azure App Service
NODE_ENV=production
PORT=8080

# Azure PostgreSQL (when you create it)
DB_HOST=digitaltide-db.postgres.database.azure.com
DB_PORT=5432
DB_NAME=digitaltide
DB_USER=digitaltideadmin
DB_PASSWORD=your-secure-password
DB_SSL=true

# Azure Redis (when you create it)
REDIS_HOST=digitaltide-cache.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=your-redis-key
REDIS_TLS=true

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_ACCOUNT_NAME=digitaltidestore

# Same API keys as local
SERPAPI_KEY=your-key
ANTHROPIC_API_KEY=your-key
```

---

## 🔒 Security Checklist

Before going to production:

- [ ] All secrets stored in Key Vault (not App Service Configuration)
- [ ] HTTPS Only enabled on App Service
- [ ] Storage Account public access disabled
- [ ] Database firewall configured (only allow Azure services + your IP)
- [ ] Redis TLS enabled
- [ ] App Service managed identity configured
- [ ] Custom domain with SSL certificate (optional)
- [ ] Rate limiting configured (already done in Phase 2)
- [ ] WAF/DDoS protection (Azure Front Door - Phase 1.8)

---

## 🎯 Next Steps After Azure Setup

Once Azure cloud services are configured:

1. ✅ **Mark Phase 1.5 as complete** in PROJECT_TODO.md
2. ✅ **Update GitHub Secrets** with Azure credentials
3. ✅ **Create deployment workflow** (GitHub Actions)
4. ✅ **Test production deployment**
5. ✅ **Set up custom domain** (digitaltide.com)
6. ✅ **Configure CDN** (Cloudflare or Azure CDN)
7. ✅ **Set up monitoring alerts** in Application Insights

---

## 🆘 Troubleshooting

### App Service won't start:
- Check **Log stream** for errors
- Verify Node.js version matches your app (20 LTS)
- Check startup command: `node src/index.js`
- Ensure PORT=8080 in environment variables

### Database connection fails:
- Check firewall rules allow App Service
- Verify connection string format
- Ensure SSL is enabled if using Azure PostgreSQL
- Test connection from local machine first

### Storage access denied:
- Check connection string is correct
- Verify container permissions (Private vs Blob)
- Ensure managed identity has Storage Blob Data Contributor role

### Quota errors:
- Request quota increase: Portal → Quotas
- Try different Azure regions
- Use Free tier (F1) which has separate quota
- Check billing/subscription limits

---

## 📚 Additional Resources

- [Azure App Service Documentation](https://learn.microsoft.com/en-us/azure/app-service/)
- [Azure PostgreSQL Documentation](https://learn.microsoft.com/en-us/azure/postgresql/)
- [Azure Storage Documentation](https://learn.microsoft.com/en-us/azure/storage/)
- [Azure Key Vault Documentation](https://learn.microsoft.com/en-us/azure/key-vault/)
- [Application Insights Documentation](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

---

## ✅ Completion Checklist

Mark these off as you complete each service:

- [ ] Resource Group created: `digitaltide-dev`
- [ ] App Service Plan created: `digitaltide-plan`
- [ ] App Service (Web App) created: `digitaltide`
- [ ] App Service configured with environment variables
- [ ] Storage Account created: `digitaltidestore`
- [ ] Blob containers created (articles-images, media-assets, backups)
- [ ] Application Insights configured
- [ ] Key Vault created (optional)
- [ ] Secrets added to Key Vault
- [ ] Azure Database for PostgreSQL created (optional - production only)
- [ ] Azure Cache for Redis created (optional - production only)
- [ ] Test deployment successful
- [ ] Health check endpoint working
- [ ] Logs streaming in Application Insights

**Once you complete the critical services (App Service, Storage, Application Insights), you can mark Phase 1.5 as complete!**

---

*Last Updated: October 30, 2025*
