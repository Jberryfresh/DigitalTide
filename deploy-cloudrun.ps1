# Cloud Run Deployment Script for DigitalTide
# This script deploys the application to Google Cloud Run

# Make sure you're logged in and have the correct project set
# gcloud auth login
# gcloud config set project YOUR_PROJECT_ID

# Variables
$PROJECT_ID = "digitaltide"
$SERVICE_NAME = "digitaltide-api"
$REGION = "us-central1"  # Change if needed

Write-Host "🚀 Deploying DigitalTide to Google Cloud Run..." -ForegroundColor Cyan
Write-Host ""

# Deploy to Cloud Run
# Cloud Run will automatically build the Docker image from source
gcloud run deploy $SERVICE_NAME `
  --source . `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars NODE_ENV=production `
  --min-instances 0 `
  --max-instances 10 `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300 `
  --port 8080

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Getting service URL..." -ForegroundColor Cyan
    
    # Get the service URL
    $SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
    
    Write-Host ""
    Write-Host "📍 Your service is live at:" -ForegroundColor Green
    Write-Host $SERVICE_URL -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🧪 Test endpoints:" -ForegroundColor Cyan
    Write-Host "   Health: $SERVICE_URL/health" -ForegroundColor White
    Write-Host "   API:    $SERVICE_URL/api/v1/articles" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check the errors above and try again." -ForegroundColor Yellow
    Write-Host ""
}
