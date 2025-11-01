import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Application
  app: {
    name: process.env.APP_NAME || 'DigitalTide',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    apiVersion: process.env.API_VERSION || 'v1',
    url: process.env.APP_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3002',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    name: process.env.POSTGRES_DB || 'digitaltide',
    user: process.env.POSTGRES_USER || 'digitaltide',
    password: process.env.POSTGRES_PASSWORD || 'digitaltide_password',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) || 30000,
      connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT, 10) || 2000,
    },
    ssl: {
      enabled: process.env.DB_SSL_ENABLED === 'true',
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    },
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || null,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'development-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  },

  // Elasticsearch
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
  },

  // Vector Database
  vectorDb: {
    type: process.env.VECTOR_DB_TYPE || 'qdrant',
    qdrant: {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY || null,
    },
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY || null,
      environment: process.env.PINECONE_ENVIRONMENT || null,
    },
  },

  // AI Services
  ai: {
    // Primary AI provider (free tier)
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
      maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS, 10) || 8192,
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
    },
    // Premium AI provider (paid)
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    },
    // Alternative AI provider (paid)
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 2000,
    },
    // AI provider preference (gemini, anthropic, openai)
    preferredProvider: process.env.AI_PROVIDER || 'gemini',
  },

  // News APIs
  newsApis: {
    googleNews: {
      apiKey: process.env.GOOGLE_NEWS_API_KEY,
    },
    newsApi: {
      apiKey: process.env.NEWSAPI_KEY,
    },
    mediaStack: {
      apiKey: process.env.MEDIASTACK_API_KEY,
    },
  },

  // News Service Configuration (for news clients)
  news: {
    serpApiKey: process.env.SERPAPI_KEY || process.env.GOOGLE_NEWS_API_KEY,
    newsApiKey: process.env.NEWSAPI_KEY,
    mediaStackApiKey: process.env.MEDIASTACK_API_KEY,
    cacheTTL: parseInt(process.env.NEWS_CACHE_TTL, 10) || 300, // 5 minutes default
    defaultLimit: parseInt(process.env.NEWS_DEFAULT_LIMIT, 10) || 20,
  },

  // Image Generation
  imageGeneration: {
    dalle: {
      apiKey: process.env.DALLE_API_KEY,
    },
    stability: {
      apiKey: process.env.STABILITY_API_KEY,
    },
  },

  // Email
  email: {
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@digitaltide.com',
      fromName: process.env.SENDGRID_FROM_NAME || 'DigitalTide',
    },
  },

  // Storage
  storage: {
    cloudflare: {
      apiKey: process.env.CLOUDFLARE_API_KEY,
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
    },
    aws: {
      s3Bucket: process.env.AWS_S3_BUCKET,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    },
  },

  // Payment
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },

  // Analytics
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    mixpanelToken: process.env.MIXPANEL_TOKEN,
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || 'debug',
    datadogApiKey: process.env.DATADOG_API_KEY,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 3600000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 1000,
    adminMax: parseInt(process.env.RATE_LIMIT_ADMIN_MAX, 10) || 10000,
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'development-session-secret',
    adminMfaRequired: process.env.ADMIN_MFA_REQUIRED === 'true',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    cspReportUri:
      process.env.CSP_REPORT_URI || `/api/${process.env.API_VERSION || 'v1'}/security/csp-report`,
    csrfEnabled: process.env.CSRF_ENABLED !== 'false',
  },

  // Agents
  agents: {
    coo: {
      enabled: process.env.AGENT_COO_ENABLED !== 'false',
    },
    crawler: {
      enabled: process.env.AGENT_CRAWLER_ENABLED !== 'false',
    },
    research: {
      enabled: process.env.AGENT_RESEARCH_ENABLED !== 'false',
    },
    writer: {
      enabled: process.env.AGENT_WRITER_ENABLED !== 'false',
    },
    qualityControl: {
      enabled: process.env.AGENT_QUALITY_CONTROL_ENABLED !== 'false',
    },
    seo: {
      enabled: process.env.AGENT_SEO_ENABLED !== 'false',
    },
    publisher: {
      enabled: process.env.AGENT_PUBLISHER_ENABLED !== 'false',
    },
    analytics: {
      enabled: process.env.AGENT_ANALYTICS_ENABLED !== 'false',
    },
    config: {
      maxConcurrentTasks: parseInt(process.env.AGENT_MAX_CONCURRENT_TASKS, 10) || 5,
      taskTimeout: parseInt(process.env.AGENT_TASK_TIMEOUT, 10) || 300000,
      retryAttempts: parseInt(process.env.AGENT_RETRY_ATTEMPTS, 10) || 3,
    },
  },

  // Feature Flags
  features: {
    websockets: process.env.ENABLE_WEBSOCKETS !== 'false',
    graphql: process.env.ENABLE_GRAPHQL === 'true',
    newsletter: process.env.ENABLE_NEWSLETTER !== 'false',
    comments: process.env.ENABLE_COMMENTS === 'true',
    userRegistration: process.env.ENABLE_USER_REGISTRATION !== 'false',
    apiDocs: process.env.ENABLE_API_DOCS !== 'false',
    debugLogging: process.env.ENABLE_DEBUG_LOGGING === 'true',
    seedData: process.env.ENABLE_SEED_DATA === 'true',
  },
};

// Validation
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file');
  process.exit(1);
}

export default config;
