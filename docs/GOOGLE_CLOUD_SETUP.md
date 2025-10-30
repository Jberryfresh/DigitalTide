# Google Cloud Platform (GCP) Setup Guide

> **Phase 1.5 - External Services & Account Setup**  
> Simplified cloud provider configuration using Google Cloud Platform

## 📋 Why Google Cloud for DigitalTide?

### Advantages over Azure:
- ✅ **Simpler deployment** - Cloud Run is easier than App Service
- ✅ **Better free tier** - $300 credit + always-free services
- ✅ **Docker-native** - Deploy our existing Docker setup easily
- ✅ **Clearer pricing** - Pay only for what you use
- ✅ **Better developer experience** - More intuitive UI
- ✅ **Excellent documentation** - Easy-to-follow guides

### Free Tier Benefits:
- **$300 credit** for 90 days (new accounts)
- **Always Free** tier includes:
  - Cloud Run: 2 million requests/month
  - Cloud Storage: 5GB
  - Cloud Functions: 2 million invocations/month
  - Firestore: 1GB storage
  - Secret Manager: 6 operations/minute

---

## 🚀 Quick Start Overview

We'll use these GCP services:
1. **Cloud Run** - Containerized Node.js app (easier than App Service!)
2. **Cloud SQL** - PostgreSQL database (optional - keep Docker for dev)
3. **Cloud Memorystore** - Redis cache (optional - keep Docker for dev)
4. **Cloud Storage** - Images, media, backups
5. **Secret Manager** - API keys and secrets
6. **Cloud Monitoring** - Logs and metrics

---

## 📝 Step 1: Create Google Cloud Account

1. Go to https://cloud.google.com/
2. Click **"Get started for free"**
3. Sign in with your Google account
4. **Activate $300 free credit** (requires credit card but won't charge)
5. Complete billing setup

**Note**: Even after free credit expires, you can use Always Free tier services.

---

## 🎯 Step 2: Create a New Project

1. Go to **Console** (console.cloud.google.com)
2. Click project dropdown (top left, next to "Google Cloud")
3. Click **"New Project"**

**Configuration**:
```
Project name: DigitalTide
Project ID: digitaltide-{random-number} (auto-generated, globally unique)
Location: No organization
```

4. Click **"Create"**
5. **Copy your Project ID** - you'll need it!

---

## 🐳 Step 3: Set Up Cloud Run (Easiest Deployment!)

**What is Cloud Run?**
- Automatically scales from 0 to infinity
- You only pay when requests are being processed
- Super easy Docker deployment
- Includes HTTPS out of the box

### 3.1 Enable Cloud Run API

1. Search for **"Cloud Run"** in the console
2. Click **"Enable API"** if not already enabled
3. Wait 1-2 minutes for activation

### 3.2 Prepare Docker Container

We'll containerize our Node.js app. Create `Dockerfile` in project root:

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY database/ ./database/

# Expose port
EXPOSE 8080

# Start app
CMD ["node", "src/index.js"]
```

### 3.3 Create `.dockerignore`

```
node_modules
.git
.env
.env.local
*.md
docs/
.vscode/
.github/
scripts/
test-*.json
test-*.html
```

### 3.4 Deploy to Cloud Run

**Option A: Using Google Cloud Console (Easiest)**

1. In Cloud Run console, click **"Create Service"**
2. Select **"Deploy one revision from an existing container image"**
3. Click **"Test with a sample container"** (for now)
4. Configure:

```
Service name: digitaltide-api
Region: us-central1 (or closest to you)
CPU allocation: CPU is only allocated during request processing
Minimum instances: 0 (scales to zero when not in use)
Maximum instances: 10

Autoscaling:
- Min: 0
- Max: 10
- Target CPU utilization: 80%

Ingress: All
Authentication: Allow unauthenticated invocations (for now)
```

5. Click **"Create"**
6. Wait 2-3 minutes for deployment
7. You'll get a URL like: `https://digitaltide-api-abc123-uc.a.run.app`

**Option B: Using gcloud CLI (Advanced)**

```bash
# Install gcloud CLI
# Download from: https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
gcloud run deploy digitaltide-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🗄️ Step 4: Set Up Cloud SQL (PostgreSQL) - Optional

**Recommendation**: Keep using Docker PostgreSQL locally, add Cloud SQL only for production.

### If You Want Cloud SQL:

1. Search for **"Cloud SQL"** in console
2. Click **"Create Instance"** → **"Choose PostgreSQL"**

**Configuration**:
```
Instance ID: digitaltide-db
Password: [create strong password - save it!]
Database version: PostgreSQL 15
Cloud SQL edition: Enterprise
Region: us-central1 (same as Cloud Run)

Machine type:
- Development: Shared core (1 vCPU, 0.6GB RAM) - ~$9/month
- Production: Lightweight (1 vCPU, 3.75GB RAM) - ~$50/month

Storage:
- SSD, 10GB
- Enable automatic storage increase

Connections:
- Public IP (for now)
- Add authorized networks: 0.0.0.0/0 (all IPs - we'll restrict later)
- Enable Cloud SQL Admin API
```

3. Click **"Create Instance"** (takes 10-15 minutes)

### Connect Cloud Run to Cloud SQL:

1. Go to your Cloud Run service
2. Click **"Edit & Deploy New Revision"**
3. Go to **"Connections"** tab
4. Click **"Add Connection"**
5. Select your Cloud SQL instance
6. Deploy

Cloud Run will automatically get a Unix socket connection!

**Connection String**:
```bash
# In Cloud Run environment
DB_HOST=/cloudsql/YOUR_PROJECT_ID:us-central1:digitaltide-db
DB_PORT=5432
DB_NAME=digitaltide
DB_USER=postgres
DB_PASSWORD=your-password
```

**Cost**: ~$9-50/month depending on tier

---

## 🔴 Step 5: Set Up Cloud Memorystore (Redis) - Optional

**Recommendation**: Keep using Docker Redis locally, add Memorystore only for production.

### If You Want Cloud Memorystore:

1. Search for **"Memorystore"** → Click **"Create Instance"**

**Configuration**:
```
Instance ID: digitaltide-cache
Tier: Basic (no replication)
Region: us-central1
Capacity: 1GB
Version: Redis 7.0

Network:
- Default network
- Authorized network: default
```

2. Click **"Create"** (takes 10-15 minutes)

**Cost**: ~$30/month for 1GB Basic tier

---

## 💾 Step 6: Set Up Cloud Storage (Easy!)

**What it is**: Object storage for images, media, backups (like AWS S3).

1. Search for **"Cloud Storage"** → Click **"Create Bucket"**

**Configuration**:
```
Bucket name: digitaltide-storage (must be globally unique)
Location type: Region
Region: us-central1 (same as Cloud Run)

Storage class: Standard

Access control: Uniform (recommended)
Protection tools:
- Soft delete: 7 days
- Object versioning: Off (for now)

Encryption: Google-managed key
```

2. Click **"Create"**

### 6.1 Create Folders (Prefixes)

Cloud Storage doesn't have real folders, but we'll use prefixes:
- `articles/images/`
- `articles/thumbnails/`
- `media/videos/`
- `media/audio/`
- `backups/database/`
- `public/assets/`

### 6.2 Make Public Assets Public

For public images (logos, etc.):
1. Create folder: `public/`
2. Upload test file
3. Click the 3 dots → **"Edit permissions"**
4. Click **"Add entry"**:
   - Entity: Public
   - Name: allUsers
   - Access: Reader
5. Save

### 6.3 Get Storage Credentials

**Option A: Use Service Account (Recommended)**
1. Go to **IAM & Admin** → **"Service Accounts"**
2. Click **"Create Service Account"**
3. Name: `digitaltide-storage`
4. Grant role: **"Storage Object Admin"**
5. Click **"Create Key"** → JSON
6. Download key file (keep it secret!)

**Option B: Use Application Default Credentials (Easier for Cloud Run)**
Cloud Run automatically has permissions if you grant the service account Storage Object Admin role.

---

## 🔐 Step 7: Secret Manager (Store API Keys Securely)

1. Search for **"Secret Manager"** → Enable API
2. Click **"Create Secret"**

**Create these secrets**:

```
Name: jwt-secret
Value: [paste your JWT secret from .env]
```

```
Name: jwt-refresh-secret
Value: [paste your JWT refresh secret]
```

```
Name: serpapi-key
Value: [paste your SerpAPI key]
```

```
Name: anthropic-api-key
Value: [paste your Anthropic key]
```

### 7.1 Grant Cloud Run Access to Secrets

1. Go to **IAM & Admin** → **IAM**
2. Find your Cloud Run service account (ends with `@*.iam.gserviceaccount.com`)
3. Click **"Edit"** (pencil icon)
4. Click **"Add Another Role"**
5. Add role: **"Secret Manager Secret Accessor"**
6. Save

### 7.2 Mount Secrets in Cloud Run

1. Edit your Cloud Run service
2. Go to **"Variables & Secrets"** tab
3. Click **"Reference a Secret"**
4. For each secret:
   - Select secret name
   - Choose **"Latest version"**
   - Expose as: **Environment variable**
   - Variable name: `JWT_SECRET`, `SERPAPI_KEY`, etc.

---

## ⚙️ Step 8: Configure Environment Variables in Cloud Run

1. Go to your Cloud Run service
2. Click **"Edit & Deploy New Revision"**
3. Go to **"Variables & Secrets"** tab
4. Add environment variables:

```bash
# Node.js
NODE_ENV=production
PORT=8080

# Database (local Docker for now)
DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=digitaltide
DB_USER=postgres
DB_PASSWORD=postgres

# Redis (local Docker for now)
REDIS_HOST=host.docker.internal
REDIS_PORT=6379

# Secrets (mounted from Secret Manager - see step 7.2)
JWT_SECRET=[from Secret Manager]
JWT_REFRESH_SECRET=[from Secret Manager]
SERPAPI_KEY=[from Secret Manager]
ANTHROPIC_API_KEY=[from Secret Manager]

# Google Cloud
GCP_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=digitaltide-storage

# CORS
CORS_ORIGIN=https://digitaltide-api-abc123-uc.a.run.app
```

4. Click **"Deploy"**

---

## 📊 Step 9: Set Up Cloud Monitoring (Free!)

**Automatic Setup**: Cloud Run automatically sends logs and metrics to Cloud Monitoring.

### View Logs:
1. Go to your Cloud Run service
2. Click **"Logs"** tab
3. See all console.log output, errors, requests

### View Metrics:
1. Cloud Run service → **"Metrics"** tab
2. See:
   - Request count
   - Request latency
   - Instance count
   - CPU/Memory usage
   - Container startup time

### Set Up Alerts:
1. Go to **"Monitoring"** → **"Alerting"**
2. Click **"Create Policy"**
3. Example alert: "Error rate > 5%"
4. Set notification channel (email)

---

## 🚀 Step 10: Deploy Your App to Cloud Run

### 10.1 Update Your Code for Cloud Run

**Update `src/index.js`** to use PORT from environment:

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DigitalTide API running on port ${PORT}`);
});
```

### 10.2 Build and Deploy

**Option A: Direct Deployment (Easiest)**

```bash
# Install gcloud CLI first
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy from source (gcloud builds the Docker image for you!)
gcloud run deploy digitaltide-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

**Option B: Docker Build + Push (More Control)**

```bash
# Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/digitaltide-api .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/digitaltide-api

# Deploy to Cloud Run
gcloud run deploy digitaltide-api \
  --image gcr.io/YOUR_PROJECT_ID/digitaltide-api \
  --region us-central1 \
  --allow-unauthenticated
```

### 10.3 Test Deployment

```bash
# Get your Cloud Run URL
gcloud run services describe digitaltide-api \
  --region us-central1 \
  --format 'value(status.url)'

# Test health endpoint
curl https://YOUR-CLOUD-RUN-URL/health

# Test API
curl https://YOUR-CLOUD-RUN-URL/api/v1/articles
```

---

## 💰 Cost Estimation

### Development Setup (Minimal):
```
Cloud Run: First 2M requests free - $0/month
Cloud Storage: First 5GB free - $0/month
Secret Manager: Free tier - $0/month
Cloud Monitoring: Free tier - $0/month

Total: FREE! (within free tier limits)
```

### Production Setup (Full):
```
Cloud Run: ~100K requests/month - ~$5/month
Cloud SQL: Shared core, 10GB - ~$9/month
Cloud Memorystore: 1GB Basic - ~$30/month
Cloud Storage: 100GB - ~$2.60/month
Cloud Monitoring: 10GB logs - ~$5/month
Egress (data transfer): ~$10/month

Total: ~$60/month (much cheaper than Azure!)
```

### Why GCP is Cheaper:
- ✅ **Pay per request** (not per hour like Azure App Service)
- ✅ **Scales to zero** (no cost when idle)
- ✅ **Generous free tier**
- ✅ **No minimum charges** for Cloud Run

---

## 🔒 Security Best Practices

- ✅ **Use Secret Manager** - Never hardcode secrets
- ✅ **Enable HTTPS only** - Cloud Run does this automatically
- ✅ **Restrict database access** - Use private IP or Cloud SQL Auth Proxy
- ✅ **Use IAM roles** - Grant minimum necessary permissions
- ✅ **Enable VPC Service Controls** - For production
- ✅ **Set up Cloud Armor** - WAF/DDoS protection (later)

---

## 📋 Step 11: Set Up GitHub Actions for Auto-Deployment

Create `.github/workflows/gcp-deploy.yml`:

```yaml
name: Deploy to Google Cloud Run

on:
  push:
    branches: [main]

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE_NAME: digitaltide-api
  REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --source . \
            --region ${{ env.REGION }} \
            --platform managed \
            --allow-unauthenticated
```

**Required GitHub Secrets**:
1. `GCP_PROJECT_ID` - Your project ID
2. `GCP_SA_KEY` - Service account JSON key

---

## 🆘 Troubleshooting

### Cloud Run deployment fails:
- Check Dockerfile syntax
- Ensure PORT=8080 (not 3000)
- Check logs: `gcloud run logs read --service digitaltide-api`

### Can't connect to database:
- If using Cloud SQL: Check connection name is correct
- Verify Cloud Run has Cloud SQL Client role
- Test connection from Cloud Shell

### Storage upload fails:
- Check service account has Storage Object Admin role
- Verify bucket name is correct
- Check CORS configuration if uploading from browser

### "Permission denied" errors:
- Check IAM roles for service account
- Verify API is enabled
- Try `gcloud auth application-default login`

---

## 📚 Useful Commands

```bash
# View logs
gcloud run logs tail --service digitaltide-api

# List services
gcloud run services list

# Update environment variables
gcloud run services update digitaltide-api \
  --update-env-vars KEY=VALUE

# Delete service
gcloud run services delete digitaltide-api

# View metrics
gcloud run services describe digitaltide-api --region us-central1
```

---

## ✅ Completion Checklist

- [ ] Google Cloud account created
- [ ] Project created: `digitaltide`
- [ ] Cloud Run service deployed
- [ ] Cloud Storage bucket created
- [ ] Secret Manager configured with API keys
- [ ] Environment variables set in Cloud Run
- [ ] Application deployed and tested
- [ ] Cloud Monitoring configured
- [ ] GitHub Actions deployment set up (optional)
- [ ] Custom domain configured (optional)

**Once Cloud Run is working, mark Phase 1.5 as complete!**

---

## 🎯 Why This is Better Than Azure

| Feature                  | Google Cloud              | Azure                     |
| ------------------------ | ------------------------- | ------------------------- |
| **Deployment**           | `gcloud run deploy .`     | Complex App Service setup |
| **Scaling**              | Automatic to zero         | Must configure            |
| **Pricing**              | Pay per request           | Pay per hour              |
| **Free Tier**            | $300 credit + always free | Limited free options      |
| **Docker Support**       | Native (Cloud Run)        | More complex              |
| **Developer Experience** | Simple, intuitive         | Complex, many options     |
| **Documentation**        | Excellent                 | Overwhelming              |

---

*Last Updated: October 30, 2025*
