# GitHub Secrets Configuration Script

# This PowerShell script helps you configure GitHub Secrets for DigitalTide
# Run this script to generate secure secrets and get the commands to set them up

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "DigitalTide - GitHub Secrets Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Function to generate random string
function Generate-SecureSecret {
    param (
        [int]$Length = 64
    )
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

Write-Host "Generating secure secrets..." -ForegroundColor Yellow
Write-Host ""

# Generate JWT secrets
$JWT_SECRET = Generate-SecureSecret -Length 64
$JWT_REFRESH_SECRET = Generate-SecureSecret -Length 64

Write-Host "✓ Generated JWT secrets" -ForegroundColor Green

# Output configuration guide
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "STEP 1: Configure Local Environment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Copy these values to your .env file:" -ForegroundColor Yellow
Write-Host ""
Write-Host "JWT_SECRET=$JWT_SECRET"
Write-Host "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "STEP 2: Configure GitHub Secrets" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Navigate to: https://github.com/Jberryfresh/DigitalTide/settings/secrets/actions" -ForegroundColor Yellow
Write-Host ""
Write-Host "Click 'New repository secret' for each of the following:" -ForegroundColor Yellow
Write-Host ""

# Database secrets
Write-Host "--- Database Credentials ---" -ForegroundColor Magenta
Write-Host "Name: DB_HOST"
Write-Host "Value: [your-production-db-host]"
Write-Host ""
Write-Host "Name: DB_PORT"
Write-Host "Value: 5432"
Write-Host ""
Write-Host "Name: DB_NAME"
Write-Host "Value: digitaltide_production"
Write-Host ""
Write-Host "Name: DB_USER"
Write-Host "Value: [your-production-db-user]"
Write-Host ""
Write-Host "Name: DB_PASSWORD"
Write-Host "Value: [your-production-db-password]"
Write-Host ""

# Redis secrets
Write-Host "--- Redis Configuration ---" -ForegroundColor Magenta
Write-Host "Name: REDIS_HOST"
Write-Host "Value: [your-production-redis-host]"
Write-Host ""
Write-Host "Name: REDIS_PORT"
Write-Host "Value: 6379"
Write-Host ""
Write-Host "Name: REDIS_PASSWORD"
Write-Host "Value: [your-redis-password-if-enabled]"
Write-Host ""

# JWT secrets
Write-Host "--- JWT Secrets (COPY THESE) ---" -ForegroundColor Magenta
Write-Host "Name: JWT_SECRET"
Write-Host "Value: $JWT_SECRET" -ForegroundColor Green
Write-Host ""
Write-Host "Name: JWT_REFRESH_SECRET"
Write-Host "Value: $JWT_REFRESH_SECRET" -ForegroundColor Green
Write-Host ""

# News API keys (placeholders for Phase 1.5)
Write-Host "--- News API Keys (Configure in Phase 1.5) ---" -ForegroundColor Magenta
Write-Host "Name: GOOGLE_NEWS_API_KEY"
Write-Host "Value: [from-google-news-api-console]"
Write-Host ""
Write-Host "Name: NEWSAPI_KEY"
Write-Host "Value: [from-newsapi.org]"
Write-Host ""
Write-Host "Name: MEDIASTACK_API_KEY"
Write-Host "Value: [from-mediastack.com]"
Write-Host ""

# AI Service API keys (placeholders for Phase 1.5)
Write-Host "--- AI Service API Keys (Configure in Phase 1.5) ---" -ForegroundColor Magenta
Write-Host "Name: OPENAI_API_KEY"
Write-Host "Value: [sk-from-openai-dashboard]"
Write-Host ""
Write-Host "Name: ANTHROPIC_API_KEY"
Write-Host "Value: [sk-ant-from-anthropic-console]"
Write-Host ""

# Cloud provider (placeholders for Phase 1.5)
Write-Host "--- Cloud Provider Credentials (Configure in Phase 1.5) ---" -ForegroundColor Magenta
Write-Host "Name: AWS_ACCESS_KEY_ID"
Write-Host "Value: [from-aws-iam]"
Write-Host ""
Write-Host "Name: AWS_SECRET_ACCESS_KEY"
Write-Host "Value: [from-aws-iam]"
Write-Host ""
Write-Host "Name: AWS_REGION"
Write-Host "Value: us-east-1"
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "STEP 3: Configure Environment Variables" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Navigate to: https://github.com/Jberryfresh/DigitalTide/settings/variables/actions" -ForegroundColor Yellow
Write-Host ""
Write-Host "Click 'New repository variable' for each:" -ForegroundColor Yellow
Write-Host ""

Write-Host "Name: NODE_ENV"
Write-Host "Value: production"
Write-Host ""
Write-Host "Name: PORT"
Write-Host "Value: 3000"
Write-Host ""
Write-Host "Name: LOG_LEVEL"
Write-Host "Value: info"
Write-Host ""
Write-Host "Name: RATE_LIMIT_WINDOW_MS"
Write-Host "Value: 900000"
Write-Host ""
Write-Host "Name: RATE_LIMIT_MAX_REQUESTS"
Write-Host "Value: 100"
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "STEP 4: Using GitHub CLI (Optional)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you have GitHub CLI installed, you can set secrets via command line:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Install GitHub CLI: https://cli.github.com/" -ForegroundColor Gray
Write-Host "# Authenticate: gh auth login" -ForegroundColor Gray
Write-Host ""
Write-Host "Example commands:" -ForegroundColor Yellow
Write-Host "gh secret set JWT_SECRET --body '$JWT_SECRET' --repo Jberryfresh/DigitalTide"
Write-Host "gh secret set JWT_REFRESH_SECRET --body '$JWT_REFRESH_SECRET' --repo Jberryfresh/DigitalTide"
Write-Host "gh secret set DB_PASSWORD --body 'your-db-password' --repo Jberryfresh/DigitalTide"
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "STEP 5: Verify Configuration" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After setting all secrets:" -ForegroundColor Yellow
Write-Host "1. Go to Actions tab" -ForegroundColor White
Write-Host "2. Run any workflow manually" -ForegroundColor White
Write-Host "3. Check if secrets are accessible" -ForegroundColor White
Write-Host "4. Review workflow logs for any secret-related errors" -ForegroundColor White
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Security Reminders" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Never commit secrets to the repository" -ForegroundColor Green
Write-Host "✓ Use strong, unique passwords for each service" -ForegroundColor Green
Write-Host "✓ Rotate secrets regularly (every 90 days recommended)" -ForegroundColor Green
Write-Host "✓ Limit access to secrets to necessary team members only" -ForegroundColor Green
Write-Host "✓ Enable secret scanning in repository settings" -ForegroundColor Green
Write-Host "✓ Use environment-specific secrets when possible" -ForegroundColor Green
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your generated secrets have been saved to: secrets.txt" -ForegroundColor Green
Write-Host "Keep this file secure and delete it after configuring GitHub!" -ForegroundColor Yellow
Write-Host ""

# Save secrets to file for reference
$content = "DigitalTide - Generated Secrets`r`n"
$content += "Generated: $(Get-Date)`r`n`r`n"
$content += "IMPORTANT: Keep this file secure and delete after use!`r`n`r`n"
$content += "JWT_SECRET=$JWT_SECRET`r`n"
$content += "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET`r`n`r`n"
$content += "These secrets should be added to:`r`n"
$content += "1. Local .env file for development`r`n"
$content += "2. GitHub Secrets for CI/CD: https://github.com/Jberryfresh/DigitalTide/settings/secrets/actions`r`n`r`n"
$content += "DO NOT commit this file to git!`r`n"

$content | Out-File -FilePath "secrets.txt" -Encoding UTF8

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy JWT secrets to your .env file" -ForegroundColor White
Write-Host "2. Configure GitHub Secrets via web UI or GitHub CLI" -ForegroundColor White
Write-Host "3. Set up remaining secrets in Phase 1.5" -ForegroundColor White
Write-Host "4. Delete secrets.txt after configuration" -ForegroundColor White
Write-Host ""
