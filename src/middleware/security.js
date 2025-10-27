/**
 * Security Middleware
 * 
 * Comprehensive security headers and protections including:
 * - Content Security Policy (CSP)
 * - Additional security headers
 * - CSRF protection utilities
 */

import helmet from 'helmet';
import crypto from 'crypto';
import config from '../config/index.js';

/**
 * Content Security Policy Middleware
 * Prevents XSS, clickjacking, and other code injection attacks
 */
export const cspMiddleware = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    
    scriptSrc: [
      "'self'",
      // Allow inline scripts with nonce (set per-request)
      (req, res) => `'nonce-${res.locals.cspNonce}'`,
      // External script sources
      "https://cdn.digitaltide.com",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com"
    ],
    
    styleSrc: [
      "'self'",
      // Allow inline styles with nonce
      (req, res) => `'nonce-${res.locals.cspNonce}'`,
      "https://cdn.digitaltide.com",
      "https://fonts.googleapis.com"
    ],
    
    imgSrc: [
      "'self'",
      "data:", // Allow data: URIs for inline images
      "https:", // Allow any HTTPS images (for news content)
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
      "wss://api.digitaltide.com", // WebSocket connections
      "https://www.google-analytics.com"
    ],
    
    mediaSrc: [
      "'self'",
      "https://media.digitaltide.com"
    ],
    
    objectSrc: ["'none'"], // Disallow <object>, <embed>, <applet>
    
    frameSrc: [
      "'self'",
      "https://www.youtube.com", // Allow YouTube embeds
      "https://player.vimeo.com" // Allow Vimeo embeds
    ],
    
    baseUri: ["'self'"], // Restrict base tag
    
    formAction: ["'self'"], // Restrict form submissions
    
    frameAncestors: ["'none'"], // Prevent clickjacking (equivalent to X-Frame-Options: DENY)
    
    upgradeInsecureRequests: [], // Auto-upgrade HTTP to HTTPS
    
    reportUri: config.security.cspReportUri || undefined
  },
  
  // Set to true during testing to report violations without blocking
  reportOnly: config.app.env === 'development' ? false : false
});

/**
 * Generate CSP nonce for inline scripts/styles
 * Must be called before cspMiddleware
 */
export const generateCspNonce = (req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
};

/**
 * Additional security headers beyond helmet defaults
 */
export const additionalSecurityHeaders = (req, res, next) => {
  // Permissions Policy (formerly Feature Policy)
  // Disable sensitive browser features
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  
  // X-Robots-Tag: Prevent API routes from being indexed
  if (req.path.startsWith('/api/')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
  
  // X-Permitted-Cross-Domain-Policies: Restrict Flash/PDF cross-domain
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Cache-Control for sensitive endpoints
  if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

/**
 * Enhanced Helmet configuration with all security headers
 */
export const securityHeaders = helmet({
  // Content Security Policy (using custom middleware above)
  contentSecurityPolicy: false, // We use custom CSP middleware
  
  // Cross-Origin policies
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-site' },
  
  // X-DNS-Prefetch-Control: Control browser DNS prefetching
  dnsPrefetchControl: { allow: false },
  
  // Expect-CT: Enforce Certificate Transparency
  expectCt: {
    enforce: true,
    maxAge: 30
  },
  
  // X-Frame-Options: Prevent clickjacking (CSP frameAncestors is preferred)
  frameguard: { action: 'deny' },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // Strict-Transport-Security (HSTS)
  hsts: {
    maxAge: 63072000, // 2 years in seconds
    includeSubDomains: true,
    preload: true
  },
  
  // X-Download-Options: Prevent IE from executing downloads
  ieNoOpen: true,
  
  // X-Content-Type-Options: Prevent MIME sniffing
  noSniff: true,
  
  // Origin-Agent-Cluster: Request dedicated process for origin
  originAgentCluster: true,
  
  // X-Permitted-Cross-Domain-Policies: Adobe products policy
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  
  // Referrer-Policy: Control referrer information
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // X-XSS-Protection: Enable browser XSS filter
  xssFilter: true
});

/**
 * CSP Violation Reporting Endpoint Handler
 * Logs CSP violations for analysis
 */
export const handleCspReport = (req, res) => {
  const report = req.body['csp-report'];
  
  if (!report) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid CSP report' }
    });
  }
  
  // Log CSP violation (in production, send to monitoring service)
  console.warn('CSP Violation:', {
    documentUri: report['document-uri'],
    violatedDirective: report['violated-directive'],
    blockedUri: report['blocked-uri'],
    sourceFile: report['source-file'],
    lineNumber: report['line-number'],
    columnNumber: report['column-number'],
    statusCode: report['status-code'],
    timestamp: new Date().toISOString()
  });
  
  // TODO: Store in database for analysis
  // TODO: Alert if critical violations exceed threshold
  
  // Return 204 No Content (standard for CSP reports)
  res.status(204).send();
};

/**
 * CSRF Token Generation Endpoint Handler
 * Generates and sets CSRF token for client-side use
 */
export const generateCsrfToken = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  
  res.cookie('csrf-token', token, {
    httpOnly: false, // JavaScript needs to read this
    secure: config.app.env === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  });
  
  res.json({ 
    success: true, 
    data: { csrfToken: token } 
  });
};

/**
 * CSRF Protection Middleware (Double-Submit Cookie Pattern)
 * Validates CSRF token for state-changing requests
 */
export const csrfProtection = (req, res, next) => {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const tokenFromHeader = req.headers['x-csrf-token'];
  const tokenFromCookie = req.cookies['csrf-token'];
  
  if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid CSRF token',
        code: 'CSRF_TOKEN_INVALID'
      }
    });
  }
  
  next();
};

/**
 * Apply all security middleware in correct order
 * Use this in your main app file
 */
export const applySecurityMiddleware = (app) => {
  // 1. Generate CSP nonce (must be first)
  app.use(generateCspNonce);
  
  // 2. Apply Helmet security headers
  app.use(securityHeaders);
  
  // 3. Apply custom CSP with nonce support
  app.use(cspMiddleware);
  
  // 4. Apply additional custom headers
  app.use(additionalSecurityHeaders);
  
  console.log('✅ Security middleware initialized');
};

export default {
  cspMiddleware,
  generateCspNonce,
  additionalSecurityHeaders,
  securityHeaders,
  handleCspReport,
  generateCsrfToken,
  csrfProtection,
  applySecurityMiddleware
};
