# Google Cloud Run - Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Google Cloud Account Setup
- [ ] Created GCP account at https://cloud.google.com
- [ ] Activated $300 free credit
- [ ] Created project: `DigitalTide`
- [ ] Noted Project ID: `___________________`

### 2. Install Google Cloud CLI
- [ ] Download from: https://cloud.google.com/sdk/docs/install
- [ ] Run installer
- [ ] Restart terminal/PowerShell

### 3. Authenticate and Configure
```powershell
# Login to Google Cloud
gcloud auth login

# Set your project (replace with your actual Project ID)
gcloud config set project YOUR_PROJECT_ID

# Verify setup
gcloud config list
```

### 4. Enable Required APIs
```powershell
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API (for Docker images)
gcloud services enable containerregistry.googleapis.com

# Enable Cloud Build API (for building images)
gcloud services enable cloudbuild.googleapis.com

# Enable Secret Manager API (for secrets)
gcloud services enable secretmanager.googleapis.com
```

### 5. Update Deployment Script
- [ ] Open `deploy-cloudrun.ps1`
- [ ] Replace `YOUR_PROJECT_ID` with your actual Project ID
- [ ] Save the file

---

## 🚀 Deploy to Cloud Run

### Option A: Simple Deployment (Recommended for First Time)

From your project directory:

```powershell
# Make sure you're in the DigitalTide directory
cd C:\DigitalTide-MAIN\DigitalTide

# Run the deployment script
.\deploy-cloudrun.ps1
```

### Option B: Manual Deployment

```powershell
# Deploy directly with gcloud
gcloud run deploy digitaltide-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

The deployment will:
1. Build your Docker image from the Dockerfile
2. Upload it to Google Container Registry
3. Deploy to Cloud Run
4. Return your service URL

---

## 🧪 Test Your Deployment

After deployment completes, you'll get a URL like:
`https://digitaltide-api-abc123-uc.a.run.app`

Test it:

```powershell
# Health check
curl https://YOUR-SERVICE-URL/health

# List articles
curl https://YOUR-SERVICE-URL/api/v1/articles

# Check categories
curl https://YOUR-SERVICE-URL/api/v1/categories
```

---

## ⚙️ Configure Environment Variables (After First Deployment)

### Via Console (Easiest):
1. Go to Cloud Run console
2. Click your service: `digitaltide-api`
3. Click **"Edit & Deploy New Revision"**
4. Go to **"Variables & Secrets"** tab
5. Add environment variables from `.env.production.example`

### Via gcloud CLI:
```powershell
gcloud run services update digitaltide-api \
  --region us-central1 \
  --set-env-vars "NODE_ENV=production,PORT=8080"
```

---

## 🔐 Set Up Secret Manager (Recommended)

### Create Secrets:
```powershell
# JWT Secret
echo -n "your-jwt-secret-here" | gcloud secrets create jwt-secret --data-file=-

# Anthropic API Key
echo -n "your-anthropic-key" | gcloud secrets create anthropic-api-key --data-file=-

# SerpAPI Key
echo -n "your-serpapi-key" | gcloud secrets create serpapi-key --data-file=-
```

### Grant Cloud Run Access:
```powershell
# Get your Cloud Run service account email
gcloud run services describe digitaltide-api \
  --region us-central1 \
  --format 'value(spec.template.spec.serviceAccountName)'

# Grant access to secrets (replace with your service account)
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:YOUR-SERVICE-ACCOUNT@YOUR-PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Mount Secrets in Cloud Run:
1. Cloud Run console → Edit service
2. **"Variables & Secrets"** tab
3. **"Reference a Secret"**
4. Select secret → Expose as environment variable
5. Variable name: `JWT_SECRET`

---

## 💾 Set Up Cloud Storage (For Images/Media)

```powershell
# Create storage bucket
gsutil mb -l us-central1 gs://digitaltide-storage

# Make public assets folder public
gsutil iam ch allUsers:objectViewer gs://digitaltide-storage/public/
```

---

## 📊 View Logs and Metrics

### View Logs:
```powershell
# Tail logs in real-time
gcloud run logs tail --service digitaltide-api

# View recent logs
gcloud run logs read --service digitaltide-api --limit 50
```

### View Metrics in Console:
1. Go to Cloud Run console
2. Click your service
3. Click **"Metrics"** tab
4. See requests, latency, CPU, memory

---

## 🔄 Update/Redeploy

After making code changes:

```powershell
# Simply run deployment again
.\deploy-cloudrun.ps1

# Or manually
gcloud run deploy digitaltide-api --source .
```

Cloud Run will:
- Build new image
- Deploy new revision
- Gradually shift traffic to new version
- Keep old version for rollback

---

## 🔙 Rollback (If Needed)

```powershell
# List revisions
gcloud run revisions list --service digitaltide-api

# Rollback to previous revision
gcloud run services update-traffic digitaltide-api \
  --to-revisions REVISION-NAME=100
```

---

## 💰 Monitor Costs

### Set Up Budget Alert:
1. Go to **Billing** → **Budgets & alerts**
2. Click **"Create Budget"**
3. Set amount: $10/month (or your preference)
4. Set alert at 50%, 90%, 100%
5. Add your email for notifications

### Expected Costs:
- **Development**: FREE (within 2M requests/month free tier)
- **Light Production**: $5-15/month
- **Moderate Traffic**: $20-50/month

---

## ❓ Troubleshooting

### Deployment fails with "permission denied":
```powershell
# Re-authenticate
gcloud auth login

# Check project is set
gcloud config get-value project
```

### "Service not found" error:
```powershell
# Verify you're in the correct region
gcloud run services list --region us-central1
```

### Container fails to start:
```powershell
# Check logs for errors
gcloud run logs read --service digitaltide-api --limit 100

# Common issues:
# - PORT must be 8080 (check Dockerfile EXPOSE and config)
# - Missing environment variables
# - Database connection issues
```

### Health check fails:
- Ensure `/health` endpoint exists and returns 200
- Check Cloud Run logs for startup errors
- Verify all dependencies are in package.json

---

## 📋 Post-Deployment Tasks

- [ ] Service deployed successfully
- [ ] Health check endpoint working
- [ ] API endpoints accessible
- [ ] Environment variables configured
- [ ] Secrets set up in Secret Manager
- [ ] Cloud Storage bucket created
- [ ] Logging and monitoring verified
- [ ] Budget alerts configured
- [ ] Custom domain configured (optional)
- [ ] CI/CD with GitHub Actions (optional - Phase 2)

---

## 🎉 Success!

Your DigitalTide API is now live on Google Cloud Run!

**Service URL**: `https://YOUR-SERVICE-URL.run.app`

**Next Steps**:
1. Test all API endpoints
2. Configure production database (Cloud SQL) if needed
3. Set up frontend deployment
4. Configure custom domain
5. Set up CI/CD for automatic deployments

---

**Need Help?**
- Cloud Run Documentation: https://cloud.google.com/run/docs
- Google Cloud Support: https://cloud.google.com/support
- Check `docs/GOOGLE_CLOUD_SETUP.md` for detailed guide
