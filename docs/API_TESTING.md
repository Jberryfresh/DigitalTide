# DigitalTide API Testing Guide

This document provides curl commands to test all API endpoints.

## Environment
```bash
BASE_URL=http://localhost:3000/api/v1
```

## 1. Authentication Endpoints

### Register a new user
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser\",
    \"email\": \"test@example.com\",
    \"password\": \"Test123!@#\",
    \"display_name\": \"Test User\"
  }"
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"password\": \"Test123!@#\"
  }"
```

### Get current user (requires access token)
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"YOUR_REFRESH_TOKEN\"
  }"
```

### Logout
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"YOUR_REFRESH_TOKEN\"
  }"
```

## 2. Articles Endpoints

### Get all articles (public)
```bash
curl "http://localhost:3000/api/v1/articles?page=1&limit=10"
```

### Get articles with filters
```bash
curl "http://localhost:3000/api/v1/articles?status=published&category_id=1&sort=views"
```

### Get single article by ID
```bash
curl http://localhost:3000/api/v1/articles/1
```

### Get article by slug
```bash
curl http://localhost:3000/api/v1/articles/getting-started-with-ai
```

### Create article (requires authentication - admin/editor/writer)
```bash
curl -X POST http://localhost:3000/api/v1/articles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"My New Article\",
    \"slug\": \"my-new-article\",
    \"summary\": \"A brief summary of the article\",
    \"content\": \"The full content of the article goes here...\",
    \"status\": \"draft\",
    \"featured_image\": \"https://example.com/image.jpg\",
    \"category_ids\": [1, 2],
    \"tag_ids\": [1, 3, 5],
    \"source_ids\": [1]
  }"
```

### Update article (requires authentication and ownership/admin)
```bash
curl -X PUT http://localhost:3000/api/v1/articles/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Updated Title\",
    \"status\": \"published\"
  }"
```

### Delete article (soft delete - requires admin/editor)
```bash
curl -X DELETE http://localhost:3000/api/v1/articles/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 3. Categories Endpoints

### Get all categories
```bash
curl "http://localhost:3000/api/v1/categories?page=1&limit=20"
```

### Get categories with article count
```bash
curl "http://localhost:3000/api/v1/categories?include_article_count=true"
```

### Get single category
```bash
curl "http://localhost:3000/api/v1/categories/1?include_children=true&include_articles=true"
```

### Get child categories
```bash
curl "http://localhost:3000/api/v1/categories?parent_id=1"
```

### Create category (requires admin/editor)
```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"New Category\",
    \"slug\": \"new-category\",
    \"description\": \"Description of the category\",
    \"parent_id\": null
  }"
```

### Update category (requires admin/editor)
```bash
curl -X PUT http://localhost:3000/api/v1/categories/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Updated Category Name\",
    \"description\": \"Updated description\"
  }"
```

### Delete category (requires admin)
```bash
curl -X DELETE http://localhost:3000/api/v1/categories/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 4. Tags Endpoints

### Get all tags
```bash
curl "http://localhost:3000/api/v1/tags?page=1&limit=50"
```

### Get tags with minimum usage
```bash
curl "http://localhost:3000/api/v1/tags?min_usage=5&sort=usage"
```

### Get popular tags
```bash
curl "http://localhost:3000/api/v1/tags/popular?limit=20"
```

### Search tags
```bash
curl "http://localhost:3000/api/v1/tags/search?q=tech&limit=10"
```

### Get single tag
```bash
curl "http://localhost:3000/api/v1/tags/1?include_articles=true"
```

### Create tag (requires admin/editor)
```bash
curl -X POST http://localhost:3000/api/v1/tags \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"New Tag\",
    \"slug\": \"new-tag\",
    \"description\": \"Description of the tag\"
  }"
```

### Update tag (requires admin/editor)
```bash
curl -X PUT http://localhost:3000/api/v1/tags/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Updated Tag Name\"
  }"
```

### Delete tag (requires admin)
```bash
curl -X DELETE http://localhost:3000/api/v1/tags/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 5. Search Endpoints

### Search articles
```bash
curl "http://localhost:3000/api/v1/search?q=artificial+intelligence&page=1&limit=20"
```

### Advanced search with filters
```bash
curl "http://localhost:3000/api/v1/search?q=AI&category_id=1&tag_id=3&sort=relevance&from_date=2024-01-01"
```

### Get search suggestions
```bash
curl "http://localhost:3000/api/v1/search/suggestions?q=art&limit=10"
```

### Get trending searches
```bash
curl "http://localhost:3000/api/v1/search/trending?limit=10"
```

### Search all entities (articles, categories, tags, authors)
```bash
curl "http://localhost:3000/api/v1/search/all?q=tech&limit=5"
```

## Testing Workflow

### 1. Register and Login
```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!@#","display_name":"Test User"}'

# Login (save the access token)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

### 2. Test Public Endpoints (no auth required)
```bash
# Get articles
curl http://localhost:3000/api/v1/articles

# Get categories
curl http://localhost:3000/api/v1/categories

# Get tags
curl http://localhost:3000/api/v1/tags

# Search
curl "http://localhost:3000/api/v1/search?q=AI"
```

### 3. Test Protected Endpoints (requires token)
```bash
# Set your token
TOKEN="YOUR_ACCESS_TOKEN_HERE"

# Get current user
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/auth/me

# Create article (requires writer/editor/admin role)
curl -X POST http://localhost:3000/api/v1/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Article","slug":"test-article","content":"Content here","status":"draft"}'
```

## PowerShell Testing Commands

For Windows PowerShell, use these commands:

### Register
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "Test123!@#"
    display_name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"
```

### Login
```powershell
$body = @{
    email = "test@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.accessToken
```

### Get Articles
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/articles?page=1&limit=10"
```

### Get Current User
```powershell
$headers = @{
    Authorization = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/me" -Headers $headers
```

### Search
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/search?q=AI"
```

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "errors": [] // Validation errors (if applicable)
  }
}
```

## Notes

1. **Authentication**: Most write operations require authentication. Include the access token in the `Authorization` header.
2. **Roles**: Some endpoints require specific roles (admin, editor, writer).
3. **Pagination**: Most list endpoints support `page` and `limit` query parameters.
4. **Filtering**: Articles and search endpoints support advanced filtering.
5. **Validation**: All input is validated. Check error responses for validation details.
6. **Rate Limiting**: (To be implemented) API will have rate limits in production.

## Common HTTP Status Codes

- `200 OK`: Successful GET/PUT/DELETE
- `201 Created`: Successful POST (resource created)
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (e.g., email/username exists)
- `500 Internal Server Error`: Server error
