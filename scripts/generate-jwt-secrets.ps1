# Generate JWT Secrets for DigitalTide
# Run this script to generate secure JWT secrets for your .env file

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     DigitalTide JWT Secret Generator              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Generating secure JWT secrets..." -ForegroundColor Yellow
Write-Host ""

# Generate JWT_SECRET
$bytes1 = New-Object byte[] 64
$rng1 = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng1.GetBytes($bytes1)
$jwtSecret = [Convert]::ToBase64String($bytes1)

# Generate JWT_REFRESH_SECRET (must be different)
$bytes2 = New-Object byte[] 64
$rng2 = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng2.GetBytes($bytes2)
$jwtRefreshSecret = [Convert]::ToBase64String($bytes2)

# Display results
Write-Host "✅ Secrets Generated Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "  ADD THESE TO YOUR .env FILE:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor White
Write-Host "JWT_REFRESH_SECRET=$jwtRefreshSecret" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Save to file for reference
$outputFile = "jwt-secrets.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$content = @"
# JWT Secrets for DigitalTide
# Generated: $timestamp
# 
# ⚠️  IMPORTANT: Keep these secrets secure!
# - Never commit this file to git
# - Never share these secrets publicly
# - Add these to your .env file
# - Add these to GitHub Secrets when ready to deploy

JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtRefreshSecret

# Copy the lines above to your .env file
"@

$content | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "💾 Secrets saved to: $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Copy the JWT secrets above" -ForegroundColor White
Write-Host "   2. Open your .env file" -ForegroundColor White
Write-Host "   3. Find the JWT_SECRET and JWT_REFRESH_SECRET lines" -ForegroundColor White
Write-Host "   4. Replace the placeholder values with the generated secrets" -ForegroundColor White
Write-Host "   5. Save the .env file" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Security Notes:" -ForegroundColor Red
Write-Host "   • The generated secrets are also saved in jwt-secrets.txt" -ForegroundColor White
Write-Host "   • Delete jwt-secrets.txt after copying to .env" -ForegroundColor White
Write-Host "   • NEVER commit .env or jwt-secrets.txt to git" -ForegroundColor White
Write-Host "   • Add these to GitHub Secrets when deploying" -ForegroundColor White
Write-Host ""
Write-Host "✅ Done! You can now test authentication features." -ForegroundColor Green
Write-Host ""
