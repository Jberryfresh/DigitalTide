# DigitalTide - Security Framework & Hardening

## Overview

This document outlines the comprehensive security architecture for DigitalTide, including multi-layer protection strategies, implementation guidelines, and operational security standards. Security is critical for protecting user data, maintaining platform integrity, and ensuring compliance with data protection regulations.

## 1. Multi-Layer Security Architecture

### 1.1 Security Layers

```yaml
Layer 1 - Network Security:
  Components:
    - Web Application Firewall (WAF)
    - DDoS protection
    - Rate limiting
    - IP filtering/geoblocking
  Purpose: "First line of defense against attacks"

Layer 2 - Application Security:
  Components:
    - Input validation
    - Authentication/authorization
    - Session management
    - CSRF protection
    - XSS prevention
  Purpose: "Protect application logic and user interactions"

Layer 3 - Data Security:
  Components:
    - Encryption at rest
    - Encryption in transit
    - Database access controls
    - Secure key management
  Purpose: "Protect sensitive information"

Layer 4 - Infrastructure Security:
  Components:
    - Server hardening
    - Container security
    - Secrets management
    - Logging and monitoring
  Purpose: "Secure underlying infrastructure"

Layer 5 - Operational Security:
  Components:
    - Security monitoring
    - Incident response
    - Backup and recovery
    - Security audits
  Purpose: "Maintain ongoing security posture"
```

### 1.2 Defense in Depth Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Network Perimeter                         │
│  WAF │ DDoS Protection │ Rate Limiting │ Geoblocking       │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│  Auth │ Input Validation │ CSRF │ XSS Prevention │ CORS   │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                              │
│  Encryption │ Access Controls │ Audit Logs │ Backups       │
├─────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                        │
│  Containers │ Secrets │ Monitoring │ Hardened OS           │
└─────────────────────────────────────────────────────────────┘
```

## 2. Web Application Firewall (WAF) & DDoS Protection

### 2.1 WAF Configuration (Cloudflare)

**Recommended Provider**: Cloudflare (Free tier initially, upgrade to Pro/Business as needed)

```yaml
Cloudflare WAF Setup:

Protection Levels:
  - OWASP Top 10 protection: Enabled
  - Bot management: Medium sensitivity
  - Challenge passage: Browser integrity check
  
Firewall Rules:
  Rule 1 - Block Malicious Countries:
    Action: Block
    Countries: [Known high-threat countries]
    Exceptions: [Whitelisted IPs for legitimate users]
  
  Rule 2 - Rate Limit API Endpoints:
    Action: Challenge
    Path: /api/*
    Threshold: 100 requests/minute
  
  Rule 3 - Block SQL Injection Attempts:
    Action: Block
    Match: SQL injection patterns in query strings
    Log: All blocked attempts
  
  Rule 4 - Block XSS Attempts:
    Action: Block
    Match: Script injection patterns
    Log: All blocked attempts
  
  Rule 5 - Protect Admin Routes:
    Action: JS Challenge
    Path: /admin/*
    Additional: Require known good IP reputation

Security Level: Medium
  - Automatic for known threats
  - Challenge suspicious requests
  - Allow legitimate traffic
```

### 2.2 DDoS Protection Strategy

```yaml
Cloudflare DDoS Settings:

HTTP/HTTPS DDoS:
  - Sensitivity: High
  - Auto-mitigation: Enabled
  - Rate limiting: Adaptive
  
Layer 3/4 DDoS:
  - Network-level filtering
  - Automatic scrubbing
  - Traffic shaping

Challenge Configuration:
  - Managed challenge: For suspicious traffic
  - JS challenge: For bot protection
  - CAPTCHA: Last resort for persistent threats

Thresholds:
  - Requests per second: 10,000 (auto-mitigate above)
  - Bandwidth: 1Gbps (alert above)
  - Unique IPs: 5,000/minute (challenge above)
```

### 2.3 AWS WAF Configuration (Alternative)

```json
{
  "wafConfiguration": {
    "name": "DigitalTide-WAF",
    "scope": "REGIONAL",
    "rules": [
      {
        "name": "RateLimitRule",
        "priority": 1,
        "action": "BLOCK",
        "rateLimit": 2000,
        "aggregateKeyType": "IP"
      },
      {
        "name": "SQLInjectionRule",
        "priority": 2,
        "managedRuleGroup": "AWSManagedRulesSQLiRuleSet"
      },
      {
        "name": "XSSRule",
        "priority": 3,
        "managedRuleGroup": "AWSManagedRulesKnownBadInputsRuleSet"
      },
      {
        "name": "GeoBlockRule",
        "priority": 4,
        "action": "BLOCK",
        "geoMatchStatement": {
          "countryCodes": ["XX", "YY"]
        }
      }
    ],
    "logging": {
      "enabled": true,
      "destination": "s3://digitaltide-waf-logs/"
    }
  }
}
```

## 3. SSL/TLS Configuration

### 3.1 Certificate Setup

```yaml
SSL/TLS Strategy:

Certificate Provider:
  - Let's Encrypt (Free, 90-day auto-renewal)
  - Cloudflare SSL (Included with CDN)
  - AWS Certificate Manager (If using AWS)

Domain Configuration:
  Primary: digitaltide.com
  WWW: www.digitaltide.com
  API: api.digitaltide.com
  Admin: admin.digitaltide.com
  
Certificate Type:
  - Wildcard cert: *.digitaltide.com
  - SAN cert: Multiple specific subdomains
  
Renewal:
  - Automated via Certbot or cloud provider
  - 30-day advance renewal
  - Alert if renewal fails
```

### 3.2 TLS Best Practices

```nginx
# Nginx SSL/TLS Configuration

server {
    listen 443 ssl http2;
    server_name digitaltide.com www.digitaltide.com;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/digitaltide.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/digitaltide.com/privkey.pem;
    
    # TLS Protocol Versions (Disable old protocols)
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Strong Ciphers Only
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # SSL Session Configuration
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/digitaltide.com/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Certificate Pinning (Optional - use with caution)
    # add_header Public-Key-Pins 'pin-sha256="base64=="; max-age=5184000; includeSubDomains';
    
    # Rest of configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name digitaltide.com www.digitaltide.com;
    return 301 https://$server_name$request_uri;
}
```

### 3.3 HSTS Implementation

```javascript
// Express.js HSTS Middleware
import helmet from 'helmet';

app.use(
  helmet.hsts({
    maxAge: 63072000, // 2 years in seconds
    includeSubDomains: true,
    preload: true
  })
);

// Submit domain to HSTS preload list:
// https://hstspreload.org/
```

### 3.4 Certificate Pinning (Advanced)

```javascript
// HTTP Public Key Pinning (HPKP) - Use with caution
// Backup pins are CRITICAL to prevent lockout

app.use((req, res, next) => {
  res.setHeader(
    'Public-Key-Pins',
    `pin-sha256="${primaryKeyHash}"; ` +
    `pin-sha256="${backupKeyHash1}"; ` +
    `pin-sha256="${backupKeyHash2}"; ` +
    'max-age=5184000; includeSubDomains'
  );
  next();
});

// WARNING: Incorrect configuration can lock users out
// Recommendation: Start with report-only mode
// Public-Key-Pins-Report-Only header first
```

## 4. Content Security Policy (CSP)

### 4.1 CSP Headers Configuration

```javascript
// src/middleware/security.js

import helmet from 'helmet';

export const cspMiddleware = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Avoid if possible, use nonces instead
      "https://cdn.digitaltide.com",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com"
    ],
    
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Needed for some frameworks
      "https://cdn.digitaltide.com",
      "https://fonts.googleapis.com"
    ],
    
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "https://cdn.digitaltide.com",
      "https://images.digitaltide.com"
    ],
    
    fontSrc: [
      "'self'",
      "https://cdn.digitaltide.com",
      "https://fonts.gstatic.com"
    ],
    
    connectSrc: [
      "'self'",
      "https://api.digitaltide.com",
      "wss://api.digitaltide.com", // WebSocket
      "https://www.google-analytics.com"
    ],
    
    mediaSrc: [
      "'self'",
      "https://media.digitaltide.com"
    ],
    
    objectSrc: ["'none'"],
    
    frameSrc: [
      "'self'",
      "https://www.youtube.com" // If embedding videos
    ],
    
    baseUri: ["'self'"],
    
    formAction: ["'self'"],
    
    frameAncestors: ["'none'"], // Prevents clickjacking
    
    upgradeInsecureRequests: [], // Auto-upgrade HTTP to HTTPS
    
    reportUri: "https://digitaltide.report-uri.com/r/d/csp/enforce"
  },
  
  reportOnly: false // Set to true during testing
});
```

### 4.2 CSP with Nonces (Recommended)

```javascript
// Generate unique nonce per request
import crypto from 'crypto';

export const cspWithNonce = (req, res, next) => {
  // Generate nonce
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  
  // Set CSP header with nonce
  res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' 'nonce-${res.locals.cspNonce}'; ` +
    `style-src 'self' 'nonce-${res.locals.cspNonce}'; ` +
    `default-src 'self'; ` +
    `img-src 'self' https: data:; ` +
    `font-src 'self' https://fonts.gstatic.com; ` +
    `connect-src 'self' https://api.digitaltide.com; ` +
    `frame-ancestors 'none'; ` +
    `base-uri 'self'; ` +
    `form-action 'self';`
  );
  
  next();
};

// Use nonce in HTML templates
// <script nonce="<%= cspNonce %>">...</script>
```

### 4.3 CSP Reporting

```javascript
// CSP Violation Reporting Endpoint
app.post('/api/v1/security/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  const report = req.body['csp-report'];
  
  // Log violation
  logger.warn('CSP Violation:', {
    documentUri: report['document-uri'],
    violatedDirective: report['violated-directive'],
    blockedUri: report['blocked-uri'],
    sourceFile: report['source-file'],
    lineNumber: report['line-number']
  });
  
  // Store in database for analysis
  // Consider aggregating similar violations
  
  res.status(204).send();
});
```

## 5. Session Management & Cookies

### 5.1 Secure Session Configuration

```javascript
// src/middleware/session.js

import session from 'express-session';
import RedisStore from 'connect-redis';
import { redisClient } from '../services/cache/redisCache.js';

export const sessionMiddleware = session({
  store: new RedisStore({ 
    client: redisClient,
    prefix: 'sess:',
    ttl: 86400 // 24 hours
  }),
  
  secret: process.env.SESSION_SECRET, // Strong random secret
  
  name: 'sessionId', // Don't use default 'connect.sid'
  
  resave: false,
  saveUninitialized: false,
  
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    httpOnly: true, // Prevents JavaScript access
    sameSite: 'strict', // CSRF protection
    maxAge: 86400000, // 24 hours in milliseconds
    domain: process.env.NODE_ENV === 'production' ? '.digitaltide.com' : undefined
  },
  
  // Regenerate session ID on login
  rolling: true, // Reset expiry on each request
  
  // Security: Destroy old session on login
  genid: (req) => {
    return crypto.randomUUID(); // Use UUID for session IDs
  }
});

// Session Security Middleware
export const secureSession = (req, res, next) => {
  // Regenerate session ID periodically
  if (req.session.createdAt && Date.now() - req.session.createdAt > 3600000) {
    // Regenerate every hour
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.createdAt = Date.now();
      next();
    });
  } else {
    if (!req.session.createdAt) {
      req.session.createdAt = Date.now();
    }
    next();
  }
};
```

### 5.2 JWT Token Security

```javascript
// src/utils/jwt.js - Enhanced security

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(), // Unique token ID
      iat: Math.floor(Date.now() / 1000),
      type: 'access'
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'digitaltide.com',
      audience: 'digitaltide-api'
    }
  );
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
      type: 'refresh'
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'digitaltide.com',
      audience: 'digitaltide-api'
    }
  );
};

export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'digitaltide.com',
      audience: 'digitaltide-api'
    });
    
    // Verify token type
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Token blacklisting for logout
export const blacklistToken = async (token) => {
  const decoded = jwt.decode(token);
  if (!decoded) return;
  
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redisClient.setex(`blacklist:${decoded.jti}`, ttl, '1');
  }
};

export const isTokenBlacklisted = async (token) => {
  const decoded = jwt.decode(token);
  if (!decoded) return true;
  
  const exists = await redisClient.exists(`blacklist:${decoded.jti}`);
  return exists === 1;
};
```

### 5.3 Cookie Security Best Practices

```javascript
// Setting secure cookies in controllers

// Authentication cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true, // No JavaScript access
  secure: process.env.NODE_ENV === 'production', // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: process.env.NODE_ENV === 'production' ? '.digitaltide.com' : undefined,
  path: '/api/v1/auth' // Restrict to auth endpoints
});

// Preferences cookie (less sensitive)
res.cookie('preferences', JSON.stringify(userPrefs), {
  httpOnly: false, // JavaScript can read
  secure: true,
  sameSite: 'lax',
  maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  path: '/'
});

// Clear cookie on logout
res.clearCookie('refreshToken', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth'
});
```

## 6. Rate Limiting

### 6.1 Global Rate Limiting

```javascript
// src/middleware/rateLimiter.js

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../services/cache/redisCache.js';

// Global rate limiter
export const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:global:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests in rate limit count
  skipSuccessfulRequests: false,
  // Skip failed requests
  skipFailedRequests: false
});

// Strict rate limiter for authentication
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts. Please try again in 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 900
      }
    });
  }
});

// API rate limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'API rate limit exceeded. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false
});

// Aggressive rate limiter for expensive operations
export const strictLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:strict:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many requests for this resource.'
});

// Custom key generator for authenticated users
export const userBasedLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:user:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  }
});
```

### 6.2 Endpoint-Specific Rate Limiting

```javascript
// src/routes/authRoutes.js - Apply rate limiters

import express from 'express';
import { authLimiter, strictLimiter } from '../middleware/rateLimiter.js';
import { 
  register, 
  login, 
  logout, 
  refresh, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';

const router = express.Router();

// Very strict rate limiting on registration
router.post('/register', strictLimiter, register);

// Strict rate limiting on login
router.post('/login', authLimiter, login);

// Logout doesn't need rate limiting (requires auth)
router.post('/logout', logout);

// Token refresh - moderate limiting
router.post('/refresh', apiLimiter, refresh);

// Password reset - strict limiting
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
```

### 6.3 Advanced Rate Limiting Strategies

```javascript
// Dynamic rate limiting based on user tier

export const tieredRateLimiter = (req, res, next) => {
  const userTier = req.user?.subscription || 'free';
  
  const limits = {
    free: { windowMs: 60000, max: 10 },
    basic: { windowMs: 60000, max: 50 },
    premium: { windowMs: 60000, max: 200 },
    enterprise: { windowMs: 60000, max: 1000 }
  };
  
  const limiter = rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: `rl:tier:${userTier}:`
    }),
    ...limits[userTier],
    keyGenerator: (req) => req.user?.id || req.ip
  });
  
  limiter(req, res, next);
};

// Exponential backoff rate limiter
export const exponentialBackoffLimiter = async (req, res, next) => {
  const key = `rl:backoff:${req.ip}`;
  const attempts = await redisClient.get(key) || 0;
  
  // Calculate delay: 2^attempts seconds
  const delay = Math.pow(2, parseInt(attempts)) * 1000;
  
  if (delay > 60000) { // Max 1 minute delay
    return res.status(429).json({
      success: false,
      error: {
        message: 'Too many failed attempts. Please wait before trying again.',
        retryAfter: 60
      }
    });
  }
  
  // Increment attempts
  await redisClient.setex(key, 300, parseInt(attempts) + 1);
  
  next();
};
```

## 7. Input Validation & Sanitization

### 7.1 Request Validation Middleware

```javascript
// src/middleware/validation.js - Enhanced security

import { body, param, query, validationResult } from 'express-validator';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Sanitize HTML input
export const sanitizeHTML = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  });
};

// Sanitize SQL input (additional layer beyond parameterized queries)
export const sanitizeSQL = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove common SQL injection patterns
  return input
    .replace(/('|(\\')|(;)|(--)|(\/)|(\\))/g, '')
    .trim();
};

// Validation middleware wrapper
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format errors
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: formattedErrors
      }
    });
  };
};

// Common validation rules
export const commonValidations = {
  email: body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email too long'),
  
  password: body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain number')
    .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain special character'),
  
  username: body('username')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, hyphens, and underscores')
    .custom(async (value) => {
      // Check for profanity, reserved words, etc.
      const reserved = ['admin', 'root', 'system', 'api', 'www'];
      if (reserved.includes(value.toLowerCase())) {
        throw new Error('Username is reserved');
      }
      return true;
    }),
  
  articleTitle: body('title')
    .trim()
    .isLength({ min: 10, max: 200 }).withMessage('Title must be 10-200 characters')
    .customSanitizer(value => sanitizeHTML(value)),
  
  articleContent: body('content')
    .trim()
    .isLength({ min: 100, max: 50000 }).withMessage('Content must be 100-50000 characters')
    .customSanitizer(value => sanitizeHTML(value)),
  
  id: param('id')
    .isUUID().withMessage('Invalid ID format'),
  
  slug: param('slug')
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Invalid slug length')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 10000 }).withMessage('Invalid page number')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
      .toInt()
  ],
  
  search: query('q')
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Search query must be 1-200 characters')
    .customSanitizer(value => sanitizeSQL(value))
};

// SQL injection prevention (paranoid mode)
export const preventSQLInjection = (req, res, next) => {
  const checkValue = (value) => {
    if (typeof value === 'string') {
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
        /(UNION.*SELECT)/gi,
        /(\bOR\b.*=.*)/gi,
        /(--|;|\/\*|\*\/)/g
      ];
      
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          return false;
        }
      }
    }
    return true;
  };
  
  // Check all request inputs
  const allInputs = { ...req.body, ...req.query, ...req.params };
  
  for (const [key, value] of Object.entries(allInputs)) {
    if (!checkValue(value)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid input detected',
          code: 'INVALID_INPUT'
        }
      });
    }
  }
  
  next();
};

// XSS prevention
export const preventXSS = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeHTML(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};
```

## 8. Additional Security Measures

### 8.1 Security Headers (Complete Implementation)

```javascript
// src/middleware/security.js

import helmet from 'helmet';

export const securityHeaders = helmet({
  // Content Security Policy (covered in section 4)
  contentSecurityPolicy: true,
  
  // X-DNS-Prefetch-Control
  dnsPrefetchControl: { allow: false },
  
  // Expect-CT
  expectCt: {
    enforce: true,
    maxAge: 30
  },
  
  // X-Frame-Options
  frameguard: { action: 'deny' },
  
  // Hide X-Powered-By
  hidePoweredBy: true,
  
  // Strict-Transport-Security
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true
  },
  
  // X-Download-Options for IE8+
  ieNoOpen: true,
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  
  // Referrer-Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // X-XSS-Protection
  xssFilter: true
});

// Additional custom headers
export const additionalSecurityHeaders = (req, res, next) => {
  // Feature Policy
  res.setHeader(
    'Feature-Policy',
    "geolocation 'none'; microphone 'none'; camera 'none'"
  );
  
  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  
  // X-Robots-Tag (for API routes)
  if (req.path.startsWith('/api/')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  
  next();
};
```

### 8.2 CSRF Protection

```javascript
// src/middleware/csrf.js

import csrf from 'csurf';
import { ApiError } from './errorHandler.js';

// CSRF protection for forms
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Double-submit cookie pattern for API
export const apiCsrfProtection = (req, res, next) => {
  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const tokenFromHeader = req.headers['x-csrf-token'];
  const tokenFromCookie = req.cookies['csrf-token'];
  
  if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
    throw new ApiError(403, 'Invalid CSRF token');
  }
  
  next();
};

// Generate CSRF token endpoint
export const generateCsrfToken = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  
  res.cookie('csrf-token', token, {
    httpOnly: false, // JavaScript needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  });
  
  res.json({ success: true, data: { csrfToken: token } });
};
```

### 8.3 API Key Management

```javascript
// src/middleware/apiKey.js

import { ApiError } from './errorHandler.js';
import { redisClient } from '../services/cache/redisCache.js';

export const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    throw new ApiError(401, 'API key required');
  }
  
  // Check if API key is valid
  const keyData = await redisClient.get(`apikey:${apiKey}`);
  
  if (!keyData) {
    throw new ApiError(401, 'Invalid API key');
  }
  
  const { userId, permissions, rateLimit } = JSON.parse(keyData);
  
  // Check rate limit for this API key
  const usage = await redisClient.incr(`apikey:usage:${apiKey}`);
  if (usage === 1) {
    await redisClient.expire(`apikey:usage:${apiKey}`, 3600); // 1 hour window
  }
  
  if (usage > rateLimit) {
    throw new ApiError(429, 'API key rate limit exceeded');
  }
  
  // Attach user/permissions to request
  req.apiUser = { userId, permissions };
  
  next();
};
```

### 8.4 Logging & Monitoring

```javascript
// src/utils/securityLogger.js

import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security.log',
      level: 'warn'
    }),
    new winston.transports.File({ 
      filename: 'logs/security-error.log',
      level: 'error'
    })
  ]
});

export const logSecurityEvent = (event, details) => {
  securityLogger.warn({
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Security event types
export const SecurityEvents = {
  FAILED_LOGIN: 'failed_login',
  ACCOUNT_LOCKED: 'account_locked',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  XSS_ATTEMPT: 'xss_attempt',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  TOKEN_THEFT_SUSPECTED: 'token_theft_suspected',
  PASSWORD_RESET: 'password_reset',
  ADMIN_ACTION: 'admin_action'
};

// Usage in controllers
// logSecurityEvent(SecurityEvents.FAILED_LOGIN, { 
//   ip: req.ip, 
//   email: req.body.email,
//   userAgent: req.headers['user-agent']
// });
```

## 9. Database Security

### 9.1 Connection Security

```javascript
// src/database/pool.js - Enhanced security

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // SSL/TLS for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA, // Certificate authority
    key: process.env.DB_SSL_KEY, // Client key
    cert: process.env.DB_SSL_CERT // Client certificate
  } : false,
  
  // Connection limits
  max: 20, // Maximum connections
  min: 5, // Minimum connections
  
  // Timeouts
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  
  // Statement timeout (prevent long-running queries)
  statement_timeout: 10000, // 10 seconds
  
  // Application name for logging
  application_name: 'digitaltide-api'
});

// Monitor connection errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  logSecurityEvent(SecurityEvents.DATABASE_ERROR, {
    error: err.message,
    stack: err.stack
  });
});

export default pool;
```

### 9.2 Query Security Best Practices

```javascript
// ALWAYS use parameterized queries
// ✅ GOOD
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ BAD - SQL injection risk
const result = await pool.query(
  `SELECT * FROM users WHERE email = '${email}'`
);

// ✅ GOOD - Named parameters
const result = await pool.query({
  text: 'INSERT INTO articles (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
  values: [title, content, authorId],
  rowMode: 'array'
});

// Table name whitelisting (from queries.js)
const ALLOWED_TABLES = [
  'users', 'articles', 'categories', 'tags', 
  'sources', 'comments', 'agent_tasks'
];

const validateTableName = (tableName) => {
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new Error('Invalid table name');
  }
};
```

### 9.3 Row-Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_select_own ON users
  FOR SELECT
  USING (id = current_setting('app.current_user_id')::uuid);

-- Policy: Users can only update their own data
CREATE POLICY user_update_own ON users
  FOR UPDATE
  USING (id = current_setting('app.current_user_id')::uuid);

-- Policy: Admins can see all users
CREATE POLICY admin_select_all ON users
  FOR SELECT
  USING (
    current_setting('app.current_user_role') = 'admin' OR
    current_setting('app.current_user_role') = 'super_admin'
  );

-- Set current user for RLS (in application)
-- await pool.query('SET app.current_user_id = $1', [userId]);
-- await pool.query('SET app.current_user_role = $1', [userRole]);
```

## 10. Implementation Checklist

### 10.1 Immediate Priorities (P1)

```yaml
Network Security:
  - [ ] Set up Cloudflare account and configure DNS
  - [ ] Enable Cloudflare WAF with OWASP rules
  - [ ] Configure DDoS protection settings
  - [ ] Set up firewall rules for known threats

SSL/TLS:
  - [ ] Obtain SSL certificate (Let's Encrypt or Cloudflare)
  - [ ] Configure Nginx/cloud provider for HTTPS
  - [ ] Implement HSTS headers
  - [ ] Test SSL configuration (SSL Labs)
  - [ ] Set up auto-renewal for certificates

Application Security:
  - [ ] Implement CSP headers in Express middleware
  - [ ] Configure secure session management
  - [ ] Implement JWT token blacklisting
  - [ ] Add CSRF protection middleware
  - [ ] Set up all Helmet security headers

Rate Limiting:
  - [ ] Implement global rate limiting
  - [ ] Add strict rate limiting to auth endpoints
  - [ ] Configure API endpoint rate limits
  - [ ] Set up Redis for distributed rate limiting
  - [ ] Create rate limit monitoring dashboard

Input Validation:
  - [ ] Add validation middleware to all routes
  - [ ] Implement SQL injection prevention checks
  - [ ] Configure XSS protection
  - [ ] Set up HTML sanitization for user content
  - [ ] Validate and sanitize file uploads

Database Security:
  - [ ] Enable SSL for database connections
  - [ ] Verify all queries use parameterized statements
  - [ ] Implement row-level security policies
  - [ ] Set up database connection limits
  - [ ] Configure query timeouts
```

### 10.2 High Priority (P2)

```yaml
Monitoring & Logging:
  - [ ] Set up security event logging
  - [ ] Configure log rotation and retention
  - [ ] Implement real-time security alerts
  - [ ] Set up intrusion detection monitoring
  - [ ] Create security dashboard

API Security:
  - [ ] Implement API key management system
  - [ ] Set up API versioning
  - [ ] Configure CORS policies
  - [ ] Add request/response encryption
  - [ ] Implement webhook signature verification

Advanced Protection:
  - [ ] Set up bot detection and mitigation
  - [ ] Implement fingerprinting for device tracking
  - [ ] Configure geo-blocking if needed
  - [ ] Set up automated security testing
  - [ ] Implement security headers testing
```

### 10.3 Medium Priority (P3)

```yaml
Compliance & Auditing:
  - [ ] Conduct security audit
  - [ ] Perform penetration testing
  - [ ] Review and update security policies
  - [ ] Implement compliance logging (GDPR, CCPA)
  - [ ] Set up security incident response plan

Advanced Features:
  - [ ] Implement Web Authentication (WebAuthn)
  - [ ] Set up two-factor authentication (2FA)
  - [ ] Configure biometric authentication
  - [ ] Implement passwordless login
  - [ ] Set up security key support
```

---

**Document Version**: 1.0  
**Last Updated**: October 27, 2025  
**Next Security Audit**: January 27, 2026  
**Contact**: security@digitaltide.com
