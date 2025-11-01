# Google Cloud Setup Script for DigitalTide
# Run this after installing Google Cloud CLI

Write-Host "🚀 Setting up Google Cloud for DigitalTide..." -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>$null
    Write-Host "✅ Google Cloud CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install it from:" -ForegroundColor Yellow
    Write-Host "https://cloud.google.com/sdk/docs/install#windows" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or run:" -ForegroundColor Yellow
    Write-Host '(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")' -ForegroundColor Cyan
    Write-Host '& $env:Temp\GoogleCloudSDKInstaller.exe' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Step 1: Authenticate with Google Cloud" -ForegroundColor Cyan
Write-Host "This will open a browser window for login..." -ForegroundColor Yellow
Write-Host ""

gcloud auth login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Authentication failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Authentication successful!" -ForegroundColor Green
Write-Host ""

# Set project
Write-Host "📋 Step 2: Setting project to 'digitaltide'" -ForegroundColor Cyan
gcloud config set project digitaltide

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set project!" -ForegroundColor Red
    Write-Host "Make sure the project 'digitaltide' exists in your GCP account" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Project set to 'digitaltide'" -ForegroundColor Green
Write-Host ""

# Enable required APIs
Write-Host "📋 Step 3: Enabling required Google Cloud APIs..." -ForegroundColor Cyan
Write-Host "This may take 2-3 minutes..." -ForegroundColor Yellow
Write-Host ""

$apis = @(
    "run.googleapis.com",
    "containerregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
    "storage.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "  Enabling $api..." -ForegroundColor White
    gcloud services enable $api --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $api enabled" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to enable $api" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ APIs enabled successfully!" -ForegroundColor Green
Write-Host ""

# Show current configuration
Write-Host "📋 Step 4: Current Configuration" -ForegroundColor Cyan
Write-Host ""
gcloud config list

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Deploy to Cloud Run:" -ForegroundColor White
Write-Host "   .\deploy-cloudrun.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. View deployment checklist:" -ForegroundColor White
Write-Host "   Open CLOUD_RUN_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. View full guide:" -ForegroundColor White
Write-Host "   Open docs\GOOGLE_CLOUD_SETUP.md" -ForegroundColor Cyan
Write-Host ""
