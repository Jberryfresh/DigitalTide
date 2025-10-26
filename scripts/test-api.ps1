# DigitalTide API Test Script
# Run this script in a NEW PowerShell window while the server is running

Write-Host "================================" -ForegroundColor Cyan
Write-Host "DigitalTide API Testing" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/v1"

# Test 1: Get API root
Write-Host "1. Testing API Root..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl"
    Write-Host "✓ API Root OK" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "✗ API Root Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get Articles
Write-Host "2. Testing GET Articles..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/articles?page=1&limit=5"
    Write-Host "✓ GET Articles OK - Found $($response.data.pagination.total) articles" -ForegroundColor Green
    Write-Host "Articles:" -ForegroundColor Cyan
    foreach ($article in $response.data.articles) {
        Write-Host "  - $($article.title) (ID: $($article.id))" -ForegroundColor White
    }
} catch {
    Write-Host "✗ GET Articles Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get Categories
Write-Host "3. Testing GET Categories..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/categories"
    Write-Host "✓ GET Categories OK - Found $($response.data.pagination.total) categories" -ForegroundColor Green
    Write-Host "Categories:" -ForegroundColor Cyan
    foreach ($category in $response.data.categories) {
        Write-Host "  - $($category.name) (ID: $($category.id), Articles: $($category.article_count))" -ForegroundColor White
    }
} catch {
    Write-Host "✗ GET Categories Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Tags
Write-Host "4. Testing GET Tags..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tags"
    Write-Host "✓ GET Tags OK - Found $($response.data.pagination.total) tags" -ForegroundColor Green
    Write-Host "Tags:" -ForegroundColor Cyan
    foreach ($tag in $response.data.tags | Select-Object -First 10) {
        Write-Host "  - $($tag.name) (Usage: $($tag.usage_count))" -ForegroundColor White
    }
} catch {
    Write-Host "✗ GET Tags Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get Popular Tags
Write-Host "5. Testing GET Popular Tags..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tags/popular?limit=5"
    Write-Host "✓ GET Popular Tags OK - Found $($response.data.tags.Count) popular tags" -ForegroundColor Green
    Write-Host "Popular Tags:" -ForegroundColor Cyan
    foreach ($tag in $response.data.tags) {
        Write-Host "  - $($tag.name) (Usage: $($tag.usage_count))" -ForegroundColor White
    }
} catch {
    Write-Host "✗ GET Popular Tags Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Search
Write-Host "6. Testing Search..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/search?q=AI&limit=5"
    Write-Host "✓ Search OK - Found $($response.data.pagination.total) results for 'AI'" -ForegroundColor Green
    Write-Host "Search Results:" -ForegroundColor Cyan
    foreach ($article in $response.data.articles) {
        Write-Host "  - $($article.title)" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Search Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get Single Article
Write-Host "7. Testing GET Single Article..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/articles/1"
    Write-Host "✓ GET Single Article OK" -ForegroundColor Green
    Write-Host "Article: $($response.data.article.title)" -ForegroundColor Cyan
    Write-Host "Author: $($response.data.article.author_username)" -ForegroundColor White
    Write-Host "Categories: $($response.data.article.categories.Count)" -ForegroundColor White
    Write-Host "Tags: $($response.data.article.tags.Count)" -ForegroundColor White
} catch {
    Write-Host "✗ GET Single Article Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 8: Register User
Write-Host "8. Testing User Registration..." -ForegroundColor Yellow
try {
    $registerBody = @{
        username = "testuser_$(Get-Random -Maximum 10000)"
        email = "testuser_$(Get-Random -Maximum 10000)@example.com"
        password = "Test123!@#"
        display_name = "Test User"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✓ User Registration OK" -ForegroundColor Green
    Write-Host "Username: $($response.data.user.username)" -ForegroundColor Cyan
    Write-Host "Email: $($response.data.user.email)" -ForegroundColor White
    $global:testAccessToken = $response.data.accessToken
    $global:testRefreshToken = $response.data.refreshToken
} catch {
    Write-Host "✗ User Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 9: Login
Write-Host "9. Testing Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@digitaltide.com"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login OK" -ForegroundColor Green
    Write-Host "User: $($response.data.user.username) (Role: $($response.data.user.role))" -ForegroundColor Cyan
    $global:adminToken = $response.data.accessToken
} catch {
    Write-Host "✗ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 10: Get Current User
Write-Host "10. Testing Get Current User..." -ForegroundColor Yellow
if ($global:adminToken) {
    try {
        $headers = @{
            Authorization = "Bearer $global:adminToken"
        }
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Headers $headers
        Write-Host "✓ Get Current User OK" -ForegroundColor Green
        Write-Host "Username: $($response.data.user.username)" -ForegroundColor Cyan
        Write-Host "Email: $($response.data.user.email)" -ForegroundColor White
        Write-Host "Role: $($response.data.user.role)" -ForegroundColor White
    } catch {
        Write-Host "✗ Get Current User Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⊘ Skipped - No token available" -ForegroundColor Gray
}
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test protected endpoints, use the token:" -ForegroundColor Yellow
if ($global:adminToken) {
    Write-Host '$token = "' -NoNewline -ForegroundColor Gray
    Write-Host $global:adminToken -NoNewline -ForegroundColor White
    Write-Host '"' -ForegroundColor Gray
}
