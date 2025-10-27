import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import config from './config/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import articlesRoutes from './routes/articlesRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import tagsRoutes from './routes/tagsRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.app.env === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'DigitalTide API is running',
    version: config.app.apiVersion,
    environment: config.app.env,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.get(`/api/${config.app.apiVersion}`, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to DigitalTide API',
    version: config.app.apiVersion,
    documentation: `${config.app.url}/api-docs`,
    endpoints: {
      auth: {
        register: `POST /api/${config.app.apiVersion}/auth/register`,
        login: `POST /api/${config.app.apiVersion}/auth/login`,
        refresh: `POST /api/${config.app.apiVersion}/auth/refresh`,
        logout: `POST /api/${config.app.apiVersion}/auth/logout`,
        me: `GET /api/${config.app.apiVersion}/auth/me`,
      },
      articles: {
        list: `GET /api/${config.app.apiVersion}/articles`,
        get: `GET /api/${config.app.apiVersion}/articles/:id`,
        create: `POST /api/${config.app.apiVersion}/articles`,
        update: `PUT /api/${config.app.apiVersion}/articles/:id`,
        delete: `DELETE /api/${config.app.apiVersion}/articles/:id`,
      },
      categories: {
        list: `GET /api/${config.app.apiVersion}/categories`,
        get: `GET /api/${config.app.apiVersion}/categories/:id`,
        create: `POST /api/${config.app.apiVersion}/categories`,
        update: `PUT /api/${config.app.apiVersion}/categories/:id`,
        delete: `DELETE /api/${config.app.apiVersion}/categories/:id`,
      },
      tags: {
        list: `GET /api/${config.app.apiVersion}/tags`,
        get: `GET /api/${config.app.apiVersion}/tags/:id`,
        popular: `GET /api/${config.app.apiVersion}/tags/popular`,
        search: `GET /api/${config.app.apiVersion}/tags/search`,
        create: `POST /api/${config.app.apiVersion}/tags`,
        update: `PUT /api/${config.app.apiVersion}/tags/:id`,
        delete: `DELETE /api/${config.app.apiVersion}/tags/:id`,
      },
      search: {
        articles: `GET /api/${config.app.apiVersion}/search`,
        suggestions: `GET /api/${config.app.apiVersion}/search/suggestions`,
        trending: `GET /api/${config.app.apiVersion}/search/trending`,
        all: `GET /api/${config.app.apiVersion}/search/all`,
      },
    },
  });
});

// Mount API routes
app.use(`/api/${config.app.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.app.apiVersion}/articles`, articlesRoutes);
app.use(`/api/${config.app.apiVersion}/categories`, categoriesRoutes);
app.use(`/api/${config.app.apiVersion}/tags`, tagsRoutes);
app.use(`/api/${config.app.apiVersion}/search`, searchRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.app.port;

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                      DIGITALTIDE                           ║');
  console.log('║        AI-Powered Autonomous News Platform                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running in ${config.app.env} mode`);
  console.log(`📡 API listening on: ${config.app.url}`);
  console.log(`📚 API Version: ${config.app.apiVersion}`);
  console.log(`🏥 Health check: ${config.app.url}/health`);
  if (config.features.apiDocs) {
    console.log(`📖 API Docs: ${config.app.url}/api-docs`);
  }
  console.log('');
  console.log('✅ AI Agents Status:');
  console.log(`   ${config.agents.coo.enabled ? '✓' : '✗'} COO Orchestrator`);
  console.log(`   ${config.agents.crawler.enabled ? '✓' : '✗'} Crawler Agent`);
  console.log(`   ${config.agents.research.enabled ? '✓' : '✗'} Research Agent`);
  console.log(`   ${config.agents.writer.enabled ? '✓' : '✗'} Writer Agent`);
  console.log(`   ${config.agents.qualityControl.enabled ? '✓' : '✗'} Quality Control Agent`);
  console.log(`   ${config.agents.seo.enabled ? '✓' : '✗'} SEO Agent`);
  console.log(`   ${config.agents.publisher.enabled ? '✓' : '✗'} Publisher Agent`);
  console.log(`   ${config.agents.analytics.enabled ? '✓' : '✗'} Analytics Agent`);
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('════════════════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;